/**
 * Error Handling Tests
 * Tests for custom error classes and error utilities
 */

const {
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
} = require('../lib/errors');

describe('Error Classes', () => {
  describe('ApiSecurityError', () => {
    test('should create error with all properties', () => {
      const details = { field: 'test', value: 'invalid' };
      const error = new ApiSecurityError('Test error', 'TEST_ERROR', 'high', details);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.severity).toBe('high');
      expect(error.details).toEqual(details);
      expect(error.name).toBe('ApiSecurityError');
      expect(error.timestamp).toBeDefined();
    });

    test('should convert to JSON', () => {
      const error = new ApiSecurityError('Test error', 'TEST_ERROR', 'medium');
      const json = error.toJSON();

      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('code');
      expect(json).toHaveProperty('severity');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('stack');
    });
  });

  describe('ConfigurationError', () => {
    test('should create configuration error', () => {
      const error = new ConfigurationError('Invalid configuration');

      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.severity).toBe('high');
      expect(error.details.resolution).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    test('should create validation error', () => {
      const error = new ValidationError('Invalid value', 'testField', 'invalidValue');

      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('testField');
      expect(error.invalidValue).toBe('invalidValue');
    });
  });

  describe('SecurityVulnerabilityError', () => {
    test('should create security vulnerability error with OWASP/CWE references', () => {
      const error = new SecurityVulnerabilityError('SQL injection detected', 'critical', 'SQL_INJECTION');

      expect(error.name).toBe('SecurityVulnerabilityError');
      expect(error.vulnerabilityType).toBe('SQL_INJECTION');
      expect(error.details.cweReference).toBe('CWE-89');
      expect(error.details.owaspCategory).toBe('A03:2021 - Injection');
    });

    test('should handle XSS vulnerability', () => {
      const error = new SecurityVulnerabilityError('XSS detected', 'high', 'XSS');

      expect(error.details.cweReference).toBe('CWE-79');
      expect(error.details.owaspCategory).toBe('A03:2021 - Injection');
    });
  });

  describe('RateLimitError', () => {
    test('should calculate retry after time', () => {
      const error = new RateLimitError('Rate limit exceeded', 100, '1m');

      expect(error.name).toBe('RateLimitError');
      expect(error.limit).toBe(100);
      expect(error.details.retryAfter).toBe(60);
    });

    test('should calculate retry after for hours', () => {
      const error = new RateLimitError('Rate limit exceeded', 100, '2h');

      expect(error.details.retryAfter).toBe(7200);
    });
  });
});

describe('Error Utilities', () => {
  describe('normalizeError', () => {
    test('should return ApiSecurityError as-is', () => {
      const originalError = new ApiSecurityError('Test', 'TEST', 'medium');
      const normalized = normalizeError(originalError);

      expect(normalized).toBe(originalError);
    });

    test('should convert standard Error to ApiSecurityError', () => {
      const standardError = new Error('Standard error');
      const normalized = normalizeError(standardError, 'testContext');

      expect(normalized).toBeInstanceOf(ApiSecurityError);
      expect(normalized.message).toBe('Standard error');
      expect(normalized.details.originalError).toBe('Error');
      expect(normalized.details.context).toBe('testContext');
    });

    test('should convert non-Error to ApiSecurityError', () => {
      const normalized = normalizeError('String error', 'testContext');

      expect(normalized).toBeInstanceOf(ApiSecurityError);
      expect(normalized.message).toBe('String error');
    });
  });

  describe('asyncErrorHandler', () => {
    test('should handle successful async operations', async () => {
      const fn = async () => 'success';
      const wrapped = asyncErrorHandler(fn);

      const result = await wrapped();
      expect(result).toBe('success');
    });

    test('should catch and normalize errors', async () => {
      const fn = async () => {
        throw new Error('Async error');
      };
      const wrapped = asyncErrorHandler(fn);

      await expect(wrapped()).rejects.toThrow(ApiSecurityError);
    });
  });
});
