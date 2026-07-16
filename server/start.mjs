#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";

const SERVER_VERSION = "0.2.0";
const REMOTE_URL =
  process.env.LINKEDIN_AUTOMATION_REMOTE_URL ||
  "https://unipile-hosted-auth-callback.vercel.app/api/linkedin-automation-mcp/mcp";

function persistentHome() {
  const user = process.env.USER;
  if (process.platform === "darwin" && /^[a-zA-Z0-9._-]+$/.test(user || "")) {
    return path.join("/Users", user);
  }
  return process.env.USERPROFILE || os.homedir();
}

const CONFIG_DIR =
  process.env.LINKEDIN_AUTOMATION_CONFIG_DIR ||
  path.join(persistentHome(), ".linkedin-automation", "mcp-auth");

const CONNECT_TOOL = {
  name: "linkedin_connect",
  description:
    "Connect this rep to their private LinkedIn automation account. Opens work-account authorization in the browser and keeps checking until it completes.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

const STATUS_TOOL = {
  name: "linkedin_connection_status",
  description: "Check whether this rep's LinkedIn automation account is connected.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
};

let parentInitialized = false;
let child;
let childState = "stopped";
let childError;
let childReadyPromise;
let childRequestId = 1000;
let authUrl;
const pendingChildRequests = new Map();

function log(message) {
  process.stderr.write(`[linkedin-automation] ${message}\n`);
}

function sendParent(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendChild(message) {
  if (!child?.stdin.writable) throw new Error("LinkedIn automation is starting.");
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function toolResult(payload, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    isError
  };
}

function pendingResult() {
  return toolResult({
    status: "pending",
    ...(authUrl ? { login_url: authUrl } : {}),
    next: "Authorization is open in the browser. Keep checking the connection status."
  });
}

function childRequest(method, params = {}, timeoutMs = 120_000) {
  const id = childRequestId++;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingChildRequests.delete(id);
      reject(new Error(`LinkedIn automation timed out while running ${method}.`));
    }, timeoutMs);
    pendingChildRequests.set(id, { resolve, reject, timeout });

    try {
      sendChild({ jsonrpc: "2.0", id, method, params });
    } catch (error) {
      clearTimeout(timeout);
      pendingChildRequests.delete(id);
      reject(error);
    }
  });
}

function settleChildMessage(message) {
  const pending = pendingChildRequests.get(message.id);
  if (!pending) return false;

  pendingChildRequests.delete(message.id);
  clearTimeout(pending.timeout);
  if (message.error) pending.reject(new Error(message.error.message || "LinkedIn automation failed."));
  else pending.resolve(message.result);
  return true;
}

function rejectPendingRequests(error) {
  for (const pending of pendingChildRequests.values()) {
    clearTimeout(pending.timeout);
    pending.reject(error);
  }
  pendingChildRequests.clear();
}

function mcpRemoteArgs() {
  return [
    "-y",
    "mcp-remote@0.1.38",
    REMOTE_URL,
    "--host",
    "127.0.0.1",
    "--auth-timeout",
    "600",
    "--transport",
    "http-only"
  ];
}

async function startChild() {
  if (childState === "ready") return;
  if (childState === "starting") return childReadyPromise;

  childState = "starting";
  childError = undefined;
  authUrl = undefined;

  childReadyPromise = new Promise((resolve, reject) => {
    const command = process.platform === "win32" ? "npx.cmd" : "npx";
    child = spawn(command, mcpRemoteArgs(), {
      env: { ...process.env, MCP_REMOTE_CONFIG_DIR: CONFIG_DIR },
      stdio: ["pipe", "pipe", "pipe"]
    });

    const childOutput = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    childOutput.on("line", (line) => {
      try {
        const message = JSON.parse(line);
        if (settleChildMessage(message)) return;
        if (message.method === "notifications/tools/list_changed" && parentInitialized) {
          sendParent(message);
        }
      } catch {
        log(line);
      }
    });

    const childErrors = readline.createInterface({ input: child.stderr, crlfDelay: Infinity });
    childErrors.on("line", (line) => {
      const match = line.match(/https?:\/\/\S+/);
      if (match && /oauth|authorize|accounts\.google/i.test(match[0])) {
        authUrl = match[0].replace(/[),.;]+$/, "");
      }
      if (/fatal|error|failed|could not open browser/i.test(line)) log(line);
    });

    child.once("error", (error) => {
      childState = "error";
      childError = error.message;
      rejectPendingRequests(error);
      reject(error);
    });

    child.once("exit", (code, signal) => {
      const error = new Error(
        childError || `LinkedIn automation stopped${signal ? ` (${signal})` : ` (${code ?? 1})`}.`
      );
      if (childState === "starting") reject(error);
      childState = "error";
      childError = error.message;
      rejectPendingRequests(error);
      child = undefined;
    });

    childRequest(
      "initialize",
      {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "linkedin-automation-local", version: SERVER_VERSION }
      },
      650_000
    )
      .then((result) => {
        sendChild({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
        childState = "ready";
        if (parentInitialized) {
          sendParent({ jsonrpc: "2.0", method: "notifications/tools/list_changed", params: {} });
        }
        resolve(result);
      })
      .catch((error) => {
        childState = "error";
        childError = error.message;
        reject(error);
      });
  });

  return childReadyPromise;
}

async function hasSavedAuthorization() {
  try {
    return (await fs.readdir(CONFIG_DIR)).length > 0;
  } catch {
    return false;
  }
}

async function waitBrieflyForChild() {
  try {
    await Promise.race([
      startChild(),
      new Promise((resolve) => setTimeout(resolve, 1500))
    ]);
  } catch {
    // Status reports the startup error with a useful message.
  }
  return childState === "ready";
}

async function remoteStatus() {
  const result = await childRequest("tools/call", {
    name: "linkedin_connection_status",
    arguments: {}
  });
  return result;
}

async function connect() {
  if (await waitBrieflyForChild()) return remoteStatus();
  if (childState === "error") return toolResult({ status: "error", error: childError }, true);
  return pendingResult();
}

async function connectionStatus() {
  if (childState === "stopped") await waitBrieflyForChild();
  if (childState === "ready") return remoteStatus();
  if (childState === "error") return toolResult({ status: "error", error: childError }, true);
  return pendingResult();
}

async function listTools() {
  if (childState !== "ready") return [CONNECT_TOOL, STATUS_TOOL];

  try {
    const result = await childRequest("tools/list");
    const remoteTools = Array.isArray(result?.tools) ? result.tools : [];
    return [
      CONNECT_TOOL,
      STATUS_TOOL,
      ...remoteTools.filter((tool) => ![CONNECT_TOOL.name, STATUS_TOOL.name].includes(tool?.name))
    ];
  } catch (error) {
    log(error.message);
    return [CONNECT_TOOL, STATUS_TOOL];
  }
}

async function callTool(name, args) {
  if (name === CONNECT_TOOL.name) return connect();
  if (name === STATUS_TOOL.name) return connectionStatus();

  if (childState !== "ready") {
    await waitBrieflyForChild();
    if (childState !== "ready") return pendingResult();
  }

  return childRequest("tools/call", { name, arguments: args || {} });
}

async function handleParentMessage(message) {
  const id = message.id;

  if (message.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: message.params?.protocolVersion || "2025-06-18",
        capabilities: { tools: { listChanged: true } },
        serverInfo: { name: "linkedin-automation", version: SERVER_VERSION }
      }
    };
  }
  if (message.method === "notifications/initialized") {
    parentInitialized = true;
    return undefined;
  }
  if (message.method?.startsWith("notifications/")) return undefined;
  if (message.method === "ping") return { jsonrpc: "2.0", id, result: {} };
  if (message.method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools: await listTools() } };
  }
  if (message.method === "tools/call") {
    const name = message.params?.name;
    if (!name) {
      return { jsonrpc: "2.0", id, error: { code: -32602, message: "Tool name is required." } };
    }
    return {
      jsonrpc: "2.0",
      id,
      result: await callTool(name, message.params?.arguments)
    };
  }

  return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found." } };
}

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", async (line) => {
  if (!line.trim()) return;
  try {
    const message = JSON.parse(line);
    const response = await handleParentMessage(message);
    if (response) sendParent(response);
  } catch (error) {
    sendParent({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: error.message || "Internal error." }
    });
  }
});

if (await hasSavedAuthorization()) {
  startChild().catch((error) => log(error.message));
}

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    if (child) child.kill(signal);
    process.exit(0);
  });
}
