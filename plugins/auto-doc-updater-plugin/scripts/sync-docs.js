#!/usr/bin/env node
/**
 * Sync Documentation Script
 * Synchronizes documentation with code changes
 */

const fs = require('fs');
const path = require('path');

/**
 * Documentation Synchronizer
 */
class DocSynchronizer {
  constructor() {
    this.template = `## {name}

{summary}

### Parameters

| Name | Type | Description |
|------|------|-------------|
{params}

### Returns

| Type | Description |
|------|-------------|
{returns}

### Examples

\`\`\`{language}
{example}
\`\`\`
`;
  }

  /**
   * Sync documentation with code
   */
  async sync(sourcePath, options = {}) {
    const dryRun = options.dryRun !== false;
    const force = options.force || false;

    // Get git diff or file changes
    const changes = await this.getChanges(sourcePath);

    if (changes.length === 0) {
      console.log('No changes detected to sync.');
      return { synced: 0, changes: [] };
    }

    const results = [];

    for (const change of changes) {
      if (change.type === 'added') {
        const result = await this.generateDoc(change, dryRun, force);
        results.push(result);
      } else if (change.type === 'modified') {
        const result = await this.updateDoc(change, dryRun, force);
        results.push(result);
      }
    }

    this.printSummary(results, dryRun);
    return { synced: results.filter(r => r.synced).length, changes: results };
  }

  /**
   * Get changes from git or file system
   */
  async getChanges(sourcePath) {
    const changes = [];

    try {
      // Try to get git diff
      const { execSync } = require('child_process');
      const diff = execSync('git diff --name-status HEAD', { encoding: 'utf-8' });

      for (const line of diff.trim().split('\n')) {
        const [status, file] = line.split('\t');
        if (file && (file.startsWith(sourcePath) || sourcePath === '.')) {
          const ext = path.extname(file);
          if (['.ts', '.js', '.py', '.java'].includes(ext)) {
            changes.push({ file, type: status === 'A' ? 'added' : 'modified' });
          }
        }
      }
    } catch {
      // Fallback: analyze files directly
      const stats = await fs.promises.stat(sourcePath);
      if (stats.isFile()) {
        changes.push({ file: sourcePath, type: 'modified' });
      }
    }

    return changes;
  }

  /**
   * Generate documentation for new code
   */
  async generateDoc(change, dryRun, force) {
    const content = await fs.promises.readFile(change.file, 'utf-8');
    const docPath = change.file.replace(/\.[^.]+$/, '.md');

    // Extract function/class info
    const info = this.extractInfo(content);
    const doc = this.renderTemplate(info);

    if (dryRun) {
      return {
        file: change.file,
        docPath,
        action: 'would generate',
        synced: false,
        doc
      };
    }

    if (force || !fs.existsSync(docPath)) {
      await fs.promises.writeFile(docPath, doc);
      return { file: change.file, docPath, action: 'generated', synced: true };
    }

    return { file: change.file, docPath, action: 'skipped', synced: false };
  }

  /**
   * Update documentation for modified code
   */
  async updateDoc(change, dryRun, force) {
    const docPath = change.file.replace(/\.[^.]+$/, '.md');

    if (!fs.existsSync(docPath)) {
      return this.generateDoc({ ...change, type: 'added' }, dryRun, force);
    }

    const docContent = await fs.promises.readFile(docPath, 'utf-8');
    const updated = docContent;

    if (dryRun) {
      return {
        file: change.file,
        docPath,
        action: 'would update',
        synced: false,
        doc: 'Updated documentation content'
      };
    }

    await fs.promises.writeFile(docPath, updated);
    return { file: change.file, docPath, action: 'updated', synced: true };
  }

  /**
   * Extract function/class information from code
   */
  extractInfo(content) {
    const info = {
      name: 'Module',
      summary: 'Auto-generated documentation',
      params: [],
      returns: [],
      example: '// Usage example',
      language: 'typescript'
    };

    // Extract function
    const funcMatch = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) {
      info.name = funcMatch[1];
      const params = funcMatch[2].split(',').filter(p => p.trim());
      info.params = params.map(p => ({
        name: p.trim().split(':')[0].trim() || 'param',
        type: p.trim().split(':')[1]?.trim() || 'any',
        description: 'TODO: Add description'
      }));
    }

    // Extract class
    const classMatch = content.match(/class\s+(\w+)/);
    if (classMatch) {
      info.name = classMatch[1];
      info.summary = `Class representing ${classMatch[1]}`;
    }

    // Detect language
    const ext = path.extname('');
    if (ext === '.py') info.language = 'python';
    if (ext === '.js') info.language = 'javascript';

    return info;
  }

  /**
   * Render documentation template
   */
  renderTemplate(info) {
    let doc = this.template
      .replace('{name}', info.name)
      .replace('{summary}', info.summary)
      .replace('{language}', info.language)
      .replace('{example}', info.example);

    const paramsMd = info.params.map(p =>
      `| ${p.name} | ${p.type} | ${p.description} |`
    ).join('\n');
    doc = doc.replace('{params}', paramsMd || '| | | |');

    const returnsMd = info.returns.map(r =>
      `| ${r.type} | ${r.description} |`
    ).join('\n');
    doc = doc.replace('{returns}', returnsMd || '| void | |');

    return doc;
  }

  /**
   * Print sync summary
   */
  printSummary(results, dryRun) {
    console.log('\n' + '='.repeat(60));
    console.log('DOCUMENTATION SYNC' + (dryRun ? ' (DRY RUN)' : ''));
    console.log('='.repeat(60));

    for (const result of results) {
      const prefix = dryRun ? '[WOULD]' : '[DONE]';
      console.log(`  ${prefix} ${result.action} documentation for ${path.basename(result.file)}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${results.length} file(s) processed`);
    console.log(`Synced: ${results.filter(r => r.synced).length} file(s)`);
    console.log('='.repeat(60));
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const sync = new DocSynchronizer();

  let sourcePath = '.';
  let options = { dryRun: true, force: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
      options.dryRun = false;
    } else if (!arg.startsWith('--')) {
      sourcePath = arg;
    }
  }

  try {
    await sync.sync(sourcePath, options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DocSynchronizer;