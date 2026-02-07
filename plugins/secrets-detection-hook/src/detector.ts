/**
 * Secrets detection engine
 * Analyzes strings for potential secrets and sensitive information
 */

import { SECRET_PATTERNS, isExcludedMatch } from './patterns.js';

export interface SecretMatch {
  patternName: string;
  match: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  position: {
    line: number;
    column: number;
  };
}

export interface ScanResult {
  hasSecrets: boolean;
  secrets: SecretMatch[];
  severity: 'critical' | 'high' | 'medium' | 'none';
}

/**
 * Scan a string for potential secrets
 */
export function scanForSecrets(input: string): ScanResult {
  const secrets: SecretMatch[] = [];
  const lines = input.split('\n');

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Skip comments and documentation lines
    if (line.trim().startsWith('#') || line.trim().startsWith('//') || line.trim().startsWith('*')) {
      continue;
    }

    // Check each pattern
    for (const pattern of SECRET_PATTERNS) {
      const matches = line.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags));

      for (const match of matches) {
        const matchedText = match[1] || match[0];

        // Skip if this is an excluded match (placeholder, example, etc.)
        if (isExcludedMatch(matchedText)) {
          continue;
        }

        // Get the position of the match
        const position = {
          line: lineIndex + 1,
          column: match.index ? match.index + 1 : 1
        };

        secrets.push({
          patternName: pattern.name,
          match: redactSecret(matchedText),
          description: pattern.description,
          severity: pattern.severity,
          position
        });
      }
    }
  }

  // Determine overall severity
  const severity = determineOverallSeverity(secrets);

  return {
    hasSecrets: secrets.length > 0,
    secrets,
    severity
  };
}

/**
 * Scan an object (like tool arguments) for secrets
 */
export function scanObjectForSecrets(obj: unknown): ScanResult {
  const secrets: SecretMatch[] = [];

  function scanValue(value: unknown, path: string[] = []): void {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      const result = scanForSecrets(value);
      if (result.hasSecrets) {
        secrets.push(...result.secrets);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => scanValue(item, [...path, String(index)]));
      return;
    }

    if (typeof value === 'object') {
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        scanValue(val, [...path, key]);
      }
    }
  }

  scanValue(obj);

  const severity = determineOverallSeverity(secrets);

  return {
    hasSecrets: secrets.length > 0,
    secrets,
    severity
  };
}

/**
 * Determine overall severity from a list of secrets
 */
function determineOverallSeverity(secrets: SecretMatch[]): 'critical' | 'high' | 'medium' | 'none' {
  if (secrets.length === 0) {
    return 'none';
  }

  const severities = secrets.map(s => s.severity);

  if (severities.includes('critical')) {
    return 'critical';
  }

  if (severities.includes('high')) {
    return 'high';
  }

  return 'medium';
}

/**
 * Redact a secret for display purposes
 * Only show first and last few characters
 */
function redactSecret(secret: string, visibleChars: number = 4): string {
  if (secret.length <= visibleChars * 2) {
    return '*'.repeat(secret.length);
  }

  const start = secret.substring(0, visibleChars);
  const end = secret.substring(secret.length - visibleChars);
  const middle = '*'.repeat(secret.length - visibleChars * 2);

  return `${start}${middle}${end}`;
}

/**
 * Format scan results for display
 */
export function formatScanResult(result: ScanResult, filename?: string): string {
  if (!result.hasSecrets) {
    return 'No secrets detected.';
  }

  const lines: string[] = [];

  if (filename) {
    lines.push(`\u26A0\uFE0F  Secrets detected in: ${filename}`);
  } else {
    lines.push('\u26A0\uFE0F  Secrets detected!');
  }

  lines.push(`\nSeverity: ${result.severity.toUpperCase()}`);
  lines.push(`Found ${result.secrets.length} potential secret(s):\n`);

  // Group by severity
  const critical = result.secrets.filter(s => s.severity === 'critical');
  const high = result.secrets.filter(s => s.severity === 'high');
  const medium = result.secrets.filter(s => s.severity === 'medium');

  if (critical.length > 0) {
    lines.push('\n\u274C  CRITICAL:');
    critical.forEach(secret => {
      lines.push(`  • ${secret.description}`);
      lines.push(`    Line ${secret.position.column}: ${secret.match}`);
    });
  }

  if (high.length > 0) {
    lines.push('\n\u26A0\uFE0F  HIGH:');
    high.forEach(secret => {
      lines.push(`  • ${secret.description}`);
      lines.push(`    Line ${secret.position.column}: ${secret.match}`);
    });
  }

  if (medium.length > 0) {
    lines.push('\u2139\uFE0F  MEDIUM:');
    medium.forEach(secret => {
      lines.push(`  • ${secret.description}`);
      lines.push(`    Line ${secret.position.column}: ${secret.match}`);
    });
  }

  lines.push('\n\u274C  Operation blocked to prevent sensitive data exposure.');
  lines.push('   Please remove or redact the sensitive information before proceeding.');

  return lines.join('\n');
}
