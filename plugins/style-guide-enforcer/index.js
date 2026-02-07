#!/usr/bin/env node

/**
 * Style Guide Enforcer Plugin
 * Main entry point for Claude Code plugin
 */

const path = require('path');
const fs = require('fs');

/**
 * Load project style guide configuration
 * @returns {object} Style guide rules
 */
function loadProjectConfig() {
  const configPath = path.join(process.cwd(), '.style-guide.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.warn('Warning: Could not parse .style-guide.json');
    }
  }
  return getDefaultRules();
}

/**
 * Get default style guide rules
 * @returns {object} Default rules
 */
function getDefaultRules() {
  return {
    naming: {
      variables: 'camelCase',
      functions: 'camelCase',
      classes: 'PascalCase',
      constants: 'UPPER_SNAKE_CASE'
    },
    formatting: {
      indentation: 'spaces',
      indentSize: 2,
      maxLineLength: 100,
      trailingWhitespace: false
    },
    imports: {
      order: ['stdlib', 'external', 'internal'],
      blankLineBetweenGroups: true
    }
  };
}

/**
 * Check naming convention
 * @param {string} identifier - Name to check
 * @param {string} type - Type of identifier
 * @param {object} rules - Style rules
 * @returns {object} Result with isValid and expected pattern
 */
function checkNaming(identifier, type, rules) {
  const patterns = {
    camelCase: /^[a-z][a-zA-Z0-9]*$/,
    PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
    UPPER_SNAKE_CASE: /^[A-Z][A-Z0-9_]*$/,
    snake_case: /^[a-z][a-z0-9_]*$/
  };

  const expectedPattern = rules.naming[type];
  const pattern = patterns[expectedPattern];

  return {
    isValid: pattern ? pattern.test(identifier) : true,
    expected: expectedPattern
  };
}

/**
 * Validate a file against style guide
 * @param {string} filePath - Path to file
 * @param {object} rules - Style rules
 * @returns {object} Validation result
 */
function validateFile(filePath, rules) {
  const violations = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check trailing whitespace
  if (rules.formatting.trailingWhitespace === false) {
    lines.forEach((line, index) => {
      if (line.endsWith(' ') || line.endsWith('\t')) {
        violations.push({
          line: index + 1,
          severity: 'warning',
          rule: 'trailing-whitespace',
          message: 'Line has trailing whitespace'
        });
      }
    });
  }

  // Check line length
  if (rules.formatting.maxLineLength) {
    lines.forEach((line, index) => {
      if (line.length > rules.formatting.maxLineLength) {
        violations.push({
          line: index + 1,
          severity: 'info',
          rule: 'line-length',
          message: `Line exceeds ${rules.formatting.maxLineLength} characters (${line.length})`
        });
      }
    });
  }

  return violations;
}

/**
 * Check style command handler
 * @param {object} params - Parameters
 * @returns {object} Validation result
 */
function checkStyle(params = {}) {
  const files = params.files || [];
  const rules = loadProjectConfig();
  const results = [];

  if (files.length === 0) {
    return {
      success: false,
      error: 'No files specified. Usage: /check-style [files...]'
    };
  }

  let totalViolations = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      results.push({
        file,
        error: 'File not found'
      });
      continue;
    }

    const violations = validateFile(file, rules);
    if (violations.length > 0) {
      results.push({
        file,
        violations,
        violationCount: violations.length
      });
      totalViolations += violations.length;
    } else {
      results.push({
        file,
        clean: true
      });
    }
  }

  return {
    success: true,
    filesChecked: files.length,
    totalViolations,
    results
  };
}

/**
 * Fix style command handler
 * @param {object} params - Parameters
 * @returns {object} Fix result
 */
function fixStyle(params = {}) {
  const files = params.files || [];
  const preview = params.preview || false;

  if (files.length === 0) {
    return {
      success: false,
      error: 'No files specified. Usage: /fix-style [files...]'
    };
  }

  const rules = loadProjectConfig();
  const fixes = [];

  for (const file of files) {
    if (!fs.existsSync(file)) {
      fixes.push({
        file,
        error: 'File not found'
      });
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    let fixedContent = content;

    // Fix trailing whitespace
    if (rules.formatting.trailingWhitespace === false) {
      fixedContent = fixedContent.replace(/[ \t]+$/gm, '');
    }

    if (preview) {
      fixes.push({
        file,
        preview: true,
        changes: content !== fixedContent
      });
    } else if (content !== fixedContent) {
      fs.writeFileSync(file, fixedContent, 'utf8');
      fixes.push({
        file,
        fixed: true
      });
    } else {
      fixes.push({
        file,
        clean: true
      });
    }
  }

  return {
    success: true,
    filesProcessed: files.length,
    preview,
    fixes
  };
}

/**
 * List rules command handler
 * @returns {object} Rules listing
 */
function listRules() {
  const rules = loadProjectConfig();

  return {
    success: true,
    rules: {
      naming: rules.naming,
      formatting: rules.formatting,
      imports: rules.imports
    }
  };
}

/**
 * Init style guide command handler
 * @param {object} params - Parameters
 * @returns {object} Init result
 */
function initStyleGuide(params = {}) {
  const preset = params.preset || 'custom';

  const presets = {
    javascript: {
      naming: {
        variables: 'camelCase',
        functions: 'camelCase',
        classes: 'PascalCase',
        constants: 'UPPER_SNAKE_CASE'
      },
      formatting: {
        indentation: 'spaces',
        indentSize: 2,
        maxLineLength: 100,
        trailingWhitespace: false
      },
      imports: {
        order: ['stdlib', 'external', 'internal'],
        blankLineBetweenGroups: true
      }
    },
    python: {
      naming: {
        variables: 'snake_case',
        functions: 'snake_case',
        classes: 'PascalCase',
        constants: 'UPPER_SNAKE_CASE'
      },
      formatting: {
        indentation: 'spaces',
        indentSize: 4,
        maxLineLength: 100,
        trailingWhitespace: false
      },
      imports: {
        order: ['stdlib', 'external', 'internal'],
        blankLineBetweenGroups: true
      }
    },
    go: {
      naming: {
        variables: 'snake_case',
        functions: 'camelCase',
        classes: 'PascalCase',
        constants: 'UPPER_SNAKE_CASE'
      },
      formatting: {
        indentation: 'tabs',
        indentSize: 1,
        maxLineLength: 100,
        trailingWhitespace: false
      },
      imports: {
        order: ['stdlib', 'external'],
        blankLineBetweenGroups: true
      }
    }
  };

  const config = presets[preset] || presets.javascript;
  const configPath = path.join(process.cwd(), '.style-guide.json');

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

  return {
    success: true,
    preset,
    configPath,
    message: `Created .style-guide.json with ${preset} preset`
  };
}

module.exports = {
  checkStyle,
  fixStyle,
  listRules,
  initStyleGuide,
  loadProjectConfig,
  validateFile
};