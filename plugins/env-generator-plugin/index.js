/**
 * Environment Variable Generator Plugin
 *
 * Automatically generates .env files by analyzing code for environment variable usage patterns.
 */

const name = "env-generator";
const version = "1.0.0";

/**
 * @typedef {Object} ClaudeContext
 * @property {Object} Claude
 * @property {string} Claude.currentWorkingDirectory
 * @property {Function} Claude.read
 * @property {Function} Claude.write
 * @property {Function} Claude.glob
 * @property {Function} Claude.exec
 */

export { name, version };