#!/usr/bin/env node

/**
 * Commit-Timeline Command
 * Visualizes commit activity over time with various granularity options
 */

const path = require('path');

const chalk = require('chalk');
const Table = require('cli-table3');
const { execCommand, validateGitRepo } = require('./utils/git-utils');

/**
 * Retrieves commits grouped by day
 * @param {string} since - Git time format (e.g., "30 days ago")
 * @returns {object} Object mapping dates to commit data
 */
function getCommitsByDay(since = '30 days ago') {
  const commits = execCommand(
    `git log --all --since="${since}" --pretty=format:"%ad|%an|%s" --date=format:"%Y-%m-%d"`
  );

  if (!commits) return {};

  const dayMap = new Map();

  commits.trim().split('\n').forEach(line => {
    const [date, author, subject] = line.split('|');
    if (!dayMap.has(date)) {
      dayMap.set(date, { commits: 0, authors: new Set(), subjects: [] });
    }
    const dayData = dayMap.get(date);
    dayData.commits++;
    dayData.authors.add(author);
    dayData.subjects.push(subject);
  });

  const result = {};
  dayMap.forEach((data, date) => {
    result[date] = {
      commits: data.commits,
      authors: data.authors.size,
      subjects: data.subjects.slice(0, 5)
    };
  });

  return result;
}

/**
 * Retrieves commits grouped by week
 * @param {string} since - Git time format (e.g., "3 months ago")
 * @returns {object} Object mapping week identifiers to commit data
 */
function getCommitsByWeek(since = '3 months ago') {
  const commits = execCommand(
    `git log --all --since="${since}" --pretty=format:"%ad|%an" --date=format:"%Y-W%V"`
  );

  if (!commits) return {};

  const weekMap = new Map();

  commits.trim().split('\n').forEach(line => {
    const [week, author] = line.split('|');
    if (!weekMap.has(week)) {
      weekMap.set(week, { commits: 0, authors: new Set() });
    }
    const weekData = weekMap.get(week);
    weekData.commits++;
    weekData.authors.add(author);
  });

  const result = {};
  weekMap.forEach((data, week) => {
    result[week] = {
      commits: data.commits,
      authors: data.authors.size
    };
  });

  return result;
}

/**
 * Retrieves commit counts by hour of day
 * @param {string} since - Git time format (e.g., "30 days ago")
 * @returns {number[]} Array of 24 elements with commit counts per hour
 */
function getCommitsByHour(since = '30 days ago') {
  const commits = execCommand(
    `git log --all --since="${since}" --pretty=format:"%ad" --date=format:"%H"`
  );

  if (!commits) return new Array(24).fill(0);

  const hourCounts = new Array(24).fill(0);

  commits.trim().split('\n').forEach(hour => {
    const hourInt = parseInt(hour, 10);
    if (!isNaN(hourInt) && hourInt >= 0 && hourInt < 24) {
      hourCounts[hourInt]++;
    }
  });

  return hourCounts;
}

/**
 * Retrieves commit counts by day of week
 * @param {string} since - Git time format (e.g., "3 months ago")
 * @returns {number[]} Array of 7 elements with commit counts per day
 */
function getCommitsByDayOfWeek(since = '3 months ago') {
  const commits = execCommand(
    `git log --all --since="${since}" --pretty=format:"%ad" --date=format:"%w"`
  );

  if (!commits) return new Array(7).fill(0);

  const dayCounts = new Array(7).fill(0);

  commits.trim().split('\n').forEach(day => {
    const dayInt = parseInt(day, 10);
    if (!isNaN(dayInt) && dayInt >= 0 && dayInt < 7) {
      dayCounts[dayInt]++;
    }
  });

  return dayCounts;
}

/**
 * Generates a visual activity bar using block characters
 * @param {number} count - Current value
 * @param {number} maxCount - Maximum value for scaling
 * @param {number} width - Width of the bar in characters
 * @returns {string} Visual bar representation
 */
function generateActivityBar(count, maxCount, width = 30) {
  if (maxCount === 0) return ' '.repeat(width);
  const filled = Math.round((count / maxCount) * width);
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled));
}

/**
 * Displays daily activity timeline with visual bars
 * @param {object} data - Object mapping dates to commit data
 */
function displayDayTimeline(data) {
  const sortedDates = Object.keys(data).sort();

  if (sortedDates.length === 0) {
    console.log(chalk.yellow('No commits found in the specified period.'));
    return;
  }

  const maxCommits = Math.max(...sortedDates.map(d => data[d].commits));

  console.log(chalk.bold.yellow('\n📅 Daily Activity'));

  sortedDates.slice(-21).forEach(date => {
    const dayData = data[date];
    const bar = generateActivityBar(dayData.commits, maxCommits);
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    console.log(`  ${chalk.cyan(dateStr.padEnd(10))} ${chalk.dim(dayName)} ${bar} ${chalk.white(dayData.commits.toString().padStart(4))} commits`);
  });
}

/**
 * Displays weekly activity timeline with visual bars
 * @param {object} data - Object mapping weeks to commit data
 */
function displayWeekTimeline(data) {
  const sortedWeeks = Object.keys(data).sort();

  if (sortedWeeks.length === 0) {
    console.log(chalk.yellow('No commits found in the specified period.'));
    return;
  }

  const maxCommits = Math.max(...sortedWeeks.map(w => data[w].commits));

  console.log(chalk.bold.yellow('\n📆 Weekly Activity'));

  sortedWeeks.forEach(week => {
    const weekData = data[week];
    const bar = generateActivityBar(weekData.commits, maxCommits, 25);
    const [year, weekNum] = week.split('-');
    console.log(`  ${chalk.cyan(`${year} Week ${weekNum}`.padEnd(15))} ${bar} ${chalk.white(weekData.commits.toString().padStart(4))} commits (${weekData.authors} authors)`);
  });
}

/**
 * Displays hourly commit distribution with visual bars
 * @param {number[]} hourCounts - Array of 24 commit counts per hour
 */
function displayHourTimeline(hourCounts) {
  const maxCommits = Math.max(...hourCounts);

  console.log(chalk.bold.yellow('\n⏰ Hourly Activity Distribution'));

  console.log('\n  Commits by hour of day (24-hour format):\n');

  for (let i = 0; i < 24; i++) {
    const count = hourCounts[i] || 0;
    const bar = generateActivityBar(count, maxCommits, 20);
    const hour = i.toString().padStart(2, '0') + ':00';
    console.log(`  ${chalk.cyan(hour)} ${bar} ${chalk.white(count.toString().padStart(4))}`);
  }
}

/**
 * Displays day of week activity distribution in table format
 * @param {number[]} dayCounts - Array of 7 commit counts per day
 */
function displayDayOfWeekTimeline(dayCounts) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const maxCommits = Math.max(...dayCounts);
  const total = dayCounts.reduce((sum, count) => sum + count, 0);

  console.log(chalk.bold.yellow('\n📊 Day of Week Activity'));

  const table = new Table({
    head: [chalk.cyan('Day'), chalk.cyan('Commits'), chalk.cyan('Percentage'), chalk.cyan('Activity')],
    colWidths: [12, 10, 12, 30]
  });

  dayNames.forEach((day, index) => {
    const count = dayCounts[index];
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const bar = generateActivityBar(count, maxCommits, 25);
    table.push([day, count, `${percentage}%`, bar]);
  });

  console.log(table.toString());
}

/**
 * Displays most active days (hotspots) in table format
 * @param {object} data - Object mapping dates to commit data
 */
function displayHotspots(data) {
  const entries = Object.entries(data)
    .map(([date, info]) => ({ date, ...info }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10);

  if (entries.length === 0) {
    return;
  }

  console.log(chalk.bold.yellow('\n🔥 Most Active Days'));

  const table = new Table({
    head: [chalk.cyan('Date'), chalk.cyan('Commits'), chalk.cyan('Authors'), chalk.cyan('Sample Messages')],
    colWidths: [15, 10, 10, 40]
  });

  entries.forEach(({ date, commits, authors, subjects }) => {
    const dateStr = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const samples = subjects.slice(0, 2).join('; ');
    const truncated = samples.length > 37 ? samples.slice(0, 37) + '...' : samples;
    table.push([dateStr, commits, authors, truncated]);
  });

  console.log(table.toString());
}

/**
 * Calculates velocity metrics from commit data
 * @param {object} data - Object mapping dates to commit data
 * @returns {object} Object containing average daily commits and trend information
 */
function calculateVelocity(data) {
  const entries = Object.entries(data).sort();
  if (entries.length < 2) return { avgDaily: 0, trend: 'stable' };

  let totalCommits = 0;
  let prevPeriodCommits = 0;
  let currPeriodCommits = 0;

  entries.forEach(([, info]) => {
    totalCommits += info.commits;
  });

  const midPoint = Math.floor(entries.length / 2);
  entries.slice(0, midPoint).forEach(([, info]) => prevPeriodCommits += info.commits);
  entries.slice(midPoint).forEach(([, info]) => currPeriodCommits += info.commits);

  const avgDaily = (totalCommits / entries.length).toFixed(1);

  let trend = 'stable';
  const percentChange = prevPeriodCommits > 0 ? ((currPeriodCommits - prevPeriodCommits) / prevPeriodCommits) * 100 : 0;

  if (percentChange > 20) trend = 'increasing 📈';
  else if (percentChange < -20) trend = 'decreasing 📉';

  return { avgDaily, trend, percentChange };
}

/**
 * Main entry point for commit-timeline command
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.bold.cyan('\nCommit Timeline - Usage'));
    console.log(chalk.white('\nVisualizes commit activity over time:\n'));
    console.log('  • Daily activity timeline (last 21 days shown)');
    console.log('  • Weekly activity summary');
    console.log('  • Hourly distribution (when commits are made)');
    console.log('  • Day of week analysis');
    console.log('  • Activity hotspots and velocity trends\n');
    console.log(chalk.yellow('Usage:'));
    console.log('  npm run commit-timeline                    # Default: 30 days');
    console.log('  npm run commit-timeline -- --since=<period> # Custom period');
    console.log('  npm run commit-timeline -- --weekly        # Weekly view (3 months)\n');
    console.log(chalk.yellow('Options:'));
    console.log('  --since=<period>    Time period to analyze (default: "30 days ago")');
    console.log('  --weekly            Show weekly aggregation (uses 3 months)');
    console.log('  --help, -h          Show this help message\n');
    console.log(chalk.yellow('Examples:'));
    console.log('  npm run commit-timeline -- --since="7 days ago"');
    console.log('  npm run commit-timeline -- --since="3 months ago" --weekly\n');
    process.exit(0);
  }

  const sinceArg = args.find(arg => arg.startsWith('--since='));
  const since = sinceArg ? sinceArg.split('=')[1] : '30 days ago';
  const useWeekly = args.includes('--weekly');

  validateGitRepo();

  const repoName = path.basename(process.cwd());

  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('                    COMMIT TIMELINE REPORT'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));

  console.log(chalk.gray(`Repository: ${repoName}`));
  console.log(chalk.gray(`Analysis Period: ${since}`));
  console.log(chalk.gray(`Generated: ${new Date().toISOString()}\n`));

  if (useWeekly) {
    const weeklyData = getCommitsByWeek(since);
    displayWeekTimeline(weeklyData);
  } else {
    const dailyData = getCommitsByDay(since);
    displayDayTimeline(dailyData);
    displayHotspots(dailyData);

    const velocity = calculateVelocity(dailyData);
    console.log(chalk.bold.yellow('\n📈 Velocity Metrics'));
    console.log(`  Average Daily Commits: ${velocity.avgDaily}`);
    console.log(`  Trend: ${velocity.trend}`);
  }

  const hourData = getCommitsByHour(since);
  displayHourTimeline(hourData);

  const dayOfWeekData = getCommitsByDayOfWeek(since);
  displayDayOfWeekTimeline(dayOfWeekData);

  console.log(chalk.bold.cyan('\n═══════════════════════════════════════════════════════════\n'));
}

main();
