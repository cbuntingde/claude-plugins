#!/usr/bin/env node

/**
 * Bundle Size Analyzer - Analyze Bundle Script
 * 
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Bundle size analysis and tree-shaking detection plugin
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Analyzes bundle size and composition.
 * @param {string[]} args - Command line arguments
 */
async function analyzeBundle(args) {
  const parsedArgs = parseArgs(args);
  const bundlePath = parsedArgs._[0] || 'dist';
  const format = parsedArgs.format || 'text';
  const output = parsedArgs.output;
  
  // Validate bundle path
  if (!fs.existsSync(bundlePath)) {
    console.error(`Error: Bundle path "${bundlePath}" does not exist.`);
    process.exit(1);
  }
  
  try {
    const analysis = await performAnalysis(bundlePath);
    const report = formatReport(analysis, format);
    
    if (output) {
      fs.writeFileSync(output, report);
      console.log(`Report written to: ${output}`);
    } else {
      console.log(report);
    }
  } catch (error) {
    console.error(`Error analyzing bundle: ${error.message}`);
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
 * Performs bundle analysis.
 * @param {string} bundlePath - Path to bundle file or directory
 * @returns {Object} Analysis results
 */
async function performAnalysis(bundlePath) {
  const stats = fs.statSync(bundlePath);
  const results = {
    path: bundlePath,
    size: 0,
    files: [],
    modules: [],
    timestamp: new Date().toISOString()
  };
  
  if (stats.isDirectory()) {
    // Analyze directory of bundles
    const files = fs.readdirSync(bundlePath).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
    
    for (const file of files) {
      const filePath = path.join(bundlePath, file);
      const fileStats = fs.statSync(filePath);
      results.size += fileStats.size;
      results.files.push({
        name: file,
        size: fileStats.size,
        sizeFormatted: formatBytes(fileStats.size)
      });
    }
  } else if (stats.isFile() && (bundlePath.endsWith('.js') || bundlePath.endsWith('.mjs'))) {
    // Analyze single bundle file
    results.size = stats.size;
    results.files.push({
      name: path.basename(bundlePath),
      size: stats.size,
      sizeFormatted: formatBytes(stats.size)
    });
  }
  
  return results;
}

/**
 * Formats analysis report based on specified format.
 * @param {Object} analysis - Analysis results
 * @param {string} format - Output format (text, json, html)
 * @returns {string} Formatted report
 */
function formatReport(analysis, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(analysis, null, 2);
    
    case 'html':
      return generateHtmlReport(analysis);
    
    case 'text':
    default:
      return generateTextReport(analysis);
  }
}

/**
 * Generates text format report.
 * @param {Object} analysis - Analysis results
 * @returns {string} Text report
 */
function generateTextReport(analysis) {
  let report = '\n=== Bundle Size Analysis ===\n\n';
  report += `Bundle Path: ${analysis.path}\n`;
  report += `Total Size: ${formatBytes(analysis.size)}\n`;
  report += `Timestamp: ${analysis.timestamp}\n\n`;
  
  report += '--- File Breakdown ---\n';
  for (const file of analysis.files) {
    report += `${file.name}: ${file.sizeFormatted}\n`;
  }
  
  return report;
}

/**
 * Generates HTML format report.
 * @param {Object} analysis - Analysis results
 * @returns {string} HTML report
 */
function generateHtmlReport(analysis) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bundle Size Analysis</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .file-list { border-collapse: collapse; width: 100%; }
    .file-list th, .file-list td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .file-list th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Bundle Size Analysis</h1>
  <div class="summary">
    <p><strong>Bundle Path:</strong> ${analysis.path}</p>
    <p><strong>Total Size:</strong> ${formatBytes(analysis.size)}</p>
    <p><strong>Timestamp:</strong> ${analysis.timestamp}</p>
  </div>
  <table class="file-list">
    <thead>
      <tr>
        <th>File</th>
        <th>Size</th>
      </tr>
    </thead>
    <tbody>
      ${analysis.files.map(f => `<tr><td>${f.name}</td><td>${f.sizeFormatted}</td></tr>`).join('')}
    </tbody>
  </table>
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
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main execution
const args = process.argv.slice(2);
analyzeBundle(args).catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});