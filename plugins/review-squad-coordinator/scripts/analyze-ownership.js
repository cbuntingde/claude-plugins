#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const plugin = require('../index.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    since: null,
    output: 'text',
    pattern: null,
    threshold: 5
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--since' && i + 1 < args.length) {
      options.since = new Date(args[i + 1]);
      i += 2;
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[i + 1];
      i += 2;
    } else if (arg === '--pattern' && i + 1 < args.length) {
      options.pattern = args[i + 1];
      i += 2;
    } else if (arg === '--threshold' && i + 1 < args.length) {
      options.threshold = parseInt(args[i + 1], 10);
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
Usage: node scripts/analyze-ownership.js [options]

Analyze code ownership patterns and expertise distribution.

Options:
  --since <date>            Analyze commits since date (YYYY-MM-DD)
  --output <format>         Output format: text, json, markdown
  --pattern <glob>          Only analyze files matching pattern
  --threshold <n>           Minimum commits for expertise (default: 5)
  --help, -h                Show this help
`);
}

function analyzeCommits(repoPath, sinceDate, pattern = null) {
  try {
    const sinceArg = sinceDate
      ? ` --since="${sinceDate.toISOString().split('T')[0]}"`
      : '';

    const patternArg = pattern ? ` -- "${pattern}"` : '';

    const logOutput = execSync(
      `git log --pretty=format:"%an|%ae" --name-only${sinceArg}${patternArg}`,
      {
        cwd: repoPath,
        encoding: 'utf-8',
        maxBuffer: 100 * 1024 * 1024
      }
    );

    const commits = [];
    const lines = logOutput.split('\n');
    let currentAuthor = null;

    for (const line of lines) {
      if (line.includes('|')) {
        const [name, email] = line.split('|');
        currentAuthor = { name, email, files: new Set() };
        commits.push(currentAuthor);
      } else if (line.trim() && currentAuthor) {
        currentAuthor.files.add(line.trim());
      }
    }

    const authorStats = new Map();

    for (const commit of commits) {
      const existing = authorStats.get(commit.email) || {
        name: commit.name,
        email: commit.email,
        files: new Set(),
        commits: 0
      };

      for (const file of commit.files) {
        existing.files.add(file);
      }
      existing.commits++;

      authorStats.set(commit.email, existing);
    }

    return authorStats;
  } catch (e) {
    console.error('Error analyzing git history:', e.message);
    return new Map();
  }
}

function analyzeCodeowners(repoPath) {
  const config = plugin.loadConfig();
  const ownershipFile = path.join(repoPath, config.ownershipFile);

  if (!fs.existsSync(ownershipFile)) {
    return { patterns: [], coverage: 0 };
  }

  const content = fs.readFileSync(ownershipFile, 'utf-8');
  const { patterns } = plugin.parseCodeowners(content);

  try {
    const filesOutput = execSync('git ls-files', {
      cwd: repoPath,
      encoding: 'utf-8'
    });

    const allFiles = filesOutput.split('\n').filter(Boolean);
    const coveredFiles = new Set();

    for (const file of allFiles) {
      for (const { pattern } of patterns) {
        const regex = plugin.selectReviewers(null, { options: {} });
        const regexPattern = patternToRegex(pattern);
        if (regexPattern.test(file)) {
          coveredFiles.add(file);
          break;
        }
      }
    }

    return {
      patterns,
      coverage: allFiles.length > 0
        ? (coveredFiles.size / allFiles.length * 100).toFixed(1)
        : 0,
      coveredCount: coveredFiles.size,
      totalCount: allFiles.length
    };
  } catch (e) {
    return { patterns, coverage: 0 };
  }
}

function patternToRegex(pattern) {
  let regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '___STAR_STAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___\w+___/g, '.*')
    .replace(/\?/g, '.');

  if (!regexStr.startsWith('^')) {
    regexStr = '.*' + regexStr;
  }

  return new RegExp(regexStr);
}

function findOwnershipGaps(repoPath, authorStats) {
  const { execSync } = require('child_process');

  const gaps = [];

  try {
    const filesOutput = execSync('git ls-files', {
      cwd: repoPath,
      encoding: 'utf-8'
    });

    const allFiles = filesOutput.split('\n').filter(Boolean);
    const trackedAuthors = new Set(authorStats.keys());

    const fileOwners = new Map();

    for (const [email, stats] of authorStats) {
      for (const file of stats.files) {
        if (!fileOwners.has(file)) {
          fileOwners.set(file, new Set());
        }
        fileOwners.get(file).add(email);
      }
    }

    const ownedFiles = new Set(fileOwners.keys());
    const unownedFiles = allFiles.filter(f => !ownedFiles.has(f));

    if (unownedFiles.length > 0) {
      gaps.push({
        type: 'unowned_files',
        count: unownedFiles.length,
        examples: unownedFiles.slice(0, 10)
      });
    }

    const lowCoverageDirs = {};
    const dirFiles = {};

    for (const file of allFiles) {
      const dir = file.split('/')[0] || 'root';
      if (!dirFiles[dir]) {
        dirFiles[dir] = { total: 0, owned: 0 };
      }
      dirFiles[dir].total++;
      if (ownedFiles.has(file)) {
        dirFiles[dir].owned++;
      }
    }

    for (const [dir, counts] of Object.entries(dirFiles)) {
      const coverage = counts.total > 0 ? (counts.owned / counts.total) * 100 : 0;
      if (coverage < 50 && counts.total > 5) {
        gaps.push({
          type: 'low_coverage_directory',
          directory: dir,
          coverage: coverage.toFixed(1),
          owned: counts.owned,
          total: counts.total
        });
      }
    }
  } catch (e) {
    console.error('Error finding ownership gaps:', e.message);
  }

  return gaps;
}

function generateTextOutput(authorStats, codeowners, gaps) {
  const lines = [];

  lines.push('Code Ownership Analysis');
  lines.push('='.repeat(50));

  lines.push('\n## CODEOWNERS Coverage');
  if (codeowners.patterns.length > 0) {
    lines.push(`Patterns defined: ${codeowners.patterns.length}`);
    lines.push(`Coverage: ${codeowners.coverage}%`);
    if (codeowners.coveredCount !== undefined) {
      lines.push(`Files covered: ${codeowners.coveredCount}/${codeowners.totalCount}`);
    }
  } else {
    lines.push('No CODEOWNERS file found');
  }

  lines.push('\n## Expertise by Contributor');
  const sortedAuthors = [...authorStats.values()]
    .sort((a, b) => b.files.size - a.files.size);

  for (const author of sortedAuthors) {
    lines.push(`\n${author.name} <${author.email}>`);
    lines.push(`  Files: ${author.files.size}`);
    lines.push(`  Commits: ${author.commits}`);
  }

  if (gaps.length > 0) {
    lines.push('\n## Ownership Gaps');
    for (const gap of gaps) {
      lines.push(`\n- ${gap.type}:`);
      if (gap.count) lines.push(`  Count: ${gap.count}`);
      if (gap.directory) lines.push(`  Directory: ${gap.directory} (${gap.coverage}% coverage)`);
      if (gap.examples && gap.examples.length > 0) {
        lines.push(`  Examples: ${gap.examples.slice(0, 5).join(', ')}`);
      }
    }
  }

  return lines.join('\n');
}

function generateMarkdownOutput(authorStats, codeowners, gaps) {
  const lines = [];

  lines.push('# Code Ownership Analysis Report');
  lines.push(`\nGenerated: ${new Date().toISOString()}`);

  lines.push('\n## CODEOWNERS Coverage');
  if (codeowners.patterns.length > 0) {
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Patterns defined | ${codeowners.patterns.length} |`);
    lines.push(`| Coverage | ${codeowners.coverage}% |`);
    if (codeowners.coveredCount !== undefined) {
      lines.push(`| Files covered | ${codeowners.coveredCount}/${codeowners.totalCount} |`);
    }

    lines.push('\n### Defined Patterns');
    lines.push('| Pattern | Owners |');
    lines.push('|---------|--------|');
    for (const pattern of codeowners.patterns) {
      lines.push(`| \`${pattern.pattern}\` | ${pattern.owners.join(', ')} |`);
    }
  } else {
    lines.push('No CODEOWNERS file found');
  }

  lines.push('\n## Expertise by Contributor');
  lines.push('| Contributor | Files | Commits |');
  lines.push('|-------------|-------|---------|');
  const sortedAuthors = [...authorStats.values()]
    .sort((a, b) => b.files.size - a.files.size);

  for (const author of sortedAuthors) {
    lines.push(`| ${author.name} <${author.email}> | ${author.files.size} | ${author.commits} |`);
  }

  if (gaps.length > 0) {
    lines.push('\n## Ownership Gaps');
    for (const gap of gaps) {
      lines.push(`\n### ${gap.type.replace(/_/g, ' ').toUpperCase()}`);
      if (gap.count) lines.push(`- Count: ${gap.count}`);
      if (gap.directory) lines.push(`- Directory: ${gap.directory} (${gap.coverage}% coverage)`);
      if (gap.examples && gap.examples.length > 0) {
        lines.push(`- Examples: \`${gap.examples.slice(0, 5).join('`, `')}\``);
      }
    }
  }

  return lines.join('\n');
}

function generateJsonOutput(authorStats, codeowners, gaps) {
  const sortedAuthors = [...authorStats.values()]
    .sort((a, b) => b.files.size - a.files.size);

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    codeowners: {
      patterns: codeowners.patterns,
      coverage: codeowners.coverage,
      coveredCount: codeowners.coveredCount,
      totalCount: codeowners.totalCount
    },
    contributors: sortedAuthors.map(a => ({
      name: a.name,
      email: a.email,
      filesCount: a.files.size,
      commits: a.commits
    })),
    gaps
  }, null, 2);
}

async function main() {
  const options = parseArgs();
  const repoPath = process.cwd();

  console.log('Review Squad Coordinator - Ownership Analysis');
  console.log('='.repeat(50));

  console.log('\nAnalyzing git history...');
  const sinceDate = options.since || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  console.log(`Since: ${sinceDate.toISOString().split('T')[0]}`);

  const authorStats = analyzeCommits(repoPath, sinceDate, options.pattern);
  console.log(`Contributors found: ${authorStats.size}`);

  console.log('\nAnalyzing CODEOWNERS coverage...');
  const codeowners = analyzeCodeowners(repoPath);

  console.log('\nIdentifying ownership gaps...');
  const gaps = findOwnershipGaps(repoPath, authorStats);

  let output;
  switch (options.output) {
    case 'json':
      output = generateJsonOutput(authorStats, codeowners, gaps);
      break;
    case 'markdown':
      output = generateMarkdownOutput(authorStats, codeowners, gaps);
      break;
    default:
      output = generateTextOutput(authorStats, codeowners, gaps);
  }

  console.log('\n' + output);

  if (gaps.length > 0) {
    console.log('\n' + '-'.repeat(50));
    console.log('Recommendations:');
    console.log('1. Run /generate-owners to create CODEOWNERS suggestions');
    console.log('2. Consider adding ownership for high-traffic directories');
    console.log('3. Ensure all modified files have designated reviewers');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});