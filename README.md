# LinkedIn Automation

A Claude plugin that connects each rep to a private, scoped `linkedin-automation` MCP connector.

## Use

Install the plugin in Claude, then ask:

```text
connect my LinkedIn account
```

Claude will authorize the connector with the rep's work Google account. Existing reps are connected to their saved LinkedIn account immediately; a new rep completes LinkedIn sign-in once.

The authorization persists across Claude threads, and every LinkedIn action is scoped to that rep's account.

## Components

- `linkedin-connect` skill in `skills/linkedin-connect`
- `linkedin-automation` remote MCP connector

The connector URL is static. Each rep's Google identity is privately bound to one LinkedIn account.
