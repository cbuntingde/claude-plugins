/**
 * TypeScript definitions for API Security Hardening Plugin
 *
 * Provides comprehensive type definitions for all plugin functionality
 */

/**
 * Severity levels for security findings
 */
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Security focus areas
 */
export type SecurityFocus = 'cors' | 'csrf' | 'xss' | 'jwt' | 'apikey' | null;

/**
 * Output format types
 */
export type OutputFormat = 'text' | 'json' | 'markdown';

/**
 * Supported frameworks
 */
export type Framework = 'express' | 'fastify' | 'nestjs' | 'koa' | 'vanilla';

/**
 * CSRF strategy types
 */
export type CsrfStrategy = 'sync' | 'double-submit' | 'encrypted';

/**
 * CSP strictness levels
 */
export type CspLevel = 'strict' | 'moderate' | 'permissive';

/**
 * Frontend frameworks for XSS prevention
 */
export type FrontendFramework = 'react' | 'vue' | 'angular' | 'vanilla';

/**
 * JWT algorithm types
 */
export type JwtAlgorithm = 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'PS256' | 'PS384' | 'PS512' | 'HS256' | 'HS384' | 'HS512';

/**
 * Security finding interface
 */
export interface SecurityFinding {
  /** File path where the finding was detected */
  file: string;
  /** Line number */
  line: number;
  /** Security category */
  category: string;
  /** Type of vulnerability */
  type: string;
  /** Severity level */
  severity: SecuritySeverity;
  /** Vulnerable code snippet */
  code: string;
  /** Recommended fix */
  fix: string;
}

/**
 * Security audit summary
 */
export interface SecurityAuditSummary {
  /** Total findings count */
  total: number;
  /** Critical severity count */
  critical: number;
  /** High severity count */
  high: number;
  /** Medium severity count */
  medium: number;
  /** Low severity count */
  low: number;
}

/**
 * Security audit result
 */
export interface SecurityAuditResult {
  /** Operation success status */
  success: boolean;
  /** Human-readable report text (for text output) */
  text?: string;
  /** Summary statistics */
  summary?: SecurityAuditSummary;
  /** Detailed findings */
  findings?: SecurityFinding[];
}

/**
 * API Security Audit parameters
 */
export interface ApiSecurityAuditParams {
  /** Directory or file to scan */
  path?: string;
  /** Minimum severity level */
  severity?: SecuritySeverity;
  /** Focus on specific security area */
  focus?: SecurityFocus;
  /** Output format */
  output?: OutputFormat;
  /** Generate fix recommendations */
  fix?: boolean;
}

/**
 * CORS Setup parameters
 */
export interface CorsSetupParams {
  /** Target framework */
  framework?: Framework;
  /** Comma-separated allowed origins */
  origins?: string;
  /** Enable credentials */
  credentials?: boolean;
  /** Preflight cache duration in seconds */
  maxAge?: number;
  /** Comma-separated exposed headers */
  exposedHeaders?: string;
  /** Output file path */
  output?: string;
}

/**
 * CSRF Protection parameters
 */
export interface CsrfProtectionParams {
  /** Target framework */
  framework?: Framework;
  /** Token strategy */
  strategy?: CsrfStrategy;
  /** Cookie name */
  cookieName?: string;
  /** Header name */
  headerName?: string;
  /** Methods to ignore */
  ignoreMethods?: string;
  /** Output directory */
  output?: string;
}

/**
 * XSS Prevention parameters
 */
export interface XssPreventionParams {
  /** Target framework */
  framework?: Framework;
  /** CSP strictness level */
  csp?: CspLevel;
  /** Enable input sanitization */
  sanitizeInput?: boolean;
  /** Enable output encoding */
  encodeOutput?: boolean;
  /** Frontend framework */
  frontend?: FrontendFramework;
  /** Output directory */
  output?: string;
}

/**
 * JWT Validation parameters
 */
export interface JwtValidateParams {
  /** Directory to validate */
  path?: string;
  /** Generate secure implementation */
  fix?: boolean;
  /** JWT algorithm */
  algorithm?: JwtAlgorithm;
  /** Access token expiration */
  expiration?: string;
  /** Refresh token expiration */
  refreshExpiration?: string;
  /** Target framework */
  framework?: Framework;
  /** Output directory */
  output?: string;
}

/**
 * API Key Rotation parameters
 */
export interface ApiKeyRotateParams {
  /** Action to perform */
  action?: 'generate' | 'validate' | 'generate-middleware' | 'rotate-all';
  /** Generate new API key */
  generate?: boolean;
  /** Validate implementation */
  validate?: boolean;
  /** Rotate all keys */
  rotateAll?: boolean;
  /** Specific key ID to rotate */
  keyId?: string;
  /** Key length in bytes */
  keyLength?: number;
  /** Key prefix */
  prefix?: string;
  /** Target framework */
  framework?: Framework;
  /** Output directory */
  output?: string;
  /** Directory to validate */
  path?: string;
  /** Number of keys to generate */
  count?: number;
}

/**
 * API Key data
 */
export interface ApiKey {
  /** Key identifier */
  keyId: string;
  /** Generated API key (only returned on creation) */
  key?: string;
  /** Scopes assigned to key */
  scopes?: string[];
  /** Creation timestamp */
  createdAt: string;
  /** Expiration timestamp */
  expiresAt?: string;
  /** Key version */
  version: number;
}

/**
 * Plugin configuration
 */
export interface ApiSecurityConfig {
  /** CORS configuration */
  cors: {
    /** Whitelisted origins */
    allowedOrigins: string[];
    /** Enable credentials */
    credentials: boolean;
    /** Preflight cache duration */
    maxAge: number;
  };
  /** CSRF configuration */
  csrf: {
    /** Cookie name */
    cookieName: string;
    /** Header name */
    headerName: string;
    /** Token strategy */
    strategy: CsrfStrategy;
  };
  /** JWT configuration */
  jwt: {
    /** Signing algorithm */
    algorithm: JwtAlgorithm;
    /** Access token expiration */
    expiration: string;
    /** Refresh token expiration */
    refreshExpiration: string;
  };
  /** API Key configuration */
  apiKeys: {
    /** Key length in bytes */
    keyLength: number;
    /** Rotation period in days */
    rotationDays: number;
    /** Key prefix */
    prefix: string;
  };
  /** Default severity level */
  severity: SecuritySeverity;
  /** Default output format */
  outputFormat: OutputFormat;
}

/**
 * Security recommendation
 */
export interface SecurityRecommendation {
  /** Security area */
  area: string;
  /** Severity level */
  severity: SecuritySeverity;
  /** Recommendation message */
  message: string;
  /** Related command */
  command: string;
}

/**
 * Security recommendations result
 */
export interface SecurityRecommendationsResult {
  /** Operation success status */
  success: boolean;
  /** List of recommendations */
  recommendations: SecurityRecommendation[];
}

/**
 * Plugin help information
 */
export interface PluginHelp {
  /** Operation success status */
  success: boolean;
  /** Plugin metadata */
  plugin: {
    name: string;
    version: string;
    description: string;
  };
  /** Available commands */
  commands: Array<{
    name: string;
    description: string;
    usage: string;
  }>;
  /** Available agents */
  agents: string[];
  /** Available skills */
  skills: string[];
  /** Active hooks */
  hooks: string[];
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Timestamp of check */
  timestamp: string;
  /** Component status */
  components: {
    /** API key validation status */
    apiKeyValidation: 'healthy' | 'unhealthy';
    /** JWT validation status */
    jwtValidation: 'healthy' | 'unhealthy';
    /** Configuration loading status */
    configLoading: 'healthy' | 'unhealthy';
    /** Script execution status */
    scriptExecution: 'healthy' | 'unhealthy';
  };
  /** Additional information */
  info?: {
    [key: string]: string | number;
  };
}

/**
 * Metrics data
 */
export interface MetricsData {
  /** Scan operations count */
  scansPerformed: number;
  /** Vulnerabilities found count */
  vulnerabilitiesFound: number;
  /** Average scan duration in milliseconds */
  averageScanDuration: number;
  /** Last scan timestamp */
  lastScanTimestamp?: string;
  /** Command execution counts */
  commandExecutions: {
    [commandName: string]: number;
  };
}

/**
 * Custom error classes
 */
export class ApiSecurityError extends Error {
  public readonly code: string;
  public readonly severity: SecuritySeverity;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, severity: SecuritySeverity, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiSecurityError';
    this.code = code;
    this.severity = severity;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigurationError extends ApiSecurityError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', 'high', details);
    this.name = 'ConfigurationError';
  }
}

export class ValidationError extends ApiSecurityError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 'medium', details);
    this.name = 'ValidationError';
  }
}

export class SecurityVulnerabilityError extends ApiSecurityError {
  constructor(message: string, severity: SecuritySeverity, details?: Record<string, unknown>) {
    super(message, 'SECURITY_VULNERABILITY', severity, details);
    this.name = 'SecurityVulnerabilityError';
  }
}

/**
 * Plugin API interface
 */
export interface ApiSecurityPlugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description: string;

  /** Configuration functions */
  loadConfig(): ApiSecurityConfig;
  getDefaultConfig(): ApiSecurityConfig;

  /** Command handlers */
  apiSecurityAudit(params?: ApiSecurityAuditParams): SecurityAuditResult;
  corsSetup(params?: CorsSetupParams): { success: boolean; config?: string; path?: string; message?: string; code?: string };
  csrfProtection(params?: CsrfProtectionParams): { success: boolean; code?: string; path?: string; message?: string };
  xssPrevention(params?: XssPreventionParams): { success: boolean; code?: string; path?: string; message?: string };
  jwtValidate(params?: JwtValidateParams): SecurityAuditResult | string;
  apiKeyRotate(params?: ApiKeyRotateParams): { success: boolean; key?: ApiKey; keys?: ApiKey[]; middleware?: string; text?: string };

  /** Utility functions */
  getSecurityRecommendations(params?: { severity?: SecuritySeverity }): SecurityRecommendationsResult;
  getHelp(): PluginHelp;
  getHealthCheck(): HealthCheckResult;
  getMetrics(): MetricsData;
}
