#!/usr/bin/env node

/**
 * Tech Debt Tracker - Debt Scan Script
 *
 * Scans codebase for technical debt issues
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Issue categories for technical debt
 */
const DEBT_CATEGORIES = {
  complexity: { name: 'Complexity', weight: 0.4 },
  duplication: { name: 'Duplication', weight: 0.3 },
  naming: { name: 'Naming', weight: 0.2 },
  security: { name: 'Security', weight: 0.5 },
  testing: { name: 'Testing', weight: 0.3 }
};

/**
 * Severity levels
 */
const SEVERITY_LEVELS = ['high', 'medium', 'low'];

/**
 * Calculate impact score for an issue
 * @param {object} issue - Issue object
 * @returns {number} Impact score (1-10)
 */
function calculateImpactScore(issue) {
  const severityWeight = { high: 3, medium: 2, low: 1 };
  const category = issue.category || 'complexity';
  const categoryWeight = DEBT_CATEGORIES[category]?.weight || 1;
  const severityMultiplier = severityWeight[issue.severity] || 1;
  const frequencyMultiplier = (issue.frequency || 1) * 0.5;
  const baseScore = categoryWeight * severityMultiplier;
  return Math.min(10, Math.max(1, baseScore + frequencyMultiplier));
}

/**
 * Get debt storage path
 * @returns {string} Storage path
 */
function getDebtStoragePath() {
  const __dirname = path.dirname(path.join(__filename, '..'));
  return path.join(__dirname, '.claude', 'debt-tracker.json');
}

/**
 * Get or create debt storage
 * @returns {object} Debt storage data
 */
function getDebtStorage() {
  const storagePath = getDebtStoragePath();
  try {
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Storage file doesn't exist or is corrupt
  }
  return { issues: [], resolved: [], lastScan: null };
}

/**
 * Save debt storage
 * @param {object} storage - Storage data to save
 */
function saveDebtStorage(storage) {
  const storagePath = getDebtStoragePath();
  try {
    const storageDir = path.dirname(storagePath);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
  } catch (error) {
    console.error(`Failed to save debt storage: ${error.message}`);
  }
}

/**
 * Generate unique issue ID
 * @returns {string} New issue ID
 */
function generateIssueId() {
  const storage = getDebtStorage();
  const existingIds = storage.issues.map(i => parseInt(i.id.split('-')[1], 10));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `TD-${String(maxId + 1).padStart(3, '0')}`;
}

/**
 * Collect files for scanning
 * @param {string} inputPath - Path to scan
 * @returns {string[]} Array of file paths
 */
function collectFiles(inputPath) {
  const files = [];
  const ignorePatterns = ['node_modules/**', 'dist/**', 'build/**', '.git/**'];

  const extPatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py', '**/*.java'];

  try {
    const glob = require('glob');

    for (const extPattern of extPatterns) {
      const pattern = path.join(inputPath, extPattern);
      const matches = glob.sync(pattern, {
        ignore: ignorePatterns,
        nodir: true
      });
      files.push(...matches);
    }
  } catch {
    // Fallback: manual directory traversal
    if (fs.existsSync(inputPath)) {
      const stats = fs.statSync(inputPath);
      if (stats.isFile()) {
        files.push(inputPath);
      } else if (stats.isDirectory()) {
        const scanDir = (dir) => {
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                const shouldSkip = ignorePatterns.some(p => {
                  const patternPart = p.replace('**', '');
                  return entry.name.endsWith(patternPart.replace('/', '')) || entry.name.startsWith('.');
                });
                if (!shouldSkip) {
                  scanDir(fullPath);
                }
              } else if (entry.isFile()) {
                files.push(fullPath);
              }
            }
          } catch {
            // Ignore permission errors
          }
        };
        scanDir(inputPath);
      }
    }
  }

  return [...new Set(files)];
}

/**
 * Scan a single file for technical debt
 * @param {string} filePath - Path to file
 * @param {string} severityFilter - Severity filter
 * @param {string} categoriesFilter - Categories filter
 * @returns {object[]} Array of issues found
 */
function scanFileForDebt(filePath, severityFilter, categoriesFilter) {
  const issues = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Detect complexity issues
    issues.push(...detectComplexityIssues(filePath, lines, content));

    // Detect naming issues
    issues.push(...detectNamingIssues(filePath, lines));

    // Detect duplication indicators
    issues.push(...detectDuplicationIssues(filePath, lines, content));

    // Detect security issues
    issues.push(...detectSecurityIssues(filePath, lines));

    // Detect testing issues
    issues.push(...detectTestingIssues(filePath, lines));
  } catch {
    // Skip files that can't be read
  }

  // Apply filters
  let filtered = issues;

  if (severityFilter !== 'all') {
    filtered = filtered.filter(i => i.severity === severityFilter);
  }

  if (categoriesFilter !== 'all') {
    const categories = categoriesFilter.split(',').map(c => c.trim());
    filtered = filtered.filter(i => categories.includes(i.category));
  }

  return filtered;
}

/**
 * Detect complexity issues in code
 */
function detectComplexityIssues(filePath, lines, content) {
  const issues = [];
  const fileName = path.basename(filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const functionMatch = line.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
    const methodMatch = line.match(/^\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{?$/);

    if (functionMatch || methodMatch) {
      const funcName = functionMatch ? functionMatch[1] : methodMatch[1];

      let braceCount = 0;
      let foundOpen = line.includes('{');
      if (!foundOpen) {
        const nextLineBrace = lines[i].match(/\{/g);
        braceCount = nextLineBrace ? nextLineBrace.length : 0;
      }

      let funcLines = 0;
      for (let j = i; j < lines.length && braceCount >= 0; j++) {
        const l = lines[j];
        braceCount += (l.match(/\{/g) || []).length;
        braceCount -= (l.match(/\}/g) || []).length;
        if (braceCount > 0) funcLines++;
        else break;
      }

      if (funcLines > 30) {
        issues.push({
          category: 'complexity',
          severity: funcLines > 50 ? 'high' : 'medium',
          file: filePath,
          line: i + 1,
          title: `Long function: ${funcName}`,
          description: `Function has ${funcLines} lines (recommended: 20-30 max)`,
          suggestion: 'Consider extracting parts into smaller helper functions',
          impactScore: calculateImpactScore({
            category: 'complexity',
            severity: funcLines > 50 ? 'high' : 'medium',
            frequency: 1
          })
        });
      }
    }
  }

  // Check for high cyclomatic complexity indicators
  let nestedDepth = 0;
  let maxNestedDepth = 0;

  for (const line of lines) {
    nestedDepth += (line.match(/if|while|for|switch|case|\?\s*\(|\&\&|\|\|/g) || []).length;
    maxNestedDepth = Math.max(maxNestedDepth, nestedDepth);
  }

  if (maxNestedDepth > 5) {
    issues.push({
      category: 'complexity',
      severity: maxNestedDepth > 8 ? 'high' : 'medium',
      file: filePath,
      line: 1,
      title: 'High cyclomatic complexity',
      description: `Maximum nested conditional depth: ${maxNestedDepth}`,
      suggestion: 'Consider using guard clauses, early returns, or extracting logic',
      impactScore: calculateImpactScore({
        category: 'complexity',
        severity: maxNestedDepth > 8 ? 'high' : 'medium',
        frequency: 1
      })
    });
  }

  return issues;
}

/**
 * Detect naming issues
 */
function detectNamingIssues(filePath, lines) {
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const varMatch = line.match(/\b(?:const|let|var)\s+([a-z])\s*=/);
    if (varMatch && !['i', 'j', 'k', 'x', 'y', 'e'].includes(varMatch[1])) {
      issues.push({
        category: 'naming',
        severity: 'low',
        file: filePath,
        line: i + 1,
        title: `Single-letter variable: ${varMatch[1]}`,
        description: 'Variable name is too short to be descriptive',
        suggestion: 'Use descriptive names that indicate purpose',
        impactScore: calculateImpactScore({ category: 'naming', severity: 'low', frequency: 1 })
      });
    }

    const genericNames = ['data', 'info', 'temp', 'tmp', 'foo', 'bar', 'baz', 'result', 'item'];
    const genericMatch = line.match(new RegExp(`\\b(?:const|let|var)\\s+(${genericNames.join('|')})\\s*=`));
    if (genericMatch) {
      issues.push({
        category: 'naming',
        severity: genericMatch[1].length < 4 ? 'medium' : 'low',
        file: filePath,
        line: i + 1,
        title: `Generic variable name: ${genericMatch[1]}`,
        description: 'Variable name is too generic to understand its purpose',
        suggestion: `Rename to something more specific (e.g., '${genericMatch[1]}Data' → 'userData')`,
        impactScore: calculateImpactScore({
          category: 'naming',
          severity: genericMatch[1].length < 4 ? 'medium' : 'low',
          frequency: 1
        })
      });
    }
  }

  return issues;
}

/**
 * Detect code duplication indicators
 */
function detectDuplicationIssues(filePath, lines, content) {
  const issues = [];

  const codePatterns = {};
  const minPatternLength = 30;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length < minPatternLength || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      continue;
    }

    const normalized = trimmed.replace(/\s+/g, ' ');
    if (!codePatterns[normalized]) {
      codePatterns[normalized] = [];
    }
    codePatterns[normalized].push(i + 1);
  }

  for (const [pattern, linesFound] of Object.entries(codePatterns)) {
    if (linesFound.length >= 3) {
      issues.push({
        category: 'duplication',
        severity: linesFound.length > 5 ? 'high' : 'medium',
        file: filePath,
        line: linesFound[0],
        title: 'Potential code duplication',
        description: `Similar code found in ${linesFound.length} locations`,
        suggestion: 'Extract into a shared function or utility module',
        impactScore: calculateImpactScore({
          category: 'duplication',
          severity: linesFound.length > 5 ? 'high' : 'medium',
          frequency: linesFound.length
        })
      });
    }
  }

  return issues;
}

/**
 * Detect security issues
 */
function detectSecurityIssues(filePath, lines) {
  const issues = [];

  const securityPatterns = [
    { pattern: /eval\s*\(/gi, title: 'Use of eval()', severity: 'high', suggestion: 'Avoid eval() - it can execute arbitrary code' },
    { pattern: /innerHTML\s*=/gi, title: 'Potential XSS with innerHTML', severity: 'high', suggestion: 'Use textContent or DOMPurify for user input' },
    { pattern: /password\s*[:=]|secret\s*[:=]|api[_-]?key\s*[:=]/gi, title: 'Potential hardcoded secret', severity: 'high', suggestion: 'Move secrets to environment variables' },
    { pattern: /Math\.random\s*\(/gi, title: 'Insecure random number generation', severity: 'medium', suggestion: 'Use crypto.getRandomValues() for security-critical randomness' },
    { pattern: /console\.(log|debug)\s*\(/gi, title: 'Debug statement left in code', severity: 'low', suggestion: 'Remove debug logging before deployment' }
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const check of securityPatterns) {
      if (check.pattern.test(line)) {
        issues.push({
          category: 'security',
          severity: check.severity,
          file: filePath,
          line: i + 1,
          title: check.title,
          description: `Found in: ${line.substring(0, 60).trim()}`,
          suggestion: check.suggestion,
          impactScore: calculateImpactScore({ category: 'security', severity: check.severity, frequency: 1 })
        });
      }
    }
  }

  return issues;
}

/**
 * Detect testing issues
 */
function detectTestingIssues(filePath, lines) {
  const issues = [];
  const fileName = path.basename(filePath);

  if (/\.(test|spec)\.(js|ts|py|java)$/i.test(fileName)) {
    return issues;
  }

  const hasTest = lines.some(l => l.includes('@test') || l.includes('describe(') || l.includes('it('));

  if (!hasTest && lines.length > 50) {
    issues.push({
      category: 'testing',
      severity: 'medium',
      file: filePath,
      line: 1,
      title: 'No test coverage detected',
      description: 'File has no obvious test coverage',
      suggestion: 'Add unit tests for critical functions',
      impactScore: calculateImpactScore({ category: 'testing', severity: 'medium', frequency: 1 })
    });
  }

  return issues;
}

/**
 * Format scan results
 * @param {object} results - Scan results
 * @returns {string} Formatted output
 */
function formatScanResults(results) {
  const output = [];

  output.push('\n📊 Technical Debt Scan Results');
  output.push('='.repeat(50));
  output.push(`Path: ${results.path}`);
  output.push(`Files scanned: ${results.scanned.length}`);
  output.push('');

  output.push(`🔴 High Priority Issues: ${results.summary.high}`);
  output.push(`🟡 Medium Priority Issues: ${results.summary.medium}`);
  output.push(`🟢 Low Priority Issues: ${results.summary.low}`);
  output.push('');

  if (results.issues.length === 0) {
    output.push('No significant technical debt issues detected.');
    output.push('');
    return output.join('\n');
  }

  output.push('Top Issues by Impact Score:');
  output.push('-'.repeat(50));

  const sortedIssues = [...results.issues]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 10);

  for (const issue of sortedIssues) {
    const severityEmoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
    output.push('');
    output.push(`${severityEmoji} [${issue.impactScore}] ${issue.title}`);
    output.push(`   Location: ${issue.file}:${issue.line}`);
    output.push(`   Category: ${issue.category}`);
    output.push(`   Suggestion: ${issue.suggestion}`);
  }

  if (results.issues.length > 10) {
    output.push('');
    output.push(`... and ${results.issues.length - 10} more issues`);
  }

  output.push('');
  output.push('[Full report saved to debt-scan-results.json]');

  return output.join('\n');
}

/**
 * Main debt scan function
 * @param {string[]} args - Command line arguments
 */
async function debtScan(args) {
  const parsedArgs = parseArgs(args);
  const scanPath = parsedArgs.path || parsedArgs._[0] || '.';
  const severity = parsedArgs.severity || 'all';
  const categories = parsedArgs.categories || 'all';
  const output = parsedArgs.output;

  const results = {
    path: scanPath,
    scanned: [],
    issues: [],
    summary: { high: 0, medium: 0, low: 0 }
  };

  // Collect files
  const files = collectFiles(scanPath);
  if (files.length === 0) {
    console.log(`No files found to scan in: ${scanPath}`);
    return;
  }

  // Scan each file
  for (const file of files) {
    const fileIssues = scanFileForDebt(file, severity, categories);
    if (fileIssues.length > 0) {
      results.issues.push(...fileIssues);
      results.scanned.push(file);
    }
  }

  // Count by severity
  for (const issue of results.issues) {
    results.summary[issue.severity]++;
  }

  // Update storage
  if (results.issues.length > 0) {
    const storage = getDebtStorage();
    for (const issue of results.issues) {
      const newIssue = {
        ...issue,
        id: generateIssueId(),
        detectedAt: new Date().toISOString(),
        status: 'open'
      };
      storage.issues.push(newIssue);
    }
    storage.lastScan = new Date().toISOString();
    saveDebtStorage(storage);
  }

  const report = formatScanResults(results);

  if (output) {
    fs.writeFileSync(output, report, 'utf-8');
    console.log(`Report written to: ${output}`);
  } else {
    console.log(report);
  }
}

/**
 * Parse command line arguments
 * @param {string[]} args - Arguments
 * @returns {object} Parsed arguments
 */
function parseArgs(args) {
  const parsed = { _: [] };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    } else {
      parsed._.push(arg);
    }
  }

  return parsed;
}

// Main execution
const args = process.argv.slice(2);
debtScan(args).catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});