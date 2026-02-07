---
description: Set up MCP servers from JSON configuration
---

# /mcp-setup

Set up MCP (Model Context Protocol) servers from JSON configuration. Paste your MCP JSON configuration and the plugin will automatically configure the servers in Claude Code.

## What it does

- **Parses MCP JSON configuration** from pasted content or files
- **Validates configuration** against MCP server schema
- **Updates Claude settings** with new MCP server entries
- **Supports merging** with existing servers or full replacement
- **Expands environment variables** in configuration values

## Usage

### Paste JSON directly

```bash
/mcp-setup
```

Then paste your MCP configuration when prompted:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

### From file

```bash
/mcp-setup --file ./mcp-config.json
```

### Replace existing servers

```bash
/mcp-setup --file ./mcp-config.json --replace
```

This will remove all existing MCP servers and add only the new ones.

### Merge with existing (default behavior)

```bash
/mcp-setup --file ./mcp-config.json
```

This adds or updates servers without removing existing ones.

## Options

- `--file <path>`: Path to JSON configuration file
- `--replace`: Replace all existing MCP servers
- `--remove-missing`: Remove servers not in new configuration
- `--stdin`: Read configuration from standard input

## Configuration Format

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"],
      "env": {
        "ENV_VAR": "value"
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

### Server Configuration Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | Yes | Executable command to run the server |
| `args` | array | No | Command-line arguments |
| `env` | object | No | Environment variables |
| `transportType` | string | No | Transport type: `stdio`, `sse`, `websocket`, `http` |
| `startupTimeout` | number | No | Milliseconds to wait for server startup |
| `shutdownTimeout` | number | No | Milliseconds to wait for graceful shutdown |
| `restartOnCrash` | boolean | No | Whether to restart crashed servers |
| `maxRestarts` | number | No | Maximum restart attempts |

## Environment Variables

Use `${VAR_NAME}` or `$VAR_NAME` syntax to reference environment variables:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}",
        "GITHUB_API_URL": "https://api.github.com"
      }
    }
  }
}
```

## Examples

### Basic filesystem server

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    }
  }
}
```

### Server with custom transport

```json
{
  "mcpServers": {
    "custom-server": {
      "command": "python",
      "args": ["./server.py", "--port", "8080"],
      "transportType": "http",
      "startupTimeout": 10000,
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Multiple servers

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/postgres", "postgresql://user:pass@localhost/db"]
    }
  }
}
```

## Output

The command displays a summary showing:

- Number of servers added successfully
- Number of servers that failed validation
- Configuration file path
- Instructions for activating the new servers

## Requirements

- Claude Code with MCP support
- Node.js 18.0.0 or higher
- For stdio transport: command must be available in PATH
- For Docker-based servers: Docker must be installed

## Related Commands

- `/mcp-list` - List configured MCP servers
- `/mcp-remove` - Remove specific MCP servers
- `/mcp-validate` - Validate MCP configuration without applying