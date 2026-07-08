---
name: linkedin-connect
description: Connect or reconnect the user's LinkedIn account for LinkedIn automation. Use when the user asks to connect LinkedIn, set up LinkedIn automation, reconnect LinkedIn, or check whether LinkedIn is connected.
---

# LinkedIn Connect

Use the plugin-provided `linkedin-automation` MCP connector.

1. Call `linkedin_connection_status`.
2. When the status is `not_connected`, call `linkedin_connect`.
3. Present the returned `login_url` for the hosted LinkedIn login.
4. Stay active and call `linkedin_connect_status` with the returned `session_id` until it reports `connected`.
5. When the status call succeeds, reply with: `LinkedIn's connected.`
