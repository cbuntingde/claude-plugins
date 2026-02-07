/**
 * Intelligent Refactoring Assistant
 *
 * Safe, context-aware refactoring tools for modernizing legacy code,
 * extracting duplicated logic, and applying design patterns with confidence.
 */

const plugin = {
  name: 'intelligent-refactoring-assistant',
  version: '1.0.0',
  description: 'Safe, context-aware refactoring tools for modernizing legacy code, extracting duplicated logic, and applying design patterns with confidence',
  commands: {
    'analyze-refactor-opportunities': {
      description: 'Comprehensively analyze code for all refactoring opportunities and provide prioritized recommendations',
      handler: './scripts/analyze-refactor-opportunities.sh'
    },
    'apply-pattern': {
      description: 'Apply appropriate design patterns to improve code structure',
      handler: './scripts/apply-pattern.sh'
    },
    'extract-duplication': {
      description: 'Analyze code for duplicated logic and extract it into reusable functions',
      handler: './scripts/extract-duplication.sh'
    },
    'modernize-code': {
      description: 'Modernize legacy code by updating outdated syntax and deprecated APIs',
      handler: './scripts/modernize-code.sh'
    },
    'safe-rename': {
      description: 'Safely rename functions, variables, classes, and other symbols',
      handler: './scripts/safe-rename.sh'
    }
  }
};

module.exports = plugin;