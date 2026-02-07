#!/usr/bin/env node

/**
 * Style Validation Script
 * Automatically runs after Write/Edit operations to check style compliance
 */

const fs = require('fs');
const path = require('path');

// Default style rules (can be overridden by project .style-guide.json)
const defaultRules = {
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
  },
  patterns: {
    fileExtensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.go']
  }
};

function loadProjectConfig() {
  const configPath = path.join(process.cwd(), '.style-guide.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...defaultRules, ...config };
    } catch (error) {
      console.warn('Warning: Could not parse .style-guide.json, using defaults');
    }
  }
  return defaultRules;
}

function checkNaming(identifier, type, rules) {
  const patterns = {
    camelCase: /^[a-z][a-zA-Z0-9]*$/,
    PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
    UPPER_SNAKE_CASE: /^[A-Z][A-Z0-9_]*$/,
    snake_case: /^[a-z][a-z0-9_]*$/
  };

  const expectedPattern = patterns[rules.naming[type]];
  return expectedPattern ? expectedPattern.test(identifier) : true;
}

function validateFile(filePath, rules) {
  const ext = path.extname(filePath);
  if (!rules.patterns.fileExtensions.includes(ext)) {
    return [];
  }

  const violations = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check for trailing whitespace
  if (rules.formatting.trailingWhitespace === false) {
    lines.forEach((line, index) => {
      if (line.endsWith(' ') || line.endsWith('\t')) {
        violations.push({
          line: index + 1,
          severity: 'warning',
          rule: 'trailing-whitespace',
          message: `Line has trailing whitespace`
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

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('No files to validate');
    return;
  }

  const rules = loadProjectConfig();
  let totalViolations = 0;

  args.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return;
    }

    const violations = validateFile(filePath, rules);
    if (violations.length > 0) {
      console.log(`\n📋 ${filePath}`);
      violations.forEach(v => {
        console.log(`  ${v.severity.toUpperCase()}: Line ${v.line} - ${v.message}`);
      });
      totalViolations += violations.length;
    }
  });

  if (totalViolations > 0) {
    console.log(`\n❌ Found ${totalViolations} style violation(s)`);
    console.log('Run /fix-style to automatically fix issues');
  }
}

main();
