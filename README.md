# LinkedIn Automation

A Claude plugin that connects LinkedIn through a hosted login flow and exposes a scoped `linkedin-automation` MCP connector.

## Use

Install the plugin in Claude, then ask:

```text
connect my LinkedIn account
```

Claude will create a hosted LinkedIn login link, keep checking the connection, and confirm when LinkedIn is connected.
Once connected, the MCP session uses that LinkedIn account automatically.
The server scopes every LinkedIn action to the account returned by the hosted login.

## Components

- `linkedin-connect` skill in `skills/linkedin-connect`
- `linkedin-automation` remote MCP connector

The connector URL is static. Each user's LinkedIn account is bound during the hosted login flow.
