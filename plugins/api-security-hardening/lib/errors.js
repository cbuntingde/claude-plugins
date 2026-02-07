/**
 * Custom Error Classes for API Security Hardening Plugin
 *
 * Provides comprehensive error handling with specific error types,
 * severity levels, and detailed context for debugging and monitoring.
 */

/**
 * Base API Security Error class
 * All custom errors extend from this class
 */
class ApiSecurityError extends Error {
  /**
   * Create a new API Security Error
   * @param {string} message - Human-readable error message
   * @param {string} code - Machine-readable error code
   * @param {'critical'|'high'|'medium'|'low'} severity - Error severity level
   * @param {Record<string, unknown>} [details] - Additional error context
   */
  constructor(message, code, severity, details = {}) {
    super(message);
    this.name = 'ApiSecurityError';
    this.code = code;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for logging/serialization
   * @returns {object} JSON representation of error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Configuration Error
 * Thrown when plugin configuration is invalid or missing
 */
class ConfigurationError extends ApiSecurityError {
  /**
   * Create a new Configuration Error
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, details = {}) {
    super(message, 'CONFIG_ERROR', 'high', {
      ...details,
      resolution: 'Check plugin configuration in .api-security.json'
    });
    this.name = 'ConfigurationError';
  }
}

/**
 * Validation Error
 * Thrown when input validation fails
 */
class ValidationError extends ApiSecurityError {
  /**
   * Create a new Validation Error
   * @param {string} message - Error message
   * @param {string} field - Field that failed validation
   * @param {unknown} [value] - Invalid value
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, field, value = undefined, details = {}) {
    super(message, 'VALIDATION_ERROR', 'medium', {
      field,
      invalidValue: value,
      ...details
    });
    this.name = 'ValidationError';
    this.field = field;
    this.invalidValue = value;
  }
}

/**
 * Security Vulnerability Error
 * Thrown when a critical security vulnerability is detected
 */
class SecurityVulnerabilityError extends ApiSecurityError {
  /**
   * Create a new Security Vulnerability Error
   * @param {string} message - Error message
   * @param {'critical'|'high'|'medium'|'low'} severity - Vulnerability severity
   * @param {string} vulnerabilityType - Type of vulnerability (e.g., 'SQL_INJECTION', 'XSS')
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, severity, vulnerabilityType, details = {}) {
    super(message, 'SECURITY_VULNERABILITY', severity, {
      vulnerabilityType,
      cweReference: getCweReference(vulnerabilityType),
      owaspCategory: getOwaspCategory(vulnerabilityType),
      ...details
    });
    this.name = 'SecurityVulnerabilityError';
    this.vulnerabilityType = vulnerabilityType;
  }
}

/**
 * File Operation Error
 * Thrown when file read/write operations fail
 */
class FileOperationError extends ApiSecurityError {
  /**
   * Create a new File Operation Error
   * @param {string} message - Error message
   * @param {string} filePath - File path that caused the error
   * @param {string} operation - Operation being performed ('read'|'write'|'delete')
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, filePath, operation, details = {}) {
    super(message, 'FILE_OPERATION_ERROR', 'medium', {
      filePath,
      operation,
      ...details
    });
    this.name = 'FileOperationError';
    this.filePath = filePath;
    this.operation = operation;
  }
}

/**
 * Authentication Error
 * Thrown when API key or JWT authentication fails
 */
class AuthenticationError extends ApiSecurityError {
  /**
   * Create a new Authentication Error
   * @param {string} message - Error message
   * @param {string} authType - Type of authentication ('api_key'|'jwt')
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, authType, details = {}) {
    super(message, 'AUTHENTICATION_ERROR', 'high', {
      authType,
      ...details
    });
    this.name = 'AuthenticationError';
    this.authType = authType;
  }
}

/**
 * Rate Limit Error
 * Thrown when rate limit is exceeded
 */
class RateLimitError extends ApiSecurityError {
  /**
   * Create a new Rate Limit Error
   * @param {string} message - Error message
   * @param {number} limit - Rate limit that was exceeded
   * @param {string} window - Rate limit window (e.g., '1m', '1h')
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, limit, window, details = {}) {
    super(message, 'RATE_LIMIT_ERROR', 'medium', {
      limit,
      window,
      retryAfter: calculateRetryAfter(window),
      ...details
    });
    this.name = 'RateLimitError';
    this.limit = limit;
    this.window = window;
  }
}

/**
 * Token Error
 * Thrown when JWT token operations fail
 */
class TokenError extends ApiSecurityError {
  /**
   * Create a new Token Error
   * @param {string} message - Error message
   * @param {string} tokenOperation - Operation being performed ('generate'|'verify'|'refresh')
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, tokenOperation, details = {}) {
    super(message, 'TOKEN_ERROR', 'high', {
      tokenOperation,
      ...details
    });
    this.name = 'TokenError';
    this.tokenOperation = tokenOperation;
  }
}

/**
 * Scan Error
 * Thrown when security scan operations fail
 */
class ScanError extends ApiSecurityError {
  /**
   * Create a new Scan Error
   * @param {string} message - Error message
   * @param {string} scanType - Type of scan ('security_audit'|'cors'|'csrf'|'xss'|'jwt')
   * @param {string} targetPath - Path being scanned
   * @param {Record<string, unknown>} [details] - Additional context
   */
  constructor(message, scanType, targetPath, details = {}) {
    super(message, 'SCAN_ERROR', 'medium', {
      scanType,
      targetPath,
      ...details
    });
    this.name = 'ScanError';
    this.scanType = scanType;
    this.targetPath = targetPath;
  }
}

/**
 * Get CWE reference for vulnerability type
 * @param {string} vulnerabilityType - Type of vulnerability
 * @returns {string} CWE reference ID
 */
function getCweReference(vulnerabilityType) {
  const cweMap = {
    'SQL_INJECTION': 'CWE-89',
    'XSS': 'CWE-79',
    'CSRF': 'CWE-352',
    'AUTHENTICATION_BYPASS': 'CWE-287',
    'HARDCODED_CREDENTIALS': 'CWE-798',
    'WEAK_CRYPTOGRAPHY': 'CWE-327',
    'PATH_TRAVERSAL': 'CWE-22',
    'COMMAND_INJECTION': 'CWE-77',
    'INSECURE_RANDOM': 'CWE-338',
    'MISSING_INPUT_VALIDATION': 'CWE-20'
  };
  return cweMap[vulnerabilityType] || 'CWE-Other';
}

/**
 * Get OWASP category for vulnerability type
 * @param {string} vulnerabilityType - Type of vulnerability
 * @returns {string} OWASP Top 10 category
 */
function getOwaspCategory(vulnerabilityType) {
  const owaspMap = {
    'SQL_INJECTION': 'A03:2021 - Injection',
    'XSS': 'A03:2021 - Injection',
    'CSRF': 'A01:2021 - Broken Access Control',
    'AUTHENTICATION_BYPASS': 'A01:2021 - Broken Access Control',
    'HARDCODED_CREDENTIALS': 'A07:2021 - Identification and Authentication Failures',
    'WEAK_CRYPTOGRAPHY': 'A02:2021 - Cryptographic Failures',
    'PATH_TRAVERSAL': 'A01:2021 - Broken Access Control',
    'COMMAND_INJECTION': 'A03:2021 - Injection',
    'INSECURE_RANDOM': 'A02:2021 - Cryptographic Failures',
    'MISSING_INPUT_VALIDATION': 'A03:2021 - Injection'
  };
  return owaspMap[vulnerabilityType] || 'Other';
}

/**
 * Calculate retry after time for rate limiting
 * @param {string} window - Rate limit window
 * @returns {number} Seconds to wait before retry
 */
function calculateRetryAfter(window) {
  const match = window.match(/(\d+)([smh])/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
    }
  }
  return 60; // Default 1 minute
}

/**
 * Create error from unknown error
 * @param {unknown} err - Unknown error
 * @param {string} context - Context where error occurred
 * @returns {ApiSecurityError} Normalized error
 */
function normalizeError(err, context = 'unknown') {
  if (err instanceof ApiSecurityError) {
    return err;
  }

  if (err instanceof Error) {
    return new ApiSecurityError(
      err.message,
      'UNKNOWN_ERROR',
      'medium',
      { originalError: err.name, context }
    );
  }

  return new ApiSecurityError(
    String(err),
    'UNKNOWN_ERROR',
    'medium',
    { context }
  );
}

/**
 * Async error handler wrapper
 * Wraps async functions to catch and normalize errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
function asyncErrorHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw normalizeError(err, fn.name || 'anonymous');
    }
  };
}

module.exports = {
  ApiSecurityError,
  ConfigurationError,
  ValidationError,
  SecurityVulnerabilityError,
  FileOperationError,
  AuthenticationError,
  RateLimitError,
  TokenError,
  ScanError,
  normalizeError,
  asyncErrorHandler
};
