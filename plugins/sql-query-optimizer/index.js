/**
 * SQL Query Optimizer Plugin
 *
 * A comprehensive SQL query optimization plugin for Claude Code that analyzes,
 * refactors, and optimizes complex SQL queries for better database performance.
 */

const plugin = {
  name: 'sql-query-optimizer',
  version: '1.0.0',
  description: 'Intelligent SQL query optimizer that analyzes, refactors, and optimizes complex SQL queries'
};

/**
 * Get available commands for this plugin
 * @returns {Object} Commands mapping
 */
function getCommands() {
  return {
    'analyze-query': './commands/analyze-query.md',
    'explain-plan': './commands/explain-plan.md',
    'optimize-sql': './commands/optimize-sql.md',
    'refactor-query': './commands/refactor-query.md',
    'suggest-indexes': './commands/suggest-indexes.md'
  };
}

/**
 * Get agents for this plugin
 * @returns {string} Agent directory path
 */
function getAgents() {
  return './agents/';
}

/**
 * Get skills for this plugin
 * @returns {string} Skills directory path
 */
function getSkills() {
  return './skills/';
}

/**
 * Get hooks configuration for this plugin
 * @returns {Object} Hooks configuration
 */
function getHooks() {
  return './hooks/hooks.json';
}

module.exports = {
  default: plugin,
  getCommands,
  getAgents,
  getSkills,
  getHooks
};