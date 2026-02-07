#!/usr/bin/env node
/**
 * Error Explainer Command Implementation
 *
 * Provides explanations for cryptic error messages.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Error Explainer

Usage: explain [error message]

Provide an error message as an argument or through stdin.

Examples:
  explain "TypeError: Cannot read property 'map' of undefined"
  explain "ReferenceError: process is not defined"

Options:
  -h, --help     Show this help message
  -v, --version  Show version information
`);
}

/**
 * Show version
 */
function showVersion() {
  const pkg = require('../package.json');
  console.log(`error-explainer v${pkg.version}`);
}

/**
 * Parse error type from message
 */
function parseErrorType(message) {
  const errorTypes = [
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'RangeError',
    'EvalError',
    'Error',
    'AttributeError',
    'ValueError',
    'KeyError',
    'IndexError',
    'PermissionError',
    'FileNotFoundError',
    'ConnectionError',
    'TimeoutError',
    'AssertionError'
  ];

  for (const errorType of errorTypes) {
    if (message.includes(errorType)) {
      return errorType;
    }
  }

  return 'UnknownError';
}

/**
 * Generate explanation for error
 */
function explainError(message) {
  const errorType = parseErrorType(message);
  const explanation = {
    errorType,
    message,
    explanation: '',
    causes: [],
    solutions: [],
    prevention: []
  };

  // TypeError explanations
  if (errorType === 'TypeError') {
    if (message.includes("Cannot read property") || message.includes("Cannot read properties")) {
      explanation.explanation = 'Attempted to access a property or method on a value that is undefined or null.';
      explanation.causes = [
        'Variable was never initialized',
        'Function returned undefined/null unexpectedly',
        'Asynchronous code ran before promise resolved',
        'Object property was deleted or not set'
      ];
      explanation.solutions = [
        'Add null/undefined checks before accessing properties',
        'Use optional chaining (?.) operator',
        'Ensure functions return expected values',
        'Wait for async operations to complete'
      ];
      explanation.prevention = [
        'Use TypeScript for type safety',
        'Initialize variables with default values',
        'Use ESLint rules for undefined access',
        'Implement proper error handling'
      ];
    } else if (message.includes("is not a function")) {
      explanation.explanation = 'Attempted to call something that is not a function.';
      explanation.causes = [
        'Variable was reassigned to a non-function value',
        'Import statement failed silently',
        'Object property was overwritten',
        'Misconfigured class or object method'
      ];
      explanation.solutions = [
        'Verify the value is a function before calling',
        'Check import statements are correct',
        'Use console.log to inspect the value type',
        'Ensure method binding is correct (for classes)'
      ];
      explanation.prevention = [
        'Use TypeScript for type checking',
        'Keep functions pure and predictable',
        'Avoid reassigning function variables',
        'Use linter rules for type safety'
      ];
    }
  }

  // ReferenceError explanations
  if (errorType === 'ReferenceError') {
    explanation.explanation = 'Referenced a variable or function that does not exist.';
    explanation.causes = [
      'Variable is not declared in current scope',
      'Typo in variable or function name',
      'Using let/const before initialization (temporal dead zone)',
      'Variable was misspelled in different files'
    ];
    explanation.solutions = [
      'Check for typos in variable names',
      'Ensure variable is declared before use',
      'Verify import/export statements are correct',
      'Check the scope where variable is defined'
    ];
    explanation.prevention = [
      'Use TypeScript to catch undefined references',
      'Use ESLint no-undef rule',
      'Use consistent naming conventions',
      'Use IDE with intellisense for early detection'
    ];
  }

  // Python AttributeError
  if (errorType === 'AttributeError') {
    if (message.includes("'NoneType' object")) {
      explanation.explanation = 'Attempted to access an attribute on None, indicating a missing value.';
      explanation.causes = [
        'Function returned None instead of expected object',
        'Variable was set to None and not updated',
        'Database query returned no results',
        'Config value not set'
      ];
      explanation.solutions = [
        'Add None checks before attribute access',
        'Provide default values with .get() or getattr()',
        'Handle None cases explicitly',
        'Verify function return values'
      ];
      explanation.prevention = [
        'Use Optional type hints',
        'Use dataclasses with defaults',
        'Implement proper null handling',
        'Add type validation'
      ];
    }
  }

  // Python KeyError / IndexError
  if (errorType === 'KeyError' || errorType === 'IndexError') {
    explanation.explanation = 'Attempted to access a key/index that does not exist in a collection.';
    explanation.causes = [
      'Key/index does not exist in dictionary/list',
      'Data structure is empty',
      'Using stale data that was modified',
      'Off-by-one error in index calculation'
    ];
    explanation.solutions = [
      'Use .get() for dictionaries with default values',
      'Check collection length before access',
      'Use try/except for key/index access',
      'Verify data is up to date'
    ];
    explanation.prevention = [
      'Use .get() or defaultdict for safe access',
      'Validate data before use',
      'Use enumerate instead of index-based access',
      'Add bounds checking'
    ];
  }

  // FileNotFoundError
  if (errorType === 'FileNotFoundError') {
    explanation.explanation = 'Attempted to access a file or directory that does not exist.';
    explanation.causes = [
      'File path is incorrect',
      'File was moved or deleted',
      'Working directory changed',
      'Case sensitivity issues in path'
    ];
    explanation.solutions = [
      'Verify file path is correct',
      'Use absolute paths where possible',
      'Check file exists before accessing',
      'Use path.join() for cross-platform paths'
    ];
    explanation.prevention = [
      'Use path.resolve() for absolute paths',
      'Check file existence with fs.existsSync()',
      'Use try/except for file operations',
      'Store paths in configuration'
    ];
  }

  // SyntaxError
  if (errorType === 'SyntaxError') {
    explanation.explanation = 'Code does not conform to the language syntax rules.';
    explanation.causes = [
      'Missing or extra punctuation (brackets, commas, parentheses)',
      'Incorrect keyword spelling',
      'Invalid string quotation',
      'Unbalanced braces or brackets'
    ];
    explanation.solutions = [
      'Check line number in error message',
      'Review recent changes to the file',
      'Use IDE with syntax highlighting',
      'Run linter to catch syntax issues'
    ];
    explanation.prevention = [
      'Use code formatter (Prettier, Black)',
      'Use IDE with real-time syntax checking',
      'Commit frequently to isolate issues',
      'Use pre-commit hooks for linting'
    ];
  }

  return explanation;
}

/**
 * Format explanation as markdown
 */
function formatExplanation(expl) {
  let output = `# Error Explanation: ${expl.errorType}\n\n`;
  output += `**Error Message:** \`${expl.message}\`\n\n`;

  output += `## What Happened\n\n${expl.explanation}\n\n`;

  if (expl.causes.length > 0) {
    output += `## Common Causes\n\n`;
    expl.causes.forEach((cause, i) => {
      output += `${i + 1}. ${cause}\n`;
    });
    output += '\n';
  }

  if (expl.solutions.length > 0) {
    output += `## How to Fix\n\n`;
    expl.solutions.forEach((solution, i) => {
      output += `${i + 1}. ${solution}\n`;
    });
    output += '\n';
  }

  if (expl.prevention.length > 0) {
    output += `## Prevention\n\n`;
    expl.prevention.forEach((tip, i) => {
      output += `- ${tip}\n`;
    });
    output += '\n';
  }

  return output;
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    showHelp();
    process.exit(0);
  }

  if (args[0] === '-v' || args[0] === '--version') {
    showVersion();
    process.exit(0);
  }

  // Get error message from arguments or stdin
  let errorMessage = '';

  if (args.length > 0) {
    errorMessage = args.join(' ');
  } else {
    // Try to read from stdin
    try {
      errorMessage = await fs.readFile(0, 'utf-8');
    } catch {
      console.error('Error: No error message provided');
      console.error('Usage: explain [error message]');
      process.exit(1);
    }
  }

  const explanation = explainError(errorMessage);
  const output = formatExplanation(explanation);

  console.log(output);
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});