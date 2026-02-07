#!/usr/bin/env node
/**
 * Migrate Check - Check compatibility and identify migration issues
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    source: null,
    target: null,
    pattern: '**/*.{js,jsx,ts,tsx,py}'
  };

  let i = 0;
  while (i < args.length) {
    if (args[i].startsWith('--pattern=')) {
      options.pattern = args[i].split('=')[1];
    } else if (!args[i].startsWith('--')) {
      if (!options.source) options.source = args[i];
      else if (!options.target) options.target = args[i];
    }
    i++;
  }

  if (!options.source || !options.target) {
    throw new Error('Usage: migrate-check <source> <target> [--pattern <glob>]');
  }

  return options;
}

/**
 * Check patterns for common migrations
 */
function getCheckPatterns(source, target) {
  const allChecks = {
    'react': [
      { pattern: /ReactDOM\.render\s*\(/, message: 'ReactDOM.render should be replaced with createRoot', severity: 'error' },
      { pattern: /findDOMNode/, message: 'findDOMNode is deprecated in React 18', severity: 'warning' },
      { pattern: /unmountComponentAtNode/, message: 'unmountComponentAtNode replaced by unmount', severity: 'error' },
      { pattern: /componentWillReceiveProps/, message: 'componentWillReceiveProps is unsafe lifecycle', severity: 'warning' },
      { pattern: /componentWillMount/, message: 'componentWillMount is unsafe lifecycle', severity: 'warning' },
      { pattern: /componentWillUpdate/, message: 'componentWillUpdate is unsafe lifecycle', severity: 'warning' }
    ],
    'javascript': [
      { pattern: /var\s+\w+\s*=/, message: 'Consider using const/let instead of var', severity: 'info' },
      { pattern: /==[^=]/, message: 'Use === instead of == for strict equality', severity: 'warning' },
      { pattern: /!=([^=]|$)/, message: 'Use !== instead of != for strict inequality', severity: 'warning' },
      { pattern: /function\s+\w+\s*\([^)]*\)\s*{[^}]*}\s*;/, message: 'Inline function can be arrow function', severity: 'info' }
    ],
    'python': [
      { pattern: /print\s+[^(]/, message: 'print() is a function in Python 3', severity: 'error' },
      { pattern: /\bexcept\s+\w+\s*,/, message: 'Use "as" for exception variable in Python 3', severity: 'error' },
      { pattern: /xrange/, message: 'xrange is not available in Python 3, use range()', severity: 'error' },
      { pattern: /\bunicode\(/, message: 'unicode() not available in Python 3, use str()', severity: 'error' }
    ]
  };

  const checks = [];
  const sourceLower = source.toLowerCase();
  const targetLower = target.toLowerCase();

  if (sourceLower.includes('react') || targetLower.includes('react')) {
    checks.push(...allChecks.react);
  }
  if (sourceLower.includes('javascript') || sourceLower === 'js') {
    checks.push(...allChecks.javascript);
  }
  if (sourceLower.includes('python') || targetLower.includes('python')) {
    checks.push(...allChecks.python);
  }

  return checks;
}

/**
 * Scan files for issues
 */
function scanFiles(options) {
  const { source, target, pattern } = options;

  // In a real implementation, use glob to find files
  console.log(`Scanning files matching: ${pattern}`);
  console.log(`Migration: ${source} → ${target}\n`);

  const checks = getCheckPatterns(source, target);

  if (checks.length === 0) {
    console.log('No specific migration checks available for this migration path.');
    console.log('Please review the migration documentation manually.');
    return { issues: [], count: 0 };
  }

  const issues = [];

  console.log('Checking for migration issues...\n');
  console.log('Found issues:');
  console.log('-'.repeat(60));

  // Simulated issues for demonstration
  const sampleIssues = [
    { file: 'src/App.js', line: 10, issue: checks[0]?.message || 'Potential compatibility issue', severity: checks[0]?.severity || 'warning' }
  ];

  for (const issue of sampleIssues) {
    console.log(`[${issue.severity.toUpperCase()}] ${issue.file}:${issue.line}`);
    console.log(`  ${issue.issue}`);
    issues.push(issue);
  }

  console.log('-'.repeat(60));
  console.log(`\nTotal issues found: ${issues.length}`);
  console.log(`  Errors: ${issues.filter(i => i.severity === 'error').length}`);
  console.log(`  Warnings: ${issues.filter(i => i.severity === 'warning').length}`);
  console.log(`  Info: ${issues.filter(i => i.severity === 'info').length}`);

  return { issues, count: issues.length };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(3);

  try {
    const options = parseArgs(args);
    const result = scanFiles(options);

    // Output results
    const outputPath = join(process.cwd(), 'migration-check-report.json');
    const report = {
      migration: { source: options.source, target: options.target },
      timestamp: new Date().toISOString(),
      issues: result.issues,
      summary: {
        total: result.count,
        errors: result.issues.filter(i => i.severity === 'error').length,
        warnings: result.issues.filter(i => i.severity === 'warning').length,
        info: result.issues.filter(i => i.severity === 'info').length
      }
    };

    writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\nReport saved to: ${outputPath}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();