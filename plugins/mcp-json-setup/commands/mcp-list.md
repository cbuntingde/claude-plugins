---
description: List all configured MCP servers
---

# /mcp-list

List all currently configured MCP (Model Context Protocol) servers with their configuration details.

## What it does

- **Displays all configured MCP servers** from Claude settings
- **Shows server details** including command, arguments, and environment
- **Indicates transport type** and configuration options
- **Provides configuration file path** for reference

## Usage

```bash
/mcp-list
```

## Output Example

```
Configured MCP Servers
=======================

Total: 3 server(s)

  filesystem
    Command: npx
    Args: -y @modelcontextprotocol/server-filesystem ./data
    Transport: stdio
    Enabled: true

  github
    Command: npx
    Args: -y @modelcontextprotocol/server-github
    Transport: stdio
    Enabled: true

  postgres
    Command: docker
    Args: run --rm -i mcp/postgres postgresql://user:pass@localhost/db
    Transport: stdio
    Enabled: true
```

## What is shown for each server

| Property | Description |
|----------|-------------|
| `Name` | Server identifier |
| `Command` | Executable command |
| `Args` | Command-line arguments |
| `Transport` | Transport type (stdio, sse, websocket, http) |
| `Enabled` | Whether the server is enabled |

## Configuration File Location

The command also displays the path to the MCP configuration file (typically `~/.claude/mcp.json`) for reference when manual edits are needed.

## Requirements

- Claude Code with MCP support
- Node.js 18.0.0 or higher

## Related Commands

- `/mcp-setup` - Add or update MCP servers
- `/mcp-remove` - Remove specific MCP servers
- `/mcp-validate` - Validate MCP configuration