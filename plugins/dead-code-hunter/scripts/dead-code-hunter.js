#!/usr/bin/env node

/**
 * Dead Code Hunter Command Script
 *
 * Integrates the dead code hunter functionality as a Claude Code command.
 */

const path = require('path');

// Get the plugin root directory
const PLUGIN_ROOT = path.resolve(__dirname, '..');

// Load the main module
const deadCodeHunter = require(path.join(PLUGIN_ROOT, 'index.js'));

// Destructure exports
const {
  generateReport,
  autoRemove,
  listBackups,
  restoreBackup,
  VERSION,
} = deadCodeHunter;

/**
 * Parse command-specific arguments
 */
function parseArgs(args) {
  const options = {
    types: ['js', 'ts'],
    exclude: [],
    depth: 10,
    report: false,
    dryRun: false,
    autoRemove: false,
    backup: false,
    listBackups: false,
    restore: null,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--types' && args[i + 1]) {
      options.types = args[i + 1].split(',');
      i += 2;
    } else if (arg === '--exclude' && args[i + 1]) {
      options.exclude = args[i + 1].split(',');
      i += 2;
    } else if (arg === '--depth' && args[i + 1]) {
      options.depth = parseInt(args[i + 1], 10);
      i += 2;
    } else if (arg === '--report') {
      options.report = true;
      i++;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
      i++;
    } else if (arg === '--auto-remove') {
      options.autoRemove = true;
      i++;
    } else if (arg === '--backup') {
      options.backup = true;
      i++;
    } else if (arg === '--list-backups') {
      options.listBackups = true;
      i++;
    } else if (arg === '--restore' && args[i + 1]) {
      options.restore = args[i + 1];
      i += 2;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else {
      i++;
    }
  }

  return options;
}

/**
 * Display command help
 */
function showHelp() {
  const help = `
# Dead Code Hunter

Scans your codebase to identify truly unused code, zombie configuration files, and dead assets.

## Usage

\`\`\`bash
/dead-code-hunter [options]
\`\`\`

## Options

| Option | Description |
|--------|-------------|
| \`--types <types>\` | File types to scan (js, ts, py, java, etc.) |
| \`--depth <n>\` | Directory depth to scan (default: 10) |
| \`--exclude <patterns>\` | Patterns to exclude (comma-separated) |
| \`--report\` | Generate a detailed report without making changes |
| \`--dry-run\` | Preview what would be removed without actual deletion |
| \`--auto-remove\` | Automatically remove confirmed dead code |
| \`--backup\` | Create backup before removal |
| \`--list-backups\` | List available backups |
| \`--restore <id>\` | Restore from a backup |

## Examples

\`\`\`bash
# Scan for dead code in JavaScript/TypeScript files
/dead-code-hunter --types js,ts

# Generate a report without making changes
/dead-code-hunter --report

# Preview removals without deleting
/dead-code-hunter --dry-run

# Scan with custom exclusions
/dead-code-hunter --exclude node_modules,dist,build
\`\`\`

## What It Detects

### Unused Code
- Functions never called
- Variables never used
- Classes never instantiated
- Imports without references
- Unreachable code (after return/throw)
- Dead else branches

### Zombie Files
- Files not referenced anywhere
- Orphaned test files
- Unused assets (images, styles, fonts)
- Stale configuration files
- Deprecated dependency files

### Unused Configuration
- package.json dependencies not imported
- Config sections never used
- Environment variables never referenced
- Build targets without output

## Safety Features

- **Backup Creation**: Automatically backs up before removal
- **Rollback Support**: Restore removed code with single command
- **Confirmation Prompts**: Asks before major deletions
- **Dry Run Mode**: Preview all changes before applying
- **Dependency Analysis**: Checks for cascading effects
`;

  console.log(help);
}

/**
 * Execute the dead code hunt
 *
 * @param {Object} options - Parsed command options
 */
function execute(options) {
  console.log(`\nDead Code Hunter v${VERSION}`);
  console.log(`Scanning for: ${options.types.join(', ')}`);
  console.log(`Excluding: ${options.exclude.join(', ') || 'nothing'}\n`);

  // Handle list-backups command
  if (options.listBackups) {
    const backups = listBackups();

    console.log('=== Available Backups ===\n');

    if (backups.length === 0) {
      console.log('No backups found\n');
    } else {
      for (const backup of backups) {
        console.log(`Backup ID: ${backup.id}`);
        console.log(`  Created: ${backup.timestamp}`);
        console.log(`  Files: ${backup.totalCount}\n`);
      }
    }

    return;
  }

  // Handle restore command
  if (options.restore) {
    const restoredCount = restoreBackup(options.restore);
    console.log(`Restore complete: ${restoredCount} files restored\n`);
    return;
  }

  // Normal scan/report or auto-remove mode
  if (options.autoRemove) {
    const result = autoRemove(options);

    if (options.dryRun) {
      console.log('\n[DRY RUN] No changes were made.\n');
    }

    return result;
  }

  // Report mode
  const report = generateReport(options);

  // Summary
  console.log('=== Summary ===');
  console.log(`Dead code items: ${report.findings.length}`);
  console.log(`Zombie files: ${report.zombieFiles.length}`);

  if (options.dryRun) {
    console.log('\n[DRY RUN] No changes were made.\n');
  } else {
    console.log();
  }

  return report;
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const options = parseArgs(args);
  execute(options);
}

// Run if executed directly
if (require.main === module) {
  main();
}