#!/usr/bin/env node

/**
 * Tech Debt Tracker - Debt Report Script
 *
 * Generates technical debt reports
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Get debt storage path
 * @returns {string} Storage path
 */
function getDebtStoragePath() {
  return path.join(__dirname, '..', '.claude', 'debt-tracker.json');
}

/**
 * Get or create debt storage
 * @returns {object} Debt storage data
 */
function getDebtStorage() {
  const storagePath = getDebtStoragePath();
  try {
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Storage file doesn't exist or is corrupt
  }
  return { issues: [], resolved: [], lastScan: null };
}

/**
 * Estimate effort for an issue
 * @param {object} issue - Issue object
 * @returns {number} Estimated hours
 */
function estimateEffort(issue) {
  const baseEffort = {
    complexity: 4,
    duplication: 6,
    naming: 1,
    security: 3,
    testing: 5
  };

  const category = issue.category || 'complexity';
  const severityEffort = { high: 2.5, medium: 1.5, low: 1 };

  const base = baseEffort[category] || 3;
  const multiplier = severityEffort[issue.severity] || 1;

  return Math.round(base * multiplier * 10) / 10;
}

/**
 * Format report results
 * @param {object} results - Report results
 * @param {string} sort - Sort criteria
 * @returns {string} Formatted output
 */
function formatReportResults(results, sort) {
  const output = [];

  output.push('\n📈 Technical Debt Report');
  output.push('='.repeat(50));
  output.push(`Period: All time`);
  output.push('');

  // Executive summary
  output.push('🎯 Executive Summary');
  output.push('-'.repeat(50));
  output.push(`Total Debt Score: ${results.totalScore}`);
  output.push(`High Priority: ${results.bySeverity.high} | Medium: ${results.bySeverity.medium} | Low: ${results.bySeverity.low}`);
  output.push(`Estimated Remediation Effort: ${results.estimatedEffortHours} hours`);
  output.push(`Issues Resolved: ${results.resolvedCount}`);
  output.push('');

  // Category breakdown
  output.push('📊 Category Breakdown');
  output.push('-'.repeat(50));

  const categoryOrder = Object.entries(results.byCategory)
    .sort((a, b) => b[1] - a[1]);

  const categoryEmojis = {
    complexity: '🧮',
    duplication: '📋',
    naming: '📝',
    security: '🔒',
    testing: '🧪'
  };

  for (const [category, count] of categoryOrder) {
    const percentage = Math.round((count / results.totalIssues) * 100);
    const emoji = categoryEmojis[category] || '📌';
    output.push(`${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${count} (${percentage}%)`);
  }

  output.push('');

  // File hotspots
  output.push('🔥 File Hotspots (Top 5)');
  output.push('-'.repeat(50));

  const fileEntries = Object.entries(results.byFile)
    .map(([file, issues]) => ({
      file,
      count: issues.length,
      totalScore: issues.reduce((sum, i) => sum + (i.impactScore || 0), 0)
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  for (const entry of fileEntries) {
    output.push(`1. ${path.basename(entry.file)}`);
    output.push(`   Score: ${Math.round(entry.totalScore)} | Issues: ${entry.count}`);
  }

  output.push('');

  // Priority items
  output.push('🎯 Priority Items (Top 10)');
  output.push('-'.repeat(50));

  let sortedIssues;
  switch (sort) {
    case 'severity':
      const severityOrder = { high: 0, medium: 1, low: 2 };
      sortedIssues = [...results.issues].sort((a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity]
      );
      break;
    case 'file':
      sortedIssues = [...results.issues].sort((a, b) =>
        a.file.localeCompare(b.file)
      );
      break;
    case 'impact':
    default:
      sortedIssues = [...results.issues].sort((a, b) =>
        (b.impactScore || 0) - (a.impactScore || 0)
      );
  }

  const severityEmojis = { high: '🔴', medium: '🟡', low: '🟢' };

  for (let i = 0; i < Math.min(10, sortedIssues.length); i++) {
    const issue = sortedIssues[i];
    const severityEmoji = severityEmojis[issue.severity] || '📌';
    output.push(`${severityEmoji} ${issue.id} - ${issue.title}`);
    output.push(`   ${path.basename(issue.file)}:${issue.line}`);
  }

  output.push('');
  output.push(`[Total: ${results.totalIssues} issues across ${Object.keys(results.byFile).length} files]`);

  return output.join('\n');
}

/**
 * Main debt report function
 * @param {string[]} args - Command line arguments
 */
async function debtReport(args) {
  const parsedArgs = parseArgs(args);
  const format = parsedArgs.format || 'text';
  const sort = parsedArgs.sort || 'impact';
  const output = parsedArgs.output;

  const storage = getDebtStorage();
  const openIssues = storage.issues.filter(i => i.status === 'open');

  if (openIssues.length === 0) {
    console.log('No technical debt issues recorded. Run /debt-scan to identify issues.');
    return;
  }

  const results = {
    totalIssues: openIssues.length,
    byCategory: {},
    bySeverity: { high: 0, medium: 0, low: 0 },
    byFile: {},
    issues: openIssues,
    resolvedCount: storage.resolved.length
  };

  // Aggregate by category
  for (const issue of openIssues) {
    const category = issue.category || 'unknown';
    results.byCategory[category] = (results.byCategory[category] || 0) + 1;
    results.bySeverity[issue.severity]++;
  }

  // Aggregate by file
  for (const issue of openIssues) {
    const filePath = issue.file;
    if (!results.byFile[filePath]) {
      results.byFile[filePath] = [];
    }
    results.byFile[filePath].push(issue);
  }

  // Calculate total debt score
  const totalScore = openIssues.reduce((sum, issue) => sum + (issue.impactScore || 0), 0);

  // Calculate estimated effort
  const totalEffort = openIssues.reduce((sum, issue) => sum + estimateEffort(issue), 0);

  results.totalScore = Math.round(totalScore * 10) / 10;
  results.estimatedEffortHours = Math.round(totalEffort * 10) / 10;

  let report;
  if (format === 'json') {
    report = JSON.stringify(results, null, 2);
  } else {
    report = formatReportResults(results, sort);
  }

  if (output) {
    fs.writeFileSync(output, report, 'utf-8');
    console.log(`Report written to: ${output}`);
  } else {
    console.log(report);
  }
}

/**
 * Parse command line arguments
 * @param {string[]} args - Arguments
 * @returns {object} Parsed arguments
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

// Main execution
const args = process.argv.slice(2);
debtReport(args).catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});