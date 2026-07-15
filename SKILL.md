---
name: linkedin-connect
description: Connect or reconnect the user's LinkedIn account for LinkedIn automation. Use when the user asks to connect LinkedIn, set up LinkedIn automation, reconnect LinkedIn, or check whether LinkedIn is connected.
---

# LinkedIn Connect

Use the plugin-provided `linkedin-automation` MCP connector.

1. Call `linkedin_connection_status`.
2. When the status is `not_connected`, call `linkedin_connect`.
3. Present the returned `login_url` and keep the returned `session_id`.
4. Start the status loop immediately by calling `linkedin_connect_status` with that `session_id`.
5. Keep calling `linkedin_connect_status` every short interval until it reports `connected`.
6. When the status call succeeds, reply with: `LinkedIn's connected.`
