/**
 * Health Checks and Metrics Tests
 * Tests for health monitoring and metrics collection
 */

const { MetricsCollector, HealthStatus, performHealthCheck, metrics } = require('../lib/health-metrics');

describe('MetricsCollector', () => {
  beforeEach(() => {
    metrics.reset();
  });

  describe('recordScan', () => {
    test('should record scan metrics', () => {
      metrics.recordScan('security-audit', 1500, 5);

      const data = metrics.getMetrics();
      expect(data.scansPerformed).toBe(1);
      expect(data.vulnerabilitiesFound).toBe(5);
      expect(data.scanDurations).toHaveLength(1);
      expect(data.scanDurations[0]).toBe(1500);
    });

    test('should track multiple scans', () => {
      metrics.recordScan('security-audit', 1000, 2);
      metrics.recordScan('cors-audit', 500, 0);

      const data = metrics.getMetrics();
      expect(data.scansPerformed).toBe(2);
      expect(data.vulnerabilitiesFound).toBe(2);
    });

    test('should limit scan duration history', () => {
      for (let i = 0; i < 105; i++) {
        metrics.recordScan('test', 100, 0);
      }

      const data = metrics.getMetrics();
      expect(data.scanDurations.length).toBe(100);
    });
  });

  describe('recordCommand', () => {
    test('should record command executions', () => {
      metrics.recordCommand('cors-setup');
      metrics.recordCommand('cors-setup');
      metrics.recordCommand('jwt-validate');

      const data = metrics.getMetrics();
      expect(data.commandExecutions['cors-setup']).toBe(2);
      expect(data.commandExecutions['jwt-validate']).toBe(1);
    });
  });

  describe('recordError', () => {
    test('should record errors', () => {
      metrics.recordError('ValidationError');
      metrics.recordError('ValidationError');
      metrics.recordError('ConfigurationError');

      const data = metrics.getMetrics();
      expect(data.errors['ValidationError']).toBe(2);
      expect(data.errors['ConfigurationError']).toBe(1);
    });
  });

  describe('average scan duration', () => {
    test('should calculate average duration', () => {
      metrics.recordScan('test', 1000, 0);
      metrics.recordScan('test', 2000, 0);
      metrics.recordScan('test', 3000, 0);

      const avg = metrics.getAverageScanDuration();
      expect(avg).toBe(2000);
    });

    test('should return 0 when no scans', () => {
      const avg = metrics.getAverageScanDuration();
      expect(avg).toBe(0);
    });
  });

  describe('P95 scan duration', () => {
    test('should calculate P95 duration', () => {
      for (let i = 0; i < 20; i++) {
        metrics.recordScan('test', i * 100, 0);
      }

      const p95 = metrics.getP95ScanDuration();
      expect(p95).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    test('should reset all metrics', () => {
      metrics.recordScan('test', 1000, 5);
      metrics.recordCommand('test');
      metrics.recordError('TestError');

      metrics.reset();

      const data = metrics.getMetrics();
      expect(data.scansPerformed).toBe(0);
      expect(data.vulnerabilitiesFound).toBe(0);
      expect(data.scanDurations).toHaveLength(0);
      expect(Object.keys(data.commandExecutions)).toHaveLength(0);
      expect(Object.keys(data.errors)).toHaveLength(0);
    });
  });
});

describe('Health Checks', () => {
  describe('performHealthCheck', () => {
    test('should return healthy status when all components are healthy', () => {
      const result = performHealthCheck();

      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.timestamp).toBeDefined();
      expect(result.components).toBeDefined();
    });

    test('should include all component statuses', () => {
      const result = performHealthCheck();

      expect(result.components).toHaveProperty('apiKeys');
      expect(result.components).toHaveProperty('jwt');
      expect(result.components).toHaveProperty('config');
      expect(result.components).toHaveProperty('scripts');
      expect(result.components).toHaveProperty('filesystem');
    });

    test('should include system information', () => {
      const result = performHealthCheck();

      expect(result.info).toHaveProperty('version');
      expect(result.info).toHaveProperty('nodeVersion');
      expect(result.info).toHaveProperty('platform');
      expect(result.info).toHaveProperty('arch');
    });

    test('should include uptime', () => {
      const result = performHealthCheck();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('component health checks', () => {
    test('should check API key validation component', () => {
      const result = performHealthCheck();
      expect(['healthy', 'unhealthy']).toContain(result.components.apiKeys);
    });

    test('should check JWT validation component', () => {
      const result = performHealthCheck();
      expect(['healthy', 'unhealthy']).toContain(result.components.jwt);
    });
  });
});
