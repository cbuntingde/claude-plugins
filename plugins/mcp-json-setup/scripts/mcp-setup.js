#!/usr/bin/env node
/**
 * MCP Server Setup Script
 *
 * This script parses MCP JSON configuration and sets up MCP servers
 * in the Claude Code settings file.
 *
 * Usage:
 *   node scripts/setup-mcp.js <config.json> [--replace] [--remove-missing] [--global]
 *   node scripts/setup-mcp.js --file <config.json> [--replace] [--global]
 *   node scripts/setup-mcp.js --stdin [--replace] [--global]
 *   node scripts/setup-mcp.js --list [--global]
 *   node scripts/setup-mcp.js --remove <server1> <server2> ... [--global]
 *   node scripts/setup-mcp.js --validate <config.json>
 */

'use strict';

const path = require('path');
const fs = require('fs');
const index = require('../index');

/**
 * Parse command line arguments
 * @returns {object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    mode: 'setup', // setup, list, remove, validate
    file: null,
    stdin: false,
    global: false,
    replace: false,
    removeMissing: false,
    servers: [],
    json: null
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--file' || arg === '-f') {
      i++;
      if (i < args.length) {
        parsed.file = args[i];
      }
    } else if (arg === '--stdin' || arg === '-s') {
      parsed.stdin = true;
    } else if (arg === '--global' || arg === '-g') {
      parsed.global = true;
    } else if (arg === '--replace' || arg === '-r') {
      parsed.replace = true;
    } else if (arg === '--remove-missing') {
      parsed.removeMissing = true;
    } else if (arg === '--list' || arg === '-l') {
      parsed.mode = 'list';
    } else if (arg === '--remove' || arg === '-d') {
      parsed.mode = 'remove';
    } else if (arg === '--validate' || arg === '-v') {
      parsed.mode = 'validate';
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      showHelp();
      process.exit(1);
    } else if (parsed.mode === 'setup' && !parsed.file && !parsed.stdin) {
      // Treat as file argument
      parsed.file = arg;
    } else if (parsed.mode === 'remove') {
      parsed.servers.push(arg);
    }
    i++;
  }

  return parsed;
}

/**
 * Display help message
 */
function showHelp() {
  const help = `
MCP Server Setup Script
========================

This script sets up MCP (Model Context Protocol) servers from JSON configuration.

Usage:
  node scripts/setup-mcp.js <config.json> [options]
  node scripts/setup-mcp.js --file <config.json> [options]
  node scripts/setup-mcp.js --stdin [options]
  node scripts/setup-mcp.js --list [--global]
  node scripts/setup-mcp.js --remove <server1> <server2> ... [--global]
  node scripts/setup-mcp.js --validate <config.json>

Options:
  --file, -f <file>     JSON file containing MCP configuration
  --stdin, -s           Read configuration from stdin
  --global, -g           Use global configuration (~/.claude/mcp.json) instead of project (.mcp.json)
  --replace             Replace all existing servers (default: merge)
  --remove-missing      Remove servers not in new configuration
  --list, -l            List configured servers
  --remove, -d <name>   Remove specific server(s)
  --validate, -v        Validate configuration without applying
  --help, -h            Show this help message

Examples:
  # Setup from file (project-level)
  node scripts/setup-mcp.js ./mcp-config.json

  # Setup from file (global)
  node scripts/setup-mcp.js ./mcp-config.json --global

  # Replace all servers
  node scripts/setup-mcp.js ./mcp-config.json --replace

  # Read from stdin
  echo '{"mcpServers": {...}}' | node scripts/setup-mcp.js --stdin

  # List configured servers
  node scripts/setup-mcp.js --list

  # List globally configured servers
  node scripts/setup-mcp.js --list --global

  # Remove a server
  node scripts/setup-mcp.js --remove server-name

  # Validate configuration
  node scripts/setup-mcp.js --validate ./mcp-config.json

Configuration Format:
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"],
      "env": {
        "API_KEY": "${API_KEY}"
      },
      "transportType": "stdio",
      "startupTimeout": 30000,
      "shutdownTimeout": 5000,
      "restartOnCrash": true,
      "maxRestarts": 3
    }
  }
}

Environment Variables:
- Use \${VAR_NAME} or $VAR_NAME in config values to reference environment variables
- Variables are expanded before writing the configuration
`;
  console.log(help);
}

/**
 * Main execution function
 */
async function main() {
  try {
    const args = parseArgs();

    // Handle different modes
    switch (args.mode) {
      case 'list':
        await handleList(args.global);
        break;
      case 'remove':
        await handleRemove(args.servers, args.global);
        break;
      case 'validate':
        await handleValidate(args.file);
        break;
      case 'setup':
      default:
        await handleSetup(args);
        break;
    }
  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    if (error.code) {
      console.error(`Error code: ${error.code}\n`);
    }
    process.exit(1);
  }
}

/**
 * Handle list mode - display configured servers
 */
async function handleList(global) {
  const result = index.listMcpServers(global);

  if (!result.success) {
    console.error(`Failed to list servers: ${result.error}`);
    process.exit(1);
  }

  console.log('\nConfigured MCP Servers');
  console.log('=======================');

  const scope = global ? 'Global' : 'Project';
  console.log(`Scope: ${scope}`);
  console.log(`Configuration file: ${result.configPath}`);
  
  if (result.count === 0) {
    console.log('\nNo MCP servers configured.\n');
    return;
  }

  console.log(`\nTotal: ${result.count} server(s)\n`);

  result.servers.forEach(server => {
    console.log(`  ${server.name}`);
    console.log(`    Command: ${server.command}`);
    if (server.args.length > 0) {
      console.log(`    Args: ${server.args.join(' ')}`);
    }
    console.log(`    Transport: ${server.transportType}`);
    console.log(`    Enabled: ${server.enabled}`);
    console.log('');
  });
}

/**
 * Handle remove mode - remove specified servers
 */
async function handleRemove(serverNames, global) {
  if (serverNames.length === 0) {
    console.error('Error: At least one server name must be specified with --remove\n');
    showHelp();
    process.exit(1);
  }

  const result = index.removeMcpServers(serverNames, global);

  if (!result.success) {
    console.error(`Failed to remove servers: ${result.error}`);
    process.exit(1);
  }

  console.log('\nMCP Server Removal Summary');
  console.log('===========================');
  
  const scope = global ? 'Global' : 'Project';
  console.log(`Scope: ${scope}`);
  console.log(`Configuration file: ${result.configPath}`);

  if (result.removed.length > 0) {
    console.log('\nRemoved servers:');
    result.removed.forEach(name => {
      console.log(`  ✓ ${name}`);
    });
  }

  if (result.notFound.length > 0) {
    console.log('\nServers not found:');
    result.notFound.forEach(name => {
      console.log(`  - ${name}`);
    });
  }

  console.log('\nTo apply changes, restart Claude Code or run: claude mcp reload\n');
}

/**
 * Handle validate mode - validate configuration without applying
 */
async function handleValidate(filePath) {
  if (!filePath) {
    console.error('Error: A configuration file must be specified for validation\n');
    showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Configuration file not found: ${filePath}\n`);
    process.exit(1);
  }

  const jsonContent = fs.readFileSync(filePath, 'utf8');
  const result = index.validateOnly(jsonContent);

  if (!result.valid) {
    console.error('\nValidation FAILED\n');
    console.error(`Error: ${result.error}`);
    if (result.code) {
      console.error(`Code: ${result.code}`);
    }
    process.exit(1);
  }

  console.log('\nValidation PASSED\n');
  console.log(`Servers: ${result.serverCount}`);

  result.servers.forEach(server => {
    const status = server.valid ? '✓' : '✗';
    console.log(`  ${status} ${server.name}`);
    if (!server.valid) {
      server.errors.forEach(err => {
        console.log(`    - ${err}`);
      });
    }
  });

  console.log('');
}

/**
 * Handle setup mode - apply configuration
 */
async function handleSetup(args) {
  let jsonContent;

  // Get JSON content from file or stdin
  if (args.stdin) {
    jsonContent = await readStdin();
  } else if (args.file) {
    if (!fs.existsSync(args.file)) {
      console.error(`\nError: Configuration file not found: ${args.file}\n`);
      process.exit(1);
    }
    jsonContent = fs.readFileSync(args.file, 'utf8');
  } else {
    console.error('\nError: No configuration provided. Use --file or --stdin\n');
    showHelp();
    process.exit(1);
  }

  // Parse and validate configuration
  let config;
  try {
    config = index.parseMcpJson(jsonContent);
  } catch (error) {
    console.error(`\nError parsing configuration: ${error.message}\n`);
    if (error.details?.validationErrors) {
      console.error('Validation errors:');
      error.details.validationErrors.forEach(err => {
        console.error(`  - ${err}`);
      });
    }
    process.exit(1);
  }

  // Setup servers
  const result = index.setupMcpServers(config, {
    replace: args.replace,
    removeMissing: args.removeMissing,
    global: args.global
  });

  // Display summary
  console.log(index.formatSetupSummary(result));

  if (!result.success) {
    process.exit(1);
  }
}

/**
 * Read configuration from stdin
 * @returns {Promise<string>} JSON configuration string
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', reject);
  });
}

// Export for testing
module.exports = {
  parseArgs,
  showHelp,
  handleList,
  handleRemove,
  handleValidate,
  handleSetup
};

// Run main function if executed directly
if (require.main === module) {
  main();
}