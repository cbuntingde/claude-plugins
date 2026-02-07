#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const plugin = require('../index.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    files: null,
    output: null,
    exclude: ['**/node_modules/**', '**/*.generated.*', '**/dist/**', '**/build/**'],
    minCommits: 3
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--files' && i + 1 < args.length) {
      options.files = [];
      while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options.files.push(args[i + 1]);
        i++;
      }
      i++;
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[i + 1];
      i += 2;
    } else if (arg === '--exclude' && i + 1 < args.length) {
      options.exclude = [];
      while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options.exclude.push(args[i + 1]);
        i++;
      }
      i++;
    } else if (arg === '--min-commits' && i + 1 < args.length) {
      options.minCommits = parseInt(args[i + 1], 10);
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
Usage: node scripts/generate-config.js [options]

Generate CODEOWNERS suggestions based on git blame history.

Options:
  --files <patterns...>    Files/directories to analyze
  --output <path>          Output file path (default: stdout)
  --exclude <patterns...>  Patterns to exclude
  --min-commits <n>        Minimum commits to be owner (default: 3)
  --help, -h               Show this help
`);
}

function isExcluded(filePath, excludePatterns) {
  for (const pattern of excludePatterns) {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');

    if (new RegExp(regexPattern).test(filePath)) {
      return true;
    }
  }
  return false;
}

function getFileOwners(repoPath, filePath, minCommits) {
  try {
    const blameOutput = execSync(
      `git blame -e -- "${filePath}"`,
      {
        cwd: repoPath,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      }
    );

    const lines = blameOutput.split('\n');
    const authorCommits = new Map();

    for (const line of lines) {
      const emailMatch = line.match(/<([^>]+)>/);
      if (emailMatch) {
        const email = emailMatch[1];
        authorCommits.set(email, (authorCommits.get(email) || 0) + 1);
      }
    }

    const owners = [];
    for (const [email, commits] of authorCommits) {
      if (commits >= minCommits) {
        owners.push({ email, commits });
      }
    }

    return owners.sort((a, b) => b.commits - a.commits);
  } catch (e) {
    return [];
  }
}

function getAllFiles(repoPath, patterns) {
  const files = new Set();

  if (!patterns || patterns.length === 0) {
    try {
      const lsOutput = execSync('git ls-files', {
        cwd: repoPath,
        encoding: 'utf-8'
      });

      for (const file of lsOutput.split('\n').filter(Boolean)) {
        files.add(file);
      }
    } catch (e) {
      console.error('Error listing files:', e.message);
    }
  } else {
    for (const pattern of patterns) {
      try {
        const lsOutput = execSync(`git ls-files "${pattern}"`, {
          cwd: repoPath,
          encoding: 'utf-8'
        });

        for (const file of lsOutput.split('\n').filter(Boolean)) {
          files.add(file);
        }
      } catch (e) {
        // Pattern might not match, skip
      }
    }
  }

  return [...files];
}

function groupByDirectory(files) {
  const dirGroups = new Map();
  const rootFiles = [];

  for (const file of files) {
    const lastSlash = file.lastIndexOf('/');
    const dir = lastSlash > 0 ? file.substring(0, lastSlash + 1) : './';
    const filename = file.substring(lastSlash + 1);

    if (lastSlash === -1) {
      rootFiles.push(file);
      continue;
    }

    if (!dirGroups.has(dir)) {
      dirGroups.set(dir, []);
    }
    dirGroups.get(dir).push(filename);
  }

  return { dirGroups, rootFiles };
}

function generateOwnersEntry(dir, files, ownersMap, minCommits) {
  if (files.length === 0) return null;

  const pattern = dir === './' ? '*.md' : dir + '*';

  const fileOwners = new Map();

  for (const filename of files) {
    const filePath = dir === './' ? filename : dir + filename;
    const fullPath = dir === './' ? filename : dir + filename;

    const owners = getFileOwners(process.cwd(), fullPath, minCommits);

    for (const owner of owners) {
      if (!fileOwners.has(owner.email)) {
        fileOwners.set(owner.email, { email: owner.email, commits: 0, files: [] });
      }
      fileOwners.get(owner.email).commits += owner.commits;
      fileOwners.get(owner.email).files.push(filename);
    }
  }

  if (fileOwners.size === 0) return null;

  const topOwners = [...fileOwners.values()]
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 3)
    .map(o => o.email);

  return { pattern, owners: topOwners };
}

function generateCodeownersContent(fileGroups, repoPath, minCommits, excludePatterns) {
  const lines = [];

  lines.push('# CODEOWNERS');
  lines.push('# Generated by Review Squad Coordinator');
  lines.push('# ' + new Date().toISOString());
  lines.push('');

  lines.push('# ========================================');
  lines.push('# Directory-based ownership');
  lines.push('# ========================================\n');

  const { dirGroups } = fileGroups;
  const entries = [];

  for (const [dir, files] of dirGroups) {
    const filteredFiles = files.filter(f => !isExcluded(dir + f, excludePatterns));

    if (filteredFiles.length === 0) continue;

    const owners = getFileOwners(repoPath, dir + filteredFiles[0], minCommits);

    if (owners.length > 0) {
      entries.push({
        pattern: dir + '*',
        owners: owners.slice(0, 3).map(o => o.email),
        reason: `${filteredFiles.length} files in ${dir}`
      });
    }
  }

  const maxPatternLen = Math.max(...entries.map(e => e.pattern.length), 0) || 20;

  for (const entry of entries) {
    const padEnd = maxPatternLen - entry.pattern.length + 2;
    lines.push(`${entry.pattern}${' '.repeat(padEnd)}${entry.owners.join(' ')}  # ${entry.reason}`);
  }

  return lines.join('\n');
}

async function main() {
  const options = parseArgs();
  const repoPath = process.cwd();

  console.log('Review Squad Coordinator - CODEOWNERS Generator');
  console.log('='.repeat(50));

  console.log('\nDiscovering files...');
  const allFiles = getAllFiles(repoPath, options.files);
  console.log(`Found ${allFiles.length} tracked files`);

  console.log(`\nAnalyzing ownership (min ${options.minCommits} commits)...`);

  const fileGroups = groupByDirectory(allFiles);
  const content = generateCodeownersContent(
    fileGroups,
    repoPath,
    options.minCommits,
    options.exclude
  );

  if (!content.trim()) {
    console.log('\nNo ownership patterns found.');
    console.log('Consider:');
    console.log('1. Increasing --min-commits threshold');
    console.log('2. Analyzing specific directories with --files');
    console.log('3. Adding manual CODEOWNERS entries');
    process.exit(1);
  }

  if (options.output) {
    fs.writeFileSync(options.output, content);
    console.log(`\nCODEOWNERS file written to: ${options.output}`);
  } else {
    console.log('\nGenerated CODEOWNERS content:');
    console.log('-'.repeat(50));
    console.log(content);
  }

  console.log('\n' + '-'.repeat(50));
  console.log('Next steps:');
  console.log('1. Review the generated CODEOWNERS entries');
  console.log('2. Add team/group references if needed (e.g., @frontend-team)');
  console.log('3. Commit the CODEOWNERS file to your repository');

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});