/**
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Testing Assistant Plugin - Entry point module
 * MIT License
 */

'use strict';

/**
 * TestingAssistantPlugin - Main plugin class for testing assistance
 * 
 * Provides utilities for:
 * - Finding edge cases in code
 * - Generating comprehensive tests
 * - Improving existing test coverage
 */
class TestingAssistantPlugin {
  /**
   * Creates a new TestingAssistantPlugin instance
   * @param {Object} options - Plugin configuration options
   */
  constructor(options = {}) {
    this.name = 'testing-assistant-plugin';
    this.version = '1.0.0';
    this.options = {
      coverageThreshold: options.coverageThreshold || 80,
      testFramework: options.testFramework || 'jest',
      verbose: options.verbose || false,
    };
  }

  /**
   * Initializes the plugin
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Validate plugin configuration
      this._validateConfiguration();
      
      // Initialize any required resources
      this._initializeResources();
      
      if (this.options.verbose) {
        console.log('[TestingAssistantPlugin] Plugin initialized successfully');
      }
    } catch (error) {
      throw new Error(`Failed to initialize TestingAssistantPlugin: ${error.message}`);
    }
  }

  /**
   * Validates the plugin configuration
   * @private
   */
  _validateConfiguration() {
    if (this.options.coverageThreshold < 0 || this.options.coverageThreshold > 100) {
      throw new Error('Coverage threshold must be between 0 and 100');
    }

    const validFrameworks = ['jest', 'mocha', 'vitest', 'playwright'];
    if (!validFrameworks.includes(this.options.testFramework)) {
      throw new Error(`Invalid test framework: ${this.options.testFramework}. Valid options: ${validFrameworks.join(', ')}`);
    }
  }

  /**
   * Initializes required resources
   * @private
   */
  _initializeResources() {
    // Initialize resource tracking
    this._resources = {
      edgeCasePatterns: new Map(),
      testTemplates: new Map(),
      coverageReports: new Map(),
    };
  }

  /**
   * Finds edge cases in the given code
   * @param {string} code - The code to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Edge case analysis results
   */
  async findEdgeCases(code, options = {}) {
    const defaultOptions = {
      includeBoundary: true,
      includeNull: true,
      includeUndefined: true,
      includeTypeMismatch: true,
      includeConcurrency: false,
    };

    const analysisOptions = { ...defaultOptions, ...options };

    try {
      // Import and use the edge case finder
      const { EdgeCaseFinder } = await import('./scripts/find-edge-cases.js');
      const finder = new EdgeCaseFinder(analysisOptions);
      
      return await finder.analyze(code);
    } catch (error) {
      throw new Error(`Failed to find edge cases: ${error.message}`);
    }
  }

  /**
   * Generates tests for the given code
   * @param {string} code - The code to generate tests for
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated test code
   */
  async generateTests(code, options = {}) {
    const defaultOptions = {
      framework: this.options.testFramework,
      coverageTarget: this.options.coverageThreshold,
      includeHappyPath: true,
      includeEdgeCases: true,
      includeErrorCases: true,
      generateComments: true,
    };

    const generationOptions = { ...defaultOptions, ...options };

    try {
      // Import and use the test generator
      const { TestGenerator } = await import('./scripts/generate-tests.js');
      const generator = new TestGenerator(generationOptions);
      
      return await generator.generate(code);
    } catch (error) {
      throw new Error(`Failed to generate tests: ${error.message}`);
    }
  }

  /**
   * Improves existing test coverage
   * @param {string} testCode - The existing test code
   * @param {string} sourceCode - The source code being tested
   * @param {Object} options - Improvement options
   * @returns {Promise<Object>} Improvement results
   */
  async improveTests(testCode, sourceCode, options = {}) {
    const defaultOptions = {
      targetCoverage: this.options.coverageThreshold,
      addMissingTests: true,
      refactorExisting: true,
      suggestAssertions: true,
    };

    const improvementOptions = { ...defaultOptions, ...options };

    try {
      // Import and use the test improver
      const { TestImprover } = await import('./scripts/improve-tests.js');
      const improver = new TestImprover(improvementOptions);
      
      return await improver.improve(testCode, sourceCode);
    } catch (error) {
      throw new Error(`Failed to improve tests: ${error.message}`);
    }
  }

  /**
   * Gets the plugin metadata
   * @returns {Object} Plugin metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      options: this.options,
    };
  }

  /**
   * Cleans up plugin resources
   * @returns {Promise<void>}
   */
  async dispose() {
    try {
      // Clean up resources
      this._resources.edgeCasePatterns.clear();
      this._resources.testTemplates.clear();
      this._resources.coverageReports.clear();
      
      if (this.options.verbose) {
        console.log('[TestingAssistantPlugin] Plugin disposed successfully');
      }
    } catch (error) {
      console.error(`Error disposing plugin: ${error.message}`);
    }
  }
}

module.exports = { TestingAssistantPlugin };

// Export individual modules for direct usage
module.exports.EdgeCaseFinder = require('./scripts/find-edge-cases.js');
module.exports.TestGenerator = require('./scripts/generate-tests.js');
module.exports.TestImprover = require('./scripts/improve-tests.js');