#!/usr/bin/env node
/**
 * Architecture Review Script
 * Analyzes codebase architecture and provides review findings
 *
 * SECURITY: This module validates all file paths to prevent path traversal attacks.
 * All external inputs are sanitized before processing.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error class for plugin errors
 */
class ArchitectureAdvisorError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'ArchitectureAdvisorError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, ArchitectureAdvisorError);
  }
}

/**
 * Validation error for invalid inputs
 */
class ValidationError extends ArchitectureAdvisorError {
  constructor(message, details) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Configuration error for missing/invalid config
 */
class ConfigurationError extends ArchitectureAdvisorError {
  constructor(message, details) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

/**
 * File system error for I/O failures
 */
class FileSystemError extends ArchitectureAdvisorError {
  constructor(message, details) {
    super(message, 'FILESYSTEM_ERROR', details);
    this.name = 'FileSystemError';
  }
}

// ============================================================================
// Structured Logger
// ============================================================================

/**
 * Structured logger with consistent output format
 */
const Logger = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',

  /**
   * Log an entry with structured format
   */
  log(level, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'architecture-advisor',
      message,
      ...metadata,
    };
    console.log(JSON.stringify(entry));
  },

  debug(message, metadata) {
    this.log(this.DEBUG, message, metadata);
  },

  info(message, metadata) {
    this.log(this.INFO, message, metadata);
  },

  warn(message, metadata) {
    this.log(this.WARN, message, metadata);
  },

  error(message, metadata) {
    this.log(this.ERROR, message, metadata);
  },
};

// ============================================================================
// Configuration
// ============================================================================

/**
 * Load and validate configuration
 */
function loadConfiguration(configPath) {
  const defaultConfig = {
    maxFileSize: 1024 * 1024, // 1MB
    allowedExtensions: ['.ts', '.js', '.py', '.java', '.go', '.rs'],
    excludedPatterns: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
    antiPatternRules: {
      maxClassLines: 300,
      maxMethodLines: 50,
      maxDepth: 4,
      maxInheritanceDepth: 3,
    },
  };

  if (!configPath) {
    return defaultConfig;
  }

  try {
    const stats = fs.statSync(configPath);
    if (!stats.isFile()) {
      throw new ConfigurationError(`Configuration path is not a file: ${configPath}`);
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const userConfig = JSON.parse(content);

    // Merge with defaults
    return {
      ...defaultConfig,
      ...userConfig,
      // Deep merge excluded patterns
      excludedPatterns: [
        ...defaultConfig.excludedPatterns,
        ...(userConfig.excludedPatterns || []),
      ],
      // Deep merge anti-pattern rules
      antiPatternRules: {
        ...defaultConfig.antiPatternRules,
        ...(userConfig.antiPatternRules || {}),
      },
    };
  } catch (error) {
    if (error instanceof ArchitectureAdvisorError) {
      throw error;
    }
    if (error.code === 'ENOENT') {
      return defaultConfig;
    }
    throw new ConfigurationError(`Failed to load config: ${error.message}`, {
      configPath,
      originalError: error.message,
    });
  }
}

// ============================================================================
// Path Security
// ============================================================================

/**
 * Validate and sanitize a file path to prevent path traversal attacks
 * @param {string} inputPath - The user-provided path
 * @param {string} baseDir - The base directory for containment check
 * @returns {string} - The validated and resolved path
 * @throws {ValidationError} - If path is invalid or attempts traversal
 */
function validatePath(inputPath, baseDir) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new ValidationError('Path must be a non-empty string', { inputPath });
  }

  // Reject null bytes (common bypass technique)
  if (inputPath.includes('\0')) {
    throw new ValidationError('Path contains null bytes', { inputPath });
  }

  // Reject URLs or protocol prefixes
  if (/^[a-z]+:\/\//i.test(inputPath)) {
    throw new ValidationError('URL paths are not allowed', { inputPath });
  }

  // Reject Windows device paths
  if (/^[A-Z]:/i.test(inputPath) || /^\\\\\.\\/.test(inputPath)) {
    throw new ValidationError('Device paths are not allowed', { inputPath });
  }

  // Resolve the path
  let resolved;
  try {
    resolved = path.resolve(baseDir, inputPath);
  } catch (error) {
    throw new ValidationError(`Invalid path: ${error.message}`, { inputPath });
  }

  // Ensure the resolved path is within the base directory
  const normalizedBase = path.resolve(baseDir);
  if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
    throw new ValidationError('Path traversal attempt detected', {
      inputPath,
      resolved,
      baseDir,
    });
  }

  return resolved;
}

/**
 * Check if a file should be excluded based on patterns
 * @param {string} filePath - The file path to check
 * @param {string[]} patterns - Array of glob patterns to match against
 * @returns {boolean} - True if the file should be excluded
 */
function isExcluded(filePath, patterns) {
  const relativePath = path.basename(filePath);

  for (const pattern of patterns) {
    // Simple pattern matching (supports **/*.ext and *.ext formats)
    const regexPattern = pattern
      .replace(/\*\*/g, '__DOUBLE_STAR__')
      .replace(/\*/g, '[^/]*')
      .replace(/__DOUBLE_STAR__/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    if (regex.test(filePath) || regex.test(relativePath)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Architecture Reviewer
// ============================================================================

/**
 * Architecture Reviewer
 * Analyzes codebases for architectural issues and design patterns
 */
class ArchitectureReviewer {
  /**
   * Create an ArchitectureReviewer instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = loadConfiguration(options.configPath);

    this.antiPatterns = [
      {
        name: 'God Object',
        regex: /class\s+\w+\s*{[^}]{500,}/,
        severity: 'critical',
        description: 'Class with excessive responsibilities',
      },
      {
        name: 'Magic Numbers',
        regex: /\b\d{3,}\b(?![.\d])/,
        severity: 'minor',
        description: 'Hardcoded numeric literals without explanation',
      },
      {
        name: 'Long Method',
        regex: /function\s+\w+\s*\([^)]*\)\s*{[^}]{200,}/,
        severity: 'major',
        description: 'Method exceeds recommended line count',
      },
      {
        name: 'Deep Nesting',
        regex: /{(?:[^{}]*{[^{}]*}){5,}/,
        severity: 'major',
        description: 'Excessive conditional nesting detected',
      },
      {
        name: 'Feature Envy',
        regex: /this\.\w+\.\w+\([^)]*\)(?![^{]*this)/,
        severity: 'minor',
        description: 'Method uses more data from other class than its own',
      },
    ];

    this.designPatterns = {
      creational: ['Singleton', 'Factory', 'Builder', 'Prototype', 'Abstract Factory'],
      structural: ['Adapter', 'Decorator', 'Facade', 'Proxy', 'Composite', 'Bridge'],
      behavioral: ['Strategy', 'Observer', 'Command', 'State', 'Template Method', 'Mediator', 'Chain of Responsibility'],
    };

    Logger.info('ArchitectureReviewer initialized', { config: this.config });
  }

  /**
   * Perform architecture review on a target path
   * @param {string} targetPath - Path to review (file or directory)
   * @param {Object} options - Review options
   * @returns {Promise<Object>} - Analysis results
   */
  async review(targetPath, options = {}) {
    const requestId = generateRequestId();
    Logger.info('Starting architecture review', { requestId, targetPath, options });

    const startTime = Date.now();

    try {
      // Validate and sanitize path
      const safePath = validatePath(targetPath, process.cwd());

      const focus = options.focus || 'all';
      const depth = options.depth || 'standard';

      const files = await this.findFiles(safePath);
      const analysis = {
        requestId,
        timestamp: new Date().toISOString(),
        files: files.length,
        lines: 0,
        patterns: [],
        antiPatterns: [],
        solidScore: null,
        findings: [],
        recommendations: [],
        duration: 0,
      };

      for (const file of files) {
        const content = await fs.promises.readFile(file, 'utf-8');
        analysis.lines += content.split('\n').length;

        if (focus === 'all' || focus === 'anti-patterns') {
          const antiFindings = this.detectAntiPatterns(content, file);
          analysis.antiPatterns.push(...antiFindings);
        }

        if (focus === 'all' || focus === 'patterns') {
          const patterns = this.detectPatterns(content);
          analysis.patterns.push(...patterns);
        }
      }

      if (focus === 'all' || focus === 'solid') {
        analysis.solidScore = this.calculateSolidScore(files);
      }

      // Generate findings and recommendations
      this.generateReport(analysis, depth);

      analysis.duration = Date.now() - startTime;
      Logger.info('Architecture review completed', {
        requestId,
        duration: analysis.duration,
        filesAnalyzed: analysis.files,
        issuesFound: analysis.antiPatterns.length,
      });

      return analysis;
    } catch (error) {
      Logger.error('Architecture review failed', { requestId, error: error.message });
      throw error;
    }
  }

  /**
   * Find files to analyze within the target path
   * @param {string} dir - Directory to search
   * @returns {Promise<string[]>} - Array of file paths
   */
  async findFiles(dir) {
    const files = [];
    const patterns = this.config.allowedExtensions.map((ext) => `**/*${ext}`);

    try {
      const stat = await fs.promises.stat(dir);
      if (stat.isDirectory()) {
        // Dynamically require glob (lazy loading for performance)
        const { glob } = require('glob');

        for (const pattern of patterns) {
          const matches = glob.sync(pattern, {
            cwd: dir,
            ignore: this.config.excludedPatterns,
            absolute: true,
          });
          files.push(...matches);
        }
      } else {
        // Check file extension and size
        const ext = path.extname(dir);
        if (this.config.allowedExtensions.includes(ext)) {
          const fileStat = await fs.promises.stat(dir);
          if (fileStat.size <= this.config.maxFileSize) {
            files.push(dir);
          } else {
            Logger.warn('File exceeds max size, skipping', { file: dir, size: fileStat.size });
          }
        } else {
          Logger.warn('File extension not allowed, skipping', { file: dir, extension: ext });
        }
      }
    } catch (error) {
      throw new FileSystemError(`Failed to access path: ${error.message}`, {
        path: dir,
        originalError: error.code,
      });
    }

    return files;
  }

  /**
   * Detect anti-patterns in code content
   * @param {string} content - File content to analyze
   * @param {string} filePath - Path to the file
   * @returns {Object[]} - Array of anti-pattern findings
   */
  detectAntiPatterns(content, filePath) {
    const findings = [];

    for (const pattern of this.antiPatterns) {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

      while ((match = regex.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        findings.push({
          type: pattern.name,
          severity: pattern.severity,
          description: pattern.description,
          file: filePath,
          line: lineNum,
          message: `Detected ${pattern.name} in ${path.basename(filePath)}`,
        });
      }
    }

    return findings;
  }

  /**
   * Detect design patterns in code content
   * @param {string} content - File content to analyze
   * @returns {Object[]} - Array of detected patterns
   */
  detectPatterns(content) {
    const patterns = [];

    // Check for common pattern signatures
    const patternSignatures = {
      Singleton: /(?:static\s+)?instance\s*=|getInstance\s*\(\)/,
      Factory: /class\s+\w+Factory|create\w+\s*\(/,
      Builder: /\.(?:build|set\w+\()/,
      Strategy: /interface\s+\w+Strategy|setStrategy\s*\(/,
      Observer: /addObserver|notifyObservers|onNext\s*\(/,
      Command: /execute\s*\(|undo\s*\(/,
      Decorator: /extends\s+\w+Decorator|wraps\s*\(/,
      Adapter: /adapt\w+|target\w+/i,
    };

    for (const [pattern, regex] of Object.entries(patternSignatures)) {
      if (regex.test(content)) {
        const category = Object.keys(this.designPatterns).find((cat) =>
          this.designPatterns[cat].includes(pattern)
        );
        patterns.push({
          pattern,
          category,
          present: true,
          description: this.getPatternDescription(pattern),
        });
      }
    }

    return patterns;
  }

  /**
   * Get description for a design pattern
   * @param {string} patternName - Name of the pattern
   * @returns {string} - Pattern description
   */
  getPatternDescription(patternName) {
    const descriptions = {
      Singleton: 'Ensures only one instance exists with global access point',
      Factory: 'Creates objects without specifying exact class',
      Builder: 'Separates object construction from representation',
      Strategy: 'Defines family of interchangeable algorithms',
      Observer: 'Notifies dependent objects of state changes',
      Command: 'Encapsulates request as an object',
      Decorator: 'Adds behavior dynamically to objects',
      Adapter: 'Makes incompatible interfaces work together',
    };
    return descriptions[patternName] || 'Design pattern detected';
  }

  /**
   * Calculate SOLID principles score
   * @param {string[]} files - Array of file paths to analyze
   * @returns {number} - SOLID score (0-100)
   */
  calculateSolidScore(files) {
    let score = 100;
    const violations = [];

    // Simplified SOLID checks based on config
    const { maxClassLines, maxInheritanceDepth } = this.config.antiPatternRules;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');

        // Check for large classes (SRP violation)
        const classMatch = content.match(/class\s+\w+/g);
        if (classMatch && classMatch.length > 10) {
          score -= 5;
          violations.push('Single Responsibility Principle: Excessive classes detected');
        }

        // Check for inheritance depth (LSP violation)
        const extendsMatch = content.match(/extends/g);
        if (extendsMatch && extendsMatch.length > maxInheritanceDepth) {
          score -= 3;
          violations.push('Liskov Substitution Principle: Deep inheritance hierarchy');
        }
      } catch (error) {
        Logger.warn('Failed to analyze file for SOLID score', { file, error: error.message });
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate review report
   * @param {Object} analysis - Analysis results
   * @param {string} depth - Report depth (standard/detailed)
   */
  generateReport(analysis, depth) {
    console.log('\n' + '='.repeat(60));
    console.log('ARCHITECTURE REVIEW REPORT');
    console.log(`Request ID: ${analysis.requestId}`);
    console.log('='.repeat(60));

    console.log(`\nFiles Analyzed: ${analysis.files}`);
    console.log(`Lines of Code: ${analysis.lines}`);
    console.log(`Duration: ${analysis.duration}ms`);

    // Anti-patterns summary
    const bySeverity = { critical: 0, major: 0, minor: 0 };
    for (const ap of analysis.antiPatterns) {
      bySeverity[ap.severity]++;
    }

    console.log('\nAnti-Patterns Found:');
    console.log(`  Critical: ${bySeverity.critical}`);
    console.log(`  Major: ${bySeverity.major}`);
    console.log(`  Minor: ${bySeverity.minor}`);

    // Design patterns summary
    console.log('\nDesign Patterns Detected:');
    if (analysis.patterns.length === 0) {
      console.log('  None detected');
    } else {
      const patternCounts = {};
      for (const p of analysis.patterns) {
        patternCounts[p.pattern] = (patternCounts[p.pattern] || 0) + 1;
      }
      for (const [pattern, count] of Object.entries(patternCounts)) {
        console.log(`  ${pattern}: ${count} occurrence(s)`);
      }
    }

    // SOLID score
    if (analysis.solidScore !== null) {
      console.log(`\nSOLID Principles Score: ${analysis.solidScore}/100`);
    }

    if (depth === 'detailed' || depth === 'standard') {
      console.log('\nDetailed Findings:');
      const findingsToShow = analysis.antiPatterns.slice(
        0,
        depth === 'standard' ? 10 : 50
      );

      if (findingsToShow.length === 0) {
        console.log('  No significant issues detected');
      } else {
        for (const finding of findingsToShow) {
          const symbol = finding.severity === 'critical' ? '[CRITICAL]' :
                        finding.severity === 'major' ? '[MAJOR]' : '[MINOR]';
          console.log(`  ${symbol} ${finding.message}`);
          console.log(`      File: ${finding.file}:${finding.line}`);
        }
      }
    }

    // Recommendations
    console.log('\nRecommendations:');
    this.printRecommendations(analysis);

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Print recommendations based on analysis
   * @param {Object} analysis - Analysis results
   */
  printRecommendations(analysis) {
    const recs = [];

    const criticalCount = analysis.antiPatterns.filter((a) => a.severity === 'critical').length;
    if (criticalCount > 0) {
      recs.push(`Address ${criticalCount} critical anti-patterns before proceeding`);
    }

    if (analysis.solidScore && analysis.solidScore < 70) {
      recs.push('Consider refactoring to improve SOLID principles compliance');
    }

    if (analysis.patterns.filter((p) => p.pattern === 'Singleton').length > 3) {
      recs.push('Review Singleton usage - consider dependency injection instead');
    }

    if (recs.length === 0) {
      console.log('  - Architecture looks good! Continue with current patterns.');
    } else {
      for (const rec of recs) {
        console.log(`  - ${rec}`);
      }
    }
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a unique request ID for tracing
 * @returns {string} - UUID v4 format request ID
 */
function generateRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// CLI
// ============================================================================

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const reviewer = new ArchitectureReviewer();

  let targetPath = '.';
  let options = { focus: 'all', depth: 'standard', configPath: null };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--focus' || arg === '-f') {
      const value = args[++i];
      if (!['all', 'anti-patterns', 'patterns', 'solid'].includes(value)) {
        console.error(`Error: Invalid focus value: ${value}`);
        console.error('Valid options: all, anti-patterns, patterns, solid');
        process.exit(1);
      }
      options.focus = value;
    } else if (arg === '--depth' || arg === '-d') {
      const value = args[++i];
      if (!['standard', 'detailed'].includes(value)) {
        console.error(`Error: Invalid depth value: ${value}`);
        console.error('Valid options: standard, detailed');
        process.exit(1);
      }
      options.depth = value;
    } else if (arg === '--config' || arg === '-c') {
      options.configPath = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Architecture Advisor - Code Architecture Analysis Tool

Usage: node architecture-review.js [path] [options]

Arguments:
  path              Target directory or file to analyze (default: current directory)

Options:
  -f, --focus <type>    Analysis focus (default: all)
                        all - Full analysis
                        anti-patterns - Anti-pattern detection only
                        patterns - Design pattern detection only
                        solid - SOLID principles score only

  -d, --depth <level>   Report detail level (default: standard)
                        standard - Summary + top 10 findings
                        detailed - Full findings list

  -c, --config <path>   Path to configuration file (JSON format)

  -h, --help            Show this help message

Examples:
  node architecture-review.js ./src
  node architecture-review.js ./lib --focus solid --depth detailed
  node architecture-review.js --config config.json

Configuration File Format:
{
  "maxFileSize": 1048576,
  "allowedExtensions": [".ts", ".js", ".py"],
  "excludedPatterns": ["**/node_modules/**", "**/.git/**"],
  "antiPatternRules": {
    "maxClassLines": 300,
    "maxMethodLines": 50,
    "maxDepth": 4,
    "maxInheritanceDepth": 3
  }
}
`);
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      targetPath = arg;
    }
  }

  try {
    await reviewer.review(targetPath, options);
  } catch (error) {
    Logger.error('Review failed', { error: error.message, code: error.code });

    if (error instanceof ValidationError) {
      console.error(`\nValidation Error: ${error.message}`);
      console.error('Please check your input and try again.');
    } else if (error instanceof ConfigurationError) {
      console.error(`\nConfiguration Error: ${error.message}`);
      console.error('Please check your configuration file.');
    } else if (error instanceof FileSystemError) {
      console.error(`\nFile System Error: ${error.message}`);
      console.error('Please check that the path exists and is accessible.');
    } else {
      console.error(`\nError: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { ArchitectureReviewer, ArchitectureAdvisorError, ValidationError, ConfigurationError, FileSystemError, Logger };