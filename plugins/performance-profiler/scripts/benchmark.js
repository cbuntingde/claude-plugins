#!/usr/bin/env node
/**
 * Benchmark Command
 * Runs comparative benchmarks for code performance measurement
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const result = {
    target: '.',
    iterations: 100,
    warmup: 10,
    output: null
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--iterations' && args[i + 1]) {
      result.iterations = parseInt(args[i + 1], 10);
      i += 2;
    } else if (arg === '--warmup' && args[i + 1]) {
      result.warmup = parseInt(args[i + 1], 10);
      i += 2;
    } else if (arg === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i += 2;
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
 * Run benchmark for a JavaScript/TypeScript file
 */
async function runBenchmark(target, iterations, warmup) {
  if (!existsSync(target)) {
    return { error: `Target not found: ${target}` };
  }

  try {
    const startMemory = process.memoryUsage();
    const timings = [];

    // Run warmup iterations
    for (let i = 0; i < warmup; i++) {
      try {
        await import(`file://${join(process.cwd(), target)}`);
      } catch {
        // File may not be executable, skip warmup
      }
    }

    // Run actual benchmark iterations
    for (let i = 0; i < iterations; i++) {
      const iterStart = Date.now();
      try {
        await import(`file://${join(process.cwd(), target)}`);
      } catch {
        // File may not be executable, measure file read instead
        readFileSync(target, 'utf-8');
      }
      timings.push(Date.now() - iterStart);
    }

    const endMemory = process.memoryUsage();

    // Calculate statistics
    timings.sort((a, b) => a - b);
    const sum = timings.reduce((a, b) => a + b, 0);
    const mean = sum / timings.length;
    const median = timings[Math.floor(timings.length / 2)];
    const min = timings[0];
    const max = timings[timings.length - 1];
    const variance = timings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / timings.length;
    const stdDev = Math.sqrt(variance);
    const p95 = timings[Math.floor(timings.length * 0.95)];
    const p99 = timings[Math.floor(timings.length * 0.99)];

    return {
      target,
      iterations,
      warmup,
      results: {
        mean,
        median,
        min,
        max,
        stdDev,
        p95,
        p99
      },
      estimatedOperationsPerSecond: mean > 0 ? Math.floor(1000 / mean) : 0,
      memoryUsage: {
        initial: startMemory.heapUsed,
        peak: endMemory.heapUsed
      }
    };
  } catch (error) {
    return { error: `Benchmark failed: ${error.message}` };
  }
}

/**
 * Generate benchmark report
 */
function generateReport(result, options) {
  const { format, iterations, warmup } = options;

  if (format === 'json') {
    return JSON.stringify({
      benchmark: result,
      config: { iterations, warmup },
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  let report = 'Benchmark Results\n';
  report += '='.repeat(50) + '\n\n';

  if (result.error) {
    report += `Error: ${result.error}\n`;
    return report;
  }

  report += `Target: ${result.target}\n`;
  report += `Iterations: ${iterations} (${warmup} warmup)\n\n`;

  report += 'Timing Results:\n';
  report += '-'.repeat(30) + '\n';
  report += `  Mean:     ${result.results.mean.toFixed(4)}ms\n`;
  report += `  Median:   ${result.results.median.toFixed(4)}ms\n`;
  report += `  Min:      ${result.results.min.toFixed(4)}ms\n`;
  report += `  Max:      ${result.results.max.toFixed(4)}ms\n`;
  report += `  Std Dev:  ${result.results.stdDev.toFixed(4)}ms\n`;
  report += `  P95:      ${result.results.p95.toFixed(4)}ms\n`;
  report += `  P99:      ${result.results.p99.toFixed(4)}ms\n\n`;

  report += 'Throughput:\n';
  report += '-'.repeat(30) + '\n';
  report += `  ~${(result.estimatedOperationsPerSecond / 1000).toFixed(0)}K ops/sec\n\n`;

  report += 'Memory:\n';
  report += '-'.repeat(30) + '\n';
  report += `  Initial:  ${(result.memoryUsage.initial / 1024 / 1024).toFixed(1)}MB\n`;
  report += `  Peak:     ${(result.memoryUsage.peak / 1024 / 1024).toFixed(1)}MB\n`;

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
async function main() {
  const options = parseArgs();

  const result = await runBenchmark(options.target, options.iterations, options.warmup);
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