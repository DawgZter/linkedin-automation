const childProcess = require("child_process");
const fs = require("fs");

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

function isLoginUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.origin === "https://auth.unipile.com";
  } catch {
    return false;
  }
}

function extractLoginUrl(input) {
  let loginUrl;

  function inspect(value) {
    if (typeof value === "string") {
      if (!loginUrl && isLoginUrl(value)) {
        loginUrl = value;
      }

      const parsed = parseJsonString(value);
      if (parsed) walk(parsed, inspect);
      return;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    if (!loginUrl && isLoginUrl(value.login_url)) {
      loginUrl = value.login_url;
    }
  }

  walk(input, inspect);
  return loginUrl;
}

function openUrl(url) {
  if (process.platform === "darwin") {
    childProcess.spawnSync("open", [url], { stdio: "ignore" });
    return;
  }

  if (process.platform === "win32") {
    childProcess.spawnSync("cmd", ["/c", "start", "", url], { stdio: "ignore" });
    return;
  }

  childProcess.spawnSync("xdg-open", [url], { stdio: "ignore" });
}

const loginUrl = extractLoginUrl(readInput());
if (loginUrl) openUrl(loginUrl);
