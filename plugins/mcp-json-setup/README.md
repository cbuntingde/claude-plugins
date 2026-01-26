# MCP JSON Setup Plugin

A Claude Code plugin that enables automatic MCP (Model Context Protocol) server setup from JSON configuration. Instead of manually configuring MCP servers through CLI commands, simply paste or provide your MCP JSON configuration and the plugin handles the rest.

## Features

- **JSON-based Configuration**: Paste MCP server configurations as JSON
- **Validation**: Built-in schema validation for server configurations
- **Environment Variable Support**: Expand `${VAR}` and `$VAR` in configuration values
- **Merge or Replace**: Optionally merge with existing servers or perform full replacement
- **Project & Global Configuration**: Support for both project-level (`.mcp.json`) and global (`~/.claude/mcp.json`) configurations
- **Multiple Commands**: Setup, list, validate, and remove servers
- **Error Handling**: Detailed error messages with error codes for programmatic handling
- **Security**: Validates all inputs, proper file permissions

## Installation

### Option 1: Install from Local Directory

```bash
claude plugin install /path/to/mcp-json-setup
```

### Option 2: Clone and Install

```bash
git clone https://github.com/cbuntingde/claude-plugins.git
cd claude-plugins/plugins/mcp-json-setup
claude plugin install .
```

### Option 3: Install from Marketplace (when published)

```bash
claude plugin install mcp-json-setup
```

## Quick Start

After installation, use the `/mcp-setup` command to configure MCP servers:

```bash
# Start the setup command (creates .mcp.json in project root)
/mcp-setup

# Or specify a configuration file
/mcp-setup --file ./mcp-config.json

# For global configuration (affects all projects)
/mcp-setup --file ./mcp-config.json --global
```

**Important**: By default, the plugin creates `.mcp.json` in your project directory. This is the standard location for Claude Code MCP server configuration. Use the `--global` flag only if you want servers available across all projects.

Example configuration file (`mcp-config.json`):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"],
      "env": {
        "DEBUG": "false"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Usage

### /mcp-setup

Add or update MCP servers from JSON configuration.

```bash
/mcp-setup                          # Interactive mode - paste JSON when prompted (project-level)
/mcp-setup --file config.json       # From file (project-level)
/mcp-setup --file config.json --global  # From file (global configuration)
/mcp-setup --file config.json --replace  # Replace all existing servers
```

**Options:**

| Option | Description |
|--------|-------------|
| `--file <path>` | Path to JSON configuration file |
| `--global` | Use global configuration (~/.claude/mcp.json) instead of project (.mcp.json) |
| `--replace` | Replace all existing MCP servers |
| `--remove-missing` | Remove servers not in new configuration |
| `--stdin` | Read configuration from standard input |

### /mcp-list

Display all configured MCP servers with their details.

```bash
/mcp-list              # List project-level servers
/mcp-list --global     # List globally configured servers
```

Output includes server names, commands, arguments, transport types, and enabled status.

### /mcp-remove

Remove specific MCP servers from the configuration.

```bash
/mcp-remove filesystem          # Remove single server (project-level)
/mcp-remove --global filesystem github  # Remove from global configuration
```

### /mcp-validate

Validate MCP configuration without applying changes.

```bash
/mcp-validate                    # Interactive - paste JSON to validate
/mcp-validate --file config.json # Validate file
```

## Configuration Format

### Basic Configuration

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name"],
      "env": {
        "KEY": "value"
      }
    }
  }
}
```

### Advanced Configuration

```json
{
  "mcpServers": {
    "custom-server": {
      "command": "python",
      "args": ["./server.py", "--port", "8080"],
      "env": {
        "LOG_LEVEL": "debug",
        "API_KEY": "${API_KEY}"
      },
      "transportType": "http",
      "startupTimeout": 30000,
      "shutdownTimeout": 5000,
      "restartOnCrash": true,
      "maxRestarts": 3
    }
  }
}
```

### Configuration Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | Yes | Executable command to run the server |
| `args` | array | No | Command-line arguments (strings only) |
| `env` | object | No | Environment variables (string values only) |
| `transportType` | string | No | Transport type: `stdio`, `sse`, `websocket`, `http` |
| `startupTimeout` | number | No | Milliseconds to wait for server startup |
| `shutdownTimeout` | number | No | Milliseconds to wait for graceful shutdown |
| `restartOnCrash` | boolean | No | Whether to restart crashed servers |
| `maxRestarts` | number | No | Maximum restart attempts |

### Environment Variables in Configuration

Use `${VAR_NAME}` or `$VAR_NAME` syntax to reference environment variables:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}",
        "GITHUB_API_URL": "${GITHUB_API_URL:-https://api.github.com}"
      }
    }
  }
}
```

Variables that are not set remain as-is in the configuration (they are not replaced).

## Script Usage

The plugin also provides a command-line script for non-interactive usage:

```bash
# Setup from file (project-level)
node scripts/setup-mcp.js ./mcp-config.json

# Setup from file (global)
node scripts/setup-mcp.js ./mcp-config.json --global

# List configured servers
node scripts/setup-mcp.js --list

# List globally configured servers
node scripts/setup-mcp.js --list --global

# Validate configuration
node scripts/setup-mcp.js --validate ./mcp-config.json

# Remove servers
node scripts/setup-mcp.js --remove server1 server2
```

## Configuration Locations

### Project-Level Configuration (Recommended)

**Location:** `.mcp.json` in your project root directory

**When to use:**
- Project-specific MCP servers
- Different servers for different projects
- When you want servers only available in a specific project

**Example:**
```bash
# In /path/to/my-project/
/mcp-setup --file ./mcp-config.json
# Creates: /path/to/my-project/.mcp.json
```

### Global Configuration

**Location:** `~/.claude/mcp.json` (user home directory)

**When to use:**
- Servers you want available across all projects
- Commonly used servers (e.g., GitHub, filesystem)
- When you don't want to configure servers per project

**Example:**
```bash
/mcp-setup --file ./mcp-config.json --global
# Creates: ~/.claude/mcp.json
```

**Important Notes:**
- Project-level configuration (`.mcp.json`) takes precedence over global
- Use `--global` flag with all commands to work with global config
- Global configuration is useful for servers you use frequently across projects

## Environment Variables

The plugin sets or uses the following environment variables:

| Variable | Description |
|----------|-------------|
| `CLAUDE_PLUGIN_ROOT` | Path to the plugin directory (set by Claude Code) |
| `USERPROFILE` (Windows) | User home directory |
| `HOME` (Unix/macOS) | User home directory |

## Common Use Cases

### Setting up official MCP servers

```bash
# GitHub
/mcp-setup
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Multiple servers at once

```bash
/mcp-setup
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

### Docker-based servers

```bash
/mcp-setup
{
  "mcpServers": {
    "postgres": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/postgres", "postgresql://user:pass@localhost/db"]
    },
    "redis": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/redis"]
    }
  }
}
```

### Replacing all servers

```bash
/mcp-setup --file new-config.json --replace
```

## Troubleshooting

### Server not starting

1. Validate your configuration: `/mcp-validate --file config.json`
2. Ensure the command is in PATH
3. Check command arguments for typos
4. Verify environment variables are set

### Configuration not saved

**For project-level configuration:**
1. Ensure Claude Code has write access to your project directory
2. Check file permissions on `.mcp.json`
3. Restart Claude Code after configuration changes

**For global configuration:**
1. Ensure Claude Code has write access to `~/.claude/`
2. Check file permissions on `~/.claude/mcp.json`
3. Restart Claude Code after configuration changes

### Invalid JSON errors

1. Verify the JSON is valid (use a JSON validator)
2. Ensure all string values are quoted
3. Check for trailing commas
4. Use `/mcp-validate` to identify specific issues

### Environment variables not expanded

1. Verify variable names match exactly (case-sensitive)
2. Check if variables are exported in your shell
3. Restart Claude Code after setting new environment variables

### Servers not recognized by Claude Code

1. **Verify file location**: Ensure `.mcp.json` is in your project root directory
2. **Check format**: Confirm JSON follows the exact format with `mcpServers` key
3. **Restart Claude Code**: MCP servers require restart to load
4. **Run diagnostics**: Use `/doctor` command in Claude Code to check MCP status
5. **Verify no settings.json**: MCP configuration should be in `.mcp.json`, NOT `~/.claude/settings.json`

**Common mistake:** Placing MCP configuration in `~/.claude/settings.json` does NOT work. Use `.mcp.json` in your project directory or `~/.claude/mcp.json` for global configuration.

## Security Considerations

1. **Secrets in Configuration**: Use environment variables for sensitive values
2. **File Permissions**: Configuration files are created with 0o600 permissions
3. **Input Validation**: All configuration is validated before application
4. **No Credentials in Logs**: Sensitive values are never logged
5. **Command Whitelisting**: Only string values are allowed in command arguments

## API Reference

### Module: index.js

```javascript
const mcpSetup = require('mcp-json-setup');

// Parse and validate JSON configuration
const config = mcpSetup.parseMcpJson(jsonString);

// Setup servers from configuration
const result = mcpSetup.setupMcpServers(config, {
  replace: false,
  removeMissing: false
});

// List configured servers
const servers = mcpSetup.listMcpServers();

// Remove specific servers
const removal = mcpSetup.removeMcpServers(['server1', 'server2']);

// Validate without applying
const validation = mcpSetup.validateOnly(jsonString);

// Generate configuration string
const generated = mcpSetup.generateMcpConfig(config, {
  envOverrides: { CUSTOM_VAR: 'value' },
  basePath: '/path/to/plugins'
});
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_JSON` | JSON parsing failed |
| `MISSING_FIELD` | Required field is missing |
| `INVALID_COMMAND` | Command validation failed |
| `INVALID_ENV_VAR` | Environment variable validation failed |
| `FILE_WRITE_ERROR` | Failed to write configuration file |
| `VALIDATION_ERROR` | Schema validation failed |
| `PERMISSION_DENIED` | Insufficient permissions |
| `SERVER_NOT_FOUND` | Server not found in configuration |
| `CONFIGURATION_ERROR` | General configuration error |

## Requirements

- Node.js 18.0.0 or higher
- Claude Code with plugin support
- For stdio transport: command must be available in PATH
- For Docker servers: Docker must be installed

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## Resources

- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Claude Code Documentation](https://code.claude.com/docs)

---

Made with care for the Claude Code community