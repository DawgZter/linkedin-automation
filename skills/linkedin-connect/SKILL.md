---
name: linkedin-connect
description: Connect the user's LinkedIn account for LinkedIn automation. Use when the user asks to connect LinkedIn, set up LinkedIn automation, reconnect LinkedIn, or check whether LinkedIn is connected.
---

# LinkedIn Connect

Use the plugin's LinkedIn tools.

1. Load `mcp__plugin_linkedin-automation_linkedin-automation__linkedin_connection_status` and `mcp__plugin_linkedin-automation_linkedin-automation__linkedin_connect`.
2. Call `linkedin_connection_status`. When it returns `status: "connected"`, reply with: `LinkedIn's connected.`
3. When the account is not connected, call `linkedin_connect`. It opens the work-account sign-in in the user's browser.
4. Keep this run active and call `linkedin_connection_status` every few seconds until it returns `status: "connected"`.
5. Reply with: `LinkedIn's connected.`
