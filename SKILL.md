---
name: linkedin-connect
description: Connect or reconnect the user's LinkedIn account for LinkedIn automation. Use when the user asks to connect LinkedIn, set up LinkedIn automation, reconnect LinkedIn, or check whether LinkedIn is connected.
---

# LinkedIn Connect

Use the plugin-provided `linkedin-automation` MCP connector.

1. Call `linkedin_connection_status`.
2. If the connector opens an authentication flow, stay active while the user completes the hosted LinkedIn login page.
3. After authentication completes, call `linkedin_connection_status` again.
4. When the status call succeeds, reply with: `LinkedIn's connected.`
