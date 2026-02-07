#!/usr/bin/env node
/**
 * API Security Hardening Plugin
 * Main entry point for Claude Code plugin
 *
 * Provides comprehensive API security hardening for:
 * - CORS (Cross-Origin Resource Sharing)
 * - CSRF (Cross-Site Request Forgery)
 * - XSS (Cross-Site Scripting)
 * - JWT (JSON Web Token) flows
 * - API key rotation and management
 */

const path = require('path');
const fs = require('fs');

// Import command handlers
const { apiSecurityAudit } = require('./scripts/api-security-audit');
const { generateCorsConfig } = require('./scripts/cors-setup');
const { generateCsrfProtection } = require('./scripts/csrf-protection');
const { generateXssPrevention } = require('./scripts/xss-prevention');
const { jwtValidate } = require('./scripts/jwt-validate');
const { generateApiKey, validateApiKeyImplementation } = require('./scripts/api-key-rotate');

// Import utilities
const { performHealthCheck, getMetricsSummary } = require('./lib/health-metrics');
const { loadAndValidateConfig, applySecurityDefaults } = require('./lib/config-validator');
const { logger } = require('./lib/logger');

/**
 * Plugin metadata
 */
const pluginInfo = {
  name: 'api-security-hardening',
  version: '1.0.0',
  description: 'API security hardening plugin for CORS, CSRF, XSS protection, API key rotation, and JWT flows'
};

/**
 * Load plugin configuration with validation
 */
function loadConfig() {
  const configPaths = [
    path.join(process.cwd(), '.api-security.json'),
    path.join(process.cwd(), '.claude', 'api-security.json'),
    path.join(__dirname, 'config.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return loadAndValidateConfig(userConfig);
      } catch (error) {
        logger.warn('Failed to load config from ' + configPath + ', using defaults', { error: error.message });
      }
    }
  }

  // Return validated defaults
  return loadAndValidateConfig(applySecurityDefaults({}));
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return {
    cors: {
      allowedOrigins: [],
      credentials: false,
      maxAge: 86400
    },
    csrf: {
      cookieName: '_csrf',
      headerName: 'x-csrf-token',
      strategy: 'sync'
    },
    jwt: {
      algorithm: 'RS256',
      expiration: '15m',
      refreshExpiration: '7d'
    },
    apiKeys: {
      keyLength: 32,
      rotationDays: 90,
      prefix: 'sk'
    },
    severity: 'medium',
    outputFormat: 'text'
  };
}

/**
 * API Security Audit command
 * Performs comprehensive security audit for CORS, CSRF, XSS, JWT, and API key vulnerabilities
 */
function apiSecurityAuditCommand(params = {}) {
  return apiSecurityAudit(params);
}

/**
 * CORS Setup command
 * Generates secure CORS configuration for various frameworks
 */
function corsSetupCommand(params = {}) {
  const config = generateCorsConfig(params);

  if (params.output) {
    fs.writeFileSync(params.output, config, 'utf8');
    return {
      success: true,
      message: `CORS configuration written to ${params.output}`,
      path: params.output
    };
  }

  return {
    success: true,
    config
  };
}

/**
 * CSRF Protection command
 * Implements CSRF protection with token generation and validation
 */
function csrfProtectionCommand(params = {}) {
  const code = generateCsrfProtection(params);

  if (params.output) {
    fs.writeFileSync(params.output, code, 'utf8');
    return {
      success: true,
      message: `CSRF protection written to ${params.output}`,
      path: params.output
    };
  }

  return {
    success: true,
    code
  };
}

/**
 * XSS Prevention command
 * Implements XSS prevention with sanitization, encoding, and CSP headers
 */
function xssPreventionCommand(params = {}) {
  const code = generateXssPrevention(params);

  if (params.output) {
    fs.writeFileSync(params.output, code, 'utf8');
    return {
      success: true,
      message: `XSS prevention code written to ${params.output}`,
      path: params.output
    };
  }

  return {
    success: true,
    code
  };
}

/**
 * JWT Validate command
 * Validates JWT implementation and generates secure token flows
 */
function jwtValidateCommand(params = {}) {
  return jwtValidate(params);
}

/**
 * API Key Rotate command
 * Generates, rotates, and validates API keys
 */
function apiKeyRotateCommand(params = {}) {
  const config = loadConfig();

  if (params.action === 'generate') {
    const keys = require('./scripts/api-key-rotate').generateApiKeys({
      keyLength: params.keyLength || config.apiKeys.keyLength,
      prefix: params.prefix || config.apiKeys.prefix,
      count: params.count || 1
    });

    return {
      success: true,
      keys
    };
  }

  if (params.action === 'validate') {
    return validateApiKeyImplementation(params.path || '.');
  }

  if (params.action === 'generate-middleware') {
    const middleware = require('./scripts/api-key-rotate').generateApiKeyValidation({
      framework: params.framework || 'express'
    });

    if (params.output) {
      fs.writeFileSync(params.output, middleware, 'utf8');
      return {
        success: true,
        message: `API key middleware written to ${params.output}`,
        path: params.output
      };
    }

    return {
      success: true,
      middleware
    };
  }

  // Default: generate a single API key
  const key = require('./scripts/api-key-rotate').generateApiKey({
    keyLength: config.apiKeys.keyLength,
    prefix: config.apiKeys.prefix
  });

  return {
    success: true,
    key
  };
}

/**
 * Get security recommendations
 */
function getSecurityRecommendations(params = {}) {
  const config = loadConfig();
  const recommendations = [];

  // CORS recommendations
  if (!config.cors.allowedOrigins || config.cors.allowedOrigins.length === 0) {
    recommendations.push({
      area: 'CORS',
      severity: 'high',
      message: 'Configure specific allowed origins instead of wildcard',
      command: '/cors-setup'
    });
  }

  if (config.cors.credentials && (!config.cors.allowedOrigins || config.cors.allowedOrigins.includes('*'))) {
    recommendations.push({
      area: 'CORS',
      severity: 'critical',
      message: 'Cannot use wildcard origin with credentials enabled',
      command: '/cors-setup'
    });
  }

  // CSRF recommendations
  recommendations.push({
    area: 'CSRF',
    severity: 'high',
    message: 'Ensure CSRF protection is implemented for all state-changing operations',
    command: '/csrf-protection'
  });

  // XSS recommendations
  recommendations.push({
    area: 'XSS',
    severity: 'high',
    message: 'Implement input sanitization and Content-Security-Policy headers',
    command: '/xss-prevention'
  });

  // JWT recommendations
  if (config.jwt.algorithm === 'none' || config.jwt.algorithm === 'HS256') {
    recommendations.push({
      area: 'JWT',
      severity: 'high',
      message: 'Use asymmetric algorithms (RS256, ES256) instead of HS256',
      command: '/jwt-validate --fix'
    });
  }

  // API key recommendations
  recommendations.push({
    area: 'API Keys',
    severity: 'medium',
    message: 'Rotate API keys every 90 days or less',
    command: '/api-key-rotate'
  });

  return {
    success: true,
    recommendations
  };
}

/**
 * Get plugin help
 */
function getHelp() {
  return {
    success: true,
    plugin: pluginInfo,
    commands: [
      {
        name: '/api-security-audit',
        description: 'Perform comprehensive API security audit',
        usage: '/api-security-audit [--path <path>] [--severity <level>] [--focus <area>]'
      },
      {
        name: '/cors-setup',
        description: 'Generate secure CORS configuration',
        usage: '/cors-setup [--framework <name>] [--origins <urls>] [--credentials]'
      },
      {
        name: '/csrf-protection',
        description: 'Implement CSRF protection',
        usage: '/csrf-protection [--framework <name>] [--strategy <type>]'
      },
      {
        name: '/xss-prevention',
        description: 'Implement XSS prevention measures',
        usage: '/xss-prevention [--framework <name>] [--csp <level>]'
      },
      {
        name: '/jwt-validate',
        description: 'Validate JWT implementation',
        usage: '/jwt-validate [--path <path>] [--fix]'
      },
      {
        name: '/api-key-rotate',
        description: 'API key generation and rotation',
        usage: '/api-key-rotate [--generate] [--validate] [--key-id <id>]'
      }
    ],
    agents: [
      'cors-security-auditor',
      'csrf-protection-specialist',
      'xss-prevention-expert',
      'jwt-security-analyst',
      'api-key-security-manager'
    ],
    skills: [
      'cors-analyzer',
      'jwt-validator',
      'xss-detector'
    ],
    hooks: [
      'PostToolUse: Quick security check on file writes',
      'SessionStart: API security check on session start',
      'UserPromptSubmit: Security guidance for CORS/CSRF/XSS/JWT/API keys'
    ]
  };
}

// Export all functions
module.exports = {
  // Plugin metadata
  ...pluginInfo,

  // Configuration
  loadConfig,
  getDefaultConfig,

  // Command handlers
  apiSecurityAudit: apiSecurityAuditCommand,
  corsSetup: corsSetupCommand,
  csrfProtection: csrfProtectionCommand,
  xssPrevention: xssPreventionCommand,
  jwtValidate: jwtValidateCommand,
  apiKeyRotate: apiKeyRotateCommand,

  // Utilities
  getSecurityRecommendations,
  getHelp,

  // Observability
  getHealthCheck: performHealthCheck,
  getMetrics: getMetricsSummary
};

// CLI interface for direct execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const handlers = {
    'api-security-audit': () => apiSecurityAuditCommand(),
    'cors-setup': () => corsSetupCommand(),
    'csrf-protection': () => csrfProtectionCommand(),
    'xss-prevention': () => xssPreventionCommand(),
    'jwt-validate': () => jwtValidateCommand(),
    'api-key-rotate': () => apiKeyRotateCommand(),
    'health-check': () => console.log(JSON.stringify(performHealthCheck(), null, 2)),
    'metrics': () => console.log(JSON.stringify(getMetricsSummary(), null, 2)),
    'help': () => console.log(JSON.stringify(getHelp(), null, 2)),
    'recommendations': () => console.log(JSON.stringify(getSecurityRecommendations(), null, 2))
  };

  if (handlers[command]) {
    const result = handlers[command]();
    if (result.text) {
      console.log(result.text);
    } else if (result.code) {
      console.log(result.code);
    } else if (result.config) {
      console.log(result.config);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log(JSON.stringify(getHelp(), null, 2));
  }
}
