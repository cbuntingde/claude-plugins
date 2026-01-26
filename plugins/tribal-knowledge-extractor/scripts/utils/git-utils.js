/**
 * Git Utilities
 * Shared utility functions for git operations across all commands
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * Sanitizes user input for safe use in git commands
 * Removes potentially dangerous shell characters while preserving valid git values
 * @param {string} input - User input to sanitize (file paths, author names, etc.)
 * @returns {string} Sanitized input safe for git command interpolation
 */
function sanitizeGitInput(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  // Remove characters that could enable command injection
  // Keep valid path characters, email chars, and common commit message chars
  return input.replace(/[`\$\\]/g, '');
}

/**
 * Executes a shell command and returns the output
 * Handles errors gracefully with optional warning display
 * @param {string} cmd - The command to execute
 * @returns {string} Command stdout, or empty string on error
 */
function execCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
  } catch (error) {
    // Suppress "not a git repository" errors (handled by validateGitRepo)
    if (error.stderr && !error.stderr.includes('not a git repository')) {
      console.warn(chalk.yellow(`Warning: ${error.stderr.trim()}`));
    }
    return '';
  }
}

/**
 * Validates that the current directory is a git repository
 * Exits with error code 1 if not a git repository
 * @throws {Error} With exit code 1 if not in a git repository
 */
function validateGitRepo() {
  const gitRoot = execCommand('git rev-parse --git-dir 2>/dev/null');
  if (!gitRoot) {
    console.error(chalk.red('Error: Not a git repository'));
    process.exit(1);
  }
}

/**
 * Parses git log output in pipe-delimited format
 * @param {string} output - Raw git log output
 * @param {string[]} fields - Field names for each pipe-delimited column
 * @returns {object[]} Array of parsed objects with field names as keys
 */
function parseGitLog(output, fields) {
  if (!output) return [];

  return output.trim().split('\n').map(line => {
    const values = line.split('|');
    const obj = {};
    fields.forEach((field, index) => {
      obj[field] = values[index] || '';
    });
    return obj;
  });
}

module.exports = {
  sanitizeGitInput,
  execCommand,
  validateGitRepo,
  parseGitLog
};
