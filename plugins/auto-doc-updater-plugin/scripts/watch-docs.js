#!/usr/bin/env node
/**
 * Watch Documentation Script
 * Watches for file changes and notifies of documentation updates needed
 */

const fs = require('fs');
const path = require('path');

/**
 * Documentation Watcher
 */
class DocWatcher {
  constructor() {
    this.lastState = new Map();
    this.checkInterval = 30000; // 30 seconds default
    this.quiet = false;
  }

  /**
   * Start watching for changes
   */
  async watch(targetPath, options = {}) {
    this.checkInterval = (options.interval || 30) * 1000;
    this.quiet = options.quiet || false;

    console.log(`\nWatching ${targetPath} for changes...`);
    console.log(`Check interval: ${this.checkInterval / 1000} seconds`);
    console.log('Press Ctrl+C to stop.\n');

    // Initial scan
    await this.scan(targetPath);

    // Watch loop
    setInterval(async () => {
      await this.scan(targetPath);
    }, this.checkInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nStopping watcher...');
      process.exit(0);
    });

    // Keep process running
    return new Promise(() => {});
  }

  /**
   * Scan for changes
   */
  async scan(targetPath) {
    const patterns = ['**/*.ts', '**/*.js', '**/*.py', '**/*.java'];
    const files = [];

    try {
      const glob = require('glob');
      const matches = glob.sync(patterns, { cwd: targetPath });
      files.push(...matches.map(f => path.join(targetPath, f)));
    } catch {
      return;
    }

    const changes = [];

    for (const file of files) {
      const stat = await fs.promises.stat(file);
      const mtime = stat.mtimeMs;
      const prevMtime = this.lastState.get(file);

      if (!prevMtime || mtime > prevMtime) {
        this.lastState.set(file, mtime);
        if (prevMtime) {
          changes.push(file);
        }
      }
    }

    if (changes.length > 0 && !this.quiet) {
      this.reportChanges(changes);
    }
  }

  /**
   * Report changes detected
   */
  reportChanges(files) {
    console.log('\n' + '='.repeat(60));
    console.log('CHANGES DETECTED');
    console.log('='.repeat(60));

    for (const file of files) {
      console.log(`  ${path.basename(file)}`);
    }

    console.log('\nDocumentation may be needed for:');

    for (const file of files) {
      this.checkDocumentation(file);
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Check if file needs documentation
   */
  checkDocumentation(filePath) {
    const ext = path.extname(filePath);
    const docPath = filePath.replace(/\.[^.]+$/, '.md');

    if (!fs.existsSync(docPath)) {
      console.log(`  [!] No documentation found: ${path.basename(filePath)} -> ${path.basename(docPath)}`);
    }
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const watcher = new DocWatcher();

  let targetPath = '.';
  let options = { interval: 30, quiet: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--interval' || arg === '-i') {
      options.interval = parseInt(args[++i]) || 30;
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    } else if (!arg.startsWith('--')) {
      targetPath = arg;
    }
  }

  try {
    await watcher.watch(targetPath, options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DocWatcher;