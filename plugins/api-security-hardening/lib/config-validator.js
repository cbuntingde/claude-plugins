/**
 * Configuration Validation for API Security Hardening Plugin
 *
 * Provides comprehensive schema validation for plugin configuration
 * with detailed error reporting and security defaults.
 */

const { ValidationError, ConfigurationError } = require('./errors');
const { logger } = require('./logger');

/**
 * Validation result
 */
class ValidationResult {
  constructor() {
    this.valid = true;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Add error to validation result
   * @param {string} field - Field path
   * @param {string} message - Error message
   */
  addError(field, message) {
    this.valid = false;
    this.errors.push({ field, message });
  }

  /**
   * Add warning to validation result
   * @param {string} field - Field path
   * @param {string} message - Warning message
   */
  addWarning(field, message) {
    this.warnings.push({ field, message });
  }

  /**
   * Throw if validation failed
   * @throws {ValidationError} If validation failed
   */
  throwIfInvalid() {
    if (!this.valid) {
      throw new ValidationError(
        'Configuration validation failed',
        'config',
        null,
        { errors: this.errors, warnings: this.warnings }
      );
    }
  }

  /**
   * Get result as object
   * @returns {object} Validation result
   */
  toJSON() {
    return {
      valid: this.valid,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

/**
 * Validate CORS configuration
 * @param {object} corsConfig - CORS configuration
 * @param {ValidationResult} result - Validation result
 */
function validateCorsConfig(corsConfig, result) {
  if (!corsConfig || typeof corsConfig !== 'object') {
    result.addError('cors', 'CORS configuration must be an object');
    return;
  }

  // Validate allowedOrigins
  if (!Array.isArray(corsConfig.allowedOrigins)) {
    result.addError('cors.allowedOrigins', 'allowedOrigins must be an array');
  } else {
    corsConfig.allowedOrigins.forEach((origin, index) => {
      if (typeof origin !== 'string') {
        result.addError(`cors.allowedOrigins[${index}]`, 'Origin must be a string');
      } else if (origin === '*' && corsConfig.credentials) {
        result.addError(
          'cors.allowedOrigins',
          'Cannot use wildcard origin (*) with credentials enabled'
        );
      } else if (origin !== '*' && !origin.startsWith('https://') && origin !== 'null') {
        result.addWarning(
          `cors.allowedOrigins[${index}]`,
          'Origin should use HTTPS in production'
        );
      }
    });
  }

  // Validate credentials
  if (typeof corsConfig.credentials !== 'boolean') {
    result.addError('cors.credentials', 'credentials must be a boolean');
  }

  // Validate maxAge
  if (typeof corsConfig.maxAge !== 'number' || corsConfig.maxAge < 0) {
    result.addError('cors.maxAge', 'maxAge must be a positive number');
  } else if (corsConfig.maxAge > 86400) {
    result.addWarning('cors.maxAge', 'maxAge over 24 hours may cause stale preflight caching');
  }
}

/**
 * Validate CSRF configuration
 * @param {object} csrfConfig - CSRF configuration
 * @param {ValidationResult} result - Validation result
 */
function validateCsrfConfig(csrfConfig, result) {
  if (!csrfConfig || typeof csrfConfig !== 'object') {
    result.addError('csrf', 'CSRF configuration must be an object');
    return;
  }

  // Validate cookieName
  if (typeof csrfConfig.cookieName !== 'string' || csrfConfig.cookieName.length === 0) {
    result.addError('csrf.cookieName', 'cookieName must be a non-empty string');
  }

  // Validate headerName
  if (typeof csrfConfig.headerName !== 'string' || csrfConfig.headerName.length === 0) {
    result.addError('csrf.headerName', 'headerName must be a non-empty string');
  }

  // Validate strategy
  const validStrategies = ['sync', 'double-submit', 'encrypted'];
  if (!validStrategies.includes(csrfConfig.strategy)) {
    result.addError(
      'csrf.strategy',
      `strategy must be one of: ${validStrategies.join(', ')}`
    );
  }
}

/**
 * Validate JWT configuration
 * @param {object} jwtConfig - JWT configuration
 * @param {ValidationResult} result - Validation result
 */
function validateJwtConfig(jwtConfig, result) {
  if (!jwtConfig || typeof jwtConfig !== 'object') {
    result.addError('jwt', 'JWT configuration must be an object');
    return;
  }

  // Validate algorithm
  const validAlgorithms = [
    'RS256', 'RS384', 'RS512',
    'ES256', 'ES384', 'ES512',
    'PS256', 'PS384', 'PS512',
    'HS256', 'HS384', 'HS512'
  ];

  if (!validAlgorithms.includes(jwtConfig.algorithm)) {
    result.addError(
      'jwt.algorithm',
      `algorithm must be one of: ${validAlgorithms.join(', ')}`
    );
  } else if (jwtConfig.algorithm === 'none') {
    result.addError('jwt.algorithm', 'Algorithm "none" is not allowed for security reasons');
  } else if (jwtConfig.algorithm.startsWith('HS')) {
    result.addWarning(
      'jwt.algorithm',
      'Asymmetric algorithms (RS256, ES256, PS256) are recommended over symmetric algorithms'
    );
  }

  // Validate expiration
  if (typeof jwtConfig.expiration !== 'string' || jwtConfig.expiration.length === 0) {
    result.addError('jwt.expiration', 'expiration must be a non-empty string (e.g., "15m", "1h")');
  }

  // Validate refreshExpiration
  if (typeof jwtConfig.refreshExpiration !== 'string' || jwtConfig.refreshExpiration.length === 0) {
    result.addError('jwt.refreshExpiration', 'refreshExpiration must be a non-empty string (e.g., "7d", "30d")');
  }

  // Validate expiration ratio
  const accessMs = parseDuration(jwtConfig.expiration);
  const refreshMs = parseDuration(jwtConfig.refreshExpiration);

  if (accessMs && refreshMs) {
    if (accessMs > 3600000) {
      result.addWarning('jwt.expiration', 'Access token expiration should be 15 minutes or less for security');
    }
    if (refreshMs < accessMs * 2) {
      result.addWarning('jwt.refreshExpiration', 'Refresh token expiration should be significantly longer than access token');
    }
  }
}

/**
 * Validate API Keys configuration
 * @param {object} apiKeysConfig - API Keys configuration
 * @param {ValidationResult} result - Validation result
 */
function validateApiKeysConfig(apiKeysConfig, result) {
  if (!apiKeysConfig || typeof apiKeysConfig !== 'object') {
    result.addError('apiKeys', 'API Keys configuration must be an object');
    return;
  }

  // Validate keyLength
  if (typeof apiKeysConfig.keyLength !== 'number' || apiKeysConfig.keyLength < 32) {
    result.addError('apiKeys.keyLength', 'keyLength must be at least 32 bytes (256 bits) for sufficient entropy');
  }

  // Validate rotationDays
  if (typeof apiKeysConfig.rotationDays !== 'number' || apiKeysConfig.rotationDays < 1) {
    result.addError('apiKeys.rotationDays', 'rotationDays must be a positive number');
  } else if (apiKeysConfig.rotationDays > 90) {
    result.addWarning('apiKeys.rotationDays', 'API keys should be rotated every 90 days or less for security');
  }

  // Validate prefix
  if (typeof apiKeysConfig.prefix !== 'string' || apiKeysConfig.prefix.length === 0) {
    result.addError('apiKeys.prefix', 'prefix must be a non-empty string');
  }
}

/**
 * Parse duration string to milliseconds
 * @param {string} duration - Duration string (e.g., "15m", "1h", "7d")
 * @returns {number|null} Milliseconds or null if invalid
 */
function parseDuration(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60000;
    case 'h': return value * 3600000;
    case 'd': return value * 86400000;
    default: return null;
  }
}

/**
 * Validate complete plugin configuration
 * @param {object} config - Configuration to validate
 * @returns {ValidationResult} Validation result
 */
function validateConfig(config) {
  const result = new ValidationResult();

  // Validate top-level structure
  if (!config || typeof config !== 'object') {
    result.addError('root', 'Configuration must be an object');
    return result;
  }

  // Validate each section
  validateCorsConfig(config.cors, result);
  validateCsrfConfig(config.csrf, result);
  validateJwtConfig(config.jwt, result);
  validateApiKeysConfig(config.apiKeys, result);

  // Validate severity
  const validSeverities = ['critical', 'high', 'medium', 'low'];
  if (!validSeverities.includes(config.severity)) {
    result.addError('severity', `severity must be one of: ${validSeverities.join(', ')}`);
  }

  // Validate outputFormat
  const validFormats = ['text', 'json', 'markdown'];
  if (!validFormats.includes(config.outputFormat)) {
    result.addError('outputFormat', `outputFormat must be one of: ${validFormats.join(', ')}`);
  }

  return result;
}

/**
 * Apply security defaults to configuration
 * @param {object} config - Configuration to apply defaults to
 * @returns {object} Configuration with defaults applied
 */
function applySecurityDefaults(config) {
  return {
    cors: {
      allowedOrigins: config.cors?.allowedOrigins || [],
      credentials: config.cors?.credentials ?? false,
      maxAge: config.cors?.maxAge || 86400
    },
    csrf: {
      cookieName: config.csrf?.cookieName || '_csrf',
      headerName: config.csrf?.headerName || 'x-csrf-token',
      strategy: config.csrf?.strategy || 'sync'
    },
    jwt: {
      algorithm: config.jwt?.algorithm || 'RS256',
      expiration: config.jwt?.expiration || '15m',
      refreshExpiration: config.jwt?.refreshExpiration || '7d'
    },
    apiKeys: {
      keyLength: config.apiKeys?.keyLength || 32,
      rotationDays: config.apiKeys?.rotationDays || 90,
      prefix: config.apiKeys?.prefix || 'sk'
    },
    severity: config.severity || 'medium',
    outputFormat: config.outputFormat || 'text'
  };
}

/**
 * Load and validate configuration
 * @param {object} config - Configuration to load and validate
 * @returns {object} Validated configuration with defaults applied
 * @throws {ConfigurationError} If validation fails
 */
function loadAndValidateConfig(config) {
  // Apply defaults
  const configWithDefaults = applySecurityDefaults(config);

  // Validate
  const result = validateConfig(configWithDefaults);

  // Log warnings
  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => {
      logger.warn(`Configuration warning: ${warning.field} - ${warning.message}`);
    });
  }

  // Throw if invalid
  result.throwIfInvalid();

  logger.info('Configuration loaded and validated successfully');
  return configWithDefaults;
}

module.exports = {
  ValidationResult,
  validateConfig,
  validateCorsConfig,
  validateCsrfConfig,
  validateJwtConfig,
  validateApiKeysConfig,
  applySecurityDefaults,
  loadAndValidateConfig,
  parseDuration
};
