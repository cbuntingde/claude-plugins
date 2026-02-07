/**
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Edge Case Finder - Identifies potential edge cases in code
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * EdgeCaseFinder - Analyzes code to identify potential edge cases
 */
class EdgeCaseFinder {
  /**
   * Creates a new EdgeCaseFinder instance
   * @param {Object} options - Analysis options
   */
  constructor(options = {}) {
    this.options = {
      includeBoundary: options.includeBoundary ?? true,
      includeNull: options.includeNull ?? true,
      includeUndefined: options.includeUndefined ?? true,
      includeTypeMismatch: options.includeTypeMismatch ?? true,
      includeConcurrency: options.includeConcurrency ?? false,
      verbose: options.verbose ?? false,
    };

    // Initialize edge case patterns
    this._initializePatterns();
  }

  /**
   * Initializes edge case detection patterns
   * @private
   */
  _initializePatterns() {
    this.patterns = {
      // Boundary value patterns
      boundary: [
        {
          name: 'Array Index Boundary',
          regex: /\[\s*(?:0|length\s*[-+]?\s*\d+|\w+\.length)\s*\]/g,
          severity: 'medium',
          description: 'Array index access at boundary',
        },
        {
          name: 'String Length Check',
          regex: /\.length\s*(?:===|!==|==|!=|>=|<=|<|>)\s*(?:0|1|\d+)/g,
          severity: 'low',
          description: 'String length boundary check',
        },
        {
          name: 'Numeric Boundary',
          regex: /(?:Number\.MIN_SAFE_INTEGER|Number\.MAX_SAFE_INTEGER|Number\.MIN_VALUE|Number\.MAX_VALUE|Infinity|-Infinity)/g,
          severity: 'high',
          description: 'Numeric boundary value usage',
        },
      ],
      // Null/undefined patterns
      nullUndefined: [
        {
          name: 'Null Check',
          regex: /(?:===|!==)\s*null/g,
          severity: 'medium',
          description: 'Explicit null comparison',
        },
        {
          name: 'Undefined Check',
          regex: /(?:===|!==)\s*undefined/g,
          severity: 'medium',
          description: 'Explicit undefined comparison',
        },
        {
          name: 'Optional Parameter',
          regex: /\?\s*:/g,
          severity: 'low',
          description: 'Ternary with potential undefined',
        },
        {
          name: 'Destructuring with Default',
          regex: /\{\s*\w+\s*=\s*(?:undefined|null)\s*[,}]/g,
          severity: 'medium',
          description: 'Destructuring with default values',
        },
      ],
      // Type mismatch patterns
      typeMismatch: [
        {
          name: 'Loose Equality',
          regex: /==[^=]/g,
          severity: 'high',
          description: 'Loose equality operator (type coercion)',
        },
        {
          name: 'Type Conversion',
          regex: /(?:parseInt|parseFloat|Number|String|Boolean)\s*\(/g,
          severity: 'medium',
          description: 'Type conversion function',
        },
        {
          name: 'Array.isArray Check',
          regex: /Array\.isArray\s*\(/g,
          severity: 'low',
          description: 'Array type checking',
        },
        {
          name: 'Instanceof Check',
          regex: /\binstanceof\b/g,
          severity: 'low',
          description: 'Type checking with instanceof',
        },
      ],
      // Error handling patterns
      errorHandling: [
        {
          name: 'Try-Catch Block',
          regex: /try\s*\{[\s\S]*?\}\s*catch\s*\(/g,
          severity: 'info',
          description: 'Error handling block present',
        },
        {
          name: 'Throw Statement',
          regex: /throw\s+(?:new\s+)?\w+Error/g,
          severity: 'info',
          description: 'Error throwing statement',
        },
        {
          name: 'Promise Rejection',
          regex: /\.catch\s*\(/g,
          severity: 'medium',
          description: 'Promise rejection handling',
        },
      ],
      // Concurrency patterns
      concurrency: [
        {
          name: 'Async/Await',
          regex: /\basync\s+/g,
          severity: 'info',
          description: 'Async function detected',
        },
        {
          name: 'Promise Usage',
          regex: /(?:new\s+Promise|Promise\.(?:all|race|allSettled))\s*\(/g,
          severity: 'info',
          description: 'Promise usage detected',
        },
        {
          name: 'SetTimeout/SetInterval',
          regex: /(?:setTimeout|setInterval)\s*\(/g,
          severity: 'medium',
          description: 'Async timing function',
        },
        {
          name: 'Event Listener',
          regex: /\.addEventListener\s*\(/g,
          severity: 'medium',
          description: 'Event listener registration',
        },
      ],
    };
  }

  /**
   * Analyzes code for edge cases
   * @param {string} code - The code to analyze
   * @returns {Object} Analysis results
   */
  async analyze(code) {
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid input: code must be a non-empty string');
    }

    const results = {
      edgeCases: [],
      summary: {
        total: 0,
        bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        byCategory: {},
      },
      recommendations: [],
    };

    try {
      // Analyze each category based on options
      if (this.options.includeBoundary) {
        this._analyzeCategory(code, 'boundary', results);
      }
      if (this.options.includeNull) {
        this._analyzeCategory(code, 'nullUndefined', results);
      }
      if (this.options.includeUndefined) {
        this._analyzeCategory(code, 'nullUndefined', results);
      }
      if (this.options.includeTypeMismatch) {
        this._analyzeCategory(code, 'typeMismatch', results);
      }
      if (this.options.includeConcurrency) {
        this._analyzeCategory(code, 'concurrency', results);
      }

      // Always analyze error handling
      this._analyzeCategory(code, 'errorHandling', results);

      // Generate recommendations
      this._generateRecommendations(results);

      // Sort edge cases by severity
      results.edgeCases.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      if (this.options.verbose) {
        console.log(`[EdgeCaseFinder] Found ${results.edgeCases.length} edge cases`);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to analyze code: ${error.message}`);
    }
  }

  /**
   * Analyzes code for a specific category
   * @param {string} code - The code to analyze
   * @param {string} category - Category name
   * @param {Object} results - Results object to populate
   * @private
   */
  _analyzeCategory(code, category, results) {
    const patterns = this.patterns[category] || [];

    patterns.forEach((pattern) => {
      const matches = code.matchAll(pattern.regex);
      
      for (const match of matches) {
        const lineNumber = this._getLineNumber(code, match.index);
        
        const edgeCase = {
          name: pattern.name,
          description: pattern.description,
          severity: pattern.severity,
          category: category,
          line: lineNumber,
          match: match[0].substring(0, 50),
        };

        results.edgeCases.push(edgeCase);
        results.summary.total++;
        results.summary.bySeverity[pattern.severity]++;
        
        if (!results.summary.byCategory[category]) {
          results.summary.byCategory[category] = 0;
        }
        results.summary.byCategory[category]++;
      }
    });
  }

  /**
   * Gets the line number for a given index
   * @param {string} code - The code
   * @param {number} index - Character index
   * @returns {number} Line number (1-based)
   * @private
   */
  _getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Generates recommendations based on findings
   * @param {Object} results - Analysis results
   * @private
   */
  _generateRecommendations(results) {
    const { edgeCases } = results;

    // High severity recommendations
    const looseEqualityCases = edgeCases.filter(e => e.name === 'Loose Equality');
    if (looseEqualityCases.length > 0) {
      results.recommendations.push({
        priority: 'high',
        category: 'Type Safety',
        suggestion: 'Replace loose equality (==) with strict equality (===) to avoid type coercion',
        count: looseEqualityCases.length,
      });
    }

    // Null/undefined recommendations
    const nullChecks = edgeCases.filter(e => e.name === 'Null Check' || e.name === 'Undefined Check');
    if (nullChecks.length > 0) {
      results.recommendations.push({
        priority: 'medium',
        category: 'Null Handling',
        suggestion: 'Consider using optional chaining (?.) and nullish coalescing (??) for cleaner null/undefined handling',
        count: nullChecks.length,
      });
    }

    // Boundary recommendations
    const boundaryCases = edgeCases.filter(e => e.name === 'Numeric Boundary');
    if (boundaryCases.length > 0) {
      results.recommendations.push({
        priority: 'medium',
        category: 'Boundary Values',
        suggestion: 'Add tests for numeric boundary values (MIN_SAFE_INTEGER, MAX_SAFE_INTEGER, etc.)',
        count: boundaryCases.length,
      });
    }

    // Error handling recommendations
    const errorHandlingCases = edgeCases.filter(e => e.category === 'errorHandling');
    if (errorHandlingCases.length === 0) {
      results.recommendations.push({
        priority: 'high',
        category: 'Error Handling',
        suggestion: 'No error handling detected. Add try-catch blocks and proper error propagation',
        count: 0,
      });
    }

    // Concurrency recommendations
    if (this.options.includeConcurrency) {
      const asyncCases = edgeCases.filter(e => e.name === 'Async/Await' || e.name === 'Promise Usage');
      if (asyncCases.length > 0) {
        results.recommendations.push({
          priority: 'medium',
          category: 'Concurrency',
          suggestion: 'Add tests for race conditions, timeouts, and error propagation in async code',
          count: asyncCases.length,
        });
      }
    }
  }

  /**
   * Analyzes files from disk
   * @param {string[]} filePaths - Array of file paths
   * @returns {Promise<Object>} Combined analysis results
   */
  async analyzeFiles(filePaths) {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      throw new Error('Invalid input: filePaths must be a non-empty array');
    }

    const results = {
      files: [],
      edgeCases: [],
      summary: {
        total: 0,
        bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        byCategory: {},
      },
      recommendations: [],
    };

    for (const filePath of filePaths) {
      try {
        const absolutePath = path.resolve(filePath);
        
        if (!fs.existsSync(absolutePath)) {
          throw new Error(`File not found: ${filePath}`);
        }

        const code = fs.readFileSync(absolutePath, 'utf-8');
        const fileResults = await this.analyze(code);

        results.files.push({
          path: filePath,
          edgeCases: fileResults.edgeCases.length,
        });

        // Merge edge cases with file info
        fileResults.edgeCases.forEach(ec => {
          ec.file = filePath;
          results.edgeCases.push(ec);
        });

        // Merge summary
        results.summary.total += fileResults.summary.total;
        Object.keys(fileResults.summary.bySeverity).forEach(severity => {
          results.summary.bySeverity[severity] += fileResults.summary.bySeverity[severity];
        });
        Object.keys(fileResults.summary.byCategory).forEach(category => {
          if (!results.summary.byCategory[category]) {
            results.summary.byCategory[category] = 0;
          }
          results.summary.byCategory[category] += fileResults.summary.byCategory[category];
        });

        // Merge recommendations
        results.recommendations.push(...fileResults.recommendations);
      } catch (error) {
        console.error(`Error analyzing file ${filePath}: ${error.message}`);
      }
    }

    return results;
  }
}

module.exports = { EdgeCaseFinder };

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePaths = args.filter(arg => !arg.startsWith('--'));
  
  const options = {
    includeBoundary: !args.includes('--no-boundary'),
    includeNull: !args.includes('--no-null'),
    includeUndefined: !args.includes('--no-undefined'),
    includeTypeMismatch: !args.includes('--no-type-mismatch'),
    includeConcurrency: args.includes('--concurrency'),
    verbose: args.includes('--verbose'),
  };

  const finder = new EdgeCaseFinder(options);

  finder.analyzeFiles(filePaths)
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}