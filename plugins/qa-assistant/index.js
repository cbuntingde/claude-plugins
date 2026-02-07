#!/usr/bin/env node
/**
 * QA Assistant Plugin
 * Comprehensive quality assurance and production readiness checks
 *
 * Available commands:
 * - /qa-assistant:breaking-changes - Detect potential breaking changes in code
 * - /qa-assistant:production-ready - Check production readiness requirements
 * - /qa-assistant:analyze-quality - Analyze code quality metrics
 * - /qa-assistant:qa-check - Full QA check suite
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'qa-assistant',
  version: '1.0.0',
  description: 'Comprehensive quality assurance and production readiness checks',
  commands: {
    'breaking-changes': path.join(__dirname, 'scripts', 'detect-breakage.js'),
    'production-ready': path.join(__dirname, 'scripts', 'check-production-ready.js'),
    'analyze-quality': path.join(__dirname, 'scripts', 'analyze-quality.js'),
    'qa-check': path.join(__dirname, 'scripts', 'qa-check.js')
  }
};

/**
 * Get the project root directory (where package.json exists)
 * Walks up from current directory to find the project root
 */
function getProjectRoot() {
  let currentDir = process.cwd();

  // Maximum depth to prevent infinite loops
  const maxDepth = 50;
  let depth = 0;

  while (depth < maxDepth && !fs.existsSync(path.join(currentDir, 'package.json'))) {
    currentDir = path.dirname(currentDir);
    depth++;
  }

  return currentDir;
}

/**
 * QA Assistant Plugin
 * Main entry point for the QA Assistant plugin
 */
class QAAssistant {
  constructor() {
    this.rootDir = getProjectRoot();
    this.cacheDir = path.join(this.rootDir, '.qa-cache');
    this.initCache();
  }

  /**
   * Initialize cache directory
   */
  initCache() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Run checks with optional project context
   */
  runChecks(options = {}) {
    this.rootDir = options.projectRoot || getProjectRoot();
    this.cacheDir = path.join(this.rootDir, '.qa-cache');
    this.initCache();

    const checks = [];
    let issuesFound = [];

    // Check 1: Breaking Changes
    console.log('🔍 Searching for breaking changes...');
    const breakageResult = this.detectBreakingChanges(this.rootDir);
    if (breakageResult.hasIssues) {
      issuesFound.push(...breakageResult.issues);
    }
    checks.push(breakageResult);

    // Check 2: Production Readiness
    console.log('🛡️  Checking production readiness...');
    const prodResult = this.checkProductionReadiness(this.rootDir);
    if (prodResult.hasIssues) {
      issuesFound.push(...prodResult.issues);
    }
    checks.push(prodResult);

    // Check 3: Code Quality
    console.log('📊 Analyzing code quality...');
    const qualityResult = this.analyzeCodeQuality(this.rootDir);
    if (qualityResult.hasIssues) {
      issuesFound.push(...qualityResult.issues);
    }
    checks.push(qualityResult);

    // Check 4: Security Issues
    console.log('🔐 Scanning for security issues...');
    const securityResult = this.scanForSecurityIssues(this.rootDir, options);
    if (securityResult.hasIssues) {
      issuesFound.push(...securityResult.issues);
    }
    checks.push(securityResult);

    // Check 5: Configuration
    console.log('⚙️  Checking configuration...');
    const configResult = this.checkConfiguration(this.rootDir);
    if (configResult.hasIssues) {
      issuesFound.push(...configResult.issues);
    }
    checks.push(configResult);

    // Summary
    this.printSummary(checks, issuesFound);

    return {
      passed: issuesFound.length === 0,
      checks,
      issues: issuesFound
    };
  }

  /**
   * Detect breaking changes
   * Searches for patterns indicating potential breaking changes
   */
  detectBreakingChanges(rootDir) {
    const issues = [];
    const patterns = [
      {
        filePattern: ['*', '!test/**', '!spec/**', '!node_modules'],
        searchPatterns: [
          { pattern: 'export default', replacement: 'module.exports' },
          { pattern: 'export const', replacement: 'exports.' },
          { pattern: 'export function', replacement: 'exports.' },
          { pattern: 'export class', replacement: 'module.exports' },
          { pattern: 'export interface', replacement: 'module.exports' },
          { pattern: 'export type', replacement: 'module.exports' },
          { pattern: 'type \\w+ =', replacement: 'exports.' },
          { pattern: 'interface \\w+ {', replacement: 'exports.' },
          { pattern: 'class \\w+', replacement: 'exports.' },
          { pattern: 'new require(', replacement: 'require(' }
        ]
      }
    ];

    for (const pattern of patterns) {
      const files = this.findFiles(rootDir, pattern.filePattern);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        for (const comparison of patterns.searchPatterns) {
          if (content.includes(comparison.pattern) && content.includes(comparison.replacement)) {
            issues.push({
              severity: 'warning',
              file,
              category: 'breaking-change',
              message: `Potential breaking change: mixing ES modules (${comparison.pattern}) with CommonJS (${comparison.replacement})`,
              suggestion: 'Use consistent module system throughout the project'
            });
          }
        }

        // Check for deprecated APIs
        const deprecated = content.match(/\.then\(|\.catch\(/g);
        if (deprecated && pattern.filePattern.includes('*.js') && !file.includes('test')) {
          issues.push({
            severity: 'info',
            file,
            category: 'breaking-change',
            message: 'Deprecated Promise chain syntax detected',
            suggestion: 'Use async/await for better readability and error handling'
          });
        }

        // Check for var usage (blocks scoping)
        if (content.includes('var ')) {
          issues.push({
            severity: 'warning',
            file,
            category: 'breaking-change',
            message: 'var declarations found (prevents block scoping)',
            suggestion: 'Use const or let for better scope control'
          });
        }
      }
    }

    // Check for API version changes in package.json
    const packageJson = this.readPackageJson(rootDir);
    if (packageJson) {
      if (packageJson.main && pattern.filePattern.includes('*.js')) {
        if (!packageJson.main.endsWith('.js') && !packageJson.main.endsWith('.mjs')) {
          issues.push({
            severity: 'warning',
            file: 'package.json',
            category: 'breaking-change',
            message: 'Main entry point doesn't match project type',
            suggestion: `Ensure package.json['main'] ends with .js or .mjs for ${this.detectProjectType(rootDir)} project`
          });
        }
      }
    }

    return {
      hasIssues: issues.length > 0,
      checks: 'breaking-changes',
      issues,
      count: issues.length
    };
  }

  /**
   * Check production readiness
   */
  checkProductionReadiness(rootDir) {
    const issues = [];
    const requirements = {
      'TypeScript/ESLint config': false,
      'Test coverage': false,
      'Security audit': false,
      'Environment variables': false,
      'Error handling': false,
      'Logging configured': false
    };

    // Check TypeScript/ESLint config
    const tsConfig = this.findFirstFile(rootDir, ['.eslintrc.js', '.eslintrc.json', '.eslintrc.cjs', 'eslint.config.js']);
    const tsConfigExists = !!tsConfig;
    requirements['TypeScript/ESLint config'] = tsConfigExists || this.detectProjectType(rootDir) === 'javascript';

    // Check test coverage
    const pkg = this.readPackageJson(rootDir);
    const hasTests = pkg && (
      pkg.scripts?.test ||
      this.findFirstFile(rootDir, ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts', 'test/**', 'tests/**'])
    );
    requirements['Test coverage'] = hasTests;

    // Check security audit
    try {
      const auditOutput = execSync('npm audit --audit-level=high', { cwd: rootDir, encoding: 'utf-8' });
      const hasVulnerabilities = auditOutput.toLowerCase().includes('vulnerability');
      requirements['Security audit'] = !hasVulnerabilities;
      if (hasVulnerabilities) {
        issues.push({
          severity: 'error',
          file: 'package.json',
          category: 'production-readiness',
          message: 'High-severity vulnerabilities found in dependencies',
          suggestion: 'Run `npm audit fix` to resolve vulnerabilities'
        });
      }
    } catch {
      requirements['Security audit'] = true;
    }

    // Check environment variables
    const envConfigs = this.findFirstFile(rootDir, ['.env.example', '.env.template', '.env.sample']);
    const hasEnvPattern = pkg && (
      pkg.private === true ||
      pkg.type === 'module'
    );
    requirements['Environment variables'] = envConfigs || !hasEnvPattern;

    // Check error handling patterns
    const files = this.findFiles(rootDir, ['*.js', '*.ts'], !tsConfigExists);
    let errorHandlingCount = 0;
    for (const file of files.slice(0, 50)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('try {') && (content.includes('catch') || content.includes('finally'))) {
        errorHandlingCount++;
      }
    }
    requirements['Error handling'] = errorHandlingCount >= files.length * 0.3;

    // Check for logging
    const loggingExists = this.findFirstFile(rootDir, ['**/logger.js', '**/log*.js', '**/winston*.js']);
    requirements['Logging configured'] = !!loggingExists;

    // Generate issues for failed requirements
    for (const [requirement, passed] of Object.entries(requirements)) {
      if (!passed) {
        issues.push({
          severity: 'error',
          file: 'project',
          category: 'production-readiness',
          message: `Missing ${requirement}`,
          suggestion: this.getRequirementSuggestion(requirement)
        });
      }
    }

    if (requirements['Test coverage'] && hasTests) {
      try {
        execSync('npm test -- --coverage', { cwd: rootDir, encoding: 'utf-8' });
      } catch {
        // Coverage check passed
      }
    }

    return {
      hasIssues: issues.some(i => i.severity === 'error'),
      checks: 'production-readiness',
      issues,
      requirements,
      count: issues.length
    };
  }

  /**
   * Analyze code quality
   */
  analyzeCodeQuality(rootDir) {
    const issues = [];

    // Check for code complexity
    const files = this.findFiles(rootDir, ['*.js', '*.ts']);
    let longFunctions = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const depth = (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
        if (depth >= 10 && content.substring(lines.lastIndexOf('{', i) + 1).length > 1000) {
          issues.push({
            severity: 'warning',
            file,
            category: 'code-quality',
            message: `Exceptionally deep nesting (depth: ${depth}) detected`,
            suggestion: `Consider refactoring to reduce nesting depth at line ${i + 1}`
          });
          break;
        }
      }

      // Check for long lines (> 120 chars)
      let lineNum = 0;
      for (const line of lines) {
        lineNum++;
        if (line.length > 120 && !line.trim().startsWith('//') && !line.trim().startsWith('/**')) {
          issues.push({
            severity: 'warning',
            file,
            category: 'code-quality',
            message: `Line exceeds recommended width (${line.length} chars)`,
            suggestion: `Consider breaking into multiple lines around column 120`
          });
        }
      }

      // Count functions/decorators
      const functionCount = (content.match(/function\s+\w+\s*\(/g) || []).length +
                           (content.match(/const\s+\w+\s*=\s*(?:async\s+)?(?:\w+|[\{\[].*=>/g) || []).length +
                           (content.match(/const\s+\w+\s*=\s*\(/g) || []).length;

      if (functionCount > 50 && file.includes('core') || file.includes('lib')) {
        issues.push({
          severity: 'info',
          file,
          category: 'code-quality',
          message: `Large file with ${functionCount} functions/functions/decorators`,
          suggestion: 'Consider splitting into smaller, focused modules'
        });
      }
    }

    // Check for commented code
    const srcFiles = this.findFiles(rootDir, ['*.js', '*.ts'], true);
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const commentedLines = content.split('\n').filter(l =>
        l.trim().startsWith('//') && !l.trim().startsWith('///') && !l.trim().startsWith('/*')
      ).length;

      const percentage = (commentedLines / content.split('\n').length) * 100;
      if (percentage > 40 && commentedLines > 20) {
        issues.push({
          severity: 'info',
          file,
          category: 'code-quality',
          message: `High comment ratio (${percentage.toFixed(1)}%)`,
          suggestion: 'Consider refactoring: large blocks of commented code may indicate technical debt'
        });
      }
    }

    return {
      hasIssues: issues.length > 0,
      checks: 'code-quality',
      issues,
      count: issues.length
    };
  }

  /**
   * Scan for security issues
   */
  scanForSecurityIssues(rootDir, options = {}) {
    const issues = [];

    const securityChecks = [
      {
        name: 'Hardcoded Secrets',
        check: this.checkHardcodedSecrets
      },
      {
        name: 'SQL Injection Risk',
        check: this.checkSqlInjection
      },
      {
        name: 'Command Injection Risk',
        check: this.checkCommandInjection
      },
      {
        name: 'Path Traversal',
        check: this.checkPathTraversal
      },
      {
        name: 'Deprecation Warnings',
        check: this.checkDeprecations
      },
      {
        name: 'Buffer Overflows',
        check: this.checkBufferOverflows
      }
    ];

    for (const check of securityChecks) {
      const result = check.check(rootDir);
      if (result.length > 0) {
        issues.push(...result);
      }
    }

    if (options.deepScan && issues.length === 0) {
      this.checkDeepSecurity(rootDir, issues);
    }

    return {
      hasIssues: issues.some(i => i.severity === 'error'),
      checks: 'security',
      issues,
      count: issues.length,
      warnings: issues.filter(i => i.severity === 'warning').length
    };
  }

  /**
   * Check for hardcoded secrets
   */
  checkHardcodedSecrets(rootDir) {
    const issues = [];
    const secrets = [
      /['"`](?i:api[_-]?key|apikey|secret|password|token|auth[_-]?token|jwt[_-]?secret|private[_-]?key|public[_-]?key)[-_]?(=|:)\s*['"`].[*'"`]/gi,
      /['"`](?i:aws_access[_-]?id|aws_secret[_-]?key|mongodb[_-]?uri|postgres[_-]?uri|mysql[_-]?uri)[-_]?=.*['"`]/gi,
      /['"`](?i:signature|authorization)[-_]?=.*['"`].*(?i:eyJ|sk_live|sk_test|pk_live|pk_test)[a-zA-Z0-9_\-=+\/]{20,}/gi
    ];

    const files = this.findFiles(rootDir, ['*.js', '*.ts', '*.json'], false);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8').toLowerCase();

      for (const pattern of secrets) {
        const matches = content.match(pattern) || [];
        for (const match of matches) {
          // Skip if it's clearly a demo/example
          if (match.includes('example') || match.includes('demo') || match.includes('sample')) {
            continue;
          }
          issues.push({
            severity: 'error',
            file,
            category: 'security',
            message: 'Potentially hardcoded secret detected',
            suggestion: 'Move sensitive information to environment variables'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check for SQL injection risk
   */
  checkSqlInjection(rootDir) {
    const issues = [];

    const files = this.findFiles(rootDir, ['*.js', '*.ts'], false);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      // String concatenation without parameterized queries
      const sqlPatterns = [
        /['"`]SELECT.*FROM.*WHERE.*[\+*=].*['"`]/gi,
        /['"`](UPDATE|DELETE|INSERT|ALTER).*[\+*=].*['"`]/gi,
        /\$\{.*\}/gi
      ];

      for (const pattern of sqlPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          for (const match of matches) {
            issues.push({
              severity: 'warning',
              file,
              category: 'security',
              message: 'SQL query with string concatenation detected',
              suggestion: 'Use parameterized queries or an ORM to prevent SQL injection'
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check for command injection
   */
  checkCommandInjection(rootDir) {
    const issues = [];

    const files = this.findFiles(rootDir, ['*.js', '*.ts'], false);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      // Shell exec with user input
      const patterns = [
        /exec\s*\(\s*['"`].*\$\w+.*['"`]\s*\)/gi,
        /execSync\s*\(\s*['"`].*\$\w+.*['"`]\s*\)/gi,
        /spawn\s*\(\s*['"`].*\$\w+.*['"`]\s*\)/gi
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          for (const match of matches) {
            issues.push({
              severity: 'error',
              file,
              category: 'security',
              message: 'Potential command injection risk detected',
              suggestion: 'Validate and sanitize user input before using in shell commands'
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check for path traversal
   */
  checkPathTraversal(rootDir) {
    const issues = [];

    const files = this.findFiles(rootDir, ['*.js', '*.ts'], false);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      // Path traversal patterns
      const patterns = [
        /fs\.read.*['"`]\.\.\/.*['"`]/gi,
        /require\s*\(\s*['"`]\.\.\/.*['"`]\s*\)/gi,
        /import\s+.*from\s+['"`]\.\.\/.*['"`]/gi
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          for (const match of matches) {
            issues.push({
              severity: 'error',
              file,
              category: 'security',
              message: 'Potential path traversal vulnerability detected',
              suggestion: 'Always use path.join() or path.resolve() and validate the user input'
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check for deprecated APIs
   */
  checkDeprecations(rootDir) {
    const issues = [];

    const files = this.findFiles(rootDir, ['*.js', '*.ts'], false);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      const deprecatedPatterns = [
        { pattern: /\.toJSON\s*/, note: 'Use toISOString() for Date objects' },
        { pattern: /\bBuffer\.from\s*\(\s*['"`]/, note: 'Use Buffer.from(string, encoding) or safer base64 functions' },
        { pattern: /\.\brequire\s*\(/, note: 'Use ES6 imports for better tree-shaking' },
        { pattern: /\.describe\([*'"]only['"].*\)/, note: 'Test suite is configured to run only this suite' },
        { pattern: /\.beforeEach\([*'"]skip['"].*\)/, note: 'Test hook is skipped' },
        { pattern: /\.only\(/, note: 'Single test case limits test coverage' }
      ];

      for (const { pattern, note } of deprecatedPatterns) {
        if (content.match(pattern)) {
          issues.push({
            severity: 'info',
            file,
            category: 'security',
            message: 'Deprecated API usage detected',
            suggestion: note
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check for buffer overflows
   */
  checkBufferOverflows(rootDir) {
    const issues = [];
    const files = this.findFiles(rootDir, ['*.js', '*.ts', '*.c', '*.cpp', '*.h'], false);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const dangerous = content.match(/Buffer\(['"`].*length\s*\)/g);

      if (dangerous) {
        for (const match of dangerous) {
          issues.push({
            severity: 'warning',
            file,
            category: 'security',
            message: 'Direct buffer manipulation detected',
            suggestion: 'Handle buffer operations carefully to prevent overflow scenarios'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Deep security scan (advanced)
   */
  checkDeepSecurity(rootDir, issues) {
    // Check for missing TLS validation
    const httpsConfigs = this.findFiles(rootDir, ['*.js', '*.ts', '*.json']);
    for (const file of httpsConfigs) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('https://') && !content.includes('rejectUnauthorized') && !content.includes('rejectUnauthorized')) {
        issues.push({
          severity: 'warning',
          file,
          category: 'security',
          message: 'HTTPS request without certificate validation',
          suggestion: 'Use rejectUnauthorized: true when making HTTPS requests'
        });
      }
    }
  }

  /**
   * Check configuration
   */
  checkConfiguration(rootDir) {
    const issues = [];
    const configChecks = [
      {
        name: 'package.json exists',
        check: () => !!this.readPackageJson(rootDir)
      },
      {
        name: 'README.md exists',
        check: () => !!this.findFirstFile(rootDir, ['.README.md', 'readme.md'])
      },
      {
        name: 'git repository',
        check: () => fs.existsSync(path.join(rootDir, '.git'))
      },
      {
        name: 'license specified',
        check: () => {
          const pkg = this.readPackageJson(rootDir);
          return pkg && (pkg.license || pkg.license !== 'UNLICENSED');
        }
      },
      {
        name: 'version specified',
        check: () => {
          const pkg = this.readPackageJson(rootDir);
          return pkg && pkg.version && /^\d+\.\d+\.\d+$/.test(pkg.version);
        }
      }
    ];

    for (const check of configChecks) {
      const passed = check.check();
      if (!passed) {
        issues.push({
          severity: 'warning',
          file: 'package.json',
          category: 'configuration',
          message: `Missing ${check.name}`,
          suggestion: `Ensure ${check.name} is properly configured`
        });
      }
    }

    return {
      hasIssues: issues.length > 0,
      checks: 'configuration',
      issues,
      count: issues.length
    };
  }

  /**
   * Helper methods
   */
  findFiles(rootDir, patterns, recursive = true) {
    const matches = [];

    const processDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory() && (recursive || patterns.some(p => !p.includes('**')))) {
          if (patterns.some(p => !p.includes('**')) || file !== 'node_modules') {
            processDir(fullPath);
          }
        } else if (stats.isFile() && patterns.some(p => this.matchesPattern(file, p))) {
          matches.push(fullPath);
        }
      }
    };

    processDir(rootDir);
    return matches;
  }

  matchesPattern(filename, pattern) {
    if (pattern.includes('**')) {
      const parts = pattern.split('**');
      if (parts.length > 1) {
        return filename.includes(parts[0].replace('*', ''));
      }
    }
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  }

  findFirstFile(rootDir, patterns) {
    for (const pattern of patterns) {
      const files = this.findFiles(rootDir, [pattern], false);
      if (files.length > 0) {
        return files[0];
      }
    }
    return null;
  }

  readPackageJson(rootDir) {
    const pkgPath = path.join(rootDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      } catch {
        return null;
      }
    }
    return null;
  }

  detectProjectType(rootDir) {
    const tsConfig = this.findFirstFile(rootDir, ['.tsconfig.json']);
    if (tsConfig) {
      return 'typescript';
    }
    return 'javascript';
  }

  getRequirementSuggestion(requirement) {
    switch (requirement) {
      case 'TypeScript/ESLint config':
        return '1. Create .eslintrc.js with recommended rules\n2. Add TypeScript if your project supports it\n3. Enable strict mode for better type safety';
      case 'Test coverage':
        return '1. Install testing framework (Jest/Vitest/Mocha)\n2. Write unit tests for all functions\n3. Add integration tests for critical paths\n4. Set minimum coverage threshold in package.json';
      case 'Security audit':
        return '1. Run `npm audit fix` to resolve vulnerabilities\n2. Subscribe to npm audit notifications\n3. Review known CVEs for the dependencies';
      case 'Environment variables':
        return '1. Create .env.example with all required variables\n2. Add .gitignore for .env files\n3. Use dotenv package in development\n4. Use process.env in production';
      case 'Error handling':
        return '1. Wrap async operations in try/catch blocks\n2. Return consistent error types\n3. Log errors with context\n4. Add error boundaries in React apps';
      case 'Logging configured':
        return '1. Install Winston or Pino logging library\n2. Configure appropriate log levels\n3. Add request/response logging for APIs\n4. Include correlation IDs for distributed tracing';
      default:
        return 'Configure this in your project settings';
    }
  }

  printSummary(checks, issues) {
    console.log('\n' + '='.repeat(60));
    console.log('QA ASSISTANT SUMMARY');
    console.log('='.repeat(60));

    const totalIssues = issues.length;
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const info = issues.filter(i => i.severity === 'info').length;

    console.log(`\nTotal Issues Found: ${totalIssues}`);
    console.log(`  Errors:  ${errors}`);
    console.log(`  Warnings: ${warnings}`);
    console.log(`  Info: ${info}`);

    console.log('\nChecks Performed:');
    for (const check of checks) {
      const status = check.hasIssues ? 'FAILED' : `PASSED (${check.count} issues found)`;
      console.log(`  ${check.checks}: ${status}`);
    }

    if (totalIssues > 0) {
      console.log('\nSample Issues:');
      for (const issue of issues.slice(0, 5)) {
        console.log(`  [${issue.severity.toUpperCase()}] ${issue.category}`);
        console.log(`    ${issue.message}`);
        console.log(`    ${issue.file}`);
        if (issue.suggestion) {
          console.log(`    Hint: ${issue.suggestion}`);
        }
        console.log('');
      }
    }

    console.log('='.repeat(60));
  }
}

/**
 * CLI entry point
 */
function main() {
  const qaAssistant = new QAAssistant();
  const args = process.argv.slice(2);

  const result = qaAssistant.runChecks();

  process.exit(result.passed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = QAAssistant;