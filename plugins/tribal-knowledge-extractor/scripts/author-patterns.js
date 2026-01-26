#!/usr/bin/env node

/**
 * Author-Patterns Command
 * Analyzes contribution patterns by author
 */

const path = require('path');

const chalk = require('chalk');
const Table = require('cli-table3');
const { execCommand, validateGitRepo, sanitizeGitInput } = require('./utils/git-utils');

/**
 * Retrieves author statistics from git history
 * @param {string} since - Git time format (e.g., "6 months ago", "30 days ago")
 * @returns {object} Map of author names to their statistics
 */
function getAuthorStats(since = '6 months ago') {
  const logData = execCommand(
    `git log --all --since="${since}" --pretty=format:"%an|%ae|%ad|%s" --date=iso`
  );

  if (!logData) return {};

  const authors = new Map();

  logData.trim().split('\n').forEach(line => {
    const [name, email, date, subject] = line.split('|');
    const hour = new Date(date).getHours();
    const dayOfWeek = new Date(date).getDay();

    if (!authors.has(name)) {
      authors.set(name, {
        email,
        commits: 0,
        firstCommit: date,
        lastCommit: date,
        commitHours: [],
        commitDays: new Array(7).fill(0),
        patterns: {
          fix: 0,
          feat: 0,
          refactor: 0,
          docs: 0,
          test: 0,
          chore: 0,
          other: 0
        },
        avgMessageLength: 0,
        totalMessageLength: 0
      });
    }

    const author = authors.get(name);
    author.commits++;
    author.commitHours.push(hour);
    author.commitDays[dayOfWeek]++;
    author.totalMessageLength += subject.length;

    if (date < author.firstCommit) author.firstCommit = date;
    if (date > author.lastCommit) author.lastCommit = date;

    if (subject.startsWith('fix:') || subject.startsWith('Fix:')) author.patterns.fix++;
    else if (subject.startsWith('feat:') || subject.startsWith('Feat:')) author.patterns.feat++;
    else if (subject.startsWith('refactor:') || subject.startsWith('Refactor:')) author.patterns.refactor++;
    else if (subject.startsWith('docs:') || subject.startsWith('Docs:')) author.patterns.docs++;
    else if (subject.startsWith('test:') || subject.startsWith('Test:')) author.patterns.test++;
    else if (subject.startsWith('chore:') || subject.startsWith('Chore:')) author.patterns.chore++;
    else author.patterns.other++;
  });

  authors.forEach(author => {
    author.avgMessageLength = (author.totalMessageLength / author.commits).toFixed(1);
  });

  return Object.fromEntries(authors);
}

/**
 * Retrieves most frequently edited files for a specific author
 * @param {string} authorName - Name of the author to analyze
 * @returns {object[]} Array of file objects with change counts
 */
function getAuthorFiles(authorName) {
  // Sanitize author name to prevent command injection
  const safeAuthorName = sanitizeGitInput(authorName);

  const files = execCommand(
    `git log --all --author="${safeAuthorName}" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -n 20`
  );

  if (!files) return [];

  return files.trim().split('\n')
    .filter(line => line.trim())
    .map(line => {
      const parts = line.trim().split(/\s+/);
      const count = parseInt(parts[0], 10);
      const file = parts.slice(1).join(' ');
      return { count: isNaN(count) ? 0 : count, file };
    })
    .filter(item => item.file);
}

/**
 * Retrieves collaboration patterns for a specific author
 * @param {string} authorName - Name of the author to analyze
 * @returns {object[]} Array of collaborators with interaction counts
 */
function getAuthorCollaboration(authorName) {
  // Sanitize author name to prevent command injection
  const safeAuthorName = sanitizeGitInput(authorName);

  const commits = execCommand(
    `git log --all --author="${safeAuthorName}" --pretty=format:"%H" | head -n 100`
  );

  if (!commits) return [];

  const collaborators = new Map();

  commits.trim().split('\n').forEach(hash => {
    const coAuthors = execCommand(
      `git show ${hash} --format="%ae" | head -n 1`
    );

    const otherCommits = execCommand(
      `git log --all --pretty=format:"%an" ${hash}~1..${hash}`
    );

    if (otherCommits) {
      otherCommits.trim().split('\n').forEach(author => {
        if (author !== authorName) {
          collaborators.set(author, (collaborators.get(author) || 0) + 1);
        }
      });
    }
  });

  return [...collaborators.entries()]
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Analyzes working hours from commit timestamps
 * @param {number[]} commitHours - Array of hour values (0-23)
 * @returns {object} Object containing most active period and counts
 */
function analyzeWorkingHours(commitHours) {
  if (commitHours.length === 0) {
    return { mostActive: 'N/A', morning: 0, afternoon: 0, evening: 0, night: 0 };
  }

  const periods = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  commitHours.forEach(hour => {
    if (hour >= 6 && hour < 12) periods.morning++;
    else if (hour >= 12 && hour < 17) periods.afternoon++;
    else if (hour >= 17 && hour < 21) periods.evening++;
    else periods.night++;
  });

  const mostActive = Object.entries(periods)
    .sort(([, a], [, b]) => b - a)[0][0];

  return { mostActive, ...periods };
}

/**
 * Analyzes day of week distribution from commit data
 * @param {number[]} commitDays - Array of day counts (7 elements, one per day)
 * @returns {object[]} Array of day objects with commit counts and percentages
 */
function analyzeDayDistribution(commitDays) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const total = commitDays.reduce((sum, count) => sum + count, 0);

  return commitDays.map((count, index) => ({
    day: dayNames[index],
    commits: count,
    percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
  }));
}

/**
 * Displays detailed analysis for a specific author
 * @param {string} authorName - Name of the author to analyze
 * @param {string} since - Git time format for analysis period
 */
function displayAuthorAnalysis(authorName, since = '6 months ago') {
  const allAuthors = getAuthorStats(since);
  const authors = Object.entries(allAuthors)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.commits - a.commits);

  const targetAuthor = authors.find(a => a.name === authorName);

  if (!targetAuthor) {
    console.error(chalk.red(`Error: Author "${authorName}" not found in git history`));
    console.log(chalk.yellow('\nAvailable authors:'));
    authors.slice(0, 10).forEach(a => console.log(`  - ${a.name}`));
    process.exit(1);
  }

  const workingHours = analyzeWorkingHours(targetAuthor.commitHours);
  const dayDistribution = analyzeDayDistribution(targetAuthor.commitDays);
  const topFiles = getAuthorFiles(authorName);
  const collaborators = getAuthorCollaboration(authorName);

  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('                  AUTHOR PATTERN ANALYSIS'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));

  const repoName = path.basename(process.cwd());
  console.log(chalk.gray(`Repository: ${repoName}`));
  console.log(chalk.gray(`Author: ${targetAuthor.name}`));
  console.log(chalk.gray(`Email: ${targetAuthor.email}`));
  console.log(chalk.gray(`Analysis Period: ${since}\n`));

  const summaryTable = new Table({
    head: [chalk.cyan('Metric'), chalk.cyan('Value')],
    colWidths: [35, 25]
  });

  const firstDate = new Date(targetAuthor.firstCommit).toLocaleDateString();
  const lastDate = new Date(targetAuthor.lastCommit).toLocaleDateString();

  summaryTable.push(['Total Commits', targetAuthor.commits]);
  summaryTable.push(['First Commit', firstDate]);
  summaryTable.push(['Last Commit', lastDate]);
  summaryTable.push(['Avg Message Length', `${targetAuthor.avgMessageLength} chars`]);
  summaryTable.push(['Most Active Period', workingHours.mostActive.charAt(0).toUpperCase() + workingHours.mostActive.slice(1)]);

  console.log(chalk.bold.yellow('\n📊 Summary'));
  console.log(summaryTable.toString());

  const patternTable = new Table({
    head: [chalk.cyan('Pattern'), chalk.cyan('Commits'), chalk.cyan('Percentage')],
    colWidths: [20, 15, 15]
  });

  const totalPatterns = Object.values(targetAuthor.patterns).reduce((sum, val) => sum + val, 0);

  Object.entries(targetAuthor.patterns).forEach(([pattern, count]) => {
    const percentage = totalPatterns > 0 ? ((count / totalPatterns) * 100).toFixed(1) : '0.0';
    patternTable.push([pattern, count, `${percentage}%`]);
  });

  console.log(chalk.bold.yellow('\n🏷️  Commit Pattern Distribution'));
  console.log(patternTable.toString());

  const dayTable = new Table({
    head: [chalk.cyan('Day'), chalk.cyan('Commits'), chalk.cyan('Percentage')],
    colWidths: [15, 12, 12]
  });

  dayDistribution.forEach(({ day, commits, percentage }) => {
    dayTable.push([day, commits, `${percentage}%`]);
  });

  console.log(chalk.bold.yellow('\n📅 Day of Week Distribution'));
  console.log(dayTable.toString());

  if (topFiles.length > 0) {
    const filesTable = new Table({
      head: [chalk.cyan('File'), chalk.cyan('Changes')],
      colWidths: [55, 15]
    });

    topFiles.slice(0, 10).forEach(({ file, count }) => {
      filesTable.push([file.slice(0, 53), count]);
    });

    console.log(chalk.bold.yellow('\n📁 Most Worked On Files'));
    console.log(filesTable.toString());
  }

  if (collaborators.length > 0) {
    const collabTable = new Table({
      head: [chalk.cyan('Collaborator'), chalk.cyan('Shared Commits')],
      colWidths: [40, 20]
    });

    collaborators.slice(0, 8).forEach(({ author, count }) => {
      collabTable.push([author, count]);
    });

    console.log(chalk.bold.yellow('\n🤝 Frequent Collaborators'));
    console.log(collabTable.toString());
  }

  const overallRank = authors.findIndex(a => a.name === authorName) + 1;
  const totalAuthors = authors.length;
  const percentage = ((targetAuthor.commits / authors.reduce((sum, a) => sum + a.commits, 0)) * 100).toFixed(1);

  console.log(chalk.bold.yellow('\n🏆 Standing in Repository'));
  console.log(`  Rank: ${overallRank} of ${totalAuthors} authors`);
  console.log(`  Contribution: ${percentage}% of all commits`);

  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════\n'));
}

/**
 * Displays list of all contributors in the repository
 * @param {string} since - Git time format for analysis period
 */
function displayAllAuthors(since = '6 months ago') {
  const allAuthors = getAuthorStats(since);
  const authors = Object.entries(allAuthors)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.commits - a.commits);

  const totalCommits = authors.reduce((sum, a) => sum + a.commits, 0);

  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('                    ALL CONTRIBUTORS'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));

  const table = new Table({
    head: [chalk.cyan('Author'), chalk.cyan('Commits'), chalk.cyan('Percentage'), chalk.cyan('Email')],
    colWidths: [30, 12, 12, 35]
  });

  authors.forEach(({ name, commits, email }) => {
    const percentage = ((commits / totalCommits) * 100).toFixed(1);
    table.push([name.slice(0, 28), commits, `${percentage}%`, email.slice(0, 33)]);
  });

  console.log(table.toString());
  console.log(chalk.gray(`Total: ${authors.length} contributors\n`));
}

/**
 * Displays usage information for the author-patterns command
 */
function showUsage() {
  console.log(chalk.bold.cyan('\nAuthor Patterns - Usage'));
  console.log(chalk.white('\nAnalyzes contribution patterns by author including:\n'));
  console.log('  • Commit patterns and distribution');
  console.log('  • Working hours and day preferences');
  console.log('  • Most frequently edited files');
  console.log('  • Collaboration patterns\n');
  console.log(chalk.yellow('Usage:'));
  console.log('  npm run author-patterns                    # List all authors');
  console.log('  npm run author-patterns -- <author-name>   # Analyze specific author\n');
  console.log(chalk.yellow('Options:'));
  console.log('  --since=<period>    Time period to analyze (default: "6 months ago")');
  console.log('  --help, -h          Show this help message\n');
  console.log(chalk.yellow('Examples:'));
  console.log('  npm run author-patterns -- "John Doe"');
  console.log('  npm run author-patterns --since="1 year ago" "Jane Smith"\n');
}

/**
 * Main entry point for author-patterns command
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  const sinceArg = args.find(arg => arg.startsWith('--since='));
  const since = sinceArg ? sinceArg.split('=')[1] : '6 months ago';

  const authorName = args.find(arg => !arg.startsWith('--'));

  validateGitRepo();

  if (authorName) {
    displayAuthorAnalysis(authorName, since);
  } else {
    displayAllAuthors(since);
  }
}

main();
