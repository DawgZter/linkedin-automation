const fs = require("fs");
const path = require("path");

function connectionPath() {
  const dataDir = process.env.CLAUDE_PLUGIN_DATA;
  if (!dataDir) return undefined;
  return path.join(dataDir, "connection.json");
}

function tokenFromUrl(value) {
  try {
    const url = new URL(value);
    return url.searchParams.get("token") || undefined;
  } catch {
    return undefined;
  }
}

function readConnection() {
  const file = connectionPath();
  if (!file || !fs.existsSync(file)) return undefined;

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
}

const connection = readConnection();
const token =
  typeof connection?.mcp_token === "string"
    ? connection.mcp_token
    : typeof connection?.mcp_url === "string"
      ? tokenFromUrl(connection.mcp_url)
      : undefined;

if (token) {
  process.stdout.write(JSON.stringify({ Authorization: `Bearer ${token}` }));
} else {
  process.stdout.write("{}");
}
