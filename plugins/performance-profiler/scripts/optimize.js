#!/usr/bin/env node
/**
 * Optimize Command
 * Analyzes code and provides optimization suggestions
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
    apply: false
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i += 2;
    } else if (arg === '--apply') {
      result.apply = true;
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
 * Analyze code and generate optimization suggestions
 */
function analyzeForOptimizations(target) {
  if (!existsSync(target)) {
    return { error: `Target not found: ${target}` };
  }

  try {
    const content = readFileSync(target, 'utf-8');
    const ext = extname(target);

    const suggestions = [];

    // Check for common optimization opportunities
    const patterns = [
      {
        id: 'nested-loops',
        regex: /for\s*\([^)]*for\s*\(/g,
        title: 'Nested Loops',
        description: 'Nested loops can lead to O(n*m) complexity. Consider reducing nesting or using more efficient algorithms.',
        impact: 'high',
        recommendation: 'Consider using hash maps or breaking down the algorithm'
      },
      {
        id: 'repeated-calls',
        regex: /\.map\s*\([^)]*\)\s*\./g,
        title: 'Chained Array Operations',
        description: 'Multiple chained array operations create intermediate arrays.',
        impact: 'medium',
        recommendation: 'Combine into single pass with reduce or for loop'
      },
      {
        id: 'sync-file',
        regex: /Sync\.(readFile|writeFile|exists)/g,
        title: 'Synchronous File Operations',
        description: 'Synchronous file operations block the event loop.',
        impact: 'high',
        recommendation: 'Use async versions (readFile/writeFile with promises)'
      },
      {
        id: 'missing-cache',
        regex: /JSON\.parse/g,
        title: 'Repeated JSON Parsing',
        description: 'JSON parsing is expensive and should be cached.',
        impact: 'medium',
        recommendation: 'Cache parsed results or use memoization'
      },
      {
        id: 'large-objects',
        regex: /console\.(log|debug)/g,
        title: 'Debug Logging',
        description: 'Debug logging can slow down production code.',
        impact: 'low',
        recommendation: 'Remove or use a proper logging library with levels'
      }
    ];

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        if (pattern.regex.test(line)) {
          suggestions.push({
            file: target,
            line: index + 1,
            ...pattern
          });
        }
      });
    });

    return {
      file: target,
      suggestions,
      count: suggestions.length,
      summary: {
        high: suggestions.filter(s => s.impact === 'high').length,
        medium: suggestions.filter(s => s.impact === 'medium').length,
        low: suggestions.filter(s => s.impact === 'low').length
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Apply optimizations to a file
 */
function applyOptimizations(filePath, suggestions) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const applied = [];

    // Apply optimizations in reverse order to maintain line numbers
    const sortedSuggestions = [...suggestions].sort((a, b) => b.line - a.line);

    sortedSuggestions.forEach((suggestion) => {
      const lineIndex = suggestion.line - 1;
      const line = lines[lineIndex];

      let newLine = line;
      let modified = false;

      switch (suggestion.id) {
        case 'nested-loops':
          // Add comment suggesting optimization
          newLine = line + ' // TODO: Consider using hash maps or breaking down algorithm to reduce O(n*m) complexity';
          modified = true;
          break;
        case 'sync-file':
          // Replace Sync with async version
          newLine = line.replace(/Sync\.(readFile|writeFile|exists)/, '$1');
          modified = true;
          break;
        case 'missing-cache':
          // Add comment for caching
          newLine = line + ' // TODO: Cache this result to avoid repeated parsing';
          modified = true;
          break;
        case 'large-objects':
          // Comment out debug logging
          if (line.trim().startsWith('console.')) {
            newLine = '// ' + line + ' // Disabled: Debug logging slows production code';
            modified = true;
          }
          break;
      }

      if (modified) {
        lines[lineIndex] = newLine;
        applied.push(suggestion);
      }
    });

    // Create backup
    const backupPath = filePath + '.backup';
    writeFileSync(backupPath, content, 'utf-8');

    // Write optimized content
    writeFileSync(filePath, lines.join('\n'), 'utf-8');

    return {
      success: true,
      backup: backupPath,
      applied: applied.length,
      total: suggestions.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate optimization report
 */
function generateReport(result, options) {
  const { format, apply } = options;

  if (apply && result.suggestions && result.suggestions.length > 0) {
    const applyResult = applyOptimizations(result.file, result.suggestions);
    if (format === 'json') {
      return JSON.stringify({ result, applyResult }, null, 2);
    }
    let report = 'Optimization Applied\n';
    report += '='.repeat(50) + '\n\n';
    report += `File: ${result.file}\n`;
    report += `Applied: ${applyResult.applied}/${result.count} suggestions\n`;
    if (applyResult.backup) {
      report += `Backup: ${applyResult.backup}\n`;
    }
    report += '\nSuggestions applied:\n';
    result.suggestions.forEach((suggestion, i) => {
      report += `${i + 1}. ${suggestion.title} (line ${suggestion.line})\n`;
    });
    return report;
  }

  if (format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  let report = 'Optimization Suggestions\n';
  report += '='.repeat(50) + '\n\n';

  if (result.error) {
    report += `Error: ${result.error}\n`;
    return report;
  }

  report += `File: ${result.file}\n`;
  report += `Total suggestions: ${result.count}\n\n`;

  report += 'Summary by Impact:\n';
  report += '-'.repeat(30) + '\n';
  report += `  High:   ${result.summary.high}\n`;
  report += `  Medium: ${result.summary.medium}\n`;
  report += `  Low:    ${result.summary.low}\n\n`;

  if (result.count === 0) {
    report += 'No optimization opportunities found.\n';
    return report;
  }

  report += 'Detailed Suggestions:\n';
  report += '-'.repeat(30) + '\n\n';

  result.suggestions.forEach((suggestion, i) => {
    report += `${i + 1}. [${suggestion.impact.toUpperCase()}] ${suggestion.title}\n`;
    report += `   Line ${suggestion.line}: ${suggestion.description}\n`;
    report += `   Recommendation: ${suggestion.recommendation}\n\n`;
  });

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

  const result = analyzeForOptimizations(options.target);
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