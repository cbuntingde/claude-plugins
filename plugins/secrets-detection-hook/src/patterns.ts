/**
 * Secret detection patterns for identifying sensitive information
 * Each pattern includes a regex and a description for user feedback
 */

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  description: string;
  severity: 'critical' | 'high' | 'medium';
}

/**
 * Comprehensive set of regex patterns for detecting secrets
 * Patterns are designed to minimize false positives while catching real secrets
 */
export const SECRET_PATTERNS: SecretPattern[] = [
  // API Keys and Tokens
  {
    name: 'AWS Access Key ID',
    pattern: /(?:^|[^A-Za-z0-9/+=])(AKIA[0-9A-Z]{16})(?:[^A-Za-z0-9/+=]|$)/,
    description: 'AWS Access Key ID detected',
    severity: 'critical'
  },
  {
    name: 'AWS Secret Key',
    pattern: /(?:^|[^A-Za-z0-9/+=])([A-Za-z0-9/+=]{40})(?:[^A-Za-z0-9/+=]|$)/,
    description: 'Possible AWS Secret Access Key (40 characters)',
    severity: 'critical'
  },
  {
    name: 'AWS Session Token',
    pattern: /(?:^|[^A-Za-z0-9/+=])([A-Za-z0-9/+=]{16,270})(?:[^A-Za-z0-9/+=]|$)/,
    description: 'Possible AWS Session Token',
    severity: 'critical'
  },

  // GitHub Tokens
  {
    name: 'GitHub Personal Access Token',
    pattern: /(?:^|[^A-Za-z0-9])(ghp_[A-Za-z0-9]{36})(?:[^A-Za-z0-9]|$)/,
    description: 'GitHub Personal Access Token',
    severity: 'critical'
  },
  {
    name: 'GitHub OAuth Token',
    pattern: /(?:^|[^A-Za-z0-9])(gho_[A-Za-z0-9]{36})(?:[^A-Za-z0-9]|$)/,
    description: 'GitHub OAuth Token',
    severity: 'critical'
  },
  {
    name: 'GitHub App Token',
    pattern: /(?:^|[^A-Za-z0-9])(ghu_[A-Za-z0-9]{36})(?:[^A-Za-z0-9]|$)/,
    description: 'GitHub App User Token',
    severity: 'critical'
  },
  {
    name: 'GitHub Server Token',
    pattern: /(?:^|[^A-Za-z0-9])(ghs_[A-Za-z0-9]{36})(?:[^A-Za-z0-9]|$)/,
    description: 'GitHub Server Token',
    severity: 'critical'
  },

  // Google Cloud
  {
    name: 'Google Cloud API Key',
    pattern: /(?:^|[^A-Za-z0-9])(AIza[A-Za-z0-9_\-]{35})(?:[^A-Za-z0-9]|$)/,
    description: 'Google Cloud API Key',
    severity: 'critical'
  },
  {
    name: 'Google OAuth Token',
    pattern: /(?:^|[^A-Za-z0-9])(ya29\.[A-Za-z0-9_\-]{100,400})(?:[^A-Za-z0-9]|$)/,
    description: 'Google OAuth Access Token',
    severity: 'critical'
  },

  // Stripe
  {
    name: 'Stripe API Key',
    pattern: /(?:^|[^A-Za-z0-9])(sk_live_[A-Za-z0-9]{24,150})(?:[^A-Za-z0-9]|$)/,
    description: 'Stripe Live API Key',
    severity: 'critical'
  },
  {
    name: 'Stripe Test Key',
    pattern: /(?:^|[^A-Za-z0-9])(sk_test_[A-Za-z0-9]{24,150})(?:[^A-Za-z0-9]|$)/,
    description: 'Stripe Test API Key',
    severity: 'high'
  },

  // Slack
  {
    name: 'Slack Token',
    pattern: /(?:^|[^A-Za-z0-9])(xox[pbar]-[A-Za-z0-9-]{10,250})(?:[^A-Za-z0-9]|$)/,
    description: 'Slack API Token',
    severity: 'critical'
  },

  // Other API Keys
  {
    name: 'Generic API Key',
    pattern: /(?:^|[^A-Za-z0-9])(?:api[_-]?key|apikey|api-key)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{20,})['"]?/i,
    description: 'Generic API Key assignment',
    severity: 'high'
  },
  {
    name: 'Bearer Token',
    pattern: /(?:^|[^A-Za-z0-9])(?:bearer\s+)([A-Za-z0-9_\-\.]{20,})/i,
    description: 'Bearer token detected',
    severity: 'high'
  },

  // Database URLs and Credentials
  {
    name: 'Database URL',
    pattern: /(?:mongodb|mysql|postgres|redis):\/\/[^:]+:[^@]+@[^\/]+/,
    description: 'Database connection URL with credentials',
    severity: 'critical'
  },
  {
    name: 'Connection String',
    pattern: /(?:^|[^A-Za-z0-9])(?:Server|Data Source|Host)[^=;]*=[^;]*;?(?:User ID|Database|Password)[^=;]*=[^;]+/i,
    description: 'Database connection string with credentials',
    severity: 'critical'
  },

  // PII - Social Security Numbers
  {
    name: 'SSN (dashed)',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/,
    description: 'Social Security Number format detected',
    severity: 'critical'
  },
  {
    name: 'SSN (spaced)',
    pattern: /\b\d{3}\s\d{2}\s\d{4}\b/,
    description: 'Social Security Number format detected',
    severity: 'critical'
  },

  // Credit Cards
  {
    name: 'Credit Card Number',
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/,
    description: 'Credit card number detected',
    severity: 'critical'
  },
  {
    name: 'Credit Card with Spaces',
    pattern: /\b(?:4[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}|5[1-5][0-9]{2}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4})\b/,
    description: 'Credit card number with spaces detected',
    severity: 'critical'
  },

  // Email Addresses (if in sensitive context)
  {
    name: 'Email Address',
    pattern: /\b[A-Za-z0-9._%+-]+@(?:gmail|yahoo|outlook|hotmail|icloud|protonmail)\.[A-Za-z]{2,}\b/i,
    description: 'Email address detected',
    severity: 'medium'
  },

  // IP Addresses (private/internal)
  {
    name: 'Private IP Address',
    pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/,
    description: 'Private IP address detected',
    severity: 'medium'
  },

  // JWT Tokens
  {
    name: 'JWT Token',
    pattern: /(?:^|[^A-Za-z0-9])(eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)(?:[^A-Za-z0-9]|$)/,
    description: 'JWT token detected',
    severity: 'high'
  },

  // Password in common formats
  {
    name: 'Password Assignment',
    pattern: /(?:^|[^A-Za-z0-9])(?:password|passwd|pwd)\s*[:=]\s*['"]?([^'\s"]{8,})['"]?/i,
    description: 'Possible password assignment',
    severity: 'high'
  },

  // Private Keys
  {
    name: 'RSA Private Key',
    pattern: /-----BEGIN\s+RSA\s+PRIVATE\s+KEY-----/,
    description: 'RSA private key detected',
    severity: 'critical'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+PRIVATE\s+KEY-----/,
    description: 'Private key detected',
    severity: 'critical'
  },
  {
    name: 'EC Private Key',
    pattern: /-----BEGIN\s+EC\s+PRIVATE\s+KEY-----/,
    description: 'Elliptic Curve private key detected',
    severity: 'critical'
  },
  {
    name: 'OpenSSH Private Key',
    pattern: /-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----/,
    description: 'OpenSSH private key detected',
    severity: 'critical'
  },

  // API Endpoint with key in URL
  {
    name: 'API Key in URL',
    pattern: /(?:https?:\/\/)[^\/?]*[?&](?:api[_-]?key|apikey|api-key|token|access[_-]?token)=[^&\s]+/i,
    description: 'API key in URL query parameter',
    severity: 'critical'
  },

  // Azure
  {
    name: 'Azure Storage Key',
    pattern: /(?:^|[^A-Za-z0-9/+=])([A-Za-z0-9/+=]{88})(?:[^A-Za-z0-9/+=]|$)/,
    description: 'Possible Azure Storage Account Key',
    severity: 'critical'
  },

  // Twilio
  {
    name: 'Twilio API Key',
    pattern: /(?:^|[^A-Za-z0-9])(SK[0-9a-f]{32})(?:[^A-Za-z0-9]|$)/,
    description: 'Twilio API Key',
    severity: 'critical'
  },

  // Auth0
  {
    name: 'Auth0 Token',
    pattern: /(?:^|[^A-Za-z0-9])(?:auth0|auth0\-)[A-Za-z0-9_\-]{30,}/,
    description: 'Possible Auth0 token or client secret',
    severity: 'critical'
  },

  // Heroku
  {
    name: 'Heroku API Key',
    pattern: /(?:^|[^A-Za-z0-9])([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/,
    description: 'Heroku API Key (UUID format)',
    severity: 'critical'
  }
];

/**
 * Patterns to exclude from detection (false positives)
 */
export const EXCLUSION_PATTERNS: RegExp[] = [
  // Common placeholder values
  /YOUR[_-]?API[_-]?KEY/i,
  /YOUR[_-]?TOKEN/i,
  /YOUR[_-]?SECRET/i,
  /\<API[_-]?KEY\>/i,
  /\<TOKEN\>/i,
  /\<SECRET\>/i,
  /REPLACE[_-]?WITH[_-]?YOUR/i,
  /example\.com/i,
  /test/i,
  /demo/i,
  /placeholder/i,

  // Documentation examples
  /xxx+/,
  /---/,
  /\.\.\./,

  // UUIDs (too common to always be secrets)
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  // Environment variable references
  /\$\{[A-Z_]+\}/,
  /\$[A-Z_]+/
];

/**
 * Check if a string matches exclusion patterns
 */
export function isExcludedMatch(match: string): boolean {
  return EXCLUSION_PATTERNS.some(pattern => pattern.test(match));
}
