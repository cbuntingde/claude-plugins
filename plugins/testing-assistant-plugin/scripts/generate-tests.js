/**
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Test Generator - Generates comprehensive test cases from code
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * TestGenerator - Generates comprehensive test cases for code
 */
class TestGenerator {
  /**
   * Creates a new TestGenerator instance
   * @param {Object} options - Generation options
   */
  constructor(options = {}) {
    this.options = {
      framework: options.framework || 'jest',
      coverageTarget: options.coverageTarget || 80,
      includeHappyPath: options.includeHappyPath ?? true,
      includeEdgeCases: options.includeEdgeCases ?? true,
      includeErrorCases: options.includeErrorCases ?? true,
      generateComments: options.generateComments ?? true,
      verbose: options.verbose ?? false,
    };

    this._initializeTemplates();
  }

  /**
   * Initializes test templates for different frameworks
   * @private
   */
  _initializeTemplates() {
    this.templates = {
      jest: {
        describe: (name, body) => `describe('${name}', () => {\n${body}\n});`,
        test: (name, body) => `  it('${name}', () => {\n${body}\n  });`,
        beforeEach: (body) => `  beforeEach(() => {\n${body}\n  });`,
        afterEach: (body) => `  afterEach(() => {\n${body}\n  });`,
        expect: (actual, matcher, expected) => `    expect(${actual}).${matcher}(${expected});`,
        expectThrow: () => `    expect(() => ${1}).toThrow();`,
        expectThrowType: (errorType) => `    expect(() => ${1}).toThrow(${errorType});`,
        comment: (text) => `    // ${text}`,
      },
      mocha: {
        describe: (name, body) => `describe('${name}', function() {\n${body}\n});`,
        test: (name, body) => `  it('${name}', function() {\n${body}\n  });`,
        beforeEach: (body) => `  beforeEach(function() {\n${body}\n  });`,
        afterEach: (body) => `  afterEach(function() {\n${body}\n  });`,
        expect: (actual, matcher, expected) => `    assert.${matcher}(${actual}, ${expected});`,
        expectThrow: () => `    assert.throws(() => ${1});`,
        expectThrowType: (errorType) => `    assert.throws(() => ${1}, ${errorType});`,
        comment: (text) => `    // ${text}`,
      },
      vitest: {
        describe: (name, body) => `describe('${name}', () => {\n${body}\n});`,
        test: (name, body) => `  it('${name}', () => {\n${body}\n  });`,
        beforeEach: (body) => `  beforeEach(() => {\n${body}\n  });`,
        afterEach: (body) => `  afterEach(() => {\n${body}\n  });`,
        expect: (actual, matcher, expected) => `    expect(${actual}).${matcher}(${expected});`,
        expectThrow: () => `    expect(() => ${1}).toThrow();`,
        expectThrowType: (errorType) => `    expect(() => ${1}).toThrow(${errorType});`,
        comment: (text) => `    // ${text}`,
      },
    };
  }

  /**
   * Gets the appropriate template set for the framework
   * @private
   * @returns {Object} Template functions
   */
  _getTemplates() {
    const templates = this.templates[this.options.framework];
    if (!templates) {
      throw new Error(`Unsupported test framework: ${this.options.framework}`);
    }
    return templates;
  }

  /**
   * Generates tests for the given code
   * @param {string} code - The code to generate tests for
   * @param {string} [moduleName] - Optional module name for test file
   * @returns {Promise<string>} Generated test code
   */
  async generate(code, moduleName = 'module') {
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid input: code must be a non-empty string');
    }

    try {
      // Analyze code structure
      const analysis = await this._analyzeCode(code);

      // Generate test sections
      const sections = [];

      if (this.options.generateComments) {
        sections.push(this._generateHeaderComment(code, moduleName));
      }

      if (this.options.includeHappyPath) {
        sections.push(await this._generateHappyPathTests(analysis, moduleName));
      }

      if (this.options.includeEdgeCases) {
        sections.push(await this._generateEdgeCaseTests(analysis, moduleName));
      }

      if (this.options.includeErrorCases) {
        sections.push(await this._generateErrorTests(analysis, moduleName));
      }

      const testCode = sections.join('\n\n');

      if (this.options.verbose) {
        console.log(`[TestGenerator] Generated ${analysis.functions.length} test suites`);
      }

      return testCode;
    } catch (error) {
      throw new Error(`Failed to generate tests: ${error.message}`);
    }
  }

  /**
   * Analyzes code to extract functions and structure
   * @param {string} code - The code to analyze
   * @returns {Promise<Object>} Analysis results
   * @private
   */
  async _analyzeCode(code) {
    const functions = [];
    const exports = [];
    const classes = [];

    // Detect language/format
    const isTypeScript = /\.(ts|tsx)$/.test(code) || /:\s*\w+\s*[=<>|]/.test(code);
    const isESM = /import\s+|export\s+/.test(code);
    const isCommonJS = /module\.exports|require\s*\(/.test(code);

    // Extract function definitions
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;

    while ((match = functionRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        params: this._parseParams(match[2]),
        type: 'function',
      });
    }

    // Extract arrow functions assigned to variables
    const arrowFunctionRegex = /const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;

    while ((match = arrowFunctionRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        params: this._parseParams(match[2]),
        type: 'arrow',
      });
    }

    // Extract class methods
    const classMethodRegex = /class\s+(\w+)\s*\{[\s\S]*?^(?:async\s+)?(\w+)\s*\(([^)]*)\)/gm;

    while ((match = classMethodRegex.exec(code)) !== null) {
      if (!classes.find(c => c.name === match[1])) {
        classes.push({
          name: match[1],
          methods: [],
        });
      }
    }

    // Extract exported functions
    const exportRegex = /export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g;

    while ((match = exportRegex.exec(code)) !== null) {
      exports.push(match[1]);
    }

    // Extract default export
    const defaultExportRegex = /export\s+default\s+(\w+)/g;

    while ((match = defaultExportRegex.exec(code)) !== null) {
      exports.unshift(match[1]);
    }

    return {
      functions,
      exports,
      classes,
      isTypeScript,
      isESM,
      isCommonJS,
    };
  }

  /**
   * Parses function parameters
   * @param {string} paramString - Parameter string
   * @returns {string[]} Array of parameter names
   * @private
   */
  _parseParams(paramString) {
    if (!paramString || paramString.trim() === '') {
      return [];
    }

    return paramString
      .split(',')
      .map(p => {
        const trimmed = p.trim();
        // Handle destructuring: { a, b } or { a = default }
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const inner = trimmed.slice(1, -1);
          return inner.split(',').map(i => i.split('=')[0].trim()).join(', ');
        }
        // Handle default values: param = default
        return trimmed.split('=')[0].trim();
      })
      .filter(p => p);
  }

  /**
   * Generates header comment for test file
   * @param {string} code - Original code
   * @param {string} moduleName - Module name
   * @returns {string} Header comment
   * @private
   */
  _generateHeaderComment(code, moduleName) {
    const date = new Date().toISOString().split('T')[0];
    return `/**
 * Auto-generated test suite for ${moduleName}
 * Generated: ${date}
 * Framework: ${this.options.framework}
 * Coverage Target: ${this.options.coverageTarget}%
 *
 * NOTE: Review and customize generated tests before use
 */`;
  }

  /**
   * Generates happy path test cases
   * @param {Object} analysis - Code analysis
   * @param {string} moduleName - Module name
   * @returns {Promise<string>} Happy path tests
   * @private
   */
  async _generateHappyPathTests(analysis, moduleName) {
    const templates = this._getTemplates();
    const tests = [];

    for (const func of analysis.functions) {
      const suiteName = func.type === 'class' ? `${func.name} class` : func.name;
      const testCases = [];

      if (this.options.generateComments) {
        testCases.push(templates.comment(`Happy path test for ${func.name}`));
      }

      // Generate test with sample arguments
      const args = func.params.map(p => this._sampleValue(p)).join(', ');
      const funcCall = func.type === 'class'
        ? `new ${func.name}(${args})`
        : `${func.name}(${args})`;

      testCases.push(templates.test(`should handle valid input for ${func.name}`, func.expect(funcCall, 'toBeDefined', '')));

      // Add more happy path variations
      if (func.params.length > 1) {
        testCases.push(templates.test(`should work with multiple arguments`, ''));
      }

      tests.push(templates.describe(suiteName, testCases.join('\n\n')));
    }

    return tests.join('\n\n');
  }

  /**
   * Generates edge case test cases
   * @param {Object} analysis - Code analysis
   * @param {string} moduleName - Module name
   * @returns {Promise<string>} Edge case tests
   * @private
   */
  async _generateEdgeCaseTests(analysis, moduleName) {
    const templates = this._getTemplates();
    const tests = [];
    const edgeCases = [];

    // Empty input edge cases
    edgeCases.push({
      name: 'Empty input handling',
      tests: [
        {
          desc: 'should handle empty string',
          params: [''],
        },
        {
          desc: 'should handle empty array',
          params: ['[]'],
        },
        {
          desc: 'should handle empty object',
          params: ['{}'],
        },
      ],
    });

    // Null/undefined edge cases
    edgeCases.push({
      name: 'Null and undefined handling',
      tests: [
        {
          desc: 'should handle null input',
          params: ['null'],
        },
        {
          desc: 'should handle undefined input',
          params: ['undefined'],
        },
      ],
    });

    // Boundary edge cases
    edgeCases.push({
      name: 'Boundary value handling',
      tests: [
        {
          desc: 'should handle zero value',
          params: ['0'],
        },
        {
          desc: 'should handle negative numbers',
          params: ['-1'],
        },
        {
          desc: 'should handle maximum values',
          params: ['Number.MAX_SAFE_INTEGER'],
        },
      ],
    });

    for (const edgeCase of edgeCases) {
      const testCases = [];

      if (this.options.generateComments) {
        testCases.push(templates.comment(`${edgeCase.name}`));
      }

      for (const test of edgeCase.tests) {
        testCases.push(templates.test(test.desc, ''));
      }

      tests.push(templates.describe(edgeCase.name, testCases.join('\n\n')));
    }

    return tests.join('\n\n');
  }

  /**
   * Generates error handling test cases
   * @param {Object} analysis - Code analysis
   * @param {string} moduleName - Module name
   * @returns {Promise<string>} Error handling tests
   * @private
   */
  async _generateErrorTests(analysis, moduleName) {
    const templates = this._getTemplates();
    const tests = [];
    const errorTests = [];

    // Type error cases
    errorTests.push({
      name: 'Type validation',
      tests: [
        {
          desc: 'should throw on invalid type',
          call: `${moduleName}(invalidType)`,
          expect: templates.expectThrowType('TypeError'),
        },
        {
          desc: 'should throw on type coercion',
          call: `${moduleName}('123')`,
          expect: '', // Will throw if proper validation exists
        },
      ],
    });

    // Value error cases
    errorTests.push({
      name: 'Value validation',
      tests: [
        {
          desc: 'should throw on negative value',
          call: `${moduleName}(-1)`,
          expect: '', // Will throw if validation exists
        },
        {
          desc: 'should throw on out of range value',
          call: `${moduleName}(999999)`,
          expect: '', // Will throw if validation exists
        },
      ],
    });

    // Missing required fields
    errorTests.push({
      name: 'Required field validation',
      tests: [
        {
          desc: 'should throw on missing required parameter',
          call: `${moduleName}()`,
          expect: '', // Will throw if required params not provided
        },
      ],
    });

    for (const errorCase of errorTests) {
      const testCases = [];

      if (this.options.generateComments) {
        testCases.push(templates.comment(`${errorCase.name}`));
      }

      for (const test of errorCase.tests) {
        testCases.push(templates.test(test.desc, test.expect));
      }

      tests.push(templates.describe(errorCase.name, testCases.join('\n\n')));
    }

    return tests.join('\n\n');
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
    if (lowerName.includes('date') || lowerName.includes('time')) {
      return "new Date()";
    }

    return 'null';
  }

  /**
   * Generates tests for a file and optionally writes to disk
   * @param {string} filePath - Path to source file
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation results
   */
  async generateForFile(filePath, options = {}) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid input: filePath must be a non-empty string');
    }

    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const code = fs.readFileSync(absolutePath, 'utf-8');
    const moduleName = path.basename(filePath).replace(/\.(js|ts|jsx|tsx)$/, '');

    const testCode = await this.generate(code, moduleName);

    const result = {
      sourceFile: filePath,
      testFile: options.output || moduleName.replace(/^[a-z]/, m => m.toUpperCase()) + '.test.js',
      framework: this.options.framework,
      generated: testCode,
    };

    if (options.output) {
      fs.writeFileSync(path.resolve(options.output), testCode, 'utf-8');
      result.written = true;
    }

    return result;
  }
}

module.exports = { TestGenerator };

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);

  let filePath = null;
  const options = {
    framework: 'jest',
    coverageTarget: 80,
    output: null,
    verbose: args.includes('--verbose'),
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--framework' && i + 1 < args.length) {
      options.framework = args[++i];
    } else if (arg === '--coverage' && i + 1 < args.length) {
      options.coverageTarget = parseInt(args[++i], 10);
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[++i];
    } else if (!arg.startsWith('--')) {
      filePath = arg;
    }
  }

  if (!filePath) {
    console.error('Usage: node generate-tests.js <file> [options]');
    console.error('Options:');
    console.error('  --framework <name>  Test framework (jest, mocha, vitest)');
    console.error('  --coverage <num>   Target coverage percentage');
    console.error('  --output <file>    Output file path');
    console.error('  --verbose          Verbose output');
    process.exit(1);
  }

  const generator = new TestGenerator(options);

  generator.generateForFile(filePath, options)
    .then(result => {
      if (options.output) {
        console.log(`Tests written to: ${result.testFile}`);
      } else {
        console.log(result.generated);
      }
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}