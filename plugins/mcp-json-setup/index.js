#!/usr/bin/env node
/**
 * MCP JSON Setup Plugin
 * Main entry point for Claude Code plugin
 *
 * This plugin provides automated MCP (Model Context Protocol) server setup
 * from JSON configuration, eliminating manual configuration steps.
 */

'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Plugin metadata
 */
const PLUGIN_INFO = {
  name: 'mcp-json-setup',
  version: '1.0.0',
  description: 'Plugin for automatic MCP server setup from JSON configuration'
};

/**
 * Error codes for consistent error handling
 */
const ERROR_CODES = {
  INVALID_JSON: 'INVALID_JSON',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_COMMAND: 'INVALID_COMMAND',
  INVALID_ENV_VAR: 'INVALID_ENV_VAR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SERVER_NOT_FOUND: 'SERVER_NOT_FOUND',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
};

/**
 * Custom error class for plugin-specific errors
 */
class McpSetupError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'McpSetupError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Validates MCP server configuration object
 * @param {object} serverConfig - Server configuration to validate
 * @param {string} serverName - Name of the server for error messages
 * @returns {object} Validation result with success flag and errors
 */
function validateServerConfig(serverConfig, serverName) {
  const errors = [];

  if (!serverConfig || typeof serverConfig !== 'object') {
    return { success: false, errors: ['Server configuration must be an object'] };
  }

  // Required field: command
  if (!serverConfig.command) {
    errors.push(`Server "${serverName}" is missing required field: command`);
  } else if (typeof serverConfig.command !== 'string') {
    errors.push(`Server "${serverName}" command must be a string`);
  }

  // Optional field: args (must be array if provided)
  if (serverConfig.args !== undefined) {
    if (!Array.isArray(serverConfig.args)) {
      errors.push(`Server "${serverName}" args must be an array`);
    } else {
      serverConfig.args.forEach((arg, index) => {
        if (typeof arg !== 'string') {
          errors.push(`Server "${serverName}" args[${index}] must be a string`);
        }
      });
    }
  }

  // Optional field: env (must be object if provided)
  if (serverConfig.env !== undefined) {
    if (serverConfig.env === null || typeof serverConfig.env !== 'object' || Array.isArray(serverConfig.env)) {
      errors.push(`Server "${serverName}" env must be an object`);
    } else {
      Object.entries(serverConfig.env).forEach(([key, value]) => {
        if (typeof value !== 'string') {
          errors.push(`Server "${serverName}" env.${key} must be a string`);
        }
      });
    }
  }

  // Optional field: transportType
  const validTransports = ['stdio', 'sse', 'websocket', 'http'];
  if (serverConfig.transportType !== undefined) {
    if (!validTransports.includes(serverConfig.transportType)) {
      errors.push(`Server "${serverName}" transportType must be one of: ${validTransports.join(', ')}`);
    }
  }

  // Optional field: startupTimeout (must be number)
  if (serverConfig.startupTimeout !== undefined) {
    if (typeof serverConfig.startupTimeout !== 'number' || serverConfig.startupTimeout < 0) {
      errors.push(`Server "${serverName}" startupTimeout must be a non-negative number`);
    }
  }

  // Optional field: shutdownTimeout (must be number)
  if (serverConfig.shutdownTimeout !== undefined) {
    if (typeof serverConfig.shutdownTimeout !== 'number' || serverConfig.shutdownTimeout < 0) {
      errors.push(`Server "${serverName}" shutdownTimeout must be a non-negative number`);
    }
  }

  // Optional field: restartOnCrash (must be boolean)
  if (serverConfig.restartOnCrash !== undefined) {
    if (typeof serverConfig.restartOnCrash !== 'boolean') {
      errors.push(`Server "${serverName}" restartOnCrash must be a boolean`);
    }
  }

  // Optional field: maxRestarts (must be number)
  if (serverConfig.maxRestarts !== undefined) {
    if (typeof serverConfig.maxRestarts !== 'number' || serverConfig.maxRestarts < 0) {
      errors.push(`Server "${serverName}" maxRestarts must be a non-negative number`);
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Validates complete MCP configuration
 * @param {object} config - Full MCP configuration object
 * @returns {object} Validation result
 */
function validateMcpConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object') {
    return { success: false, errors: ['Configuration must be an object'] };
  }

  if (!config.mcpServers && !config.servers) {
    return { success: false, errors: ['Configuration must contain mcpServers or servers field'] };
  }

  const servers = config.mcpServers || config.servers || {};

  if (Object.keys(servers).length === 0) {
    return { success: false, errors: ['At least one server must be defined'] };
  }

  Object.entries(servers).forEach(([serverName, serverConfig]) => {
    const result = validateServerConfig(serverConfig, serverName);
    if (!result.success) {
      errors.push(...result.errors);
    }
  });

  return {
    success: errors.length === 0,
    errors,
    serverCount: Object.keys(servers).length
  };
}

/**
 * Parses and validates JSON configuration string
 * @param {string} jsonString - JSON configuration string
 * @returns {object} Parsed and validated configuration
 */
function parseMcpJson(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new McpSetupError(
      'JSON configuration string is required',
      ERROR_CODES.INVALID_JSON
    );
  }

  let config;
  try {
    config = JSON.parse(jsonString);
  } catch (parseError) {
    throw new McpSetupError(
      `Invalid JSON format: ${parseError.message}`,
      ERROR_CODES.INVALID_JSON,
      { originalError: parseError.message }
    );
  }

  const validation = validateMcpConfig(config);
  if (!validation.success) {
    throw new McpSetupError(
      `Configuration validation failed: ${validation.errors.join('; ')}`,
      ERROR_CODES.VALIDATION_ERROR,
      { validationErrors: validation.errors }
    );
  }

  return config;
}

/**
 * Expands environment variables in configuration values
 * @param {string|object|array} value - Value to expand
 * @param {object} env - Environment variables to use
 * @returns {string|object|array} Expanded value
 */
function expandEnvVars(value, env) {
  if (typeof value === 'string') {
    return value.replace(/\$\{(\w+)\}|\$(\w+)/g, (match, braced, simple) => {
      const varName = braced || simple;
      return env[varName] !== undefined ? env[varName] : match;
    });
  }

  if (Array.isArray(value)) {
    return value.map(item => expandEnvVars(item, env));
  }

  if (value && typeof value === 'object') {
    const expanded = {};
    Object.entries(value).forEach(([key, val]) => {
      expanded[key] = expandEnvVars(val, env);
    });
    return expanded;
  }

  return value;
}

/**
 * Generates MCP configuration file content
 * @param {object} config - Valid MCP configuration
 * @param {object} options - Generation options
 * @returns {string} Generated configuration content
 */
function generateMcpConfig(config, options = {}) {
  const servers = config.mcpServers || config.servers || {};
  const env = { ...process.env, ...options.envOverrides };
  const basePath = options.basePath || '${CLAUDE_PLUGIN_ROOT}';

  const expandedServers = {};

  Object.entries(servers).forEach(([serverName, serverConfig]) => {
    const expanded = { ...serverConfig };

    // Expand environment variables in command
    if (expanded.command) {
      expanded.command = expandEnvVars(expanded.command, env);
    }

    // Expand environment variables in args
    if (expanded.args) {
      expanded.args = expandEnvVars(expanded.args, env);
    }

    // Expand environment variables in env object
    if (expanded.env) {
      expanded.env = expandEnvVars(expanded.env, env);
    }

    expandedServers[serverName] = expanded;
  });

  const outputConfig = { mcpServers: expandedServers };

  return JSON.stringify(outputConfig, null, 2);
}

/**
 * Gets the Claude settings directory path
 * @returns {string} Path to settings directory
 */
function getSettingsDir() {
  const homeDir = process.env.USERPROFILE || process.env.HOME || process.cwd();
  return path.join(homeDir, '.claude');
}

/**
 * Gets the MCP settings file path
 * @param {boolean} global - Whether to use global configuration directory
 * @returns {string} Path to MCP settings file
 */
function getMcpSettingsPath(global = false) {
  if (global) {
    // Global configuration: ~/.claude/mcp.json
    return path.join(getSettingsDir(), 'mcp.json');
  }
  // Project-level configuration: .mcp.json in current working directory
  return path.join(process.cwd(), '.mcp.json');
}

/**
 * Reads existing MCP configuration
 * @param {boolean} global - Whether to use global configuration directory
 * @returns {object|null} Existing configuration or null
 */
function readExistingMcpConfig(global = false) {
  const mcpPath = getMcpSettingsPath(global);

  if (!fs.existsSync(mcpPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(mcpPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Merges new servers with existing configuration
 * @param {object} existing - Existing MCP configuration
 * @param {object} newServers - New servers to add
 * @param {object} options - Merge options
 * @returns {object} Merged configuration
 */
function mergeConfigurations(existing, newServers, options = {}) {
  const merged = existing || { mcpServers: {} };

  if (options.replace) {
    // Replace all servers
    merged.mcpServers = newServers;
  } else {
    // Merge servers (new servers take precedence)
    merged.mcpServers = {
      ...(merged.mcpServers || {}),
      ...newServers
    };
  }

  if (options.removeMissing) {
    // Remove servers not in new configuration
    const newServerNames = Object.keys(newServers);
    Object.keys(merged.mcpServers).forEach(name => {
      if (!newServerNames.includes(name)) {
        delete merged.mcpServers[name];
      }
    });
  }

  return merged;
}

/**
 * Sets up MCP servers from JSON configuration
 * @param {string|object} mcpJson - MCP JSON configuration (string or object)
 * @param {object} options - Setup options
 * @returns {object} Setup result
 */
function setupMcpServers(mcpJson, options = {}) {
  const config = typeof mcpJson === 'string' ? parseMcpJson(mcpJson) : mcpJson;
  const servers = config.mcpServers || config.servers || {};
  const global = options.global || false;

  const results = {
    success: true,
    serversAdded: [],
    serversFailed: [],
    skipped: [],
    configPath: getMcpSettingsPath(global),
    global
  };

  Object.entries(servers).forEach(([serverName, serverConfig]) => {
    try {
      // Validate each server
      const validation = validateServerConfig(serverConfig, serverName);
      if (!validation.success) {
        results.serversFailed.push({
          name: serverName,
          errors: validation.errors
        });
        results.success = false;
        return;
      }

      results.serversAdded.push({
        name: serverName,
        command: serverConfig.command,
        transportType: serverConfig.transportType || 'stdio'
      });
    } catch (error) {
      results.serversFailed.push({
        name: serverName,
        errors: [error.message]
      });
      results.success = false;
    }
  });

  // Read existing configuration
  const existingConfig = readExistingMcpConfig(global);

  // Merge configurations
  const mergedConfig = mergeConfigurations(existingConfig, servers, {
    replace: options.replace,
    removeMissing: options.removeMissing
  });

  // Write configuration file
  try {
    const mcpPath = getMcpSettingsPath(global);
    const mcpDir = path.dirname(mcpPath);
    
    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }

    fs.writeFileSync(
      mcpPath,
      JSON.stringify(mergedConfig, null, 2),
      { mode: 0o600 }
    );
  } catch (error) {
    throw new McpSetupError(
      `Failed to write MCP configuration: ${error.message}`,
      ERROR_CODES.FILE_WRITE_ERROR,
      { path: getMcpSettingsPath(global) }
    );
  }

  return results;
}

/**
 * Generates a human-readable summary of the setup
 * @param {object} results - Setup results
 * @returns {string} Formatted summary
 */
function formatSetupSummary(results) {
  let summary = '\n═══════════════════════════════════════════════\n';
  summary += '    MCP SERVER SETUP SUMMARY\n';
  summary += '═══════════════════════════════════════════════\n\n';

  if (results.configPath) {
    summary += `Configuration file: ${results.configPath}\n\n`;
  }

  summary += `Servers added successfully: ${results.serversAdded.length}\n`;
  summary += `Servers failed: ${results.serversFailed.length}\n`;

  if (results.serversAdded.length > 0) {
    summary += '\nAdded servers:\n';
    results.serversAdded.forEach(server => {
      summary += `  ✓ ${server.name} (${server.transportType})\n`;
    });
  }

  if (results.serversFailed.length > 0) {
    summary += '\nFailed servers:\n';
    results.serversFailed.forEach(server => {
      summary += `  ✗ ${server.name}\n`;
      server.errors.forEach(error => {
        summary += `    - ${error}\n`;
      });
    });
  }

  summary += '\n═══════════════════════════════════════════════\n';
  summary += 'To activate the new servers:\n';
  summary += '1. Restart Claude Code\n';
  summary += '2. Or run: claude mcp reload\n';
  summary += '═══════════════════════════════════════════════\n';

  return summary;
}

/**
 * Lists all configured MCP servers
 * @param {boolean} global - Whether to use global configuration directory
 * @returns {object} List result with server information
 */
function listMcpServers(global = false) {
  const config = readExistingMcpConfig(global);
  const servers = config?.mcpServers || {};

  const serverList = Object.entries(servers).map(([name, config]) => ({
    name,
    command: config.command,
    args: config.args || [],
    env: config.env || {},
    transportType: config.transportType || 'stdio',
    enabled: true // All configured servers are assumed enabled
  }));

  return {
    success: true,
    count: serverList.length,
    servers: serverList,
    configPath: getMcpSettingsPath(global),
    global
  };
}

/**
 * Removes specified MCP servers from configuration
 * @param {string[]} serverNames - Names of servers to remove
 * @param {boolean} global - Whether to use global configuration directory
 * @returns {object} Removal result
 */
function removeMcpServers(serverNames, global = false) {
  if (!Array.isArray(serverNames) || serverNames.length === 0) {
    return {
      success: false,
      error: 'At least one server name must be provided'
    };
  }

  const config = readExistingMcpConfig(global);

  if (!config || !config.mcpServers) {
    return {
      success: false,
      error: 'No MCP configuration found'
    };
  }

  const removed = [];
  const notFound = [];

  serverNames.forEach(name => {
    if (config.mcpServers[name]) {
      delete config.mcpServers[name];
      removed.push(name);
    } else {
      notFound.push(name);
    }
  });

  try {
    fs.writeFileSync(
      getMcpSettingsPath(global),
      JSON.stringify(config, null, 2),
      { mode: 0o600 }
    );
  } catch (error) {
    return {
      success: false,
      error: `Failed to write configuration: ${error.message}`
    };
  }

  return {
    success: true,
    removed,
    notFound,
    configPath: getMcpSettingsPath(global),
    global
  };
}

/**
 * Validates MCP JSON without applying changes
 * @param {string} mcpJson - MCP JSON configuration
 * @returns {object} Validation result
 */
function validateOnly(mcpJson) {
  try {
    const config = parseMcpJson(mcpJson);
    const servers = config.mcpServers || config.servers || {};

    const results = {
      valid: true,
      serverCount: Object.keys(servers).length,
      servers: []
    };

    Object.entries(servers).forEach(([name, serverConfig]) => {
      const validation = validateServerConfig(serverConfig, name);
      results.servers.push({
        name,
        valid: validation.success,
        errors: validation.errors
      });
    });

    return results;
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      code: error.code
    };
  }
}

module.exports = {
  // Plugin metadata
  ...PLUGIN_INFO,

  // Error classes
  McpSetupError,
  ERROR_CODES,

  // Validation functions
  validateServerConfig,
  validateMcpConfig,
  parseMcpJson,
  validateOnly,

  // Configuration functions
  generateMcpConfig,
  setupMcpServers,
  listMcpServers,
  removeMcpServers,
  readExistingMcpConfig,
  mergeConfigurations,

  // Utility functions
  formatSetupSummary,
  getSettingsDir,
  getMcpSettingsPath,
  expandEnvVars
};