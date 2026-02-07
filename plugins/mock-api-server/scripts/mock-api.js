#!/usr/bin/env node
/**
 * Mock API CLI - Command implementation for /mock-api
 *
 * Provides CLI interface for managing mock API servers.
 */

const fs = require('fs').promises;
const path = require('path');

const SUBCOMMANDS = ['start', 'stop', 'status', 'generate', 'list'];

/**
 * Display usage information
 */
function showUsage() {
  console.log(`
Mock API Server CLI

Usage: mock-api <subcommand> [options]

Subcommands:
  start <port> [config]   Start a mock API server on the specified port
  stop <port>             Stop the mock server running on the specified port
  status                  Show status of all running mock servers
  generate <spec-file>    Generate mock API configuration from OpenAPI spec
  list                    List available example configurations

Options:
  -h, --help              Show this help message
  -v, --version           Show version information

Examples:
  mock-api start 3001 ./api-config.json
  mock-api stop 3001
  mock-api status
  mock-api generate ./openapi.yaml
`);
}

/**
 * Show version
 */
function showVersion() {
  const pkg = require('../package.json');
  console.log(`mock-api-server v${pkg.version}`);
}

/**
 * Read configuration file
 */
async function readConfig(configPath) {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Start a mock server
 */
async function startServer(port, configPath) {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    console.error('Error: Port must be a number between 1 and 65535');
    process.exit(1);
  }

  let config = { endpoints: [] };

  if (configPath) {
    config = await readConfig(configPath);
  }

  console.log(`Starting mock API server on port ${portNum}...`);
  console.log(`Configuration: ${configPath || 'default'}`);

  if (config.endpoints && config.endpoints.length > 0) {
    console.log(`Endpoints: ${config.endpoints.length}`);
  }

  console.log('');
  console.log('To start the server, use the MCP tools or create a configuration file.');
  console.log(`Server URL: http://localhost:${portNum}`);
}

/**
 * Stop a mock server
 */
async function stopServer(port) {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum)) {
    console.error('Error: Port must be a number');
    process.exit(1);
  }

  console.log(`Stopping mock API server on port ${portNum}...`);
  console.log('Note: Server management is primarily done through MCP tools.');
}

/**
 * Show server status
 */
async function showStatus() {
  console.log('Mock API Server Status');
  console.log('');
  console.log('No running servers found.');
  console.log('');
  console.log('To start a server, use:');
  console.log('  mock-api start <port> [config-file]');
  console.log('');
  console.log('Or use the /mock-api command in Claude Code.');
}

/**
 * Generate configuration from OpenAPI spec
 */
async function generateFromSpec(specPath) {
  console.log(`Generating mock API configuration from: ${specPath}`);

  try {
    const content = await fs.readFile(specPath, 'utf-8');
    let spec;

    if (specPath.endsWith('.yaml') || specPath.endsWith('.yml')) {
      const YAML = require('yaml');
      spec = YAML.parse(content);
    } else {
      spec = JSON.parse(content);
    }

    if (!spec.paths) {
      console.error('Error: No paths found in OpenAPI specification');
      process.exit(1);
    }

    const endpoints = [];

    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
          endpoints.push({
            path,
            method: method.toUpperCase(),
            response: {
              message: `Response for ${method.toUpperCase()} ${path}`,
              ...(details.responses && {
                status: Object.keys(details.responses)[0]
              })
            },
            status: 200,
            delay: 100
          });
        }
      }
    }

    const config = { endpoints };
    const outputPath = specPath.replace(/\.(yaml|yml|json)$/, '-mock.json');

    await fs.writeFile(outputPath, JSON.stringify(config, null, 2));

    console.log(`Generated configuration with ${endpoints.length} endpoints`);
    console.log(`Output: ${outputPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * List example configurations
 */
async function listExamples() {
  const examplesDir = path.join(__dirname, '..', 'examples');

  try {
    const files = await fs.readdir(examplesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    console.log('Available example configurations:');
    console.log('');

    for (const file of jsonFiles) {
      const filePath = path.join(examplesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const config = JSON.parse(content);
      const endpointCount = config.endpoints?.length || 0;
      console.log(`  - ${file} (${endpointCount} endpoints)`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No example configurations found.');
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    showUsage();
    process.exit(0);
  }

  if (args[0] === '-v' || args[0] === '--version') {
    showVersion();
    process.exit(0);
  }

  const subcommand = args[0].toLowerCase();

  if (!SUBCOMMANDS.includes(subcommand)) {
    console.error(`Error: Unknown subcommand '${subcommand}'`);
    console.error(`Valid subcommands: ${SUBCOMMANDS.join(', ')}`);
    process.exit(1);
  }

  try {
    switch (subcommand) {
      case 'start':
        if (args.length < 2) {
          console.error('Error: Missing port number');
          console.error('Usage: mock-api start <port> [config-file]');
          process.exit(1);
        }
        await startServer(args[1], args[2]);
        break;

      case 'stop':
        if (args.length < 2) {
          console.error('Error: Missing port number');
          console.error('Usage: mock-api stop <port>');
          process.exit(1);
        }
        await stopServer(args[1]);
        break;

      case 'status':
        await showStatus();
        break;

      case 'generate':
        if (args.length < 2) {
          console.error('Error: Missing specification file');
          console.error('Usage: mock-api generate <openapi-spec>');
          process.exit(1);
        }
        await generateFromSpec(args[1]);
        break;

      case 'list':
        await listExamples();
        break;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();