---
description: Remove MCP servers from configuration
---

# /mcp-remove

Remove specific MCP (Model Context Protocol) servers from the Claude Code configuration.

## What it does

- **Removes specified servers** from MCP configuration
- **Validates server names** before removal
- **Updates configuration file** atomically
- **Reports removed vs not found** servers

## Usage

```bash
/mcp-remove <server1> <server2> ...
```

## Examples

Remove a single server:

```bash
/mcp-remove filesystem
```

Remove multiple servers:

```bash
/mcp-remove filesystem github postgres
```

## Options

- `<server1> <server2> ...`: Space-separated list of server names to remove

## Output Example

```
MCP Server Removal Summary
===========================

Removed servers:
  ✓ filesystem
  ✓ github

Servers not found:
  - postgres
```

## Behavior

- **Only removes servers that exist** - unknown servers are reported as not found
- **Does not affect other servers** - only specified servers are removed
- **Configuration is updated atomically** - partial failures do not leave corrupt state

## Requirements

- Claude Code with MCP support
- Node.js 18.0.0 or higher
- Write access to Claude settings directory

## Related Commands

- `/mcp-setup` - Add or update MCP servers
- `/mcp-list` - List configured MCP servers
- `/mcp-validate` - Validate MCP configuration

## See Also

- [MCP Server Configuration](https://github.com/modelcontextprotocol/specification)