/**
 * Configuration Validation Tests
 * Tests for configuration validation and security defaults
 */

const {
  ValidationResult,
  validateConfig,
  validateCorsConfig,
  validateCsrfConfig,
  validateJwtConfig,
  validateApiKeysConfig,
  applySecurityDefaults,
  loadAndValidateConfig
} = require('../lib/config-validator');

describe('ValidationResult', () => {
  test('should start with valid state', () => {
    const result = new ValidationResult();

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  test('should add errors', () => {
    const result = new ValidationResult();
    result.addError('test.field', 'Test error');

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual({
      field: 'test.field',
      message: 'Test error'
    });
  });

  test('should add warnings', () => {
    const result = new ValidationResult();
    result.addWarning('test.field', 'Test warning');

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
  });

  test('should throw when invalid', () => {
    const result = new ValidationResult();
    result.addError('test', 'Error');

    expect(() => result.throwIfInvalid()).toThrow();
  });

  test('should not throw when valid', () => {
    const result = new ValidationResult();

    expect(() => result.throwIfInvalid()).not.toThrow();
  });
});

describe('CORS Configuration Validation', () => {
  test('should validate valid CORS config', () => {
    const config = {
      allowedOrigins: ['https://example.com'],
      credentials: false,
      maxAge: 86400
    };
    const result = new ValidationResult();

    validateCorsConfig(config, result);

    expect(result.valid).toBe(true);
  });

  test('should detect wildcard with credentials', () => {
    const config = {
      allowedOrigins: ['*'],
      credentials: true,
      maxAge: 86400
    };
    const result = new ValidationResult();

    validateCorsConfig(config, result);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('credentials'))).toBe(true);
  });

  test('should warn about HTTP origins', () => {
    const config = {
      allowedOrigins: ['http://example.com'],
      credentials: false,
      maxAge: 86400
    };
    const result = new ValidationResult();

    validateCorsConfig(config, result);

    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.message.includes('HTTPS'))).toBe(true);
  });
});

describe('CSRF Configuration Validation', () => {
  test('should validate valid CSRF config', () => {
    const config = {
      cookieName: '_csrf',
      headerName: 'x-csrf-token',
      strategy: 'sync'
    };
    const result = new ValidationResult();

    validateCsrfConfig(config, result);

    expect(result.valid).toBe(true);
  });

  test('should reject invalid strategy', () => {
    const config = {
      cookieName: '_csrf',
      headerName: 'x-csrf-token',
      strategy: 'invalid'
    };
    const result = new ValidationResult();

    validateCsrfConfig(config, result);

    expect(result.valid).toBe(false);
  });
});

describe('JWT Configuration Validation', () => {
  test('should validate valid JWT config', () => {
    const config = {
      algorithm: 'RS256',
      expiration: '15m',
      refreshExpiration: '7d'
    };
    const result = new ValidationResult();

    validateJwtConfig(config, result);

    expect(result.valid).toBe(true);
  });

  test('should reject "none" algorithm', () => {
    const config = {
      algorithm: 'none',
      expiration: '15m',
      refreshExpiration: '7d'
    };
    const result = new ValidationResult();

    validateJwtConfig(config, result);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('none'))).toBe(true);
  });

  test('should warn about HS algorithms', () => {
    const config = {
      algorithm: 'HS256',
      expiration: '15m',
      refreshExpiration: '7d'
    };
    const result = new ValidationResult();

    validateJwtConfig(config, result);

    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.message.includes('Asymmetric'))).toBe(true);
  });

  test('should warn about long access token expiration', () => {
    const config = {
      algorithm: 'RS256',
      expiration: '2h',
      refreshExpiration: '7d'
    };
    const result = new ValidationResult();

    validateJwtConfig(config, result);

    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.message.includes('15 minutes'))).toBe(true);
  });
});

describe('API Keys Configuration Validation', () => {
  test('should validate valid API keys config', () => {
    const config = {
      keyLength: 32,
      rotationDays: 90,
      prefix: 'sk'
    };
    const result = new ValidationResult();

    validateApiKeysConfig(config, result);

    expect(result.valid).toBe(true);
  });

  test('should reject short key length', () => {
    const config = {
      keyLength: 16,
      rotationDays: 90,
      prefix: 'sk'
    };
    const result = new ValidationResult();

    validateApiKeysConfig(config, result);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('32 bytes'))).toBe(true);
  });

  test('should warn about long rotation period', () => {
    const config = {
      keyLength: 32,
      rotationDays: 180,
      prefix: 'sk'
    };
    const result = new ValidationResult();

    validateApiKeysConfig(config, result);

    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.message.includes('90 days'))).toBe(true);
  });
});

describe('Security Defaults', () => {
  test('should apply defaults to empty config', () => {
    const config = {};
    const withDefaults = applySecurityDefaults(config);

    expect(withDefaults.cors.allowedOrigins).toEqual([]);
    expect(withDefaults.cors.credentials).toBe(false);
    expect(withDefaults.csrf.cookieName).toBe('_csrf');
    expect(withDefaults.jwt.algorithm).toBe('RS256');
    expect(withDefaults.apiKeys.keyLength).toBe(32);
  });

  test('should preserve existing values', () => {
    const config = {
      cors: { allowedOrigins: ['https://example.com'], credentials: true, maxAge: 3600 },
      jwt: { algorithm: 'ES256', expiration: '30m', refreshExpiration: '30d' }
    };
    const withDefaults = applySecurityDefaults(config);

    expect(withDefaults.cors.allowedOrigins).toEqual(['https://example.com']);
    expect(withDefaults.cors.credentials).toBe(true);
    expect(withDefaults.jwt.algorithm).toBe('ES256');
  });
});

describe('Full Configuration Validation', () => {
  test('should validate complete configuration', () => {
    const config = {
      cors: {
        allowedOrigins: ['https://example.com'],
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
      outputFormat: 'json'
    };

    const result = validateConfig(config);

    expect(result.valid).toBe(true);
  });

  test('should collect multiple validation errors', () => {
    const config = {
      cors: {
        allowedOrigins: ['*'],
        credentials: true,
        maxAge: -1
      },
      jwt: {
        algorithm: 'none',
        expiration: 'invalid',
        refreshExpiration: '7d'
      }
    };

    const result = validateConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
