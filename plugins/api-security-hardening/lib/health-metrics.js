/**
 * Health Checks and Metrics for API Security Hardening Plugin
 *
 * Provides health monitoring and performance metrics tracking
 * for observability and monitoring integration.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

/**
 * Metrics storage
 */
class MetricsCollector {
  constructor() {
    this.metrics = {
      scansPerformed: 0,
      vulnerabilitiesFound: 0,
      scanDurations: [],
      commandExecutions: {},
      lastScanTimestamp: null,
      errors: {},
      startTime: Date.now()
    };
  }

  /**
   * Record scan operation
   * @param {string} scanType - Type of scan performed
   * @param {number} duration - Scan duration in milliseconds
   * @param {number} vulnerabilitiesFound - Number of vulnerabilities found
   */
  recordScan(scanType, duration, vulnerabilitiesFound = 0) {
    this.metrics.scansPerformed++;
    this.metrics.scanDurations.push(duration);
    this.metrics.vulnerabilitiesFound += vulnerabilitiesFound;
    this.metrics.lastScanTimestamp = new Date().toISOString();

    // Keep only last 100 scan durations
    if (this.metrics.scanDurations.length > 100) {
      this.metrics.scanDurations.shift();
    }

    logger.debug('Scan recorded', {
      scanType,
      duration,
      vulnerabilitiesFound,
      totalScans: this.metrics.scansPerformed
    });
  }

  /**
   * Record command execution
   * @param {string} command - Command name
   */
  recordCommand(command) {
    if (!this.metrics.commandExecutions[command]) {
      this.metrics.commandExecutions[command] = 0;
    }
    this.metrics.commandExecutions[command]++;

    logger.debug('Command executed', { command, count: this.metrics.commandExecutions[command] });
  }

  /**
   * Record error
   * @param {string} errorType - Type of error
   */
  recordError(errorType) {
    if (!this.metrics.errors[errorType]) {
      this.metrics.errors[errorType] = 0;
    }
    this.metrics.errors[errorType]++;

    logger.warn('Error recorded', { errorType, count: this.metrics.errors[errorType] });
  }

  /**
   * Get average scan duration
   * @returns {number} Average duration in milliseconds
   */
  getAverageScanDuration() {
    if (this.metrics.scanDurations.length === 0) return 0;
    const sum = this.metrics.scanDurations.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.scanDurations.length);
  }

  /**
   * Get P95 scan duration
   * @returns {number} P95 duration in milliseconds
   */
  getP95ScanDuration() {
    if (this.metrics.scanDurations.length === 0) return 0;
    const sorted = [...this.metrics.scanDurations].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || 0;
  }

  /**
   * Get all metrics
   * @returns {object} Current metrics
   */
  getMetrics() {
    return {
      scansPerformed: this.metrics.scansPerformed,
      vulnerabilitiesFound: this.metrics.vulnerabilitiesFound,
      averageScanDuration: this.getAverageScanDuration(),
      p95ScanDuration: this.getP95ScanDuration(),
      lastScanTimestamp: this.metrics.lastScanTimestamp,
      commandExecutions: { ...this.metrics.commandExecutions },
      errors: { ...this.metrics.errors },
      uptime: Date.now() - this.metrics.startTime
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      scansPerformed: 0,
      vulnerabilitiesFound: 0,
      scanDurations: [],
      commandExecutions: {},
      lastScanTimestamp: null,
      errors: {},
      startTime: Date.now()
    };
    logger.info('Metrics reset');
  }
}

// Global metrics collector instance
const metrics = new MetricsCollector();

/**
 * Health check status
 */
const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy'
};

/**
 * Perform health check
 * @returns {object} Health check result
 */
function performHealthCheck() {
  const components = {
    apiKeys: checkApiKeyValidation(),
    jwt: checkJwtValidation(),
    config: checkConfigLoading(),
    scripts: checkScriptExecution(),
    filesystem: checkFilesystemAccess()
  };

  // Determine overall status
  const allHealthy = Object.values(components).every(status => status === HealthStatus.HEALTHY);
  const anyUnhealthy = Object.values(components).some(status => status === HealthStatus.UNHEALTHY);

  const status = allHealthy
    ? HealthStatus.HEALTHY
    : anyUnhealthy
    ? HealthStatus.UNHEALTHY
    : HealthStatus.DEGRADED;

  const result = {
    status,
    timestamp: new Date().toISOString(),
    components,
    uptime: Date.now() - metrics.metrics.startTime,
    info: {
      version: require('../package.json').version,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  logger.debug('Health check performed', result);
  return result;
}

/**
 * Check API key validation component
 * @returns {string} Health status
 */
function checkApiKeyValidation() {
  try {
    const crypto = require('crypto');
    // Test key generation
    const testKey = crypto.randomBytes(32).toString('base64');
    if (!testKey || testKey.length === 0) {
      return HealthStatus.UNHEALTHY;
    }
    return HealthStatus.HEALTHY;
  } catch (err) {
    logger.error('API key validation health check failed', err);
    return HealthStatus.UNHEALTHY;
  }
}

/**
 * Check JWT validation component
 * @returns {string} Health status
 */
function checkJwtValidation() {
  try {
    const jwt = require('jsonwebtoken');
    // Test JWT operations
    const testToken = jwt.sign({ test: true }, 'test-secret', { algorithm: 'HS256', expiresIn: '1m' });
    const decoded = jwt.verify(testToken, 'test-secret');
    if (!decoded || decoded.test !== true) {
      return HealthStatus.UNHEALTHY;
    }
    return HealthStatus.HEALTHY;
  } catch (err) {
    logger.error('JWT validation health check failed', err);
    return HealthStatus.UNHEALTHY;
  }
}

/**
 * Check config loading component
 * @returns {string} Health status
 */
function checkConfigLoading() {
  try {
    const configPaths = [
      path.join(process.cwd(), '.api-security.json'),
      path.join(process.cwd(), '.claude', 'api-security.json')
    ];

    let configExists = false;
    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        configExists = true;
        break;
      }
    }

    // Config not existing is not unhealthy (will use defaults)
    return HealthStatus.HEALTHY;
  } catch (err) {
    logger.error('Config loading health check failed', err);
    return HealthStatus.UNHEALTHY;
  }
}

/**
 * Check script execution component
 * @returns {string} Health status
 */
function checkScriptExecution() {
  try {
    const scriptPath = path.join(__dirname, '../scripts/api-security-audit.js');
    if (!fs.existsSync(scriptPath)) {
      return HealthStatus.UNHEALTHY;
    }
    return HealthStatus.HEALTHY;
  } catch (err) {
    logger.error('Script execution health check failed', err);
    return HealthStatus.UNHEALTHY;
  }
}

/**
 * Check filesystem access component
 * @returns {string} Health status
 */
function checkFilesystemAccess() {
  try {
    const testDir = process.cwd();
    if (!fs.existsSync(testDir)) {
      return HealthStatus.UNHEALTHY;
    }
    fs.accessSync(testDir, fs.constants.R_OK);
    return HealthStatus.HEALTHY;
  } catch (err) {
    logger.error('Filesystem access health check failed', err);
    return HealthStatus.UNHEALTHY;
  }
}

/**
 * Get metrics summary
 * @returns {object} Metrics summary
 */
function getMetricsSummary() {
  const data = metrics.getMetrics();

  return {
    ...data,
    health: performHealthCheck().status
  };
}

/**
 * Record scan with metrics
 * @param {Function} scanFunction - Scan function to execute
 * @param {string} scanType - Type of scan
 * @returns {Promise<*>} Scan result
 */
async function withMetrics(scanFunction, scanType) {
  const startTime = Date.now();
  let result;

  try {
    result = await scanFunction();
    const duration = Date.now() - startTime;

    // Count vulnerabilities if result includes findings
    const vulnerabilityCount = result?.findings?.length || 0;
    metrics.recordScan(scanType, duration, vulnerabilityCount);

    return result;
  } catch (err) {
    const duration = Date.now() - startTime;
    metrics.recordError(err.name || 'UnknownError');
    metrics.recordScan(scanType, duration, 0);

    throw err;
  }
}

module.exports = {
  MetricsCollector,
  HealthStatus,
  metrics,
  performHealthCheck,
  getMetricsSummary,
  withMetrics
};
