#!/usr/bin/env node

/**
 * Secrets Detection Script
 * Scans tool arguments for secrets and sensitive information
 * Exits with non-zero code if secrets are detected
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m'
};

/**
 * Secret detection patterns
 */
const SECRET_PATTERNS = [
  // AWS Keys
  { name: 'AWS Access Key', pattern: /(?:^|[^A-Za-z0-9/+=])(AKIA[0-9A-Z]{16})(?:[^A-Za-z0-9/+=]|$)/, severity: 'critical' },
  { name: 'AWS Secret Key', pattern: /(?:^|[^A-Za-z0-9/+=])([A-Za-z0-9/+=]{40})(?:[^A-Za-z0-9/+=]|$)/, severity: 'critical' },

  // GitHub Tokens
  { name: 'GitHub Token', pattern: /(?:^|[^A-Za-z0-9])(ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36})(?:[^A-Za-z0-9]|$)/, severity: 'critical' },

  // Google Cloud
  { name: 'Google API Key', pattern: /(?:^|[^A-Za-z0-9])(AIza[A-Za-z0-9_\-]{35})(?:[^A-Za-z0-9]|$)/, severity: 'critical' },
  { name: 'Google OAuth Token', pattern: /(?:^|[^A-Za-z0-9])(ya29\.[A-Za-z0-9_\-]{100,400})(?:[^A-Za-z0-9]|$)/, severity: 'critical' },

  // Stripe
  { name: 'Stripe API Key', pattern: /(?:^|[^A-Za-z0-9])(sk_live_[A-Za-z0-9]{24,150})(?:[^A-Za-z0-9]|$)/, severity: 'critical' },
  { name: 'Stripe Test Key', pattern: /(?:^|[^A-Za-z0-9])(sk_test_[A-Za-z0-9]{24,150})(?:[^A-Za-z0-9]|$)/, severity: 'high' },

  // Slack
  { name: 'Slack Token', pattern: /(?:^|[^A-Za-z0-9])(xox[pbar]-[A-Za-z0-9-]{10,250})(?:[^A-Za-z0-9]|$)/, severity: 'critical' },

  // JWT Tokens
  { name: 'JWT Token', pattern: /(?:^|[^A-Za-z0-9])(eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)(?:[^A-Za-z0-9]|$)/, severity: 'high' },

  // Database URLs
  { name: 'Database URL with credentials', pattern: /(?:mongodb|mysql|postgres|redis):\/\/[^:]+:[^@]+@[^\/]+/, severity: 'critical' },

  // API Keys in URLs
  { name: 'API Key in URL', pattern: /(?:https?:\/\/)[^\/?]*[?&](?:api[_-]?key|apikey|api-key|token|access[_-]?token)=[^&\s]+/i, severity: 'critical' },

  // Generic API Key assignments
  { name: 'API Key assignment', pattern: /(?:^|[^A-Za-z0-9])(?:api[_-]?key|apikey|api-key)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{20,})['"]?/i, severity: 'high' },

  // Bearer tokens
  { name: 'Bearer token', pattern: /(?:^|[^A-Za-z0-9])(?:bearer\s+)([A-Za-z0-9_\-\.]{20,})/i, severity: 'high' },

  // Password assignments
  { name: 'Password assignment', pattern: /(?:^|[^A-Za-z0-9])(?:password|passwd|pwd)\s*[:=]\s*['"]?([^'\s"]{8,})['"]?/i, severity: 'high' },

  // Private keys
  { name: 'Private Key', pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/, severity: 'critical' },
  { name: 'OpenSSH Private Key', pattern: /-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----/, severity: 'critical' },

  // PII - SSN
  { name: 'Social Security Number', pattern: /\b\d{3}-\d{2}-\d{4}\b/, severity: 'critical' },

  // Credit Cards
  { name: 'Credit Card Number', pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/, severity: 'critical' },

  // Email addresses (major providers)
  { name: 'Email Address', pattern: /\b[A-Za-z0-9._%+-]+@(?:gmail|yahoo|outlook|hotmail|icloud|protonmail)\.[A-Za-z]{2,}\b/i, severity: 'medium' },

  // Private IP addresses
  { name: 'Private IP Address', pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/, severity: 'medium' }
];

/**
 * Exclusion patterns (false positives)
 */
const EXCLUSION_PATTERNS = [
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
  /xxx+/,
  /---/,
  /\.\.\./,
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /\$\{[A-Z_]+\}/,
  /\$[A-Z_]+/
];

/**
 * Check if a string matches exclusion patterns
 */
function isExcludedMatch(match) {
  return EXCLUSION_PATTERNS.some(pattern => pattern.test(match));
}

/**
 * Scan a string for secrets
 */
function scanForSecrets(input) {
  const secrets = [];

  for (const secretPattern of SECRET_PATTERNS) {
    const matches = input.matchAll(new RegExp(secretPattern.pattern.source, secretPattern.pattern.flags || 'gi'));

    for (const match of matches) {
      const matchedText = match[1] || match[0];

      if (isExcludedMatch(matchedText)) {
        continue;
      }

      secrets.push({
        pattern: secretPattern.name,
        match: redactSecret(matchedText),
        severity: secretPattern.severity
      });
    }
  }

  return secrets;
}

/**
 * Redact a secret for display
 */
function redactSecret(secret, visibleChars = 4) {
  if (secret.length <= visibleChars * 2) {
    return '*'.repeat(secret.length);
  }
  const start = secret.substring(0, visibleChars);
  const end = secret.substring(secret.length - visibleChars);
  return `${start}${'*'.repeat(secret.length - visibleChars * 2)}${end}`;
}

/**
 * Main detection function
 */
function main() {
  // Read hook input from environment variables or stdin
  const hookInput = process.env.HOOK_INPUT || '';

  let inputData = {};
  try {
    inputData = hookInput ? JSON.parse(hookInput) : {};
  } catch (e) {
    // If no input, try reading from stdin
    try {
      const stdinBuffer = fs.readFileSync(0, 'utf-8');
      inputData = stdinBuffer.trim() ? JSON.parse(stdinBuffer) : {};
    } catch (e2) {
      // No input available, just exit successfully
      process.exit(0);
    }
  }

  // Get tool name and arguments
  const toolName = inputData.toolName || '';
  const args = inputData.arguments || {};
  const command = inputData.command || '';

  // Convert arguments to string for scanning
  const argsString = JSON.stringify(args);
  const combinedInput = `${toolName} ${command} ${argsString}`;

  // Scan for secrets
  const secrets = scanForSecrets(combinedInput);

  if (secrets.length === 0) {
    process.exit(0);
  }

  // Determine overall severity
  const severities = secrets.map(s => s.severity);
  const overallSeverity = severities.includes('critical') ? 'critical' :
                         severities.includes('high') ? 'high' : 'medium';

  // Group by severity
  const critical = secrets.filter(s => s.severity === 'critical');
  const high = secrets.filter(s => s.severity === 'high');
  const medium = secrets.filter(s => s.severity === 'medium');

  // Output warning
  console.error(`\n${colors.cyan}${colors.bright}⚠️  Secrets Detection Warning${colors.reset}`);
  console.error(`${colors.bright}Severity: ${overallSeverity.toUpperCase()}${colors.reset}`);
  console.error(`${colors.bright}Found ${secrets.length} potential secret(s):${colors.reset}\n`);

  if (critical.length > 0) {
    console.error(`${colors.red}${colors.bright}❌ CRITICAL:${colors.reset}`);
    critical.forEach(secret => {
      console.error(`  • ${secret.pattern}`);
      console.error(`    Detected: ${secret.match}`);
    });
    console.error('');
  }

  if (high.length > 0) {
    console.error(`${colors.yellow}${colors.bright}⚠️  HIGH:${colors.reset}`);
    high.forEach(secret => {
      console.error(`  • ${secret.pattern}`);
      console.error(`    Detected: ${secret.match}`);
    });
    console.error('');
  }

  if (medium.length > 0) {
    console.error(`${colors.yellow}ℹ️  MEDIUM:${colors.reset}`);
    medium.forEach(secret => {
      console.error(`  • ${secret.pattern}`);
      console.error(`    Detected: ${secret.match}`);
    });
    console.error('');
  }

  console.error(`${colors.red}${colors.bright}⛔ Operation blocked to prevent sensitive data exposure.${colors.reset}`);
  console.error(`${colors.cyan}Please remove or redact the sensitive information before proceeding.${colors.reset}\n`);

  // Exit with error to block the operation
  process.exit(1);
}

main();
