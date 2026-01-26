#!/usr/bin/env node
/**
 * Analyze-Memory Command
 * Analyzes memory usage patterns and identifies potential memory leaks
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const result = {
    target: '.',
    output: null,
    format: 'text',
    detailed: false
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i += 2;
    } else if (arg === '--format' && args[i + 1]) {
      result.format = args[i + 1];
      i += 2;
    } else if (arg === '--detailed') {
      result.detailed = true;
      i++;
    } else if (!arg.startsWith('--')) {
      result.target = arg;
      i++;
    } else {
      i++;
    }
  }

  return result;
}

/**
 * Analyze code for memory-related issues
 */
function analyzeMemory(target) {
  if (!existsSync(target)) {
    return { error: `Target not found: ${target}` };
  }

  try {
    const content = readFileSync(target, 'utf-8');
    const ext = extname(target);

    const issues = [];
    const lines = content.split('\n');

    // Memory-related patterns to check
    const patterns = [
      {
        id: 'global-vars',
        regex: /^(var|let|const)\s+\w+\s*=/,
        title: 'Global Variables',
        description: 'Global variables persist in memory for the lifetime of the application.',
        impact: 'high',
        recommendation: 'Use module-scoped variables or properly clean up references'
      },
      {
        id: 'event-listeners',
        regex: /\.addEventListener/g,
        title: 'Event Listeners',
        description: 'Event listeners can cause memory leaks if not properly removed.',
        impact: 'high',
        recommendation: 'Remove event listeners when component unmounts or no longer needed'
      },
      {
        id: 'closures',
        regex: /function\s*\([^)]*\)\s*\{[^}]*\}\s*\([^)]*\)/g,
        title: 'Closures',
        description: 'Closures can retain references to outer scope variables.',
        impact: 'medium',
        recommendation: 'Be mindful of what closures capture; avoid capturing large objects'
      },
      {
        id: 'timers',
        regex: /(setTimeout|setInterval)\s*\(/g,
        title: 'Timers',
        description: 'Timers that are not cleared continue running and retain references.',
        impact: 'high',
        recommendation: 'Always clear timeouts and intervals when no longer needed'
      },
      {
        id: 'caching-large',
        regex: /cache\s*=|new\s+Map\s*\(|new\s+Set\s*\(/g,
        title: 'Caching Data Structures',
        description: 'Caches can grow unbounded if not properly sized or cleared.',
        impact: 'medium',
        recommendation: 'Implement cache size limits and eviction policies (LRU, TTL)'
      },
      {
        id: 'large-objects',
        regex: /JSON\.stringify/g,
        title: 'Large Object Serialization',
        description: 'JSON.stringify on large objects is memory intensive.',
        impact: 'low',
        recommendation: 'Avoid serializing large objects repeatedly; consider streaming'
      },
      {
        id: 'object-assign',
        regex: /Object\.assign/g,
        title: 'Object.assign Usage',
        description: 'Object.assign creates copies of objects, using additional memory.',
        impact: 'low',
        recommendation: 'Consider using spread operator or destructuring for simple cases'
      },
      {
        id: 'promises-unhandled',
        regex: /async function\s+\w+\s*\([^)]*\)\s*\{[^}]*(Promise\.all|Promise\.race)/g,
        title: 'Promise Concurrency',
        description: 'Promise.all can cause memory spikes with large concurrent operations.',
        impact: 'medium',
        recommendation: 'Limit concurrency with batching or use p-limit'
      }
    ];

    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        try {
          if (pattern.regex.test(line)) {
            issues.push({
              file: target,
              line: index + 1,
              ...pattern
            });
          }
        } catch (e) {
          // Skip regex errors
        }
      });
    });

    return {
      file: target,
      issues,
      count: issues.length,
      summary: {
        high: issues.filter(i => i.impact === 'high').length,
        medium: issues.filter(i => i.impact === 'medium').length,
        low: issues.filter(i => i.impact === 'low').length
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Generate memory analysis report
 */
function generateReport(result, options) {
  const { format, detailed } = options;

  if (format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  let report = 'Memory Analysis Report\n';
  report += '='.repeat(50) + '\n\n';

  if (result.error) {
    report += `Error: ${result.error}\n`;
    return report;
  }

  report += `File: ${result.file}\n`;
  report += `Total issues: ${result.count}\n\n`;

  report += 'Summary by Impact:\n';
  report += '-'.repeat(30) + '\n';
  report += `  High:   ${result.summary.high}\n`;
  report += `  Medium: ${result.summary.medium}\n`;
  report += `  Low:    ${result.summary.low}\n\n`;

  if (result.count === 0) {
    report += 'No memory issues detected.\n';
    return report;
  }

  // Group by type
  const grouped = result.issues.reduce((acc, issue) => {
    if (!acc[issue.title]) acc[issue.title] = [];
    acc[issue.title].push(issue);
    return acc;
  }, {});

  report += 'Issues by Category:\n';
  report += '-'.repeat(50) + '\n\n';

  for (const [title, categoryIssues] of Object.entries(grouped)) {
    report += `${title}: ${categoryIssues.length} occurrence(s)\n`;

    if (detailed) {
      categoryIssues.forEach(issue => {
        report += `  Line ${issue.line}: ${issue.description}\n`;
        report += `    Recommendation: ${issue.recommendation}\n\n`;
      });
    }
  }

  // Best practices section
  report += '\nMemory Best Practices:\n';
  report += '-'.repeat(50) + '\n';
  report += '1. Use WeakMap/WeakSet for object keys when appropriate\n';
  report += '2. Clean up event listeners when components unmount\n';
  report += '3. Clear timeouts and intervals before removal\n';
  report += '4. Implement cache size limits with eviction policies\n';
  report += '5. Use const for objects that should not be reassigned\n';
  report += '6. Break closures to release captured references\n';
  report += '7. Profile memory usage with Chrome DevTools Memory panel\n';
  report += '8. Use Chrome Memory API for heap snapshots\n';

  return report;
}

/**
 * Write report to file or stdout
 */
function writeReport(report, outputPath) {
  if (outputPath) {
    try {
      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(outputPath, report, 'utf-8');
      return { success: true, path: outputPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  process.stdout.write(report);
  return { success: true, path: 'stdout' };
}

/**
 * Main entry point
 */
function main() {
  const options = parseArgs();

  const result = analyzeMemory(options.target);
  const report = generateReport(result, options);

  // Write report
  const writeResult = writeReport(report, options.output);

  if (!writeResult.success) {
    process.stderr.write(`Error writing report: ${writeResult.error}\n`);
    process.exit(1);
  }

  if (options.output) {
    process.stderr.write(`Report saved to: ${writeResult.path}\n`);
  }
}

main();