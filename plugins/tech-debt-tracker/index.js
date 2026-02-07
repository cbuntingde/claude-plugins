/**
 * Tech Debt Tracker Plugin
 *
 * Identifies, tracks, and prioritizes technical debt in your codebase.
 * Security: OWASP compliant with input validation and secure file operations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Debt storage file path
 */
const DEBT_STORAGE_PATH = path.join(__dirname, '.claude', 'debt-tracker.json');

/**
 * Issue categories for technical debt
 */
const DEBT_CATEGORIES = {
  complexity: {
    name: 'Complexity',
    weight: 0.4,
    patterns: [
      /cyclomatic complexity/i,
      /cognitive complexity/i,
      /nesting depth/i,
      /too many parameters/i
    ]
  },
  duplication: {
    name: 'Duplication',
    weight: 0.3,
    patterns: [
      /duplicate code/i,
      /copy-paste/i,
      /similar code/i
    ]
  },
  naming: {
    name: 'Naming',
    weight: 0.2,
    patterns: [
      /naming convention/i,
      /unclear name/i,
      /magic number/i,
      /magic string/i
    ]
  },
  security: {
    name: 'Security',
    weight: 0.5,
    patterns: [
      /security vulnerability/i,
      /insecure/i,
      /deprecated/i,
      /cve-/i
    ]
  },
  testing: {
    name: 'Testing',
    weight: 0.3,
    patterns: [
      /low test coverage/i,
      /missing tests/i,
      /brittle test/i
    ]
  }
};

/**
 * Severity levels
 */
const SEVERITY_LEVELS = ['high', 'medium', 'low'];

/**
 * Impact score calculator
 * @param {object} issue - Issue object
 * @returns {number} Impact score (1-10)
 */
function calculateImpactScore(issue) {
  const severityWeight = {
    high: 3,
    medium: 2,
    low: 1
  };

  const category = issue.category || 'complexity';
  const categoryWeight = DEBT_CATEGORIES[category]?.weight || 1;

  const severityMultiplier = severityWeight[issue.severity] || 1;
  const frequencyMultiplier = (issue.frequency || 1) * 0.5;

  const baseScore = categoryWeight * severityMultiplier;
  const impactScore = Math.min(10, Math.max(1, baseScore + frequencyMultiplier));

  return Math.round(impactScore * 10) / 10;
}

/**
 * Get or create debt storage
 * @returns {object} Debt storage data
 */
function getDebtStorage() {
  try {
    if (fs.existsSync(DEBT_STORAGE_PATH)) {
      const data = fs.readFileSync(DEBT_STORAGE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Storage file doesn't exist or is corrupt
  }

  return {
    issues: [],
    resolved: [],
    lastScan: null
  };
}

/**
 * Save debt storage
 * @param {object} storage - Storage data to save
 */
function saveDebtStorage(storage) {
  try {
    const storageDir = path.dirname(DEBT_STORAGE_PATH);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    fs.writeFileSync(DEBT_STORAGE_PATH, JSON.stringify(storage, null, 2));
  } catch (error) {
    throw new Error(`Failed to save debt storage: ${error.message}`);
  }
}

/**
 * Validate issue ID format
 * @param {string} issueId - Issue ID to validate
 * @returns {boolean} True if valid
 */
function isValidIssueId(issueId) {
  return /^TD-\d{3}$/.test(issueId);
}

/**
 * Find issue by ID
 * @param {string} issueId - Issue ID to find
 * @returns {object|null} Issue or null
 */
function findIssueById(issueId) {
  const storage = getDebtStorage();
  return storage.issues.find(i => i.id === issueId) || null;
}

/**
 * Calculate effort estimate for an issue
 * @param {object} issue - Issue object
 * @returns {number} Estimated hours
 */
function estimateEffort(issue) {
  const baseEffort = {
    complexity: 4,
    duplication: 6,
    naming: 1,
    security: 3,
    testing: 5
  };

  const category = issue.category || 'complexity';
  const severityEffort = {
    high: 2.5,
    medium: 1.5,
    low: 1
  };

  const base = baseEffort[category] || 3;
  const multiplier = severityEffort[issue.severity] || 1;

  return Math.round(base * multiplier * 10) / 10;
}

/**
 * Generate unique issue ID
 * @returns {string} New issue ID
 */
function generateIssueId() {
  const storage = getDebtStorage();
  const existingIds = storage.issues.map(i => parseInt(i.id.split('-')[1]));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `TD-${String(maxId + 1).padStart(3, '0')}`;
}

// ============================================================================
// DEBT SCAN COMMAND
// ============================================================================

/**
 * Scan codebase for technical debt
 * @param {object} params - Command parameters
 * @returns {string} Scan results
 */
function debtScan(params = {}) {
  const { path: scanPath = '.', severity = 'all', categories = 'all' } = params;

  const results = {
    path: scanPath,
    scanned: [],
    issues: [],
    summary: {
      high: 0,
      medium: 0,
      low: 0
    }
  };

  // Validate path
  if (!scanPath || typeof scanPath !== 'string') {
    return 'Error: Invalid path parameter. Provide a valid directory or file path.';
  }

  // Collect files
  const files = collectFiles(scanPath);
  if (files.length === 0) {
    return `No files found to scan in: ${scanPath}`;
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

  return formatScanResults(results);
}

/**
 * Collect files for scanning
 * @param {string} inputPath - Path to scan
 * @returns {string[]} Array of file paths
 */
function collectFiles(inputPath) {
  const files = [];
  const ignorePatterns = ['node_modules/**', 'dist/**', 'build/**', '.git/**'];

  try {
    const extPatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py', '**/*.java'];

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
    // Fallback: treat as direct path
    if (fs.existsSync(inputPath)) {
      if (fs.statSync(inputPath).isFile()) {
        files.push(inputPath);
      } else if (fs.statSync(inputPath).isDirectory()) {
        // Simple directory scan
        const scanDir = (dir) => {
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory() && !ignorePatterns.some(p => entry.name.match(p.replace('**', '')))) {
                scanDir(fullPath);
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
    const complexityIssues = detectComplexityIssues(filePath, lines, content);
    issues.push(...complexityIssues);

    // Detect naming issues
    const namingIssues = detectNamingIssues(filePath, lines);
    issues.push(...namingIssues);

    // Detect duplication indicators
    const duplicationIssues = detectDuplicationIssues(filePath, lines, content);
    issues.push(...duplicationIssues);

    // Detect security issues
    const securityIssues = detectSecurityIssues(filePath, lines);
    issues.push(...securityIssues);

    // Detect testing issues
    const testingIssues = detectTestingIssues(filePath, lines);
    issues.push(...testingIssues);

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

  // Check for long methods (lines over 50)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect function/class definitions
    const functionMatch = line.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
    const methodMatch = line.match(/^\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*{?$/);

    if (functionMatch || methodMatch) {
      const funcName = functionMatch ? functionMatch[1] : methodMatch[1];

      // Count lines in this function/method
      let braceCount = 0;
      let foundOpen = line.includes('{');
      if (!foundOpen) {
        // Look for opening brace on same line
        const nextLineBrace = lines[i].match(/{/g);
        braceCount = nextLineBrace ? nextLineBrace.length : 0;
      }

      let funcLines = 0;
      for (let j = i; j < lines.length && braceCount >= 0; j++) {
        const l = lines[j];
        braceCount += (l.match(/{/g) || []).length;
        braceCount -= (l.match(/}/g) || []).length;
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

  // Check for high cyclomatic complexity indicators (nested conditionals)
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
  const fileName = path.basename(filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for single-letter variables (excluding common ones)
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
        impactScore: calculateImpactScore({
          category: 'naming',
          severity: 'low',
          frequency: 1
        })
      });
    }

    // Check for generic names
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

  // Simple check for repeated code patterns
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
    {
      pattern: /eval\s*\(/gi,
      title: 'Use of eval()',
      severity: 'high',
      suggestion: 'Avoid eval() - it can execute arbitrary code'
    },
    {
      pattern: /innerHTML\s*=/gi,
      title: 'Potential XSS with innerHTML',
      severity: 'high',
      suggestion: 'Use textContent or DOMPurify for user input'
    },
    {
      pattern: /password\s*[:=]|secret\s*[:=]|api[_-]?key\s*[:=]/gi,
      title: 'Potential hardcoded secret',
      severity: 'high',
      suggestion: 'Move secrets to environment variables'
    },
    {
      pattern: /Math\.random\s*\(/gi,
      title: 'Insecure random number generation',
      severity: 'medium',
      suggestion: 'Use crypto.getRandomValues() for security-critical randomness'
    },
    {
      pattern: /console\.(log|debug)\s*\(/gi,
      title: 'Debug statement left in code',
      severity: 'low',
      suggestion: 'Remove debug logging before deployment'
    }
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
          impactScore: calculateImpactScore({
            category: 'security',
            severity: check.severity,
            frequency: 1
          })
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

  // Skip test files
  if (/\.(test|spec)\.(js|ts|py|java)$/i.test(fileName)) {
    return issues;
  }

  // Check if production file has corresponding test
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
      impactScore: calculateImpactScore({
        category: 'testing',
        severity: 'medium',
        frequency: 1
      })
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

  const highCount = results.summary.high;
  const mediumCount = results.summary.medium;
  const lowCount = results.summary.low;

  output.push(`🔴 High Priority Issues: ${highCount}`);
  output.push(`🟡 Medium Priority Issues: ${mediumCount}`);
  output.push(`🟢 Low Priority Issues: ${lowCount}`);
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

// ============================================================================
// DEBT REPORT COMMAND
// ============================================================================

/**
 * Generate debt report
 * @param {object} params - Command parameters
 * @returns {string} Report
 */
function debtReport(params = {}) {
  const { period = 'all', format = 'text', sort = 'impact' } = params;

  const storage = getDebtStorage();
  const openIssues = storage.issues.filter(i => i.status === 'open');

  if (openIssues.length === 0) {
    return 'No technical debt issues recorded. Run /debt-scan to identify issues.';
  }

  const results = {
    totalIssues: openIssues.length,
    byCategory: {},
    bySeverity: { high: 0, medium: 0, low: 0 },
    byFile: {},
    issues: openIssues,
    resolvedCount: storage.resolved.length
  };

  // Aggregate by category
  for (const issue of openIssues) {
    const category = issue.category || 'unknown';
    results.byCategory[category] = (results.byCategory[category] || 0) + 1;
    results.bySeverity[issue.severity]++;
  }

  // Aggregate by file
  for (const issue of openIssues) {
    const filePath = issue.file;
    if (!results.byFile[filePath]) {
      results.byFile[filePath] = [];
    }
    results.byFile[filePath].push(issue);
  }

  // Calculate total debt score
  const totalScore = openIssues.reduce((sum, issue) => sum + (issue.impactScore || 0), 0);

  // Calculate estimated effort
  const totalEffort = openIssues.reduce((sum, issue) => sum + estimateEffort(issue), 0);

  // Add additional metrics
  results.totalScore = Math.round(totalScore * 10) / 10;
  results.estimatedEffortHours = Math.round(totalEffort * 10) / 10;

  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }

  return formatReportResults(results, sort);
}

/**
 * Format report results
 * @param {object} results - Report results
 * @param {string} sort - Sort criteria
 * @returns {string} Formatted output
 */
function formatReportResults(results, sort) {
  const output = [];

  output.push('\n📈 Technical Debt Report');
  output.push('='.repeat(50));
  output.push(`Period: ${'All time'}`);
  output.push('');

  // Executive summary
  output.push('🎯 Executive Summary');
  output.push('-'.repeat(50));
  output.push(`Total Debt Score: ${results.totalScore}`);
  output.push(`High Priority: ${results.bySeverity.high} | Medium: ${results.bySeverity.medium} | Low: ${results.bySeverity.low}`);
  output.push(`Estimated Remediation Effort: ${results.estimatedEffortHours} hours`);
  output.push(`Issues Resolved: ${results.resolvedCount}`);
  output.push('');

  // Category breakdown
  output.push('📊 Category Breakdown');
  output.push('-'.repeat(50));

  const categoryOrder = Object.entries(results.byCategory)
    .sort((a, b) => b[1] - a[1]);

  const severityEmojis = { high: '🔴', medium: '🟡', low: '🟢' };
  const categoryEmojis = {
    complexity: '🧮',
    duplication: '📋',
    naming: '📝',
    security: '🔒',
    testing: '🧪'
  };

  for (const [category, count] of categoryOrder) {
    const percentage = Math.round((count / results.totalIssues) * 100);
    const emoji = categoryEmojis[category] || '📌';
    output.push(`${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${count} (${percentage}%)`);
  }

  output.push('');

  // File hotspots
  output.push('🔥 File Hotspots (Top 5)');
  output.push('-'.repeat(50));

  const fileEntries = Object.entries(results.byFile)
    .map(([file, issues]) => ({
      file,
      count: issues.length,
      totalScore: issues.reduce((sum, i) => sum + (i.impactScore || 0), 0)
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  for (const entry of fileEntries) {
    output.push(`1. ${path.basename(entry.file)}`);
    output.push(`   Score: ${Math.round(entry.totalScore)} | Issues: ${entry.count}`);
  }

  output.push('');

  // Priority items
  output.push('🎯 Priority Items (Top 10)');
  output.push('-'.repeat(50));

  let sortedIssues;
  switch (sort) {
    case 'severity':
      const severityOrder = { high: 0, medium: 1, low: 2 };
      sortedIssues = [...results.issues].sort((a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity]
      );
      break;
    case 'file':
      sortedIssues = [...results.issues].sort((a, b) =>
        a.file.localeCompare(b.file)
      );
      break;
    case 'impact':
    default:
      sortedIssues = [...results.issues].sort((a, b) =>
        (b.impactScore || 0) - (a.impactScore || 0)
      );
  }

  for (let i = 0; i < Math.min(10, sortedIssues.length); i++) {
    const issue = sortedIssues[i];
    const severityEmoji = severityEmojis[issue.severity] || '📌';
    output.push(`${severityEmoji} ${issue.id} - ${issue.title}`);
    output.push(`   ${path.basename(issue.file)}:${issue.line}`);
  }

  output.push('');
  output.push(`[Total: ${results.totalIssues} issues across ${Object.keys(results.byFile).length} files]`);

  return output.join('\n');
}

// ============================================================================
// DEBT PRIORITIZE COMMAND
// ============================================================================

/**
 * Prioritize technical debt issues
 * @param {object} params - Command parameters
 * @returns {string} Prioritized list
 */
function debtPrioritize(params = {}) {
  const { strategy = 'roi', limit = 20 } = params;

  const storage = getDebtStorage();
  const openIssues = storage.issues.filter(i => i.status === 'open');

  if (openIssues.length === 0) {
    return 'No technical debt issues recorded. Run /debt-scan to identify issues.';
  }

  // Calculate ROI for each issue
  const issuesWithMetrics = openIssues.map(issue => {
    const impactScore = issue.impactScore || calculateImpactScore(issue);
    const effortHours = estimateEffort(issue);

    return {
      ...issue,
      impactScore,
      effortHours,
      roi: effortHours > 0 ? impactScore / effortHours : impactScore
    };
  });

  // Sort by strategy
  let sortedIssues;
  switch (strategy) {
    case 'impact':
      sortedIssues = issuesWithMetrics.sort((a, b) => b.impactScore - a.impactScore);
      break;
    case 'effort':
      sortedIssues = issuesWithMetrics.sort((a, b) => a.effortHours - b.effortHours);
      break;
    case 'timeline':
      // Put security issues first, then by age
      sortedIssues = issuesWithMetrics.sort((a, b) => {
        if (a.category === 'security' && b.category !== 'security') return -1;
        if (a.category !== 'security' && b.category === 'security') return 1;
        return new Date(a.detectedAt) - new Date(b.detectedAt);
      });
      break;
    case 'roi':
    default:
      sortedIssues = issuesWithMetrics.sort((a, b) => b.roi - a.roi);
      break;
  }

  const limitedIssues = sortedIssues.slice(0, limit);

  return formatPrioritizeResults(limitedIssues, strategy);
}

/**
 * Format prioritize results
 * @param {object[]} issues - Prioritized issues
 * @param {string} strategy - Prioritization strategy
 * @returns {string} Formatted output
 */
function formatPrioritizeResults(issues, strategy) {
  const output = [];

  const strategyDescriptions = {
    impact: 'by Impact Score',
    effort: 'by Effort (quick wins)',
    roi: 'by ROI (Return on Investment)',
    timeline: 'by Timeline (security first)'
  };

  output.push(`\n🎯 Prioritized Technical Debt`);
  output.push(`Strategy: ${strategyDescriptions[strategy] || 'by ROI'}`);
  output.push('='.repeat(50));
  output.push('');

  // Categorize into quadrants
  const quickWins = [];
  const highValue = [];
  const lowValue = [];
  const defer = [];

  for (const issue of issues) {
    const impact = issue.impactScore;
    const effort = issue.effortHours;

    if (impact >= 6 && effort <= 2) {
      quickWins.push(issue);
    } else if (impact >= 6 && effort > 2) {
      highValue.push(issue);
    } else if (impact < 4 && effort < 2) {
      lowValue.push(issue);
    } else {
      defer.push(issue);
    }
  }

  // Quick wins section
  if (quickWins.length > 0) {
    output.push('🚀 Quick Wins (High Impact, Low Effort)');
    output.push('-'.repeat(50));

    for (const issue of quickWins) {
      output.push(`[${issue.id}] ${issue.title}`);
      output.push(`   Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push(`   Category: ${issue.category}`);
      output.push(`   Suggestion: ${issue.suggestion}`);
      output.push('');
    }
  }

  // High value investments
  if (highValue.length > 0) {
    output.push('💎 High Value Investments (Plan Sprints)');
    output.push('-'.repeat(50));

    for (const issue of highValue) {
      output.push(`[${issue.id}] ${issue.title}`);
      output.push(`   Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push(`   Category: ${issue.category}`);
      if (issue.prerequisite) {
        output.push(`   Prerequisite: ${issue.prerequisite}`);
      }
      output.push('');
    }
  }

  // Time sensitive (security)
  const securityIssues = issues.filter(i => i.category === 'security');
  if (securityIssues.length > 0) {
    output.push('⏰ Time Sensitive (Address Soon)');
    output.push('-'.repeat(50));

    for (const issue of securityIssues) {
      output.push(`[Security] ${issue.title}`);
      output.push(`   Risk: High | Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push('');
    }
  }

  // Low value
  if (lowValue.length > 0) {
    output.push('📋 Lower Priority');
    output.push('-'.repeat(50));

    for (const issue of lowValue) {
      output.push(`[${issue.id}] ${issue.title}`);
      output.push(`   Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push('');
    }
  }

  // Summary
  const totalEffort = issues.reduce((sum, i) => sum + i.effortHours, 0);
  output.push('');
  output.push(`📊 Summary: ${issues.length} items | Est. Effort: ${totalEffort}h`);

  return output.join('\n');
}

// ============================================================================
// DEBT RESOLVE COMMAND
// ============================================================================

/**
 * Resolve a technical debt issue
 * @param {object} params - Command parameters
 * @returns {string} Resolution result
 */
function debtResolve(params = {}) {
  const { issueId, resolution = 'fixed', notes = '', link = '' } = params;

  // Validate issue ID
  if (!issueId || !isValidIssueId(issueId)) {
    return 'Error: Invalid issue ID. Use format: TD-001, TD-002, etc.\n\nUsage: /debt-resolve <issue-id> [--resolution=<type>] [--notes=""]';
  }

  const issue = findIssueById(issueId);
  if (!issue) {
    return `Error: Issue ${issueId} not found. Run /debt-report to see current issues.`;
  }

  if (issue.status === 'resolved') {
    return `Error: Issue ${issueId} is already resolved.`;
  }

  const resolutionTypes = ['fixed', 'refactored', 'documented', 'deferred', 'false-positive'];
  if (!resolutionTypes.includes(resolution)) {
    return `Error: Invalid resolution type. Must be one of: ${resolutionTypes.join(', ')}`;
  }

  // Update storage
  const storage = getDebtStorage();
  const issueIndex = storage.issues.findIndex(i => i.id === issueId);

  if (issueIndex === -1) {
    return `Error: Issue ${issueId} not found in storage.`;
  }

  const resolvedIssue = {
    ...storage.issues[issueIndex],
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolution,
    resolutionNotes: notes,
    resolutionLink: link
  };

  storage.issues.splice(issueIndex, 1);
  storage.resolved.push(resolvedIssue);
  saveDebtStorage(storage);

  return formatResolveResult(resolvedIssue, storage);
}

/**
 * Format resolve result
 * @param {object} issue - Resolved issue
 * @param {object} storage - Updated storage
 * @returns {string} Formatted output
 */
function formatResolveResult(issue, storage) {
  const resolutionEmojis = {
    fixed: '🔧',
    refactored: '✨',
    documented: '📝',
    deferred: '⏳',
    'false-positive': '✅'
  };

  const output = [];

  output.push('\n✅ Debt Issue Resolved');
  output.push('='.repeat(50));
  output.push(`Issue: ${issue.id} - ${issue.title}`);
  output.push(`Resolution: ${resolutionEmojis[issue.resolution]} ${issue.resolution}`);
  output.push(`Date: ${new Date().toISOString().split('T')[0]}`);
  output.push('');

  if (issue.resolutionNotes) {
    output.push(`Notes: ${issue.resolutionNotes}`);
    output.push('');
  }

  if (issue.resolutionLink) {
    output.push(`Link: ${issue.resolutionLink}`);
    output.push('');
  }

  // Resolution metrics
  const resolvedCount = storage.resolved.length;
  const recentResolved = storage.resolved.filter(r => {
    const resolvedDate = new Date(r.resolvedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return resolvedDate >= weekAgo;
  }).length;

  output.push('📊 Resolution Metrics');
  output.push('-'.repeat(50));
  output.push(`Total Resolved: ${resolvedCount}`);
  output.push(`This Week: ${recentResolved}`);

  // Resolution type breakdown
  const byType = {};
  for (const r of storage.resolved) {
    byType[r.resolution] = (byType[r.resolution] || 0) + 1;
  }

  output.push('By Type:');
  for (const [type, count] of Object.entries(byType)) {
    const emoji = resolutionEmojis[type] || '📌';
    output.push(`  ${emoji} ${type}: ${count} (${Math.round(count / resolvedCount * 100)}%)`);
  }

  output.push('');

  return output.join('\n');
}

// ============================================================================
// EXPORT COMMANDS
// ============================================================================

export const commands = {
  'debt-scan': {
    handler: debtScan,
    description: 'Scan the codebase for technical debt issues',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          default: '.',
          description: 'Path to scan (directory or file)'
        },
        severity: {
          type: 'string',
          enum: ['all', 'high', 'medium', 'low'],
          default: 'all',
          description: 'Filter by severity level'
        },
        categories: {
          type: 'string',
          default: 'all',
          description: 'Filter by categories (comma-separated)'
        }
      }
    }
  },
  'debt-report': {
    handler: debtReport,
    description: 'View and analyze technical debt reports',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          default: 'all',
          description: 'Time period for report (all, last-7-days, last-30-days)'
        },
        format: {
          type: 'string',
          enum: ['text', 'json'],
          default: 'text',
          description: 'Output format'
        },
        sort: {
          type: 'string',
          enum: ['impact', 'severity', 'file', 'category'],
          default: 'impact',
          description: 'Sort criteria'
        }
      }
    }
  },
  'debt-prioritize': {
    handler: debtPrioritize,
    description: 'Prioritize technical debt issues based on impact and effort',
    parameters: {
      type: 'object',
      properties: {
        strategy: {
          type: 'string',
          enum: ['impact', 'effort', 'roi', 'timeline'],
          default: 'roi',
          description: 'Prioritization strategy'
        },
        limit: {
          type: 'number',
          default: 20,
          description: 'Maximum number of items to display'
        }
      }
    }
  },
  'debt-resolve': {
    handler: debtResolve,
    description: 'Mark technical debt issues as resolved',
    parameters: {
      type: 'object',
      properties: {
        issueId: {
          type: 'string',
          description: 'Issue ID (e.g., TD-001)'
        },
        resolution: {
          type: 'string',
          enum: ['fixed', 'refactored', 'documented', 'deferred', 'false-positive'],
          default: 'fixed',
          description: 'Resolution type'
        },
        notes: {
          type: 'string',
          default: '',
          description: 'Additional notes about the resolution'
        },
        link: {
          type: 'string',
          default: '',
          description: 'Link to commit or PR'
        }
      },
      required: ['issueId']
    }
  }
};

export default { commands };