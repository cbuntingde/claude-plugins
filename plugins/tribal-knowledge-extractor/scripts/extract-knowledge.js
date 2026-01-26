#!/usr/bin/env node

/**
 * Extract-Knowledge Command
 * Mines git history for tribal knowledge and context
 */

const path = require('path');
const fs = require('fs');

const chalk = require('chalk');
const Table = require('cli-table3');
const { execCommand, validateGitRepo, parseGitLog } = require('./utils/git-utils');

const MAX_COMMITS = 1000;
const OUTPUT_FILE = 'tribal-knowledge-report.json';

/**
 * Retrieves commit statistics for a specified time period
 * @param {string} since - Git time format (e.g., "6 months ago", "30 days ago")
 * @returns {object} Commit statistics including authors, patterns, and time distribution
 */
function getCommitStats(since = '6 months ago') {
  const commits = execCommand(
    `git log --all --since="${since}" --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso`
  );

  if (!commits) return { commits: [], total: 0 };

  const commitList = parseGitLog(commits, ['hash', 'author', 'email', 'date', 'subject']);
  const stats = {
    commits: [],
    total: commitList.length,
    authors: {},
    patterns: {
      fix: 0,
      feat: 0,
      refactor: 0,
      docs: 0,
      test: 0,
      chore: 0,
      other: 0
    },
    timeDistribution: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    }
  };

  commitList.slice(0, MAX_COMMITS).forEach(commit => {
    const { hash, author, email, date, subject } = commit;
    const hour = new Date(date).getHours();

    stats.commits.push({ hash, author, email, date, subject });

    if (!stats.authors[author]) {
      stats.authors[author] = { email, commits: 0 };
    }
    stats.authors[author].commits++;

    if (subject.startsWith('fix:') || subject.startsWith('Fix:')) stats.patterns.fix++;
    else if (subject.startsWith('feat:') || subject.startsWith('Feat:')) stats.patterns.feat++;
    else if (subject.startsWith('refactor:') || subject.startsWith('Refactor:')) stats.patterns.refactor++;
    else if (subject.startsWith('docs:') || subject.startsWith('Docs:')) stats.patterns.docs++;
    else if (subject.startsWith('test:') || subject.startsWith('Test:')) stats.patterns.test++;
    else if (subject.startsWith('chore:') || subject.startsWith('Chore:')) stats.patterns.chore++;
    else stats.patterns.other++;

    if (hour >= 6 && hour < 12) stats.timeDistribution.morning++;
    else if (hour >= 12 && hour < 17) stats.timeDistribution.afternoon++;
    else if (hour >= 17 && hour < 21) stats.timeDistribution.evening++;
    else stats.timeDistribution.night++;
  });

  return stats;
}

/**
 * Retrieves the most frequently changed files in the repository
 * @param {number} limit - Maximum number of files to return
 * @returns {object[]} Array of file objects with change counts
 */
function getMostChangedFiles(limit = 20) {
  const files = execCommand(
    `git log --all --name-only --pretty=format: | sort | uniq -c | sort -rn | head -n ${limit}`
  );

  if (!files) return [];

  return files.trim().split('\n').map(line => {
    const parts = line.trim().split(/\s+/);
    const count = parseInt(parts[0], 10);
    const file = parts.slice(1).join(' ');
    return { count: isNaN(count) ? 0 : count, file };
  }).filter(item => item.file && item.file.length > 0);
}

/**
 * Analyzes commit message patterns to find common words and phrases
 * @returns {object} Object containing common words and phrases with their frequencies
 */
function getCommitPatterns() {
  const messages = execCommand('git log --all --pretty=format:"%s" | head -n 1000');

  if (!messages) return { commonWords: [], commonPhrases: [] };

  const messageList = messages.trim().split('\n');

  const wordMap = new Map();
  const phraseMap = new Map();

  messageList.forEach(msg => {
    const words = msg.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) {
        wordMap.set(word, (wordMap.get(word) || 0) + 1);
      }
    });

    const phrase = msg.toLowerCase().replace(/\s+/g, ' ').trim();
    if (phrase.length > 5) {
      phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
    }
  });

  const commonWords = [...wordMap.entries()]
    .filter(([word]) => !['this', 'that', 'with', 'from', 'when', 'were', 'been'].includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const commonPhrases = [...phraseMap.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([phrase, count]) => ({ phrase, count }));

  return { commonWords, commonPhrases };
}

/**
 * Retrieves branch insights for the repository
 * @returns {object} Object containing total and merged branch counts
 */
function getBranchInsights() {
  const branches = execCommand('git branch -a | wc -l');
  const branchesStr = branches ? branches.trim() : '0';

  const mergedBranches = execCommand('git branch --merged | wc -l');
  const mergedStr = mergedBranches ? mergedBranches.trim() : '0';

  return {
    totalBranches: parseInt(branchesStr, 10) || 0,
    mergedBranches: parseInt(mergedStr, 10) || 0
  };
}

/**
 * Generates and displays a comprehensive tribal knowledge report
 * @param {object} stats - Commit statistics from getCommitStats
 * @param {object[]} files - Most changed files from getMostChangedFiles
 * @param {object} patterns - Commit patterns from getCommitPatterns
 * @param {object} branches - Branch insights from getBranchInsights
 */
function generateReport(stats, files, patterns, branches) {
  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('          TRIBAL KNOWLEDGE EXTRACTION REPORT'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));

  const repoName = path.basename(process.cwd());
  console.log(chalk.gray(`Repository: ${repoName}`));
  console.log(chalk.gray(`Analysis Date: ${new Date().toISOString()}`));
  console.log(chalk.gray(`Commits Analyzed: ${stats.total}\n`));

  const authorsTable = new Table({
    head: [chalk.cyan('Author'), chalk.cyan('Commits'), chalk.cyan('Percentage')],
    colWidths: [30, 15, 15]
  });

  const sortedAuthors = Object.entries(stats.authors)
    .sort(([, a], [, b]) => b.commits - a.commits)
    .slice(0, 10);

  sortedAuthors.forEach(([author, data]) => {
    const percentage = ((data.commits / stats.total) * 100).toFixed(1);
    authorsTable.push([author, data.commits, `${percentage}%`]);
  });

  console.log(chalk.bold.yellow('\n📊 Top Contributors'));
  console.log(authorsTable.toString());

  const patternTable = new Table({
    head: [chalk.cyan('Pattern'), chalk.cyan('Count'), chalk.cyan('Percentage')],
    colWidths: [20, 15, 15]
  });

  Object.entries(stats.patterns).forEach(([pattern, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    patternTable.push([pattern, count, `${percentage}%`]);
  });

  console.log(chalk.bold.yellow('\n🏷️  Commit Patterns'));
  console.log(patternTable.toString());

  const timeTable = new Table({
    head: [chalk.cyan('Time Period'), chalk.cyan('Commits'), chalk.cyan('Percentage')],
    colWidths: [20, 15, 15]
  });

  const periods = {
    morning: '06:00 - 12:00',
    afternoon: '12:00 - 17:00',
    evening: '17:00 - 21:00',
    night: '21:00 - 06:00'
  };

  Object.entries(stats.timeDistribution).forEach(([period, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    timeTable.push([periods[period], count, `${percentage}%`]);
  });

  console.log(chalk.bold.yellow('\n⏰ Activity Distribution'));
  console.log(timeTable.toString());

  if (files.length > 0) {
    const filesTable = new Table({
      head: [chalk.cyan('File'), chalk.cyan('Changes')],
      colWidths: [60, 15]
    });

    files.slice(0, 10).forEach(({ file, count }) => {
      filesTable.push([file.slice(0, 58), count]);
    });

    console.log(chalk.bold.yellow('\n📁 Most Changed Files'));
    console.log(filesTable.toString());
  }

  console.log(chalk.bold.yellow('\n🔍 Common Keywords'));
  console.log(patterns.commonWords.slice(0, 10)
    .map(({ word, count }) => `  ${word.padEnd(20)} ${count}`)
    .join('\n'));

  console.log(chalk.bold.yellow('\n📝 Common Commit Phrases'));
  console.log(patterns.commonPhrases.slice(0, 8)
    .map(({ phrase, count }) => `  "${phrase}" (${count}x)`)
    .join('\n'));

  console.log(chalk.bold.yellow('\n🌿 Branch Insights'));
  console.log(`  Total Branches: ${branches.totalBranches}`);
  console.log(`  Merged Branches: ${branches.mergedBranches}`);
  console.log(`  Active Branches: ${branches.totalBranches - branches.mergedBranches}`);

  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════\n'));

  const reportData = {
    metadata: {
      repository: repoName,
      generatedAt: new Date().toISOString(),
      commitsAnalyzed: stats.total
    },
    authors: sortedAuthors.map(([author, data]) => ({
      author,
      email: data.email,
      commits: data.commits,
      percentage: ((data.commits / stats.total) * 100).toFixed(1) + '%'
    })),
    commitPatterns: stats.patterns,
    timeDistribution: stats.timeDistribution,
    mostChangedFiles: files,
    commonKeywords: patterns.commonWords,
    commonPhrases: patterns.commonPhrases,
    branchInsights: branches
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(reportData, null, 2));
  console.log(chalk.green(`Report saved to: ${OUTPUT_FILE}`));
}

/**
 * Main entry point for extract-knowledge command
 */
function main() {
  const args = process.argv.slice(2);
  const since = args.find(arg => arg.startsWith('--since='))?.split('=')[1] || '6 months ago';

  validateGitRepo();

  console.log(chalk.blue(`Analyzing git history since "${since}"...`));

  const stats = getCommitStats(since);
  const files = getMostChangedFiles();
  const patterns = getCommitPatterns();
  const branches = getBranchInsights();

  generateReport(stats, files, patterns, branches);
}

main();
