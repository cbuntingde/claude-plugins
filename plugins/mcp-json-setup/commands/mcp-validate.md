---
description: Validate MCP JSON configuration without applying changes
---

# /mcp-validate

Validate MCP (Model Context Protocol) JSON configuration without modifying any files. This command checks that the configuration is syntactically correct and follows MCP server specifications.

## What it does

- **Parses JSON configuration** to verify syntax
- **Validates server configurations** against MCP schema
- **Reports errors** with line numbers and descriptions
- **Provides detailed feedback** for each server

## Usage

### Paste JSON directly

```bash
/mcp-validate
```

Then paste your MCP configuration when prompted.

### From file

```bash
/mcp-validate --file ./mcp-config.json
```

## Options

- `--file <path>`: Path to JSON configuration file to validate

## Configuration Format

```json
{
  "mcpServers": {
    "server-name": {
      "command": "string",
      "args": ["array", "of", "strings"],
      "env": {
        "KEY": "value"
      },
      "transportType": "stdio",
      "startupTimeout": 30000,
      "shutdownTimeout": 5000,
      "restartOnCrash": true,
      "maxRestarts": 3
    }
  }
}
```

## Validation Rules

### Required Fields
- `command` (string): Must be a non-empty string

### Optional Fields
- `args` (array of strings): Each argument must be a string
- `env` (object): All values must be strings
- `transportType` (string): Must be one of: `stdio`, `sse`, `websocket`, `http`
- `startupTimeout` (number): Must be a non-negative integer
- `shutdownTimeout` (number): Must be a non-negative integer
- `restartOnCrash` (boolean): Must be a boolean value
- `maxRestarts` (number): Must be a non-negative integer

## Output Examples

### Valid Configuration

```
Validation PASSED

Servers: 2
  ✓ filesystem
  ✓ github
```

### Invalid Configuration

```
Validation FAILED

Error: Server "github" is missing required field: command

Servers: 2
  ✓ filesystem
  ✗ github
    - Server "github" is missing required field: command
```

### JSON Syntax Error

```
Validation FAILED

Error: Invalid JSON format: Unexpected token } in JSON at position 142
```

## Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing required field: command` | Server config missing command | Add `command` field with executable path |
| `args must be an array` | args is not an array | Change args to array format: `["arg1", "arg2"]` |
| `env must be an object` | env is not an object | Change env to object format: `{"KEY": "value"}` |
| `transportType must be one of: stdio, sse, websocket, http` | Invalid transport type | Use one of the valid transport types |

## Use Cases

1. **Before applying configuration** - Validate first to catch errors
2. **During CI/CD** - Validate configuration in automated pipelines
3. **Configuration templates** - Validate shared configuration before distribution
4. **Debugging** - Check if configuration is the source of server startup issues

## Requirements

- Claude Code with MCP support
- Node.js 18.0.0 or higher

## Related Commands

- `/mcp-setup` - Apply validated configuration
- `/mcp-list` - List configured servers
- `/mcp-remove` - Remove specific servers

## See Also

- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)