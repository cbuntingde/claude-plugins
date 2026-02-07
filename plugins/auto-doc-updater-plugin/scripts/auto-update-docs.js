#!/usr/bin/env node
/**
 * Auto Update Documentation Script
 * Analyzes code changes and suggests documentation updates
 */

const fs = require('fs');
const path = require('path');

/**
 * Documentation Updater
 */
class AutoDocUpdater {
  constructor() {
    this.codePatterns = {
      js: {
        function: /function\s+(\w+)\s*\(([^)]*)\)/g,
        class: /class\s+(\w+)\s*(?:extends\s+\w+)?\s*{/g,
        export: /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/g
      },
      ts: {
        function: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\):\s*(\w+)/g,
        class: /class\s+(\w+)\s*(?:extends\s+\w+)?\s*{/g,
        interface: /interface\s+(\w+)\s*{/g,
        type: /type\s+(\w+)\s*=/g
      },
      python: {
        function: /def\s+(\w+)\s*\(([^)]*)\):/g,
        class: /class\s+(\w+)(?:\([^)]*\))?:\s*$/g
      }
    };
  }

  /**
   * Run documentation analysis
   */
  async analyze(targetPath, options = {}) {
    const output = options.output || 'text';
    const fullAudit = options.full || false;

    const results = {
      filesAnalyzed: 0,
      functionsFound: 0,
      undocumentedCount: 0,
      outdatedCount: 0,
      suggestions: [],
      coverage: 0
    };

    try {
      const files = await this.findFiles(targetPath, options);
      results.filesAnalyzed = files.length;

      for (const file of files) {
        const analysis = await this.analyzeFile(file, fullAudit);
        results.functionsFound += analysis.functions.length;
        results.suggestions.push(...analysis.suggestions);
      }

      // Count undocumented functions
      for (const sugg of results.suggestions) {
        if (sugg.type === 'undocumented') results.undocumentedCount++;
        if (sugg.type === 'outdated') results.outdatedCount++;
      }

      // Calculate coverage
      const total = results.functionsFound;
      results.coverage = total > 0
        ? Math.round(((total - results.undocumentedCount) / total) * 100)
        : 100;

      // Output results
      this.printResults(results, output);
      return results;
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Find files to analyze
   */
  async findFiles(dir, options) {
    const patterns = ['**/*.ts', '**/*.js', '**/*.py', '**/*.java'];
    const files = [];

    try {
      const stat = await fs.promises.stat(dir);
      if (stat.isDirectory()) {
        for (const pattern of patterns) {
          const glob = require('glob');
          const matches = glob.sync(pattern, { cwd: dir });
          files.push(...matches.map(f => path.join(dir, f)));
        }
      } else if (stat.isFile()) {
        files.push(dir);
      }
    } catch {
      files.push(dir);
    }

    return files;
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath, fullAudit) {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath);
    const lang = this.getLanguage(ext);
    const patterns = this.codePatterns[lang] || this.codePatterns.js;

    const functions = [];
    const suggestions = [];
    const lines = content.split('\n');

    // Find functions/classes
    for (const [type, regex] of Object.entries(patterns)) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const name = match[1];

        // Check if documented
        const isDocumented = this.isDocumented(lines, lineNum - 1);

        functions.push({ name, type, line: lineNum, documented: isDocumented });

        if (!isDocumented) {
          suggestions.push({
            file: filePath,
            line: lineNum,
            name,
            type: 'undocumented',
            suggestion: `Add documentation for ${type} "${name}"`
          });
        } else if (fullAudit && this.isOutdated(lines, lineNum - 1, name)) {
          suggestions.push({
            file: filePath,
            line: lineNum,
            name,
            type: 'outdated',
            suggestion: `Review documentation for ${type} "${name}"`
          });
        }
      }
    }

    return { functions, suggestions };
  }

  /**
   * Check if function is documented
   */
  isDocumented(lines, funcLine) {
    // Check lines before function for documentation comments
    const startLine = Math.max(0, funcLine - 10);
    for (let i = funcLine - 1; i >= startLine; i--) {
      const line = lines[i]?.trim();
      if (line === '' || line.startsWith('//') || line.startsWith('/*') ||
          line.startsWith('*') || line.startsWith('#') || line.startsWith('"""') ||
          line.startsWith("'''")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if documentation might be outdated
   */
  isOutdated(lines, funcLine, name) {
    // Simple check: if documentation mentions "TODO" or "FIXME"
    const startLine = Math.max(0, funcLine - 10);
    for (let i = funcLine - 1; i >= startLine; i--) {
      const line = lines[i]?.toLowerCase() || '';
      if (line.includes('todo') || line.includes('fixme')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get language from extension
   */
  getLanguage(ext) {
    const map = { '.ts': 'ts', '.js': 'js', '.py': 'python', '.java': 'java' };
    return map[ext] || 'js';
  }

  /**
   * Print analysis results
   */
  printResults(results, output) {
    if (output === 'json') {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('DOCUMENTATION ANALYSIS REPORT');
    console.log('='.repeat(60));

    console.log(`\nFiles Analyzed: ${results.filesAnalyzed}`);
    console.log(`Functions/Classes Found: ${results.functionsFound}`);
    console.log(`Documentation Coverage: ${results.coverage}%`);

    console.log('\nIssues Found:');
    console.log(`  Undocumented: ${results.undocumentedCount}`);
    console.log(`  Potentially Outdated: ${results.outdatedCount}`);

    if (results.suggestions.length > 0) {
      console.log('\nSuggestions:');
      for (const sugg of results.suggestions.slice(0, 20)) {
        const emoji = sugg.type === 'undocumented' ? '[!]' : '[i]';
        console.log(`  ${emoji} ${sugg.suggestion}`);
        console.log(`      File: ${path.basename(sugg.file)}:${sugg.line}`);
      }
      if (results.suggestions.length > 20) {
        console.log(`  ... and ${results.suggestions.length - 20} more`);
      }
    }

    console.log('\n' + '='.repeat(60));
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const updater = new AutoDocUpdater();

  let targetPath = '.';
  let options = { output: 'text', full: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--file') {
      targetPath = args[++i];
    } else if (arg === '--full') {
      options.full = true;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (!arg.startsWith('--')) {
      targetPath = arg;
    }
  }

  try {
    await updater.analyze(targetPath, options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoDocUpdater;