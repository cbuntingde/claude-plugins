/**
 * Code Complexity Analyzer Plugin
 * Analyzes code complexity and provides refactoring recommendations.
 */

const path = require('path');
const { execSync } = require('child_process');

/**
 * Plugin metadata
 */
const PLUGIN_NAME = 'code-complexity-analyzer';
const VERSION = '1.0.0';

/**
 * Resolves the script path relative to the plugin root.
 * @param {string} scriptName - The script filename
 * @returns {string} - Absolute path to the script
 */
function resolveScriptPath(scriptName) {
  return path.join(__dirname, 'scripts', scriptName);
}

/**
 * Analyzes a file or directory for code complexity.
 * @param {Object} args - Command arguments
 * @returns {Object} - Analysis result
 */
async function analyzeComplexity(args) {
  const {
    target = '.',
    threshold = 15,
    output = 'detailed',
    cognitive = false,
    minimal = false,
    suggest = false,
  } = args;

  const scriptPath = resolveScriptPath('complexity-analyzer.sh');

  // Build command arguments
  const cmdArgs = [`"${target}"`];

  if (threshold !== 15) {
    cmdArgs.push(`--threshold=${threshold}`);
  }

  if (output !== 'detailed') {
    cmdArgs.push(`--output=${output}`);
  }

  if (cognitive) {
    cmdArgs.push('--cognitive');
  }

  if (minimal) {
    cmdArgs.push('--minimal');
  }

  if (suggest) {
    cmdArgs.push('--suggest');
  }

  const command = `bash "${scriptPath}" ${cmdArgs.join(' ')}`;

  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    return {
      success: true,
      output: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || '',
    };
  }
}

/**
 * Default plugin export
 */
export default {
  name: PLUGIN_NAME,
  version: VERSION,
  commands: {
    'analyze-complexity': analyzeComplexity,
  },
};