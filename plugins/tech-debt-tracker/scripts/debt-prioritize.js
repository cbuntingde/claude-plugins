#!/usr/bin/env node

/**
 * Tech Debt Tracker - Debt Prioritize Script
 *
 * Prioritizes technical debt issues based on impact and effort
 * Copyright 2025 Chris Bunting <cbuntingde@gmail.com>
 * MIT License
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Issue categories for technical debt
 */
const DEBT_CATEGORIES = {
  complexity: { name: 'Complexity', weight: 0.4 },
  duplication: { name: 'Duplication', weight: 0.3 },
  naming: { name: 'Naming', weight: 0.2 },
  security: { name: 'Security', weight: 0.5 },
  testing: { name: 'Testing', weight: 0.3 }
};

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
 * Calculate impact score for an issue
 * @param {object} issue - Issue object
 * @returns {number} Impact score (1-10)
 */
function calculateImpactScore(issue) {
  const severityWeight = { high: 3, medium: 2, low: 1 };
  const category = issue.category || 'complexity';
  const categoryWeight = DEBT_CATEGORIES[category]?.weight || 1;
  const severityMultiplier = severityWeight[issue.severity] || 1;
  const frequencyMultiplier = (issue.frequency || 1) * 0.5;
  const baseScore = categoryWeight * severityMultiplier;
  return Math.min(10, Math.max(1, baseScore + frequencyMultiplier));
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
 * Format prioritize results
 * @param {object[]} issues - Prioritized issues
 * @param {string} strategy - Prioritization strategy
 * @returns {string} Formatted output
 */
function formatPrioritizeResults(issues, strategy) {
  const output = [];

  const strategyDescriptions = {
    impact: 'by Impact Score',
    effort: 'by Effort (quick wins)',
    roi: 'by ROI (Return on Investment)',
    timeline: 'by Timeline (security first)'
  };

  output.push(`\n🎯 Prioritized Technical Debt`);
  output.push(`Strategy: ${strategyDescriptions[strategy] || 'by ROI'}`);
  output.push('='.repeat(50));
  output.push('');

  // Categorize into quadrants
  const quickWins = [];
  const highValue = [];
  const lowValue = [];
  const defer = [];

  for (const issue of issues) {
    const impact = issue.impactScore;
    const effort = issue.effortHours;

    if (impact >= 6 && effort <= 2) {
      quickWins.push(issue);
    } else if (impact >= 6 && effort > 2) {
      highValue.push(issue);
    } else if (impact < 4 && effort < 2) {
      lowValue.push(issue);
    } else {
      defer.push(issue);
    }
  }

  // Quick wins section
  if (quickWins.length > 0) {
    output.push('🚀 Quick Wins (High Impact, Low Effort)');
    output.push('-'.repeat(50));

    for (const issue of quickWins) {
      output.push(`[${issue.id}] ${issue.title}`);
      output.push(`   Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push(`   Category: ${issue.category}`);
      output.push(`   Suggestion: ${issue.suggestion}`);
      output.push('');
    }
  }

  // High value investments
  if (highValue.length > 0) {
    output.push('💎 High Value Investments (Plan Sprints)');
    output.push('-'.repeat(50));

    for (const issue of highValue) {
      output.push(`[${issue.id}] ${issue.title}`);
      output.push(`   Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push(`   Category: ${issue.category}`);
      if (issue.prerequisite) {
        output.push(`   Prerequisite: ${issue.prerequisite}`);
      }
      output.push('');
    }
  }

  // Time sensitive (security)
  const securityIssues = issues.filter(i => i.category === 'security');
  if (securityIssues.length > 0) {
    output.push('⏰ Time Sensitive (Address Soon)');
    output.push('-'.repeat(50));

    for (const issue of securityIssues) {
      output.push(`[Security] ${issue.title}`);
      output.push(`   Risk: High | Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push('');
    }
  }

  // Low value
  if (lowValue.length > 0) {
    output.push('📋 Lower Priority');
    output.push('-'.repeat(50));

    for (const issue of lowValue) {
      output.push(`[${issue.id}] ${issue.title}`);
      output.push(`   Impact: ${issue.impactScore} | Effort: ${issue.effortHours}h`);
      output.push('');
    }
  }

  // Summary
  const totalEffort = issues.reduce((sum, i) => sum + i.effortHours, 0);
  output.push('');
  output.push(`📊 Summary: ${issues.length} items | Est. Effort: ${totalEffort}h`);

  return output.join('\n');
}

/**
 * Main debt prioritize function
 * @param {string[]} args - Command line arguments
 */
async function debtPrioritize(args) {
  const parsedArgs = parseArgs(args);
  const strategy = parsedArgs.strategy || 'roi';
  const limit = parseInt(parsedArgs.limit, 10) || 20;
  const output = parsedArgs.output;

  const storage = getDebtStorage();
  const openIssues = storage.issues.filter(i => i.status === 'open');

  if (openIssues.length === 0) {
    console.log('No technical debt issues recorded. Run /debt-scan to identify issues.');
    return;
  }

  // Calculate ROI for each issue
  const issuesWithMetrics = openIssues.map(issue => {
    const impactScore = issue.impactScore || calculateImpactScore(issue);
    const effortHours = estimateEffort(issue);

    return {
      ...issue,
      impactScore,
      effortHours,
      roi: effortHours > 0 ? impactScore / effortHours : impactScore
    };
  });

  // Sort by strategy
  let sortedIssues;
  switch (strategy) {
    case 'impact':
      sortedIssues = issuesWithMetrics.sort((a, b) => b.impactScore - a.impactScore);
      break;
    case 'effort':
      sortedIssues = issuesWithMetrics.sort((a, b) => a.effortHours - b.effortHours);
      break;
    case 'timeline':
      sortedIssues = issuesWithMetrics.sort((a, b) => {
        if (a.category === 'security' && b.category !== 'security') return -1;
        if (a.category !== 'security' && b.category === 'security') return 1;
        return new Date(a.detectedAt) - new Date(b.detectedAt);
      });
      break;
    case 'roi':
    default:
      sortedIssues = issuesWithMetrics.sort((a, b) => b.roi - a.roi);
      break;
  }

  const limitedIssues = sortedIssues.slice(0, limit);

  const report = formatPrioritizeResults(limitedIssues, strategy);

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
debtPrioritize(args).catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});