# LinkedIn Automation

A Claude plugin that connects each rep to private, scoped LinkedIn automation tools.

## Use

Install the plugin in Claude, then ask:

```text
connect my LinkedIn account
```

Claude opens authorization with the rep's work Google account. Existing reps are connected to their saved LinkedIn account immediately; a new rep completes LinkedIn sign-in once.

The plugin stores the connector authorization locally on the rep's computer, refreshes it automatically, and uses it across Claude threads. Every LinkedIn action remains scoped to that rep's account.

## Components

- `linkedin-connect` skill in `skills/linkedin-connect`
- bundled local MCP bridge in `server/start.mjs`

Each rep's Google identity is privately bound to one LinkedIn account. The local connector proxies authenticated requests to the hosted LinkedIn automation service without exposing account IDs in prompts or plugin configuration.
