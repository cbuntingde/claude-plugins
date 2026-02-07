#!/usr/bin/env node

/**
 * File-History Command
 * Shows detailed history for specific files including blame information
 */

const path = require('path');
const fs = require('fs');

const chalk = require('chalk');
const Table = require('cli-table3');
const { execCommand, validateGitRepo, sanitizeGitInput } = require('./utils/git-utils');

/**
 * Retrieves commit history for a specific file
 * @param {string} filePath - Path to the file to analyze
 * @returns {object[]} Array of commit objects with hash, author, date, and subject
 */
function getFileHistory(filePath) {
  // Sanitize file path to prevent command injection
  const safePath = sanitizeGitInput(filePath);

  const history = execCommand(
    `git log --follow --pretty=format:"%H|%an|%ad|%s" --date=iso -- "${safePath}"`
  );

  if (!history) return [];

  return history.trim().split('\n').map(line => {
    const [hash, author, date, subject] = line.split('|');
    return { hash, author, date, subject };
  });
}

/**
 * Retrieves author contributions for a file using git blame
 * @param {string} filePath - Path to the file to analyze
 * @returns {object[]} Array of author objects with name and lines authored
 */
function getFileAuthors(filePath) {
  // Sanitize file path to prevent command injection
  const safePath = sanitizeGitInput(filePath);

  const blame = execCommand(`git blame --line-porcelain "${safePath}" 2>/dev/null`);

  if (!blame) return [];

  const authors = new Map();
  const lines = blame.split('\n');

  lines.forEach(line => {
    if (line.startsWith('author ')) {
      const author = line.slice(7);
      authors.set(author, (authors.get(author) || 0) + 1);
    }
  });

  return [...authors.entries()]
    .map(([author, lines]) => ({ author, lines }))
    .sort((a, b) => b.lines - a.lines);
}

/**
 * Retrieves file statistics including additions, deletions, and commit count
 * @param {string} filePath - Path to the file to analyze
 * @returns {object} Object containing file statistics
 */
function getFileStats(filePath) {
  // Sanitize file path to prevent command injection
  const safePath = sanitizeGitInput(filePath);

  const additions = execCommand(
    `git log --follow --numstat --pretty=format: -- "${safePath}" | awk '{add+=$1} END {print add+0}'`
  );

  const deletions = execCommand(
    `git log --follow --numstat --pretty=format: -- "${safePath}" | awk '{del+=$2} END {print del+0}'`
  );

  const commits = execCommand(
    `git log --follow --oneline -- "${safePath}" | wc -l`
  );

  const currentSize = execCommand(`wc -l < "${safePath}" 2>/dev/null || echo 0`);

  return {
    additions: parseInt(additions.trim(), 10) || 0,
    deletions: parseInt(deletions.trim(), 10) || 0,
    commits: parseInt(commits.trim(), 10) || 0,
    currentLines: parseInt(currentSize.trim(), 10) || 0
  };
}

/**
 * Retrieves commits grouped by date for recent activity
 * @param {string} filePath - Path to the file to analyze
 * @param {number} limit - Number of days to look back (default: 30)
 * @returns {object[]} Array of date-grouped commit data
 */
function getCommitsByDate(filePath, limit = 30) {
  // Sanitize file path to prevent command injection
  const safePath = sanitizeGitInput(filePath);

  const commits = execCommand(
    `git log --follow --since="${limit} days ago" --pretty=format:"%ad|%s" --date=format:"%Y-%m-%d" -- "${safePath}"`
  );

  if (!commits) return [];

  const dateMap = new Map();
  commits.trim().split('\n').forEach(line => {
    const [date, subject] = line.split('|');
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date).push(subject);
  });

  return [...dateMap.entries()]
    .map(([date, messages]) => ({ date, commits: messages.length, messages }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Displays comprehensive file history report
 * @param {string} filePath - Path to the file to analyze
 */
function displayFileHistory(filePath) {
  const stats = getFileStats(filePath);
  const history = getFileHistory(filePath);
  const authors = getFileAuthors(filePath);
  const recentCommits = getCommitsByDate(filePath);

  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('                    FILE HISTORY REPORT'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));

  const repoName = path.basename(process.cwd());
  console.log(chalk.gray(`Repository: ${repoName}`));
  console.log(chalk.gray(`File: ${filePath}`));
  console.log(chalk.gray(`Analysis Date: ${new Date().toISOString()}\n`));

  const statsTable = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Value')],
    colWidths: [30, 20]
  });

  statsTable.push(['Current Lines', stats.currentLines]);
  statsTable.push(['Total Commits', stats.commits]);
  statsTable.push(['Lines Added', stats.additions]);
  statsTable.push(['Lines Deleted', stats.deletions]);
  statsTable.push(['Net Change', stats.additions - stats.deletions]);

  console.log(chalk.bold.yellow('\n📊 File Statistics'));
  console.log(statsTable.toString());

  if (authors.length > 0) {
    const authorsTable = new Table({
      head: [chalk.cyan('Author'), chalk.cyan('Lines Authored'), chalk.cyan('Percentage')],
      colWidths: [30, 20, 15]
    });

    const totalLines = authors.reduce((sum, a) => sum + a.lines, 0);

    authors.slice(0, 10).forEach(({ author, lines }) => {
      const percentage = ((lines / totalLines) * 100).toFixed(1);
      authorsTable.push([author, lines, `${percentage}%`]);
    });

    console.log(chalk.bold.yellow('\n✍️  Authors by Contribution'));
    console.log(authorsTable.toString());
  }

  if (recentCommits.length > 0) {
    const timelineTable = new Table({
      head: [chalk.cyan('Date'), chalk.cyan('Commits'), chalk.cyan('Messages')],
      colWidths: [15, 10, 50]
    });

    recentCommits.slice(0, 15).forEach(({ date, commits, messages }) => {
      const msgPreview = messages.slice(0, 2).join('; ') +
        (messages.length > 2 ? `... (${messages.length} total)` : '');
      timelineTable.push([date, commits, msgPreview.slice(0, 48)]);
    });

    console.log(chalk.bold.yellow('\n📅 Recent Activity (Last 30 Days)'));
    console.log(timelineTable.toString());
  }

  if (history.length > 0) {
    console.log(chalk.bold.yellow('\n📜 Commit History (Most Recent 10)'));
    history.slice(0, 10).forEach((commit, index) => {
      const shortHash = commit.hash.slice(0, 8);
      const date = new Date(commit.date).toLocaleDateString();
      console.log(chalk.gray(`${index + 1}. ${chalk.cyan(shortHash)} - ${chalk.white(commit.subject)}`));
      console.log(chalk.gray(`   ${chalk.dim(commit.author)} - ${date}\n`));
    });
  }

  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));
}

/**
 * Displays usage information for the file-history command
 */
function showUsage() {
  console.log(chalk.bold.cyan('\nFile History - Usage'));
  console.log(chalk.white('\nShows detailed history for a specific file including:\n'));
  console.log('  • File statistics (lines, commits, additions/deletions)');
  console.log('  • Author contributions (based on git blame)');
  console.log('  • Recent activity timeline');
  console.log('  • Complete commit history\n');
  console.log(chalk.yellow('Usage:'));
  console.log('  npm run file-history -- <file-path>\n');
  console.log(chalk.yellow('Example:'));
  console.log('  npm run file-history -- src/index.js\n');
  console.log(chalk.yellow('Options:'));
  console.log('  <file-path>    Path to the file to analyze (required)\n');
}

/**
 * Main entry point for file-history command
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  const filePath = args[0];

  validateGitRepo();

  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }

  displayFileHistory(filePath);
}

main();
