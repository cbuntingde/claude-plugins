/**
 * Architecture Gatekeeper Plugin for Claude Code
 *
 * Comprehensive architecture validation plugin that prevents commits violating
 * architecture patterns or creating circular dependencies.
 *
 * Features:
 * - Circular dependency detection for TypeScript/JavaScript
 * - Architecture pattern validation (layered, hexagonal, clean architecture)
 * - Import rule enforcement (no internal module bypassing)
 * - Pre-commit hooks for automatic validation
 * - Configurable rule sets and thresholds
 * - Detailed violation reporting with fix suggestions
 */

export const VERSION = '1.0.0';
export const NAME = 'architecture-gatekeeper';

export const commands = {
  'check-architecture': {
    description: 'Run comprehensive architecture validation checks',
    parameters: {
      directory: {
        type: 'string',
        description: 'Root directory to analyze',
        default: process.cwd(),
      },
      config: {
        type: 'string',
        description: 'Path to architecture configuration file',
        default: '.claude/architecture.json',
      },
      output: {
        type: 'string',
        description: 'Output format (json, table, markdown)',
        default: 'table',
      },
    },
  },
  'check-circular': {
    description: 'Detect and report circular dependencies',
    parameters: {
      directory: {
        type: 'string',
        description: 'Root directory to analyze',
        default: process.cwd(),
      },
      filePattern: {
        type: 'string',
        description: 'File pattern to match',
        default: '**/*.{ts,tsx,js,jsx}',
      },
      excludePatterns: {
        type: 'array',
        description: 'Patterns to exclude',
        default: ['node_modules', 'dist', 'build', '.claude'],
      },
    },
  },
  'check-patterns': {
    description: 'Validate architecture pattern compliance',
    parameters: {
      directory: {
        type: 'string',
        description: 'Root directory to analyze',
        default: process.cwd(),
      },
      pattern: {
        type: 'string',
        description: 'Architecture pattern to validate (layered, hexagonal, clean)',
        default: 'layered',
      },
    },
  },
  'validate-commit': {
    description: 'Validate staged changes against architecture rules',
    parameters: {
      strict: {
        type: 'boolean',
        description: 'Fail validation on any violation',
        default: true,
      },
    },
  },
  'configure-gates': {
    description: 'Configure architecture gate rules and thresholds',
    parameters: {
      rule: {
        type: 'string',
        description: 'Rule type to configure (circular, patterns, imports)',
      },
      action: {
        type: 'string',
        description: 'Action (enable, disable, configure)',
      },
    },
  },
  'show-violations': {
    description: 'Display detected architecture violations',
    parameters: {
      format: {
        type: 'string',
        description: 'Display format (table, json, markdown)',
        default: 'table',
      },
      severity: {
        type: 'string',
        description: 'Filter by severity (error, warning, info)',
        default: 'error',
      },
    },
  },
};

export default {
  name: NAME,
  version: VERSION,
  commands,
};
