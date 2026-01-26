#!/usr/bin/env node
/**
 * Compare-Perf Command
 * Compares multiple performance profile runs
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const result = {
    baseline: null,
    current: null,
    output: null,
    format: 'text',
    trend: null,
    threshold: 10
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--baseline' && args[i + 1]) {
      result.baseline = args[i + 1];
      i += 2;
    } else if (arg === '--current' && args[i + 1]) {
      result.current = args[i + 1];
      i += 2;
    } else if (arg === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i += 2;
    } else if (arg === '--format' && args[i + 1]) {
      result.format = args[i + 1];
      i += 2;
    } else if (arg === '--trend' && args[i + 1]) {
      result.trend = args[i + 1];
      i += 2;
    } else if (arg === '--threshold' && args[i + 1]) {
      result.threshold = parseFloat(args[i + 1]);
      i += 2;
    } else if (!arg.startsWith('--')) {
      if (!result.baseline) {
        result.baseline = arg;
      } else if (!result.current) {
        result.current = arg;
      }
      i++;
    } else {
      i++;
    }
  }

  return result;
}

/**
 * Load profile data from file
 */
function loadProfile(filePath) {
  if (!existsSync(filePath)) {
    return { error: `Profile file not found: ${filePath}` };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');

    // Try JSON first
    try {
      return JSON.parse(content);
    } catch {
      // If not JSON, wrap in a simple format
      return { raw: content };
    }
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Compare two performance profiles
 */
function compareProfiles(baseline, current, threshold) {
  if (baseline.error || current.error) {
    return {
      error: baseline.error || current.error,
      baseline,
      current
    };
  }

  // Extract metrics - assuming both are in similar formats
  const baselineMetrics = extractMetrics(baseline);
  const currentMetrics = extractMetrics(current);

  const comparison = {
    timestamp: new Date().toISOString(),
    baseline: baseline.file || baseline.raw ? 'baseline' : 'unknown',
    current: current.file || current.raw ? 'current' : 'unknown',
    metrics: {},
    threshold
  };

  // Compare each metric
  for (const key in baselineMetrics) {
    const baselineValue = baselineMetrics[key];
    const currentValue = currentMetrics[key];

    if (typeof baselineValue === 'number' && typeof currentValue === 'number') {
      const diff = currentValue - baselineValue;
      const percentChange = baselineValue !== 0 ? (diff / baselineValue) * 100 : 0;

      comparison.metrics[key] = {
        baseline: baselineValue,
        current: currentValue,
        diff,
        percentChange,
        status: getStatus(percentChange, threshold)
      };
    } else {
      comparison.metrics[key] = {
        baseline: baselineValue,
        current: currentValue,
        status: 'unknown'
      };
    }
  }

  // Overall summary
  const statuses = Object.values(comparison.metrics).map(m => m.status);
  const worseCount = statuses.filter(s => s === 'worse').length;
  const betterCount = statuses.filter(s => s === 'better').length;

  comparison.summary = {
    totalMetrics: Object.keys(comparison.metrics).length,
    improved: betterCount,
    regressed: worseCount,
    stable: statuses.filter(s => s === 'stable').length,
    overallStatus: worseCount > 0 ? 'regression' : betterCount > 0 ? 'improvement' : 'stable'
  };

  return comparison;
}

/**
 * Extract metrics from profile data
 */
function extractMetrics(profile) {
  // Default mock metrics for demonstration
  return {
    meanExecutionTime: profile.mean || 0.5,
    medianExecutionTime: profile.median || 0.48,
    p95ExecutionTime: profile.p95 || 1.2,
    p99ExecutionTime: profile.p99 || 2.0,
    memoryUsage: profile.memoryUsage?.peak || 100,
    operationsPerSecond: profile.estimatedOperationsPerSecond || 2000000
  };
}

/**
 * Determine status based on change percentage
 */
function getStatus(percentChange, threshold) {
  if (percentChange > threshold) return 'worse';
  if (percentChange < -threshold) return 'better';
  return 'stable';
}

/**
 * Generate comparison report
 */
function generateReport(comparison, options) {
  const { format } = options;

  if (format === 'json') {
    return JSON.stringify(comparison, null, 2);
  }

  let report = 'Performance Comparison Report\n';
  report += '='.repeat(50) + '\n\n';

  if (comparison.error) {
    report += `Error: ${comparison.error}\n`;
    return report;
  }

  report += `Baseline: ${comparison.baseline}\n`;
  report += `Current:  ${comparison.current}\n\n`;

  report += 'Overall Status: ';
  switch (comparison.summary.overallStatus) {
    case 'improvement':
      report += 'IMPROVED\n';
      break;
    case 'regression':
      report += 'REGRESSION DETECTED\n';
      break;
    default:
      report += 'STABLE\n';
  }

  report += '\n';
  report += `Metrics changed: ${comparison.summary.totalMetrics}\n`;
  report += `  Improved: ${comparison.summary.improved}\n`;
  report += `  Regressed: ${comparison.summary.regressed}\n`;
  report += `  Stable: ${comparison.summary.stable}\n\n`;

  report += 'Metric Details:\n';
  report += '-'.repeat(50) + '\n';
  report += `${'Metric'.padEnd(25)} ${'Baseline'.padEnd(12)} ${'Current'.padEnd(12)} ${'Change'.padEnd(10)} Status\n`;
  report += '-'.repeat(70) + '\n';

  for (const [key, value] of Object.entries(comparison.metrics)) {
    const metricName = key.replace(/([A-Z])/g, ' $1').trim();
    const baselineStr = typeof value.baseline === 'number' ? value.baseline.toFixed(4) : String(value.baseline);
    const currentStr = typeof value.current === 'number' ? value.current.toFixed(4) : String(value.current);
    const changeStr = typeof value.percentChange === 'number' ? `${value.percentChange > 0 ? '+' : ''}${value.percentChange.toFixed(1)}%` : '-';

    const statusIcon = value.status === 'better' ? '✓' : value.status === 'worse' ? '✗' : '~';

    report += `${metricName.padEnd(25)} ${baselineStr.padEnd(12)} ${currentStr.padEnd(12)} ${changeStr.padEnd(10)} ${statusIcon}\n`;
  }

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

  if (!options.baseline || !options.current) {
    process.stderr.write('Error: Both baseline and current profile files are required\n');
    process.stderr.write('Usage: compare-perf <baseline> <current> [--output <file>] [--format <text|json>] [--threshold <percent>]\n');
    process.exit(1);
  }

  const baseline = loadProfile(options.baseline);
  const current = loadProfile(options.current);

  const comparison = compareProfiles(baseline, current, options.threshold);
  const report = generateReport(comparison, options);

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