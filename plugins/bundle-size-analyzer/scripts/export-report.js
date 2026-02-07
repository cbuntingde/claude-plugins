#!/usr/bin/env node

/**
 * Bundle Size Analyzer - Export Report Script
 * 
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * Bundle size analysis and tree-shaking detection plugin
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Generates detailed analysis reports.
 * @param {string[]} args - Command line arguments
 */
async function exportReport(args) {
  const parsedArgs = parseArgs(args);
  const format = parsedArgs.format || 'html';
  const template = parsedArgs.template || 'full';
  const output = parsedArgs.output;
  const bundlePath = parsedArgs.bundle || 'dist';
  
  if (!output) {
    console.error('Error: Output file path is required (--output)');
    process.exit(1);
  }
  
  try {
    const analysis = await performAnalysis(bundlePath);
    const report = generateReport(analysis, format, template);
    
    fs.writeFileSync(output, report);
    console.log(`Report exported to: ${output}`);
  } catch (error) {
    console.error(`Error exporting report: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Parses command line arguments.
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs(args) {
  const parsed = {};
  
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
  const results = {
    path: bundlePath,
    files: [],
    totalSize: 0,
    timestamp: new Date().toISOString()
  };
  
  if (fs.existsSync(bundlePath)) {
    const stats = fs.statSync(bundlePath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(bundlePath).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
      
      for (const file of files) {
        const filePath = path.join(bundlePath, file);
        const fileStats = fs.statSync(filePath);
        results.totalSize += fileStats.size;
        results.files.push({
          name: file,
          size: fileStats.size,
          sizeFormatted: formatBytes(fileStats.size)
        });
      }
    } else if (stats.isFile()) {
      results.totalSize = stats.size;
      results.files.push({
        name: path.basename(bundlePath),
        size: stats.size,
        sizeFormatted: formatBytes(stats.size)
      });
    }
  }
  
  return results;
}

/**
 * Generates report in specified format and template.
 * @param {Object} analysis - Analysis results
 * @param {string} format - Output format (html, json, csv)
 * @param {string} template - Report template (full, executive)
 * @returns {string} Generated report
 */
function generateReport(analysis, format, template) {
  switch (format) {
    case 'json':
      return JSON.stringify(analysis, null, 2);
    
    case 'csv':
      return generateCsvReport(analysis);
    
    case 'html':
    default:
      return generateHtmlReport(analysis, template);
  }
}

/**
 * Generates CSV format report.
 * @param {Object} analysis - Analysis results
 * @returns {string} CSV report
 */
function generateCsvReport(analysis) {
  let csv = 'File,Size (Bytes),Size (Formatted)\n';
  
  for (const file of analysis.files) {
    csv += `${file.name},${file.size},${file.sizeFormatted}\n`;
  }
  
  csv += `\nTotal,,${analysis.totalSize}\n`;
  csv += `Timestamp,,${analysis.timestamp}\n`;
  
  return csv;
}

/**
 * Generates HTML format report.
 * @param {Object} analysis - Analysis results
 * @param {string} template - Report template (full, executive)
 * @returns {string} HTML report
 */
function generateHtmlReport(analysis, template) {
  const summarySection = `
    <div class="summary">
      <h2>Summary</h2>
      <table>
        <tr><td><strong>Bundle Path:</strong></td><td>${analysis.path}</td></tr>
        <tr><td><strong>Total Size:</strong></td><td>${formatBytes(analysis.totalSize)}</td></tr>
        <tr><td><strong>File Count:</strong></td><td>${analysis.files.length}</td></tr>
        <tr><td><strong>Timestamp:</strong></td><td>${analysis.timestamp}</td></tr>
      </table>
    </div>
  `;
  
  const fileSection = `
    <h2>File Breakdown</h2>
    <table class="file-table">
      <thead>
        <tr><th>File</th><th>Size</th><th>% of Total</th></tr>
      </thead>
      <tbody>
        ${analysis.files.map(f => `
          <tr>
            <td>${f.name}</td>
            <td>${f.sizeFormatted}</td>
            <td>${((f.size / analysis.totalSize) * 100).toFixed(2)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  const recommendationsSection = template === 'full' ? `
    <h2>Recommendations</h2>
    <ul>
      ${generateRecommendations(analysis)}
    </ul>
  ` : '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bundle Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; max-width: 1200px; }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary table { width: 100%; }
    .summary td { padding: 8px; }
    .file-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .file-table th, .file-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .file-table th { background: #f8f9fa; }
    .file-table tr:hover { background: #f5f5f5; }
    ul { line-height: 1.8; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <h1>📦 Bundle Size Analysis Report</h1>
  ${summarySection}
  ${fileSection}
  ${recommendationsSection}
  <div class="footer">
    <p>Generated by Bundle Size Analyzer Plugin</p>
    <p>Timestamp: ${analysis.timestamp}</p>
  </div>
</body>
</html>`;
}

/**
 * Generates optimization recommendations based on analysis.
 * @param {Object} analysis - Analysis results
 * @returns {string[]} Array of recommendation strings
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Check for large files
  const largeFiles = analysis.files.filter(f => f.size > 500 * 1024); // > 500KB
  if (largeFiles.length > 0) {
    recommendations.push(`Consider splitting large files (${largeFiles.map(f => f.name).join(', ')}) into smaller chunks for lazy loading.`);
  }
  
  // Check for total size
  if (analysis.totalSize > 1024 * 1024) { // > 1MB
    recommendations.push('Total bundle size exceeds 1MB. Consider implementing code splitting and lazy loading for non-critical features.');
  }
  
  // Check for many small files
  if (analysis.files.length > 20) {
    recommendations.push('Consider bundling smaller files together to reduce HTTP request overhead.');
  }
  
  // General recommendations
  recommendations.push('Enable tree-shaking in your bundler configuration by setting "sideEffects": false in package.json.');
  recommendations.push('Use dynamic imports (import()) for code that is not needed on initial load.');
  recommendations.push('Consider using lighter alternatives for large dependencies (e.g., lodash-es instead of lodash).');
  
  return recommendations;
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
exportReport(args).catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});