#!/usr/bin/env node
/**
 * Run Quality Check
 * Executes all quality gate checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Quality Check Runner
 */
class QualityCheckRunner {
  constructor() {
    this.results = {
      linting: { passed: true, issues: 0 },
      tests: { passed: true, coverage: 0 },
      security: { passed: true, vulnerabilities: 0 }
    };
  }

  /**
   * Run all quality checks
   */
  async run(options = {}) {
    const fix = options.fix || false;
    const reportFormat = options.reportFormat || 'text';

    console.log('\n' + '='.repeat(60));
    console.log('QUALITY GATE CHECKS');
    console.log('='.repeat(60));

    // Run linting
    await this.runLinting(fix);

    // Run tests
    await this.runTests();

    // Run security scan
    await this.runSecurity();

    // Generate report
    const report = this.generateReport(reportFormat);
    this.printReport(report, reportFormat);

    return { passed: this.isPassing(), results: this.results, report };
  }

  /**
   * Run linting check
   */
  async runLinting(fix) {
    console.log('\n[Linting] Running...');

    try {
      // Check if package.json exists
      if (!fs.existsSync('package.json')) {
        console.log('[Linting] Skipped - no package.json found');
        return;
      }

      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

      if (!pkg.scripts?.lint) {
        console.log('[Linting] Skipped - no lint script configured');
        return;
      }

      if (fix) {
        execSync('npm run lint -- --fix', { stdio: 'inherit' });
      } else {
        execSync('npm run lint', { stdio: 'inherit' });
      }

      console.log('[Linting] Passed');
      this.results.linting.passed = true;
    } catch (error) {
      console.log('[Linting] Failed');
      this.results.linting.passed = false;
      this.results.linting.issues = error.message.includes('error') ? 1 : 0;
    }
  }

  /**
   * Run tests
   */
  async runTests() {
    console.log('\n[Tests] Running...');

    try {
      if (!fs.existsSync('package.json')) {
        console.log('[Tests] Skipped - no package.json found');
        return;
      }

      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

      if (!pkg.scripts?.test) {
        console.log('[Tests] Skipped - no test script configured');
        return;
      }

      const output = execSync('npm test -- --coverage', { encoding: 'utf-8' });

      // Parse coverage from output
      const coverageMatch = output.match(/All files.*?(\d+\.?\d*)%/);
      if (coverageMatch) {
        this.results.tests.coverage = parseFloat(coverageMatch[1]);
      }

      console.log(`[Tests] Passed - Coverage: ${this.results.tests.coverage}%`);
    } catch (error) {
      console.log('[Tests] Failed');
      this.results.tests.passed = false;
    }
  }

  /**
   * Run security scan
   */
  async runSecurity() {
    console.log('\n[Security] Scanning...');

    try {
      if (!fs.existsSync('package.json')) {
        console.log('[Security] Skipped - no package.json found');
        return;
      }

      const output = execSync('npm audit --audit-level=high --json', { encoding: 'utf-8' }).toString();

      try {
        const audit = JSON.parse(output);
        const vulnCount = audit.vulnerabilities ? Object.keys(audit.vulnerabilities).length : 0;

        if (vulnCount > 0) {
          console.log(`[Security] Found ${vulnCount} high/critical vulnerabilities`);
          this.results.security.passed = false;
          this.results.security.vulnerabilities = vulnCount;
        } else {
          console.log('[Security] Passed - No high vulnerabilities found');
        }
      } catch {
        console.log('[Security] Passed');
      }
    } catch (error) {
      // Audit passed if no high vulnerabilities
      if (error.message.includes('0 vulnerabilities')) {
        console.log('[Security] Passed');
      } else {
        console.log('[Security] Failed');
        this.results.security.passed = false;
      }
    }
  }

  /**
   * Check if all checks passed
   */
  isPassing() {
    return this.results.linting.passed &&
           this.results.tests.passed &&
           this.results.security.passed;
  }

  /**
   * Generate report
   */
  generateReport(format) {
    const report = {
      timestamp: new Date().toISOString(),
      passed: this.isPassing(),
      checks: { ...this.results }
    };

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    return report;
  }

  /**
   * Print report
   */
  printReport(report, format) {
    if (format === 'json') {
      console.log('\n' + report);
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('QUALITY GATE REPORT');
    console.log('='.repeat(60));

    console.log(`\nTimestamp: ${report.timestamp}`);
    console.log(`\nOverall: ${report.passed ? 'PASSED' : 'FAILED'}`);

    console.log('\nChecks:');
    console.log(`  Linting:  ${report.checks.linting.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Tests:    ${report.checks.tests.passed ? 'PASSED' : 'FAILED'} (${report.checks.tests.coverage}% coverage)`);
    console.log(`  Security: ${report.checks.security.passed ? 'PASSED' : 'FAILED'}`);

    console.log('\n' + '='.repeat(60));
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const runner = new QualityCheckRunner();

  let options = { fix: false, reportFormat: 'text' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--fix' || arg === '-f') {
      options.fix = true;
    } else if (arg === '--report-format' || arg === '-o') {
      options.reportFormat = args[++i] || 'text';
    }
  }

  try {
    const result = await runner.run(options);
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = QualityCheckRunner;