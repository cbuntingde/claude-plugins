#!/usr/bin/env node

/**
 * Mock API Server - MCP Server
 * Provides tools for creating and managing mock API endpoints
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Security constants
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB max response size
const ALLOWED_TEMP_DIR = process.env.TEMP || '/tmp';

// Allowed CORS origins (not wildcard)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

let httpServer = null;
const activeServers = new Map();

/**
 * Validate server file path to prevent path traversal
 */
function validateServerFilePath(fileName) {
  // Only allow alphanumeric characters, hyphens, and dots in filename
  if (!/^[a-zA-Z0-9.-]+$/.test(fileName)) {
    throw new Error('Invalid server filename: contains disallowed characters');
  }

  const resolved = path.join(ALLOWED_TEMP_DIR, fileName);
  const baseResolved = path.resolve(ALLOWED_TEMP_DIR);

  // Prevent traversal outside allowed temp directory
  if (!path.resolve(resolved).startsWith(baseResolved)) {
    throw new Error('Access denied: server file path is outside allowed scope');
  }

  return resolved;
}

/**
 * Start a mock HTTP server
 */
async function startServer(config) {
  const { port = 3001, endpoints = [], host = 'localhost' } = config;

  // Validate port number
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return {
      success: false,
      error: 'Invalid port number'
    };
  }

  // Check if server already running
  if (activeServers.has(portNum)) {
    return {
      success: false,
      error: `Server already running on port ${portNum}`
    };
  }

  // Create a simple Express server
  const serverCode = generateServerCode(portNum, endpoints);
  const serverFileName = `mock-server-${portNum}.js`;
  const serverFile = validateServerFilePath(serverFileName);

  await fs.writeFile(serverFile, serverCode);

  // Use spawn with array arguments - no shell interpolation
  const server = spawn('node', [serverFile], {
    env: { ...process.env, PORT: portNum.toString() },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  server.stdout.on('data', (data) => {
    console.log(`[Server ${port}] ${data}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`[Server ${port}] ${data}`);
  });

  activeServers.set(port, {
    process: server,
    config: config,
    file: serverFile
  });

  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    message: `Mock API server started on http://${host}:${port}`,
    url: `http://${host}:${port}`,
    port: port,
    endpoints: endpoints.length
  };
}

/**
 * Stop a mock server
 */
async function stopServer(port) {
  const server = activeServers.get(port);

  if (!server) {
    return {
      success: false,
      error: `No server running on port ${port}`
    };
  }

  server.process.kill();

  try {
    await fs.unlink(server.file);
  } catch (err) {
    // Ignore file deletion errors
  }

  activeServers.delete(port);

  return {
    success: true,
    message: `Server on port ${port} stopped`
  };
}

/**
 * Generate server code with security hardening
 */
function generateServerCode(port, endpoints) {
  const endpointHandlers = endpoints.map(ep => generateEndpointHandler(ep)).join('\n\n');
  const allowedOriginsJSON = JSON.stringify(ALLOWED_ORIGINS);

  return `
const http = require('http');
const url = require('url');

const MAX_RESPONSE_SIZE = ${MAX_RESPONSE_SIZE};
const ALLOWED_ORIGINS = ${allowedOriginsJSON};

// Get origin from request
function getOrigin(req) {
  return req.headers.origin || req.headers.referer || '';
}

// Check if origin is allowed
function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(\`[\${new Date().toISOString()}] \${method} \${pathname}\`);

  // CORS headers - restricted to specific origins, not wildcard
  const origin = getOrigin(req);
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    ${endpointHandlers}

    // 404 handler
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: pathname, method: method }));
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
  }
});

const PORT = ${port};
server.listen(PORT, () => {
  console.log(\`Mock API server running on http://localhost:\${PORT}\`);
});
`;
}

/**
 * Generate endpoint handler code with response size limiting
 */
function generateEndpointHandler(endpoint) {
  const { path: pathPattern, method = 'GET', response, status = 200, delay = 0 } = endpoint;

  // Validate path pattern
  if (pathPattern.includes('..') || pathPattern.includes('//')) {
    throw new Error('Invalid path pattern: path traversal not allowed');
  }

  // Convert path pattern to regex (sanitized)
  const sanitizedPath = pathPattern.replace(/[^a-zA-Z0-9/:?*[\]-]/g, '');
  const pathRegex = sanitizedPath
    .replace(/:([^/]+)/g, '(?<$1>[^/]+)')
    .replace(/\*/g, '.*');

  const delayCode = delay > 0 ? `await new Promise(r => setTimeout(r, ${delay}));` : '';

  return `
  if (method === '${method}' && pathname.match(/^${pathRegex}$/)) {
    ${delayCode}
    const responseData = ${JSON.stringify(response, null, 2)};
    // Check response size before sending
    const responseStr = JSON.stringify(responseData);
    if (responseStr.length > MAX_RESPONSE_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Response too large' }));
      return;
    }
    res.writeHead(${status}, { 'Content-Type': 'application/json' });
    res.end(responseStr);
    return;
  }
`;
}

/**
 * Get server status
 */
function getServerStatus() {
  return {
    activeServers: Array.from(activeServers.entries()).map(([port, info]) => ({
      port,
      url: `http://localhost:${port}`,
      endpoints: info.config.endpoints?.length || 0,
      pid: info.process.pid
    }))
  };
}

/**
 * Load configuration from file
 */
async function loadConfig(configPath) {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load config: ${error.message}`);
  }
}

/**
 * Save configuration to file
 */
async function saveConfig(configPath, config) {
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true, path: configPath };
  } catch (error) {
    throw new Error(`Failed to save config: ${error.message}`);
  }
}

// MCP Server interface
const server = {
  name: 'mock-api-mcp',
  version: '1.0.0',

  tools: {
    start_mock_server: {
      name: 'start_mock_server',
      description: 'Start a mock API server with the given configuration',
      inputSchema: {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            description: 'Port number for the server',
            default: 3001
          },
          endpoints: {
            type: 'array',
            description: 'Array of endpoint configurations',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string', description: 'Endpoint path' },
                method: { type: 'string', description: 'HTTP method', default: 'GET' },
                response: { type: 'object', description: 'Response data' },
                status: { type: 'number', description: 'HTTP status code', default: 200 },
                delay: { type: 'number', description: 'Response delay in ms', default: 0 }
              }
            }
          }
        },
        required: ['endpoints']
      }
    },

    stop_mock_server: {
      name: 'stop_mock_server',
      description: 'Stop a running mock API server',
      inputSchema: {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            description: 'Port number of the server to stop'
          },
          required: ['port']
        }
      }
    },

    get_server_status: {
      name: 'get_server_status',
      description: 'Get status of all running mock API servers',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },

    load_mock_config: {
      name: 'load_mock_config',
      description: 'Load mock API configuration from a JSON file',
      inputSchema: {
        type: 'object',
        properties: {
          configPath: {
            type: 'string',
            description: 'Path to the configuration file'
          },
          required: ['configPath']
        }
      }
    },

    save_mock_config: {
      name: 'save_mock_config',
      description: 'Save mock API configuration to a JSON file',
      inputSchema: {
        type: 'object',
        properties: {
          configPath: {
            type: 'string',
            description: 'Path to save the configuration file'
          },
          config: {
            type: 'object',
            description: 'Configuration object to save'
          },
          required: ['configPath', 'config']
        }
      }
    }
  },

  async callTool(name, args) {
    switch (name) {
      case 'start_mock_server':
        return await startServer(args);
      case 'stop_mock_server':
        return await stopServer(args.port);
      case 'get_server_status':
        return getServerStatus();
      case 'load_mock_config':
        return await loadConfig(args.configPath);
      case 'save_mock_config':
        return await saveConfig(args.configPath, args.config);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
};

// Export for MCP
if (require.main === module) {
  console.log('Mock API MCP Server');
  console.log('This server should be started by Claude Code plugin system');
} else {
  module.exports = server;
}
