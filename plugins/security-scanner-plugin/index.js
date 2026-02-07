#!/usr/bin/env node
/**
 * Security Scanner Plugin
 * Main entry point for Claude Code plugin
 */

const path = require('path');
const fs = require('fs');

/**
 * Plugin metadata
 */
const pluginInfo = {
  name: 'security-scanner-plugin',
  version: '1.0.0',
  description: 'Security scanner plugin for Claude Code that detects OWASP Top 10 vulnerabilities and security issues'
};

/**
 * Load plugin configuration
 * @returns {object} Plugin configuration
 */
function loadConfig() {
  const configPaths = [
    path.join(process.cwd(), '.security-scanner.json'),
    path.join(process.cwd(), '.claude', 'security-scanner.json'),
    path.join(__dirname, 'config.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        // Continue with defaults
      }
    }
  }

  return getDefaultConfig();
}

/**
 * Get default configuration
 * @returns {object} Default configuration
 */
function getDefaultConfig() {
  return {
    severity: {
      critical: ['sql-injection', 'command-injection', 'hardcoded-secrets'],
      high: ['xss', 'weak-crypto', 'path-traversal'],
      medium: ['information-disclosure', 'missing-validation'],
      low: ['style-issues']
    },
    ignorePatterns: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**', 'build/**'],
    outputFormat: 'text'
  };
}

/**
 * Security scan command handler
 * @param {object} params - Parameters
 * @returns {object} Scan result
 */
function securityScan(params = {}) {
  const path = params.path || '.';
  const severity = params.severity || 'medium';
  const output = params.output || 'text';

  const config = loadConfig();
  const findings = [];

  // File extensions to scan
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs', '.c', '.cpp'];

  // Directories to skip
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  // Vulnerability patterns
  const vulnPatterns = [
    { type: 'SQL Injection', pattern: /query\s*=\s*[`"'].*\$.*[`"']/g, severity: 'critical' },
    { type: 'SQL Injection', pattern: /execute\s*\(\s*[`"'].*\+/g, severity: 'critical' },
    { type: 'Command Injection', pattern: /exec\s*\(\s*[^)]*\+/g, severity: 'critical' },
    { type: 'Command Injection', pattern: /subprocess.*shell\s*=\s*true/g, severity: 'critical' },
    { type: 'Hardcoded Secrets', pattern: /password\s*=\s*['"][^'"]{8,}['"]/g, severity: 'critical' },
    { type: 'Hardcoded Secrets', pattern: /api[_-]?key\s*=\s*['"][^'"]{20,}['"]/g, severity: 'critical' },
    { type: 'Hardcoded Secrets', pattern: /secret[_-]?key\s*=\s*['"][^'"]{20,}['"]/g, severity: 'critical' },
    { type: 'Hardcoded Secrets', pattern: /token\s*=\s*['"][^'"]{30,}['"]/g, severity: 'critical' },
    { type: 'XSS', pattern: /innerHTML\s*=\s*/g, severity: 'high' },
    { type: 'XSS', pattern: /document\.write\s*\(/g, severity: 'high' },
    { type: 'Weak Cryptography', pattern: /\.md5\s*\(/g, severity: 'high' },
    { type: 'Weak Cryptography', pattern: /\.sha1\s*\(/g, severity: 'high' },
    { type: 'Eval Usage', pattern: /eval\s*\(/g, severity: 'high' },
    { type: 'Path Traversal', pattern: /\.\.\/.*\$/g, severity: 'high' },
    { type: 'Information Disclosure', pattern: /console\.log\s*\(/g, severity: 'medium' },
    { type: 'Missing Input Validation', pattern: /parseInt\s*\(/g, severity: 'medium' },
    { type: 'Insecure Random', pattern: /Math\.random\s*\(\)/g, severity: 'medium' }
  ];

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
              for (const vuln of vulnPatterns) {
                const matches = lines[i].match(vuln.pattern);
                if (matches) {
                  for (const match of matches) {
                    baseFindings.push({
                      file: fullPath,
                      line: i + 1,
                      type: vuln.type,
                      severity: vuln.severity,
                      code: lines[i].trim().substring(0, 100)
                    });
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

  const rawFindings = scanDirectory(path);

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
  outputText += '    SECURITY SCAN REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Total findings: ${filteredFindings.length}\n`;
  outputText += `  Critical: ${summary.critical}\n`;
  outputText += `  High: ${summary.high}\n`;
  outputText += `  Medium: ${summary.medium}\n`;
  outputText += `  Low: ${summary.low}\n\n`;

  for (const finding of filteredFindings) {
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    outputText += `${severityEmoji[finding.severity]} ${finding.severity.toUpperCase()}: ${finding.type}\n`;
    outputText += `   File: ${finding.file}:${finding.line}\n`;
    outputText += `   Code: ${finding.code}\n\n`;
  }

  outputText += '═════════════════════════════════════════════\n';

  return {
    success: true,
    text: outputText,
    summary,
    findings: filteredFindings
  };
}

/**
 * Vulnerability check command handler
 * @param {object} params - Parameters
 * @returns {object} Check result
 */
function vulnerabilityCheck(params = {}) {
  const vulnType = params.vulnType || 'sql-injection';
  const scanPath = params.path || '.';
  const severity = params.severity || 'high';

  // Map vulnerability types to patterns
  const vulnTypePatterns = {
    'sql-injection': [
      { pattern: /query\s*=\s*[`"'].*\$.*[`"']/g, name: 'String concatenation in queries' },
      { pattern: /execute\s*\(\s*[`"'].*\+/g, name: 'String concatenation in execute' }
    ],
    'xss': [
      { pattern: /innerHTML\s*=\s*/g, name: 'Direct innerHTML assignment' },
      { pattern: /document\.write\s*\(/g, name: 'document.write usage' }
    ],
    'secrets': [
      { pattern: /password\s*=\s*['"][^'"]{8,}['"]/g, name: 'Hardcoded password' },
      { pattern: /api[_-]?key\s*=\s*['"][^'"]{20,}['"]/g, name: 'Hardcoded API key' },
      { pattern: /secret[_-]?key\s*=\s*['"][^'"]{20,}['"]/g, name: 'Hardcoded secret key' }
    ],
    'command-injection': [
      { pattern: /exec\s*\(\s*[^)]*\+/g, name: 'exec with string concatenation' },
      { pattern: /subprocess.*shell\s*=\s*true/g, name: 'subprocess with shell=true' }
    ]
  };

  const patterns = vulnTypePatterns[vulnType] || vulnTypePatterns['sql-injection'];
  const findings = [];

  // Similar scanning logic as securityScan
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env']);

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
              for (const vuln of patterns) {
                if (vuln.pattern.test(lines[i])) {
                  baseFindings.push({
                    file: fullPath,
                    line: i + 1,
                    type: vuln.name,
                    code: lines[i].trim().substring(0, 100)
                  });
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

  const results = scanDirectory(scanPath);

  let outputText = `\nVulnerability Check: ${vulnType}\n`;
  outputText += `Path: ${scanPath}\n\n`;

  if (results.length === 0) {
    outputText += '✓ No vulnerabilities of this type found!\n';
  } else {
    outputText += `Found ${results.length} potential issues:\n\n`;
    for (const result of results) {
      outputText += `File: ${result.file}:${result.line}\n`;
      outputText += `Type: ${result.type}\n`;
      outputText += `Code: ${result.code}\n\n`;
    }
  }

  return {
    success: true,
    vulnType,
    count: results.length,
    findings: results,
    text: outputText
  };
}

/**
 * Dependency audit command handler
 * @param {object} params - Parameters
 * @returns {object} Audit result
 */
function dependencyAudit(params = {}) {
  const severity = params.severity || 'high';
  const production = params.production || false;

  // Detect package manager
  const packageManagers = [];

  if (fs.existsSync('package.json')) {
    packageManagers.push({ name: 'npm', file: 'package.json' });
  }
  if (fs.existsSync('requirements.txt')) {
    packageManagers.push({ name: 'pip', file: 'requirements.txt' });
  }
  if (fs.existsSync('Gemfile')) {
    packageManagers.push({ name: 'bundler', file: 'Gemfile' });
  }
  if (fs.existsSync('go.mod')) {
    packageManagers.push({ name: 'go', file: 'go.mod' });
  }

  if (packageManagers.length === 0) {
    return {
      success: false,
      error: 'No supported package manager found. Supported: npm, pip, bundler, go'
    };
  }

  const results = {
    summary: {
      packagesAudited: packageManagers.length,
      vulnerabilities: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    findings: []
  };

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    DEPENDENCY SECURITY AUDIT\n';
  outputFormat = '═════════════════════════════════════════════\n\n';

  for (const pm of packageManagers) {
    outputText += `Detected: ${pm.name}\n`;

    if (pm.name === 'npm') {
      outputText += 'Run "npm audit" to check for vulnerabilities.\n';
      outputText += 'Tip: Use "npm audit --production" for production deps only.\n';
    } else if (pm.name === 'pip') {
      outputText += 'Tip: Use "pip-audit" to check for vulnerabilities.\n';
    } else if (pm.name === 'bundler') {
      outputText += 'Tip: Use "bundle-audit" to check for vulnerabilities.\n';
    } else if (pm.name === 'go') {
      outputText += 'Tip: Use "govulncheck" to check for vulnerabilities.\n';
    }

    outputText += '\n';
  }

  outputText += 'For comprehensive dependency scanning:\n';
  outputText += '- npm: npm audit [--production]\n';
  outputText += '- pip: pip-audit\n';
  outputText += '- bundler: bundle-audit\n';
  outputText += '- go: govulncheck ./...\n';
  outputText += '\n═════════════════════════════════════════════\n';

  return {
    success: true,
    packageManagers: packageManagers.map(p => p.name),
    summary: results.summary,
    text: outputText
  };
}

module.exports = {
  // Plugin metadata
  ...pluginInfo,

  // Configuration
  loadConfig,
  getDefaultConfig,

  // Command handlers
  securityScan,
  vulnerabilityCheck,
  dependencyAudit
};