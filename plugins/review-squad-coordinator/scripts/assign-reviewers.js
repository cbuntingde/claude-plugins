#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const plugin = require('../index.js');

function getGitUsername() {
  try {
    return execSync('git config user.name', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function getGitUserEmail() {
  try {
    return execSync('git config user.email', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function getChangedFiles(baseBranch = 'main') {
  try {
    const diffOutput = execSync(`git diff --name-only ${baseBranch}...HEAD`, {
      encoding: 'utf-8'
    });
    return diffOutput.split('\n').filter(Boolean);
  } catch {
    const statusOutput = execSync('git diff --name-only HEAD~1', {
      encoding: 'utf-8'
    });
    return statusOutput.split('\n').filter(Boolean);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    author: null,
    files: null,
    maxReviewers: 3,
    config: null,
    excludeRecent: true,
    baseBranch: 'main'
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--author' && i + 1 < args.length) {
      options.author = args[i + 1];
      i += 2;
    } else if (arg === '--files' && i + 1 < args.length) {
      options.files = [];
      while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options.files.push(args[i + 1]);
        i++;
      }
      i++;
    } else if (arg === '--max-reviewers' && i + 1 < args.length) {
      options.maxReviewers = parseInt(args[i + 1], 10);
      i += 2;
    } else if (arg === '--config' && i + 1 < args.length) {
      options.config = args[i + 1];
      i += 2;
    } else if (arg === '--exclude-recent') {
      options.excludeRecent = true;
      i++;
    } else if (arg === '--base-branch' && i + 1 < args.length) {
      options.baseBranch = args[i + 1];
      i += 2;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      i++;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage: node scripts/assign-reviewers.js [options]

Auto-assign code reviewers based on CODEOWNERS and expertise.

Options:
  --author <username>       PR author's username
  --files <patterns...>     Files to analyze
  --max-reviewers <n>       Maximum reviewers (default: 3)
  --config <path>           Config file path
  --base-branch <branch>    Base branch for diff (default: main)
  --help, -h                Show this help

Environment Variables:
  REVIEW_SQUAD_CONFIG       Path to config file
  REVIEW_SQUAD_MAX          Maximum reviewers
`);
}

async function main() {
  const options = parseArgs();
  const repoPath = process.cwd();

  console.log('Review Squad Coordinator v' + plugin.version);
  console.log('='.repeat(50));

  const changedFiles = options.files || getChangedFiles(options.baseBranch);

  if (changedFiles.length === 0) {
    console.log('No changed files detected.');
    console.log('Please provide files with --files option or ensure you are in a git repo.');
    process.exit(1);
  }

  console.log(`\nAnalyzing ${changedFiles.length} changed file(s)...`);

  const config = plugin.loadConfig(options.config);

  if (options.maxReviewers !== 3) {
    config.maxReviewersPerPR = options.maxReviewers;
  }

  const authorEmail = getGitUserEmail();
  const authorName = options.author || getGitUsername();

  if (config.excludeAuthorFromReview && authorEmail) {
    console.log(`Excluding author: ${authorName || authorEmail}`);
  }

  const reviewHistory = new Map();

  const result = plugin.selectReviewers(changedFiles, {
    repoPath,
    configPath: options.config,
    author: authorEmail || authorName,
    reviewHistory,
    availableReviewers: config.fallbackReviewers || []
  });

  if (!result.success) {
    console.error('\nError:', result.error);
    process.exit(1);
  }

  console.log('\n' + plugin.generateReviewAssignmentComment(result));

  console.log('\n--- Summary ---');
  console.log(`Total candidates analyzed: ${result.summary.totalCandidates}`);
  console.log(`Codeowners found: ${result.summary.codeownersFound}`);
  console.log(`Files modified: ${result.summary.filesModified}`);

  console.log('\nNext steps:');
  console.log('1. Copy the reviewer list above');
  console.log('2. Add as reviewers to your PR');
  console.log('3. Run /analyze-ownership for deeper insights');

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});