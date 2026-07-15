---
name: linkedin-connect
description: Connect or reconnect the user's LinkedIn account for LinkedIn automation. Use when the user asks to connect LinkedIn, set up LinkedIn automation, reconnect LinkedIn, or check whether LinkedIn is connected.
---

# LinkedIn Connect

Use the plugin-provided `linkedin-automation` MCP connector.

1. Load the `linkedin_connect` tool from the `linkedin-automation` MCP connector.
2. Call `linkedin_connect`.
3. Open the returned `login_url` for the user.
4. Call `linkedin_connection_status` with the returned `session_id` every few seconds until it returns `status: "connected"`.
5. Keep the returned `connection_session_id` for later LinkedIn automation tool calls in this conversation.
6. When the status call succeeds, reply with: `LinkedIn's connected.`

For LinkedIn automation tools used after connection, include the saved `connection_session_id` whenever the tool accepts it.
