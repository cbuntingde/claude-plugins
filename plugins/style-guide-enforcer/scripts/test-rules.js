#!/usr/bin/env node

/**
 * Test script for style guide rules
 * Runs validation against test files to verify rules work correctly
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max file size

/**
 * Safely escape a file path for use in command arguments
 */
function escapeFilePath(filePath) {
  // Validate path is safe
  const normalized = path.normalize(filePath);
  if (normalized.includes('..') || normalized.startsWith('/')) {
    throw new Error('Invalid file path: path traversal or absolute path not allowed');
  }
  return filePath;
}

/**
 * Run validation with spawn to avoid command injection
 */
function runValidation(validateScript, testFilePath) {
  return new Promise((resolve, reject) => {
    const escapedPath = escapeFilePath(testFilePath);
    const child = spawn('node', [validateScript, escapedPath], {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
      maxBuffer: MAX_FILE_SIZE
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        const error = new Error(`Validation failed with exit code ${code}`);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      }
    });

    child.on('error', reject);
  });
}

// Test files with expected violations
const testCases = [
  {
    name: 'Trailing whitespace',
    file: 'test-trailing-ws.ts',
    content: 'const x = "test"; \nconst y = "value";   \n',
    expectedViolations: ['trailing-whitespace']
  },
  {
    name: 'Long lines',
    file: 'test-long-line.ts',
    content: 'const veryLongVariableName = "this is a very long string that exceeds the maximum line length limit";\n',
    expectedViolations: ['line-length']
  },
  {
    name: 'Clean code',
    file: 'test-clean.ts',
    content: 'const x = "test";\nconst y = "value";\n',
    expectedViolations: []
  }
];

async function runTests() {
  console.log('Running style guide rule tests...\n');

  let passed = 0;
  let failed = 0;

  for (const [index, testCase] of testCases.entries()) {
    console.log(`Test ${index + 1}: ${testCase.name}`);

    // Create temporary test file
    const testDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testFilePath = path.join(testDir, testCase.file);
    fs.writeFileSync(testFilePath, testCase.content, 'utf8');

    // Run validation using spawn to prevent command injection
    try {
      const validateScript = path.join(__dirname, 'validate-style.js');
      const output = await runValidation(validateScript, testFilePath);

      if (testCase.expectedViolations.length === 0 && !output.includes('violation')) {
        console.log('  ✓ PASS\n');
        passed++;
      } else if (testCase.expectedViolations.length > 0 && output.includes('violation')) {
        console.log('  ✓ PASS\n');
        passed++;
      } else {
        console.log('  ✗ FAIL - Unexpected violations');
        console.log(`  Expected: ${testCase.expectedViolations.join(', ')}`);
        console.log(`  Output: ${output}\n`);
        failed++;
      }
    } catch (error) {
      if (testCase.expectedViolations.length === 0) {
        console.log('  ✓ PASS\n');
        passed++;
      } else {
        console.log('  ✗ FAIL - Command threw error');
        console.log(`  ${error.message}\n`);
        failed++;
      }
    }

    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }

  // Cleanup test directory
  const testDir = path.join(__dirname, '../tmp');
  if (fs.existsSync(testDir)) {
    fs.rmdirSync(testDir);
  }

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
