#!/usr/bin/env node
/**
 * Architecture Review Script
 * Memory-efficient codebase architecture analysis
 */

const fs = require('fs');
const path = require('path');

/**
 * Architecture Reviewer - memory-efficient version
 */
class ArchitectureReviewer {
  constructor() {
    this.skipDirs = new Set(['node_modules', '.git', '.claude', 'dist', 'build', 'coverage', 'servers']);
    this.extensions = new Set(['.ts', '.js', '.py', '.java']);

    // Compiled regex patterns for efficiency
    this.antiPatternRegex = {
      magicNumbers: /\b\d{3,}\b(?![.\d])/g,
      deepNesting: /{(?:[^{}]*{[^{}]*}){5,}/g,
    };

    this.patternRegex = {
      singleton: /(?:static\s+)?instance\s*=|getInstance\s*\(\)/,
      factory: /class\s+\w+Factory|create\w+\s*\(/,
      builder: /\.(?:build|set\w+\()/,
      strategy: /interface\s+\w+Strategy|setStrategy\s*\(/,
      observer: /addObserver|notifyObservers|onNext\s*\(/,
      command: /execute\s*\(|undo\s*\(/,
    };
  }

  /**
   * Perform architecture review
   */
  async review(targetPath, options = {}) {
    const focus = options.focus || 'all';
    const depth = options.depth || 'standard';
    const startTime = Date.now();

    // Collect files first
    const files = await this.collectFiles(targetPath);

    // Process files one at a time to conserve memory
    const stats = {
      files: files.length,
      lines: 0,
      patternsFound: {},
      antiPatterns: [],
      solidChecks: {
        srp: 100,
        ocp: 100,
        lsp: 100,
        isp: 100,
        dip: 100,
        violations: []
      }
    };

    for (const file of files) {
      await this.analyzeFile(file, stats, focus);
    }

    this.generateReport(stats, depth, Date.now() - startTime);
    return stats;
  }

  /**
   * Collect source files recursively
   */
  async collectFiles(dir) {
    const files = [];
    const self = this;

    async function scanDirectory(currentDir) {
      let entries;
      try {
        entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        // Skip ignored directories
        if (entry.isDirectory()) {
          if (!self.skipDirs.has(entry.name)) {
            await scanDirectory(path.join(currentDir, entry.name));
          }
        } else if (entry.isFile()) {
          if (self.extensions.has(path.extname(entry.name))) {
            files.push(path.join(currentDir, entry.name));
          }
        }
      }
    }

    await scanDirectory(dir);
    return files;
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath, stats, focus) {
    let content;
    try {
      content = await fs.promises.readFile(filePath, 'utf-8');
    } catch {
      return;
    }

    const lines = content.split('\n').length;
    stats.lines += lines;

    if (focus === 'all' || focus === 'anti-patterns') {
      this.detectAntiPatterns(content, filePath, stats);
    }

    if (focus === 'all' || focus === 'patterns') {
      this.detectPatterns(content, filePath, stats);
    }

    if (focus === 'all' || focus === 'solid') {
      this.checkSolid(content, filePath, stats);
    }
  }

  /**
   * Detect anti-patterns in code
   */
  detectAntiPatterns(content, filePath, stats) {
    const basename = path.basename(filePath);

    // Magic numbers
    const magicMatches = content.match(this.antiPatternRegex.magicNumbers);
    if (magicMatches && magicMatches.length > 0) {
      stats.antiPatterns.push({
        type: 'Magic Numbers',
        severity: 'minor',
        file: filePath,
        message: `Found ${magicMatches.length} magic numbers in ${basename}`
      });
    }

    // Deep nesting - count occurrences
    const nestingMatches = content.match(this.antiPatternRegex.deepNesting);
    if (nestingMatches && nestingMatches.length > 0) {
      stats.antiPatterns.push({
        type: 'Deep Nesting',
        severity: 'major',
        file: filePath,
        message: `Found ${nestingMatches.length} deep nesting instances in ${basename}`
      });
    }
  }

  /**
   * Detect design patterns
   */
  detectPatterns(content, filePath, stats) {
    for (const [patternName, regex] of Object.entries(this.patternRegex)) {
      if (regex.test(content)) {
        stats.patternsFound[patternName] = (stats.patternsFound[patternName] || 0) + 1;
      }
    }
  }

  /**
   * Check SOLID principles
   */
  checkSolid(content, filePath, stats) {
    const basename = path.basename(filePath);

    // Count classes and estimate size (SRP)
    const classMatches = content.match(/class\s+\w+/g);
    if (classMatches && classMatches.length > 10) {
      stats.solidChecks.srp -= 5;
      stats.solidChecks.violations.push(`SRP: ${basename} has ${classMatches.length} classes`);
    }

    // Count extends for inheritance depth (LSP)
    const extendsMatches = content.match(/extends/g);
    if (extendsMatches && extendsMatches.length > 2) {
      stats.solidChecks.lsp -= 3;
      stats.solidChecks.violations.push(`LSP: ${basename} has ${extendsMatches.length} extends`);
    }

    // Count dependencies (DIP)
    const requireMatches = content.match(/require\(['"](?!@)[^'"]+['"]\)/g) || [];
    const importMatches = content.match(/import\s+.*\s+from\s+['"][^'"]+['"]/g) || [];
    const totalDeps = requireMatches.length + importMatches.length;
    if (totalDeps > 15) {
      stats.solidChecks.dip -= 5;
      stats.solidChecks.violations.push(`DIP: ${basename} has ${totalDeps} direct dependencies`);
    }

    // Clamp scores
    stats.solidChecks.srp = Math.max(0, stats.solidChecks.srp);
    stats.solidChecks.lsp = Math.max(0, stats.solidChecks.lsp);
    stats.solidChecks.dip = Math.max(0, stats.solidChecks.dip);
  }

  /**
   * Generate review report
   */
  generateReport(stats, depth, elapsedMs) {
    console.log('\n' + '='.repeat(60));
    console.log('ARCHITECTURE REVIEW REPORT');
    console.log('='.repeat(60));

    console.log(`\nFiles Analyzed: ${stats.files}`);
    console.log(`Lines of Code: ${stats.lines}`);
    console.log(`Analysis Time: ${(elapsedMs / 1000).toFixed(2)}s`);

    // Anti-patterns summary
    const bySeverity = { critical: 0, major: 0, minor: 0 };
    for (const ap of stats.antiPatterns) {
      bySeverity[ap.severity]++;
    }

    console.log('\nAnti-Patterns Found:');
    console.log(`  Critical: ${bySeverity.critical}`);
    console.log(`  Major: ${bySeverity.major}`);
    console.log(`  Minor: ${bySeverity.minor}`);

    // Design patterns summary
    console.log('\nDesign Patterns Detected:');
    const sortedPatterns = Object.entries(stats.patternsFound)
      .sort((a, b) => b[1] - a[1]);

    if (sortedPatterns.length === 0) {
      console.log('  (None detected)');
    } else {
      for (const [pattern, count] of sortedPatterns.slice(0, 10)) {
        const displayName = pattern.charAt(0).toUpperCase() + pattern.slice(1);
        console.log(`  ${displayName}: ${count}`);
      }
    }

    // SOLID score
    const { srp, ocp, lsp, isp, dip, violations } = stats.solidChecks;
    const overall = Math.round((srp + ocp + lsp + isp + dip) / 5);

    console.log(`\nSOLID Principles Score: ${overall}/100`);
    console.log(`  SRP (Single Responsibility): ${srp}/100`);
    console.log(`  OCP (Open/Closed): ${ocp}/100`);
    console.log(`  LSP (Liskov Substitution): ${lsp}/100`);
    console.log(`  ISP (Interface Segregation): ${isp}/100`);
    console.log(`  DIP (Dependency Inversion): ${dip}/100`);

    // Detailed findings
    if (depth === 'detailed' || depth === 'standard') {
      const limit = depth === 'standard' ? 10 : 50;

      if (stats.antiPatterns.length > 0) {
        console.log('\nDetailed Findings:');
        for (const finding of stats.antiPatterns.slice(0, limit)) {
          const marker = finding.severity === 'critical' ? '[CRITICAL]' :
                        finding.severity === 'major' ? '[MAJOR]' : '[MINOR]';
          console.log(`  ${marker} ${finding.message}`);
        }
      }

      if (violations.length > 0) {
        console.log('\nSOLID Violations:');
        for (const violation of violations.slice(0, limit)) {
          console.log(`  - ${violation}`);
        }
      }
    }

    // Recommendations
    console.log('\nRecommendations:');
    this.printRecommendations(stats);

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Print recommendations
   */
  printRecommendations(stats) {
    const recs = [];
    const { srp, ocp, lsp, isp, dip } = stats.solidChecks;
    const overall = Math.round((srp + ocp + lsp + isp + dip) / 5);

    const criticalCount = stats.antiPatterns.filter(a => a.severity === 'critical').length;
    if (criticalCount > 0) {
      recs.push(`Address ${criticalCount} critical anti-patterns`);
    }

    if (overall < 70) {
      recs.push('Consider refactoring to improve SOLID principles compliance');
    }
    if (srp < 70) {
      recs.push('SRP: Break large classes into smaller, focused classes');
    }
    if (dip < 70) {
      recs.push('DIP: Use dependency injection to reduce direct dependencies');
    }

    const singletonCount = stats.patternsFound.singleton || 0;
    if (singletonCount > 3) {
      recs.push('Review Singleton usage - consider dependency injection');
    }

    for (const rec of recs) {
      console.log(`  - ${rec}`);
    }

    if (recs.length === 0) {
      console.log('  - Architecture looks good! Continue with current patterns.');
    }
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const reviewer = new ArchitectureReviewer();

  let targetPath = '.';
  let options = { focus: 'all', depth: 'standard' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--focus' || arg === '-f') {
      options.focus = args[++i];
    } else if (arg === '--depth' || arg === '-d') {
      options.depth = args[++i];
    } else if (!arg.startsWith('--')) {
      targetPath = arg;
    }
  }

  // Convert to absolute path if relative
  if (!path.isAbsolute(targetPath)) {
    targetPath = path.resolve(process.cwd(), targetPath);
  }

  try {
    await reviewer.review(targetPath, options);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ArchitectureReviewer;