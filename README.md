# LinkedIn Automation

A Claude plugin that connects each rep to private, scoped LinkedIn automation tools.

## Use

Install the plugin in Claude, then ask:

```text
connect my LinkedIn account
```

Claude opens authorization with the rep's work Google account. Existing reps are connected to their saved LinkedIn account immediately; a new rep completes LinkedIn sign-in once.

Claude stores and refreshes the connector authorization across threads. Every LinkedIn action remains scoped to that rep's account.

## Components

- `linkedin-connect` skill in `skills/linkedin-connect`
- hosted `linkedin-automation` MCP connector

Each rep's Google identity is privately bound to one LinkedIn account. Claude connects directly to the hosted LinkedIn automation service without exposing account IDs in prompts or plugin configuration. No local runtime or setup is required.
