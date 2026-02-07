#!/usr/bin/env node
/**
 * API Security Audit Script
 * Performs comprehensive security audit for CORS, CSRF, XSS, JWT, and API key vulnerabilities
 */

const path = require('path');
const fs = require('fs');

/**
 * Main audit function
 */
function apiSecurityAudit(params = {}) {
  const scanPath = params.path || '.';
  const severity = params.severity || 'medium';
  const focus = params.focus || null;
  const output = params.output || 'text';

  const findings = [];
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  // Security patterns for each category
  const securityPatterns = {
    cors: [
      {
        type: 'Overly Permissive CORS',
        pattern: /origin\s*:\s*['"]\*['"]/g,
        severity: 'critical',
        fix: 'Whitelist specific origins instead of using wildcard'
      },
      {
        type: 'CORS with Wildcard and Credentials',
        pattern: /origin\s*:\s*['"]\*['"].*credentials\s*:\s*true/gs,
        severity: 'critical',
        fix: 'Cannot use wildcard origin with credentials. Specify exact origins.'
      },
      {
        type: 'Missing CORS Configuration',
        pattern: /app\.use\s*\(.*require\s*\(\s*['"]cors['"]\s*\)/g,
        severity: 'low',
        fix: 'Configure CORS with specific options instead of default'
      }
    ],
    csrf: [
      {
        type: 'Missing CSRF Protection',
        pattern: /app\.post\s*\(|app\.put\s*\(|app\.delete\s*\(|app\.patch\s*\(/g,
        severity: 'high',
        fix: 'Implement CSRF token validation for state-changing operations',
        contextCheck: (content) => !content.includes('csrf') && !content.includes('CSRF')
      },
      {
        type: 'Insecure Cookie Configuration',
        pattern: /res\.cookie\s*\([^)]*\)/g,
        severity: 'high',
        fix: 'Set { httpOnly: true, secure: true, sameSite: \'strict\' } on cookies',
        contextCheck: (content) => {
          const match = content.match(/res\.cookie\s*\(([^)]*)\)/);
          if (match) {
            const options = match[1];
            return !options.includes('httpOnly') || !options.includes('sameSite');
          }
          return false;
        }
      }
    ],
    xss: [
      {
        type: 'Dangerous innerHTML',
        pattern: /innerHTML\s*=\s*[^;]+[|=]/g,
        severity: 'critical',
        fix: 'Use textContent or sanitize with DOMPurify before using innerHTML'
      },
      {
        type: 'Dangerous document.write',
        pattern: /document\.write\s*\(/g,
        severity: 'high',
        fix: 'Use safe DOM manipulation methods instead'
      },
      {
        type: 'Eval with User Input',
        pattern: /eval\s*\(\s*[^)]*\+/g,
        severity: 'critical',
        fix: 'Never use eval with user input. Use JSON.parse or alternatives.'
      },
      {
        type: 'Unescaped Template Literal in HTML Context',
        pattern: /`[^`]*\$\{[^}]*\}[^`]*`/g,
        severity: 'medium',
        fix: 'Properly escape template literals when used in HTML context'
      }
    ],
    jwt: [
      {
        type: 'Weak JWT Algorithm',
        pattern: /algorithm\s*:\s*['"]none['"]/g,
        severity: 'critical',
        fix: 'Never use "none" algorithm. Use RS256 or HS256 with strong secret.'
      },
      {
        type: 'Weak JWT Secret',
        pattern: /secret\s*:\s*['"][^'"]{1,31}['"]/g,
        severity: 'critical',
        fix: 'Use minimum 256-bit (32 character) secret for JWT signing'
      },
      {
        type: 'JWT in URL',
        pattern: /query\.token|params\.token|url\.token/g,
        severity: 'high',
        fix: 'Never pass JWT in URL. Use Authorization header instead.'
      },
      {
        type: 'JWT in localStorage',
        pattern: /localStorage\.setItem\s*\(\s*['"]token['"]/g,
        severity: 'high',
        fix: 'Store JWT in HttpOnly, Secure, SameSite cookies instead.'
      },
      {
        type: 'Missing JWT Expiration',
        pattern: /jwt\.sign\s*\(\s*{[^}]*}\s*,\s*secret\s*(?![^}]*expiresIn)/g,
        severity: 'high',
        fix: 'Always set expiresIn option (recommended: 15m for access tokens)'
      }
    ],
    apikey: [
      {
        type: 'Hardcoded API Key',
        pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/g,
        severity: 'critical',
        fix: 'Move API key to environment variable or secret manager.'
      },
      {
        type: 'Hardcoded API Secret',
        pattern: /api[_-]?secret\s*[:=]\s*['"][^'"]{20,}['"]/g,
        severity: 'critical',
        fix: 'Move API secret to environment variable or secret manager.'
      },
      {
        type: 'Bearer Token Hardcoded',
        pattern: /bearer\s*:\s*['"][^'"]{30,}['"]/g,
        severity: 'critical',
        fix: 'Move bearer token to secure storage.'
      },
      {
        type: 'Weak API Key Length',
        pattern: /api[_-]?key\s*[:=]\s*['"][^'']{1,15}['"]/g,
        severity: 'medium',
        fix: 'Use minimum 32-byte (256-bit) API keys for sufficient entropy.'
      }
    ]
  };

  // Scan directory recursively
  function scanDirectory(dir, baseFindings = []) {
    if (!fs.existsSync(dir)) {
      return baseFindings;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!skipDirs.has(item)) {
          scanDirectory(fullPath, baseFindings);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (scanExtensions.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
              // Scan based on focus or all categories
              const categoriesToScan = focus ? [focus] : Object.keys(securityPatterns);

              for (const category of categoriesToScan) {
                if (!securityPatterns[category]) continue;

                for (const vuln of securityPatterns[category]) {
                  const matches = lines[i].match(vuln.pattern);

                  if (matches) {
                    // Check context if needed
                    if (vuln.contextCheck && !vuln.contextCheck(content)) {
                      continue;
                    }

                    for (const match of matches) {
                      baseFindings.push({
                        file: fullPath,
                        line: i + 1,
                        category: category.toUpperCase(),
                        type: vuln.type,
                        severity: vuln.severity,
                        code: lines[i].trim().substring(0, 100),
                        fix: vuln.fix
                      });
                    }
                  }
                }
              }
            }
          } catch (error) {
            // Skip unreadable files
          }
        }
      }
    }

    return baseFindings;
  }

  const rawFindings = scanDirectory(scanPath);

  // Filter by severity
  const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
  const minLevel = severityLevels[severity] || 1;
  const filteredFindings = rawFindings.filter(f => severityLevels[f.severity] >= minLevel);

  // Generate report
  if (output === 'json') {
    return {
      success: true,
      summary: {
        total: filteredFindings.length,
        critical: filteredFindings.filter(f => f.severity === 'critical').length,
        high: filteredFindings.filter(f => f.severity === 'high').length,
        medium: filteredFindings.filter(f => f.severity === 'medium').length,
        low: filteredFindings.filter(f => f.severity === 'low').length
      },
      findings: filteredFindings
    };
  }

  // Text output
  const summary = {
    critical: filteredFindings.filter(f => f.severity === 'critical').length,
    high: filteredFindings.filter(f => f.severity === 'high').length,
    medium: filteredFindings.filter(f => f.severity === 'medium').length,
    low: filteredFindings.filter(f => f.severity === 'low').length
  };

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    API SECURITY AUDIT REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Path: ${scanPath}\n`;
  outputText += `Total findings: ${filteredFindings.length}\n`;
  outputText += `  Critical: ${summary.critical}\n`;
  outputText += `  High: ${summary.high}\n`;
  outputText += `  Medium: ${summary.medium}\n`;
  outputText += `  Low: ${summary.low}\n\n`;

  // Group by category
  const grouped = {};
  for (const finding of filteredFindings) {
    if (!grouped[finding.category]) {
      grouped[finding.category] = [];
    }
    grouped[finding.category].push(finding);
  }

  for (const category of Object.keys(grouped)) {
    outputText += `\n─── ${category} ───\n\n`;

    for (const finding of grouped[category]) {
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🔵'
      };

      outputText += `${severityEmoji[finding.severity]} ${finding.severity.toUpperCase()}: ${finding.type}\n`;
      outputText += `   File: ${finding.file}:${finding.line}\n`;
      outputText += `   Code: ${finding.code}\n`;
      outputText += `   Fix: ${finding.fix}\n\n`;
    }
  }

  outputText += '═════════════════════════════════════════════\n';

  return {
    success: true,
    text: outputText,
    summary,
    findings: filteredFindings
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      params.path = args[++i];
    } else if (args[i] === '--severity' && args[i + 1]) {
      params.severity = args[++i];
    } else if (args[i] === '--focus' && args[i + 1]) {
      params.focus = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      params.output = args[++i];
    }
  }

  const result = apiSecurityAudit(params);
  if (result.text) {
    console.log(result.text);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

module.exports = { apiSecurityAudit };
