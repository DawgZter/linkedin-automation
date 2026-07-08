const fs = require("fs");
const path = require("path");

function readInput() {
  try {
    const text = fs.readFileSync(0, "utf8");
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function walk(value, visit) {
  visit(value);
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const entry of Object.values(value)) walk(entry, visit);
}

function parseJsonString(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

function tokenFromUrl(value) {
  try {
    const url = new URL(value);
    return url.searchParams.get("token") || undefined;
  } catch {
    return undefined;
  }
}

function extractConnection(input) {
  let accountId;
  let mcpToken;
  let mcpUrl;

  function inspect(value) {
    if (typeof value === "string") {
      if (!accountId && /^acc_[a-zA-Z0-9]+$/.test(value)) accountId = value;
      if (!mcpUrl && value.includes("/api/linkedin-automation-mcp/mcp?token=")) {
        mcpUrl = value;
        mcpToken = mcpToken || tokenFromUrl(value);
      }

      const parsed = parseJsonString(value);
      if (parsed) walk(parsed, inspect);
      return;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    if (!accountId && typeof value.account_id === "string") accountId = value.account_id;
    if (!mcpToken && typeof value.mcp_token === "string") mcpToken = value.mcp_token;
    if (!mcpUrl && typeof value.mcp_url === "string") {
      mcpUrl = value.mcp_url;
      mcpToken = mcpToken || tokenFromUrl(value.mcp_url);
    }
  }

  walk(input, inspect);
  if (!accountId || !mcpToken) return undefined;

  return {
    account_id: accountId,
    mcp_token: mcpToken,
    mcp_url: mcpUrl,
    connected_at: new Date().toISOString()
  };
}

function saveConnection(connection) {
  const dataDir = process.env.CLAUDE_PLUGIN_DATA;
  if (!dataDir) return;

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "connection.json"),
    JSON.stringify(connection, null, 2)
  );
}

const connection = extractConnection(readInput());
if (connection) saveConnection(connection);
