#!/usr/bin/env node

/**
 * Bundle Size Analyzer - Compare Bundles Script
 * 
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Bundle size analysis and tree-shaking detection plugin
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Compares bundle sizes across builds or commits.
 * @param {string[]} args - Command line arguments
 */
async function compareBundles(args) {
  const parsedArgs = parseArgs(args);
  const baseRef = parsedArgs._[0] || 'main';
  const commits = parsedArgs.commits || 1;
  const format = parsedArgs.format || 'text';
  const output = parsedArgs.output;
  const threshold = parsedArgs.threshold || 0;
  
  try {
    const comparison = await performComparison(baseRef, commits, threshold);
    const report = formatReport(comparison, format);
    
    if (output) {
      fs.writeFileSync(output, report);
      console.log(`Report written to: ${output}`);
    } else {
      console.log(report);
    }
  } catch (error) {
    console.error(`Error comparing bundles: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Parses command line arguments.
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs(args) {
  const parsed = { _: [] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('-')) {
        parsed[key] = nextArg;
        i++;
      } else {
        parsed[key] = true;
      }
    } else {
      parsed._.push(arg);
    }
  }
  
  return parsed;
}

/**
 * Performs bundle comparison.
 * @param {string} baseRef - Base reference (commit, branch, tag)
 * @param {number} commits - Number of commits to compare
 * @param {number} threshold - Size change threshold percentage
 * @returns {Object} Comparison results
 */
async function performComparison(baseRef, commits, threshold) {
  const currentCommit = getCurrentCommit();
  const currentSize = getBundleSize();
  const baseSize = getBundleSizeAtRef(baseRef);
  
  const changeBytes = currentSize - baseSize;
  const changePercent = baseSize > 0 ? (changeBytes / baseSize) * 100 : 0;
  
  const results = {
    baseRef,
    currentCommit,
    baseSize,
    currentSize,
    changeBytes,
    changePercent,
    threshold,
    exceedsThreshold: Math.abs(changePercent) >= threshold,
    timestamp: new Date().toISOString()
  };
  
  return results;
}

/**
 * Gets the current git commit hash.
 * @returns {string} Current commit hash
 */
function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Gets bundle size at a specific git reference.
 * @param {string} ref - Git reference
 * @returns {number} Bundle size in bytes
 */
function getBundleSizeAtRef(ref) {
  try {
    // Stash current changes
    execSync('git stash push -u -m "bundle-analyzer-temp"', { encoding: 'utf8' });
    
    // Checkout to reference
    execSync(`git checkout ${ref}`, { encoding: 'utf8' });
    
    // Build and get size
    const size = getBundleSize();
    
    // Return to original branch
    execSync('git checkout -', { encoding: 'utf8' });
    execSync('git stash pop', { encoding: 'utf8' });
    
    return size;
  } catch (error) {
    console.warn(`Warning: Could not get bundle size at ref "${ref}": ${error.message}`);
    return 0;
  }
}

/**
 * Gets the current bundle size.
 * @returns {number} Bundle size in bytes
 */
function getBundleSize() {
  let totalSize = 0;
  
  const distPath = 'dist';
  if (fs.existsSync(distPath) && fs.statSync(distPath).isDirectory()) {
    const files = fs.readdirSync(distPath).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
    
    for (const file of files) {
      const filePath = path.join(distPath, file);
      if (fs.existsSync(filePath)) {
        totalSize += fs.statSync(filePath).size;
      }
    }
  }
  
  return totalSize;
}

/**
 * Formats comparison report based on specified format.
 * @param {Object} comparison - Comparison results
 * @param {string} format - Output format (text, json, html)
 * @returns {string} Formatted report
 */
function formatReport(comparison, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(comparison, null, 2);
    
    case 'html':
      return generateHtmlReport(comparison);
    
    case 'text':
    default:
      return generateTextReport(comparison);
  }
}

/**
 * Generates text format report.
 * @param {Object} comparison - Comparison results
 * @returns {string} Text report
 */
function generateTextReport(comparison) {
  const changeSign = comparison.changeBytes >= 0 ? '+' : '';
  const changeIndicator = comparison.changeBytes >= 0 ? '↑' : '↓';
  
  let report = '\n=== Bundle Size Comparison ===\n\n';
  report += `Base Reference: ${comparison.baseRef}\n`;
  report += `Current Commit: ${comparison.currentCommit}\n`;
  report += `Base Size: ${formatBytes(comparison.baseSize)}\n`;
  report += `Current Size: ${formatBytes(comparison.currentSize)}\n`;
  report += `Change: ${changeSign}${formatBytes(comparison.changeBytes)} (${changeSign}${comparison.changePercent.toFixed(2)}%) ${changeIndicator}\n`;
  report += `Threshold: ${comparison.threshold}%\n`;
  report += `Exceeds Threshold: ${comparison.exceedsThreshold ? 'YES' : 'NO'}\n`;
  report += `Timestamp: ${comparison.timestamp}\n`;
  
  if (comparison.exceedsThreshold) {
    report += '\n⚠️  WARNING: Bundle size change exceeds threshold!\n';
  }
  
  return report;
}

/**
 * Generates HTML format report.
 * @param {Object} comparison - Comparison results
 * @returns {string} HTML report
 */
function generateHtmlReport(comparison) {
  const changeColor = comparison.changeBytes >= 0 ? '#d32f2f' : '#388e3c';
  const changeSign = comparison.changeBytes >= 0 ? '+' : '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bundle Size Comparison</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .change { color: ${changeColor}; font-weight: bold; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Bundle Size Comparison</h1>
  <div class="summary">
    <p><strong>Base Reference:</strong> ${comparison.baseRef}</p>
    <p><strong>Current Commit:</strong> ${comparison.currentCommit}</p>
    <p><strong>Base Size:</strong> ${formatBytes(comparison.baseSize)}</p>
    <p><strong>Current Size:</strong> ${formatBytes(comparison.currentSize)}</p>
    <p><strong>Change:</strong> <span class="change">${changeSign}${formatBytes(comparison.changeBytes)} (${changeSign}${comparison.changePercent.toFixed(2)}%)</span></p>
    <p><strong>Threshold:</strong> ${comparison.threshold}%</p>
  </div>
  ${comparison.exceedsThreshold ? '<div class="warning">⚠️ WARNING: Bundle size change exceeds threshold!</div>' : ''}
</body>
</html>`;
}

/**
 * Formats bytes to human readable string.
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main execution
const args = process.argv.slice(2);
compareBundles(args).catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});