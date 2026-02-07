/**
 * Structured Logger for API Security Hardening Plugin
 *
 * Provides comprehensive logging with structured output,
 * log levels, and correlation tracking for observability.
 */

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Current log level (can be configured via environment)
 */
let currentLevel = LogLevel.INFO;

/**
 * Set log level from environment or string
 * @param {string|number} level - Log level
 */
function setLogLevel(level) {
  if (typeof level === 'string') {
    const upperLevel = level.toUpperCase();
    currentLevel = LogLevel[upperLevel] ?? LogLevel.INFO;
  } else if (typeof level === 'number') {
    currentLevel = level;
  }
}

// Set log level from environment
if (process.env.API_SECURITY_LOG_LEVEL) {
  setLogLevel(process.env.API_SECURITY_LOG_LEVEL);
}

/**
 * Generate correlation ID for request tracking
 * @returns {string} Correlation ID
 */
function generateCorrelationId() {
  return `corsc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current correlation ID from async context or generate new one
 * @returns {string} Correlation ID
 */
function getCorrelationId() {
  return asyncLocalStorage.getStore()?.correlationId || generateCorrelationId();
}

/**
 * Async local storage for context tracking
 */
let asyncLocalStorage;
try {
  const { AsyncLocalStorage } = require('async_hooks');
  asyncLocalStorage = new AsyncLocalStorage();
} catch (err) {
  // AsyncLocalStorage not available (Node.js < 16)
  asyncLocalStorage = {
    getStore: () => null,
    run: (store, callback) => callback()
  };
}

/**
 * Sanitize data for logging (remove sensitive information)
 * @param {unknown} data - Data to sanitize
 * @returns {unknown} Sanitized data
 */
function sanitize(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'session',
    'jwt',
    'private_key',
    'access_token',
    'refresh_token'
  ];

  const sanitized = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));

    if (isSensitive && typeof value === 'string') {
      sanitized[key] = value.length > 0 ? '[REDACTED]' : '';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Format log entry as JSON
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted log entry
 */
function formatLogEntry(level, message, metadata = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    logger: 'api-security-hardening',
    message,
    correlation_id: getCorrelationId(),
    ...sanitize(metadata)
  };
}

/**
 * Write log to console
 * @param {string} level - Log level
 * @param {object} entry - Log entry
 */
function writeLog(level, entry) {
  const formatted = JSON.stringify(entry);

  switch (level) {
    case 'DEBUG':
      if (currentLevel <= LogLevel.DEBUG) {
        console.debug(formatted);
      }
      break;
    case 'INFO':
      if (currentLevel <= LogLevel.INFO) {
        console.info(formatted);
      }
      break;
    case 'WARN':
      if (currentLevel <= LogLevel.WARN) {
        console.warn(formatted);
      }
      break;
    case 'ERROR':
    case 'FATAL':
      if (currentLevel <= LogLevel.ERROR) {
        console.error(formatted);
      }
      break;
  }
}

/**
 * Logger class
 */
class Logger {
  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata
   */
  debug(message, metadata = {}) {
    writeLog('DEBUG', formatLogEntry('DEBUG', message, metadata));
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata
   */
  info(message, metadata = {}) {
    writeLog('INFO', formatLogEntry('INFO', message, metadata));
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata
   */
  warn(message, metadata = {}) {
    writeLog('WARN', formatLogEntry('WARN', message, metadata));
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Error|object} errorOrMetadata - Error object or metadata
   * @param {object} [metadata] - Additional metadata if error provided
   */
  error(message, errorOrMetadata = {}, metadata = {}) {
    let errorMetadata = { ...metadata };

    if (errorOrMetadata instanceof Error) {
      errorMetadata = {
        ...errorMetadata,
        error_name: errorOrMetadata.name,
        error_message: errorOrMetadata.message,
        error_stack: errorOrMetadata.stack
      };

      if (errorOrMetadata.code) {
        errorMetadata.error_code = errorOrMetadata.code;
      }
    } else {
      errorMetadata = { ...errorOrMetadata, ...errorMetadata };
    }

    writeLog('ERROR', formatLogEntry('ERROR', message, errorMetadata));
  }

  /**
   * Log fatal message
   * @param {string} message - Log message
   * @param {Error|object} errorOrMetadata - Error object or metadata
   * @param {object} [metadata] - Additional metadata if error provided
   */
  fatal(message, errorOrMetadata = {}, metadata = {}) {
    let errorMetadata = { ...metadata };

    if (errorOrMetadata instanceof Error) {
      errorMetadata = {
        ...errorMetadata,
        error_name: errorOrMetadata.name,
        error_message: errorOrMetadata.message,
        error_stack: errorOrMetadata.stack
      };

      if (errorOrMetadata.code) {
        errorMetadata.error_code = errorOrMetadata.code;
      }
    } else {
      errorMetadata = { ...errorOrMetadata, ...errorMetadata };
    }

    writeLog('FATAL', formatLogEntry('FATAL', message, errorMetadata));
  }

  /**
   * Create child logger with additional context
   * @param {object} context - Additional context for child logger
   * @returns {Logger} Child logger
   */
  child(context) {
    const childLogger = new Logger();
    const originalDebug = childLogger.debug.bind(childLogger);
    const originalInfo = childLogger.info.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);
    const originalFatal = childLogger.fatal.bind(childLogger);

    childLogger.debug = (message, metadata) => originalDebug(message, { ...context, ...metadata });
    childLogger.info = (message, metadata) => originalInfo(message, { ...context, ...metadata });
    childLogger.warn = (message, metadata) => originalWarn(message, { ...context, ...metadata });
    childLogger.error = (message, errorOrMetadata, metadata) =>
      originalError(message, errorOrMetadata, { ...context, ...metadata });
    childLogger.fatal = (message, errorOrMetadata, metadata) =>
      originalFatal(message, errorOrMetadata, { ...context, ...metadata });

    return childLogger;
  }

  /**
   * Run function with correlation context
   * @param {string} correlationId - Correlation ID
   * @param {Function} fn - Function to run
   * @returns {unknown} Function result
   */
  withCorrelation(correlationId, fn) {
    return asyncLocalStorage.run({ correlationId }, fn);
  }
}

// Create default logger instance
const logger = new Logger();

// Set initial log level from environment
setLogLevel(process.env.API_SECURITY_LOG_LEVEL || 'INFO');

module.exports = {
  logger,
  Logger,
  setLogLevel,
  LogLevel,
  generateCorrelationId,
  sanitize
};
