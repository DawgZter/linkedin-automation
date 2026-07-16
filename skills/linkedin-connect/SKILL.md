---
name: linkedin-connect
description: Connect the user's LinkedIn account for LinkedIn automation. Use when the user asks to connect LinkedIn, set up LinkedIn automation, reconnect LinkedIn, or check whether LinkedIn is connected.
---

# LinkedIn Connect

Use the plugin's LinkedIn tools.

1. Load `linkedin_connect` and `linkedin_connection_status`.
2. Call `linkedin_connect`. It opens the work-account sign-in in the user's browser.
3. Keep this run active and call `linkedin_connection_status` every few seconds until it returns `status: "connected"`.
4. Reply with: `LinkedIn's connected.`
