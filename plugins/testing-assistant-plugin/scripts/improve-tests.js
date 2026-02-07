/**
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Test Improver - Analyzes and improves existing test coverage
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * TestImprover - Analyzes and improves existing test coverage
 */
class TestImprover {
  /**
   * Creates a new TestImprover instance
   * @param {Object} options - Improvement options
   */
  constructor(options = {}) {
    this.options = {
      targetCoverage: options.targetCoverage || 80,
      addMissingTests: options.addMissingTests ?? true,
      refactorExisting: options.refactorExisting ?? true,
      suggestAssertions: options.suggestAssertions ?? true,
      verbose: options.verbose ?? false,
    };

    this._initializePatterns();
  }

  /**
   * Initializes analysis patterns for test improvement
   * @private
   */
  _initializePatterns() {
    this.patterns = {
      // Missing test patterns
      missing: {
        noTests: /describe\s*\(\s*['"]/g,
        noAssertions: /expect\s*\(/g,
        noEdgeCases: /(?:null|undefined|empty|zero|negative)\s*[=:]/gi,
        noErrorTests: /throw\s+(?:new\s+)?\w+Error/g,
        noAsyncTests: /(?:async\s+)?it\(/g,
      },
      // Quality issues
      quality: {
        magicValues: /expect\s*\([^)]*\b\d+\b[^)]*\)/g,
        longTests: /it\s*\([^,]+,\s*function\s*\(\)\s*\{[\s\S]{500,}\}/g,
        deepNesting: /\{\s*\{\s*\{/g,
        missingDescribe: /^(?!describe|context)\s*(?:it|test)\s*\(/gm,
      },
      // Coverage gaps
      coverage: {
        noBeforeEach: /beforeEach/g,
        noAfterEach: /afterEach/g,
        noBeforeAll: /beforeAll/g,
        noAfterAll: /afterAll/g,
        noSkippedTests: /xit\s*\(|xdescribe\s*\(/g,
        noOnlyTests: /it\.only\s*\(|describe\.only\s*\(/g,
      },
    };
  }

  /**
   * Improves existing test coverage
   * @param {string} testCode - The existing test code
   * @param {string} sourceCode - The source code being tested
   * @returns {Promise<Object>} Improvement results
   */
  async improve(testCode, sourceCode) {
    if (!testCode || typeof testCode !== 'string') {
      throw new Error('Invalid input: testCode must be a non-empty string');
    }

    if (!sourceCode || typeof sourceCode !== 'string') {
      throw new Error('Invalid input: sourceCode must be a non-empty string');
    }

    try {
      const results = {
        coverage: this._estimateCoverage(testCode, sourceCode),
        gaps: [],
        suggestions: [],
        improvements: [],
        refactored: testCode,
      };

      // Analyze coverage gaps
      results.gaps = this._findCoverageGaps(testCode, sourceCode);

      // Generate improvement suggestions
      results.suggestions = this._generateSuggestions(testCode, sourceCode, results.gaps);

      // Refactor if enabled
      if (this.options.refactorExisting) {
        results.refactored = this._refactorTests(testCode);
        results.improvements.push('Refactored test structure');
      }

      // Add missing tests if enabled
      if (this.options.addMissingTests) {
        const missingTests = this._generateMissingTests(sourceCode, results.gaps);
        if (missingTests.length > 0) {
          results.refactored = this._addMissingTests(results.refactored, missingTests);
          results.improvements.push(`Added ${missingTests.length} missing test cases`);
        }
      }

      if (this.options.verbose) {
        console.log(`[TestImprover] Coverage: ${results.coverage.overall}%`);
        console.log(`[TestImprover] Found ${results.gaps.length} coverage gaps`);
        console.log(`[TestImprover] Made ${results.improvements.length} improvements`);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to improve tests: ${error.message}`);
    }
  }

  /**
   * Estimates test coverage based on test code analysis
   * @param {string} testCode - The test code
   * @param {string} sourceCode - The source code
   * @returns {Object} Coverage estimates
   * @private
   */
  _estimateCoverage(testCode, sourceCode) {
    const sourceFunctions = this._extractFunctions(sourceCode);
    const testedFunctions = this._extractTestedFunctions(testCode);
    const sourceBranches = this._countBranches(sourceCode);
    const testedBranches = this._countTestedBranches(testCode);

    const testedSet = new Set(testedFunctions);
    const testedFunctionCount = sourceFunctions.filter(f => testedSet.has(f.name)).length;

    const functionCoverage = sourceFunctions.length > 0
      ? Math.round((testedFunctionCount / sourceFunctions.length) * 100)
      : 100;

    const branchCoverage = sourceBranches > 0
      ? Math.round((testedBranches / sourceBranches) * 100)
      : 100;

    const overall = Math.round((functionCoverage + branchCoverage) / 2);

    return {
      overall,
      functions: functionCoverage,
      branches: branchCoverage,
      testedFunctions: testedFunctionCount,
      totalFunctions: sourceFunctions.length,
      sourceFunctions,
      testedFunctions: testedFunctions,
    };
  }

  /**
   * Extracts function names from source code
   * @param {string} code - Source code
   * @returns {Array<{name: string, params: string[]}>} Function list
   * @private
   */
  _extractFunctions(code) {
    const functions = [];

    // Match regular functions
    const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        params: match[2].split(',').filter(p => p.trim()).map(p => p.trim()),
        type: 'function',
      });
    }

    // Match arrow functions assigned to variables
    const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;

    while ((match = arrowRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        params: match[2].split(',').filter(p => p.trim()).map(p => p.trim()),
        type: 'arrow',
      });
    }

    // Match class methods
    const classRegex = /class\s+(\w+)/g;

    while ((match = classRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        type: 'class',
      });
    }

    return functions;
  }

  /**
   * Extracts tested function names from test code
   * @param {string} testCode - Test code
   * @returns {string[]} Tested function names
   * @private
   */
  _extractTestedFunctions(testCode) {
    const tested = new Set();

    // Match describe blocks which usually indicate tested functions
    const describeRegex = /describe\s*\(\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = describeRegex.exec(testCode)) !== null) {
      const describeName = match[1];
      // Common patterns: 'ModuleName', 'functionName', 'ClassName'
      tested.add(describeName);
    }

    // Match it/test blocks which reference functions
    const testRegex = /(?:it|test)\s*\(\s*['"](?:should\s+)?(?:handle|call|invoke|test|check)\s+(\w+)/gi;

    while ((match = testRegex.exec(testCode)) !== null) {
      tested.add(match[1]);
    }

    return Array.from(tested);
  }

  /**
   * Counts branch-like structures in source code
   * @param {string} code - Source code
   * @returns {number} Branch count
   * @private
   */
  _countBranches(code) {
    let count = 0;

    // Count if statements
    count += (code.match(/if\s*\(/g) || []).length;

    // Count ternary operators
    count += (code.match(/\?[^:]+:/g) || []).length;

    // Count switch cases
    count += (code.match(/case\s+/g) || []).length;

    // Count try-catch
    count += (code.match(/catch\s*\(/g) || []).length;

    return count;
  }

  /**
   * Counts tested branches in test code
   * @param {string} testCode - Test code
   * @returns {number} Tested branch count
   * @private
   */
  _countTestedBranches(testCode) {
    let count = 0;

    // Count conditional expectations (testing branches)
    count += (testCode.match(/expect\s*\([^)]*(?:===|!==|<|>|<=|>=|toBeTruthy|toBeFalsy)/g) || []).length;

    // Count error expectations
    count += (testCode.match(/toThrow/g) || []).length;

    // Count eachOf/forEach test patterns
    count += (testCode.match(/forEach|each\s*\(/g) || []).length;

    return count;
  }

  /**
   * Finds coverage gaps in tests
   * @param {string} testCode - Test code
   * @param {string} sourceCode - Source code
   * @returns {Object[]} Coverage gaps
   * @private
   */
  _findCoverageGaps(testCode, sourceCode) {
    const gaps = [];
    const sourceFunctions = this._extractFunctions(sourceCode);
    const testedFunctions = this._extractTestedFunctions(testCode);

    // Find untested functions
    for (const func of sourceFunctions) {
      const isTested = testedFunctions.some(tf =>
        tf === func.name ||
        tf.toLowerCase() === func.name.toLowerCase()
      );

      if (!isTested && func.type !== 'class') {
        gaps.push({
          type: 'function',
          name: func.name,
          severity: 'high',
          description: `Function '${func.name}' is not tested`,
          recommendation: `Add tests for ${func.name}`,
        });
      }
    }

    // Find missing edge cases
    const hasNullTests = /null/.test(testCode);
    const hasUndefinedTests = /undefined/.test(testCode);
    const hasEmptyTests = /empty/.test(testCode);
    const hasZeroTests = /\bzero\b/.test(testCode.toLowerCase());
    const hasNegativeTests = /negative/.test(testCode.toLowerCase());

    if (!hasNullTests) {
      gaps.push({
        type: 'edge-case',
        name: 'null-handling',
        severity: 'medium',
        description: 'No null input tests found',
        recommendation: 'Add tests for null input handling',
      });
    }

    if (!hasUndefinedTests) {
      gaps.push({
        type: 'edge-case',
        name: 'undefined-handling',
        severity: 'medium',
        description: 'No undefined input tests found',
        recommendation: 'Add tests for undefined input handling',
      });
    }

    if (!hasEmptyTests) {
      gaps.push({
        type: 'edge-case',
        name: 'empty-handling',
        severity: 'medium',
        description: 'No empty value tests found',
        recommendation: 'Add tests for empty string/array/object',
      });
    }

    if (!hasZeroTests) {
      gaps.push({
        type: 'edge-case',
        name: 'zero-handling',
        severity: 'low',
        description: 'No zero value tests found',
        recommendation: 'Add tests for zero values',
      });
    }

    if (!hasNegativeTests) {
      gaps.push({
        type: 'edge-case',
        name: 'negative-handling',
        severity: 'low',
        description: 'No negative value tests found',
        recommendation: 'Add tests for negative values',
      });
    }

    // Find missing error tests
    const hasErrorTests = /toThrow/.test(testCode);

    if (!hasErrorTests) {
      gaps.push({
        type: 'error-handling',
        name: 'error-tests',
        severity: 'high',
        description: 'No error throwing tests found',
        recommendation: 'Add tests for error conditions',
      });
    }

    // Find missing async tests if source has async
    if (/async\s+function|\basync\b/.test(sourceCode) && !/async\s+it|it\s*\([^)]*\basync\b/.test(testCode)) {
      gaps.push({
        type: 'async',
        name: 'async-tests',
        severity: 'high',
        description: 'Source has async functions but no async tests',
        recommendation: 'Add async/await tests',
      });
    }

    return gaps;
  }

  /**
   * Generates improvement suggestions
   * @param {string} testCode - Test code
   * @param {string} sourceCode - Source code
   * @param {Object[]} gaps - Coverage gaps
   * @returns {Object[]} Suggestions
   * @private
   */
  _generateSuggestions(testCode, sourceCode, gaps) {
    const suggestions = [];

    // Coverage-based suggestions
    const coverage = this._estimateCoverage(testCode, sourceCode);

    if (coverage.overall < this.options.targetCoverage) {
      suggestions.push({
        category: 'coverage',
        priority: 'high',
        message: `Coverage is at ${coverage.overall}%, target is ${this.options.targetCoverage}%`,
        action: 'Add tests for untested functions and edge cases',
      });
    }

    // Gap-based suggestions
    const untestedFunctions = gaps.filter(g => g.type === 'function');
    if (untestedFunctions.length > 0) {
      suggestions.push({
        category: 'functions',
        priority: 'high',
        message: `${untestedFunctions.length} functions are not tested`,
        functions: untestedFunctions.map(g => g.name),
        action: 'Add test suites for untested functions',
      });
    }

    const edgeCaseGaps = gaps.filter(g => g.type === 'edge-case');
    if (edgeCaseGaps.length > 0) {
      suggestions.push({
        category: 'edge-cases',
        priority: 'medium',
        message: `${edgeCaseGaps.length} edge case categories are missing`,
        action: 'Add boundary and null/undefined tests',
      });
    }

    // Quality suggestions
    const magicValues = (testCode.match(this.patterns.quality.magicValues) || []).length;
    if (magicValues > 0) {
      suggestions.push({
        category: 'quality',
        priority: 'low',
        message: `${magicValues} magic values found in assertions`,
        action: 'Replace magic values with constants for clarity',
      });
    }

    return suggestions;
  }

  /**
   * Refactors test code for better quality
   * @param {string} testCode - Original test code
   * @returns {string} Refactored test code
   * @private
   */
  _refactorTests(testCode) {
    let refactored = testCode;

    // Add proper spacing
    refactored = refactored.replace(/describe\s*\(\s*['"]([^'"]+)['"]\s*,\s*function\s*\(\)\s*\{/g,
      "describe('$1', function () {");

    // Standardize it/test declarations
    refactored = refactored.replace(/\bit\s*\(\s*['"]([^'"]+)['"]\s*,\s*function\s*\(\)\s*\{/gi,
      "it('$1', () => {");

    // Improve test descriptions
    refactored = refactored.replace(/it\s*\(\s*['"](should\s+)work[s]?\s*['"]/gi,
      'it("$1behave correctly"');

    refactored = refactored.replace(/it\s*\(\s*['"](works|works\s+correctly)['"]/gi,
      'it("should work correctly"');

    return refactored;
  }

  /**
   * Generates missing test cases based on gaps
   * @param {string} sourceCode - Source code
   * @param {Object[]} gaps - Coverage gaps
   * @returns {string[]} Missing test cases
   * @private
   */
  _generateMissingTests(sourceCode, gaps) {
    const missingTests = [];
    const functions = this._extractFunctions(sourceCode);
    const testedFunctions = this._extractTestedFunctions('');
    const untestedFunctions = functions.filter(f =>
      !testedFunctions.some(tf => tf === f.name || tf.toLowerCase() === f.name.toLowerCase())
    );

    // Generate tests for untested functions
    for (const func of untestedFunctions) {
      const args = func.params.map(p => this._sampleValue(p)).join(', ');

      missingTests.push({
        describe: func.name,
        tests: [
          {
            name: `should handle valid input for ${func.name}`,
            call: `${func.name}(${args})`,
            expectation: 'expect(result).toBeDefined();',
          },
          {
            name: `should handle null input for ${func.name}`,
            call: `${func.name}(null)`,
            expectation: 'expect(() => result).not.toThrow();',
          },
        ],
      });
    }

    // Generate edge case tests if missing
    const edgeCaseGaps = gaps.filter(g => g.type === 'edge-case');

    if (edgeCaseGaps.length > 0) {
      const edgeSuite = {
        describe: 'Edge Cases',
        tests: [],
      };

      if (edgeCaseGaps.some(g => g.name === 'null-handling')) {
        edgeSuite.tests.push({
          name: 'should handle null input',
          call: null, // Will be filled per function
          expectation: 'expect(result).toBeDefined();',
        });
      }

      if (edgeCaseGaps.some(g => g.name === 'undefined-handling')) {
        edgeSuite.tests.push({
          name: 'should handle undefined input',
          call: undefined,
          expectation: 'expect(result).toBeDefined();',
        });
      }

      if (edgeCaseGaps.some(g => g.name === 'empty-handling')) {
        edgeSuite.tests.push({
          name: 'should handle empty string',
          call: '',
          expectation: 'expect(result).toBeDefined();',
        });
      }

      if (edgeSuite.tests.length > 0) {
        missingTests.push(edgeSuite);
      }
    }

    return missingTests;
  }

  /**
   * Adds missing tests to existing test code
   * @param {string} testCode - Original test code
   * @param {Object[]} missingTests - Tests to add
   * @returns {string} Updated test code
   * @private
   */
  _addMissingTests(testCode, missingTests) {
    let updated = testCode;

    for (const suite of missingTests) {
      const testCases = suite.tests.map(t =>
        `  it('${t.name}', () => {\n    ${t.expectation}\n  });`
      ).join('\n\n');

      const suiteBlock = `\ndescribe('${suite.describe}', () => {\n${testCases}\n});`;
      updated += suiteBlock;
    }

    return updated;
  }

  /**
   * Generates a sample value for a parameter
   * @param {string} paramName - Parameter name
   * @returns {string} Sample value
   * @private
   */
  _sampleValue(paramName) {
    const lowerName = paramName.toLowerCase();

    if (lowerName.includes('name') || lowerName.includes('user') || lowerName.includes('string')) {
      return "'test-value'";
    }
    if (lowerName.includes('id')) {
      return "'123'";
    }
    if (lowerName.includes('count') || lowerName.includes('num') || lowerName.includes('index')) {
      return '1';
    }
    if (lowerName.includes('list') || lowerName.includes('array') || lowerName.includes('items')) {
      return '[]';
    }
    if (lowerName.includes('obj') || lowerName.includes('data') || lowerName.includes('config')) {
      return '{}';
    }
    if (lowerName.includes('bool') || lowerName.includes('is') || lowerName.includes('has')) {
      return 'true';
    }

    return 'null';
  }

  /**
   * Improves test file and optionally writes to disk
   * @param {string} testFilePath - Path to test file
   * @param {string} sourceFilePath - Path to source file
   * @param {Object} options - Improvement options
   * @returns {Promise<Object>} Improvement results
   */
  async improveFile(testFilePath, sourceFilePath, options = {}) {
    if (!testFilePath || typeof testFilePath !== 'string') {
      throw new Error('Invalid input: testFilePath must be a non-empty string');
    }

    if (!sourceFilePath || typeof sourceFilePath !== 'string') {
      throw new Error('Invalid input: sourceFilePath must be a non-empty string');
    }

    const testAbsolutePath = path.resolve(testFilePath);
    const sourceAbsolutePath = path.resolve(sourceFilePath);

    if (!fs.existsSync(testAbsolutePath)) {
      throw new Error(`Test file not found: ${testFilePath}`);
    }

    if (!fs.existsSync(sourceAbsolutePath)) {
      throw new Error(`Source file not found: ${sourceFilePath}`);
    }

    const testCode = fs.readFileSync(testAbsolutePath, 'utf-8');
    const sourceCode = fs.readFileSync(sourceAbsolutePath, 'utf-8');

    const results = await this.improve(testCode, sourceCode);

    results.testFile = testFilePath;
    results.sourceFile = sourceFilePath;

    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, results.refactored, 'utf-8');
      results.outputFile = options.output;
      results.written = true;
    }

    return results;
  }
}

module.exports = { TestImprover };

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);

  let testFile = null;
  let sourceFile = null;
  const options = {
    targetCoverage: 80,
    output: null,
    verbose: args.includes('--verbose'),
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--target' && i + 1 < args.length) {
      options.targetCoverage = parseInt(args[++i], 10);
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[++i];
    } else if (!arg.startsWith('--') && !testFile) {
      testFile = args[i];
    } else if (!arg.startsWith('--') && testFile && !sourceFile) {
      sourceFile = args[i];
    }
  }

  if (!testFile || !sourceFile) {
    console.error('Usage: node improve-tests.js <test-file> <source-file> [options]');
    console.error('Options:');
    console.error('  --target <num>  Target coverage percentage');
    console.error('  --output <file> Output file path');
    console.error('  --verbose       Verbose output');
    process.exit(1);
  }

  const improver = new TestImprover(options);

  improver.improveFile(testFile, sourceFile, options)
    .then(result => {
      console.log(`Coverage Analysis for ${result.testFile}:`);
      console.log(`================================`);
      console.log(`Overall Coverage: ${result.coverage.overall}%`);
      console.log(`Functions: ${result.coverage.functions}%`);
      console.log(`Branches: ${result.coverage.branches}%`);
      console.log();
      console.log(`Improvement Suggestions:`);
      console.log(`========================`);

      for (const suggestion of result.suggestions) {
        console.log(`[${suggestion.priority.toUpperCase()}] ${suggestion.message}`);
        if (suggestion.functions) {
          console.log(`  Functions: ${suggestion.functions.join(', ')}`);
        }
        console.log(`  Action: ${suggestion.action}`);
        console.log();
      }

      if (result.improvements.length > 0) {
        console.log('Improvements Made:');
        for (const improvement of result.improvements) {
          console.log(`  - ${improvement}`);
        }
      }

      if (options.output) {
        console.log(`\nImproved tests written to: ${result.outputFile}`);
      }
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}