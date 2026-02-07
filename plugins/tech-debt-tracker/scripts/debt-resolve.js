#!/usr/bin/env node

/**
 * Tech Debt Tracker - Debt Resolve Script
 *
 * Marks technical debt issues as resolved
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
 * Save debt storage
 * @param {object} storage - Storage data to save
 */
function saveDebtStorage(storage) {
  const storagePath = getDebtStoragePath();
  try {
    const storageDir = path.dirname(storagePath);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2));
  } catch (error) {
    throw new Error(`Failed to save debt storage: ${error.message}`);
  }
}

/**
 * Validate issue ID format
 * @param {string} issueId - Issue ID to validate
 * @returns {boolean} True if valid
 */
function isValidIssueId(issueId) {
  return /^TD-\d{3}$/.test(issueId);
}

/**
 * Find issue by ID
 * @param {string} issueId - Issue ID to find
 * @returns {object|null} Issue or null
 */
function findIssueById(issueId) {
  const storage = getDebtStorage();
  return storage.issues.find(i => i.id === issueId) || null;
}

/**
 * Format resolve result
 * @param {object} issue - Resolved issue
 * @param {object} storage - Updated storage
 * @returns {string} Formatted output
 */
function formatResolveResult(issue, storage) {
  const resolutionEmojis = {
    fixed: '🔧',
    refactored: '✨',
    documented: '📝',
    deferred: '⏳',
    'false-positive': '✅'
  };

  const output = [];

  output.push('\n✅ Debt Issue Resolved');
  output.push('='.repeat(50));
  output.push(`Issue: ${issue.id} - ${issue.title}`);
  output.push(`Resolution: ${resolutionEmojis[issue.resolution]} ${issue.resolution}`);
  output.push(`Date: ${new Date().toISOString().split('T')[0]}`);
  output.push('');

  if (issue.resolutionNotes) {
    output.push(`Notes: ${issue.resolutionNotes}`);
    output.push('');
  }

  if (issue.resolutionLink) {
    output.push(`Link: ${issue.resolutionLink}`);
    output.push('');
  }

  // Resolution metrics
  const resolvedCount = storage.resolved.length;
  const recentResolved = storage.resolved.filter(r => {
    const resolvedDate = new Date(r.resolvedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return resolvedDate >= weekAgo;
  }).length;

  output.push('📊 Resolution Metrics');
  output.push('-'.repeat(50));
  output.push(`Total Resolved: ${resolvedCount}`);
  output.push(`This Week: ${recentResolved}`);

  // Resolution type breakdown
  const byType = {};
  for (const r of storage.resolved) {
    byType[r.resolution] = (byType[r.resolution] || 0) + 1;
  }

  if (Object.keys(byType).length > 0) {
    output.push('By Type:');
    for (const [type, count] of Object.entries(byType)) {
      const emoji = resolutionEmojis[type] || '📌';
      output.push(`  ${emoji} ${type}: ${count} (${Math.round(count / resolvedCount * 100)}%)`);
    }
  }

  output.push('');

  return output.join('\n');
}

/**
 * Main debt resolve function
 * @param {string[]} args - Command line arguments
 */
async function debtResolve(args) {
  const parsedArgs = parseArgs(args);
  const issueId = parsedArgs.issueId || parsedArgs._[0];
  const resolution = parsedArgs.resolution || 'fixed';
  const notes = parsedArgs.notes || '';
  const link = parsedArgs.link || '';

  // Validate issue ID
  if (!issueId || !isValidIssueId(issueId)) {
    console.log('Error: Invalid issue ID. Use format: TD-001, TD-002, etc.');
    console.log('\nUsage: node debt-resolve.js <issue-id> [options]');
    console.log('Options:');
    console.log('  --resolution=<type>  Resolution type (fixed, refactored, documented, deferred, false-positive)');
    console.log('  --notes=""           Additional notes about the resolution');
    console.log('  --link=""            Link to commit or PR');
    process.exit(1);
  }

  const issue = findIssueById(issueId);
  if (!issue) {
    console.log(`Error: Issue ${issueId} not found. Run /debt-report to see current issues.`);
    process.exit(1);
  }

  if (issue.status === 'resolved') {
    console.log(`Error: Issue ${issueId} is already resolved.`);
    process.exit(1);
  }

  const resolutionTypes = ['fixed', 'refactored', 'documented', 'deferred', 'false-positive'];
  if (!resolutionTypes.includes(resolution)) {
    console.log(`Error: Invalid resolution type. Must be one of: ${resolutionTypes.join(', ')}`);
    process.exit(1);
  }

  // Update storage
  const storage = getDebtStorage();
  const issueIndex = storage.issues.findIndex(i => i.id === issueId);

  if (issueIndex === -1) {
    console.log(`Error: Issue ${issueId} not found in storage.`);
    process.exit(1);
  }

  const resolvedIssue = {
    ...storage.issues[issueIndex],
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolution,
    resolutionNotes: notes,
    resolutionLink: link
  };

  storage.issues.splice(issueIndex, 1);
  storage.resolved.push(resolvedIssue);
  saveDebtStorage(storage);

  console.log(formatResolveResult(resolvedIssue, storage));
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
debtResolve(args).catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});