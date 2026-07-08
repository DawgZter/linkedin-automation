# LinkedIn Automation

A Claude plugin that connects LinkedIn through a hosted login flow and exposes a scoped `linkedin-automation` MCP connector.

## Use

Install the plugin in Claude, then ask:

```text
connect my LinkedIn account
```

Claude will create a hosted LinkedIn login link, keep checking the connection, and confirm when LinkedIn is connected.

## Components

- `linkedin-connect` skill
- `linkedin-automation` remote MCP connector

The connector URL is static. Each user's LinkedIn account is bound during the hosted login flow.
