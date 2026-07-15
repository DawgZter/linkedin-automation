---
name: linkedin-connect
description: Connect or reconnect the user's LinkedIn account for LinkedIn automation. Use when the user asks to connect LinkedIn, set up LinkedIn automation, reconnect LinkedIn, or check whether LinkedIn is connected.
---

# LinkedIn Connect

Use the plugin-provided `linkedin-automation` MCP connector.

1. Load the `linkedin-automation` MCP connector.
2. Complete the connector authorization flow when Claude opens it.
3. After authorization, call `linkedin_connection_status`.
4. When the status call succeeds, reply with: `LinkedIn's connected.`
