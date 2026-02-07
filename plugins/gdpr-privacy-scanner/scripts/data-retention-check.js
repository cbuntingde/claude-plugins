#!/usr/bin/env node

/**
 * Data Retention Check
 *
 * Validates data retention policies and practices against GDPR Article 5(1)(e)
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// Default retention configuration
const DEFAULT_RETENTION_DAYS = 365;

class RetentionPolicyChecker {
  constructor(options = {}) {
    this.options = {
      policy: options.policy || null,
      maxAge: options.maxAge || DEFAULT_RETENTION_DAYS,
      strict: options.strict || false,
      databases: options.databases || false,
      logs: options.logs || false,
      backups: options.backups || false,
      report: options.report || false,
      path: options.path || process.cwd()
    };

    this.violations = [];
    this.policy = null;
    this.stats = {
      categoriesChecked: 0,
      compliant: 0,
      nonCompliant: 0
    };
  }

  async check() {
    try {
      console.log('Starting Data Retention Check...');
      console.log(`Path: ${this.options.path}`);
      console.log('');

      await this.loadPolicy();
      await this.checkRetentionPolicies();
      await this.checkImplementation();
      this.generateReport();

      if (this.options.strict && this.stats.nonCompliant > 0) {
        return 1;
      }
      return 0;
    } catch (error) {
      console.error(`Check error: ${error.message}`);
      return 2;
    }
  }

  async loadPolicy() {
    if (this.options.policy) {
      const policyPath = path.resolve(this.options.policy);
      if (fs.existsSync(policyPath)) {
        try {
          const content = fs.readFileSync(policyPath, 'utf-8');
          this.policy = JSON.parse(content);
          console.log(`Loaded retention policy from: ${policyPath}`);
        } catch (error) {
          console.warn(`Failed to parse policy file: ${error.message}`);
        }
      }
    }

    if (!this.policy) {
      console.log('No retention policy file found, using default checks');
      console.log('');
    }
  }

  async checkRetentionPolicies() {
    if (!this.policy) {
      this.addViolation({
        category: 'policy_missing',
        severity: 'high',
        description: 'No retention policy file found',
        location: 'N/A',
        recommendation: 'Create retention-policy.json documenting all data categories and retention periods'
      });
      return;
    }

    const requiredFields = ['version', 'dataCategories'];
    for (const field of requiredFields) {
      if (!this.policy[field]) {
        this.addViolation({
          category: 'policy_invalid',
          severity: 'medium',
          description: `Missing required field: ${field}`,
          location: 'retention-policy.json',
          recommendation: `Add ${field} to retention policy`
        });
      }
    }

    if (this.policy.dataCategories) {
      for (const category of this.policy.dataCategories) {
        this.stats.categoriesChecked++;

        if (!category.retentionPeriodDays) {
          this.addViolation({
            category: category.category || 'unknown',
            severity: 'high',
            description: 'No retention period defined',
            location: 'retention-policy.json',
            recommendation: `Define retentionPeriodDays for ${category.category}`
          });
          this.stats.nonCompliant++;
        } else if (!category.deletionMethod) {
          this.addViolation({
            category: category.category,
            severity: 'medium',
            description: 'No deletion method specified',
            location: 'retention-policy.json',
            recommendation: 'Specify deletionMethod (e.g., secure_erase, soft_delete)'
          });
          this.stats.nonCompliant++;
        } else {
          this.stats.compliant++;
        }
      }
    }

    console.log(`Checked ${this.stats.categoriesChecked} data categories`);
    console.log('');
  }

  async checkImplementation() {
    const files = globSync('**/*.{js,ts,py,sql,sh}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundCleanupJobs = false;
    let foundSoftDelete = false;
    let foundRetentionLogic = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for cleanup jobs
      if (/cleanup|delete.*expired|retention.*delete/i.test(content)) {
        foundCleanupJobs = true;
        // Verify it's actually doing deletion
        if (!/DELETE|delete\(\)|\.remove\(\)/i.test(content)) {
          this.addViolation({
            category: 'cleanup_ineffective',
            severity: 'medium',
            description: 'Cleanup job found but may not be deleting data',
            location: file,
            recommendation: 'Verify cleanup job actually executes DELETE operations'
          });
        }
      }

      // Check for soft delete
      if (/deletedAt|deleted_at|isDeleted/i.test(content)) {
        foundSoftDelete = true;
      }

      // Check for retention logic
      if (/retention|data.*retention|ttl|timeToLive/i.test(content)) {
        foundRetentionLogic = true;
      }
    }

    if (!foundCleanupJobs) {
      this.addViolation({
        category: 'no_cleanup_jobs',
        severity: 'high',
        description: 'No automated data cleanup jobs found',
        location: 'codebase',
        recommendation: 'Implement scheduled cleanup jobs (cron, CloudWatch Events, etc.)'
      });
    }

    if (foundSoftDelete && !foundCleanupJobs) {
      this.addViolation({
        category: 'soft_delete_no_purge',
        severity: 'high',
        description: 'Soft delete implemented but no permanent deletion',
        location: 'codebase',
        recommendation: 'Implement cascading permanent deletion after soft delete period'
      });
    }

    if (!foundRetentionLogic) {
      this.addViolation({
        category: 'no_retention_logic',
        severity: 'medium',
        description: 'No data retention logic implementation found',
        location: 'codebase',
        recommendation: 'Implement TTL, retention policies, or scheduled deletion'
      });
    }
  }

  addViolation(violation) {
    this.violations.push({
      ...violation,
      id: `VIOL-${this.violations.length + 1}`
    });
  }

  generateReport() {
    console.log('Data Retention Compliance Report');
    console.log('=================================');
    console.log('');

    const policyFile = this.options.policy || 'none';
    console.log(`Policy File: ${policyFile}`);
    console.log(`Evaluation Date: ${new Date().toISOString()}`);
    console.log('');

    console.log('Summary:');
    console.log('├── Data Categories Checked:', this.stats.categoriesChecked);
    console.log('├── Compliant:', this.stats.compliant);
    console.log('├── Non-Compliant:', this.stats.nonCompliant);
    console.log('└── Overall Status:', this.stats.nonCompliant > 0 ? 'NON-COMPLIANT' : 'COMPLIANT');
    console.log('');

    if (this.violations.length > 0) {
      console.log('Violations:');
      console.log('───────────');

      const critical = this.violations.filter(v => v.severity === 'critical');
      const high = this.violations.filter(v => v.severity === 'high');
      const medium = this.violations.filter(v => v.severity === 'medium');
      const low = this.violations.filter(v => v.severity === 'low');

      [...critical, ...high, ...medium, ...low].forEach(v => {
        console.log(`┌────────────────────────────────────────────────────────────────────────────┐`);
        console.log(`│ Category: ${v.category.padEnd(68)}│`);
        console.log(`│ Location: ${v.location.padEnd(68)}│`);
        console.log(`│ Status: ${v.description.padEnd(68)}│`);
        console.log(`│ Impact: GDPR Article 5(1)(e) - Storage Limitation${' '.repeat(32)}│`);
        console.log(`│ Recommendation: ${v.recommendation.substring(0, 66)}...│`);
        console.log(`└────────────────────────────────────────────────────────────────────────────┘`);
      });
      console.log('');
    }

    const score = this.stats.categoriesChecked > 0
      ? Math.round((this.stats.compliant / this.stats.categoriesChecked) * 100)
      : 0;

    console.log(`Compliance Score: ${score}%`);
    console.log('');

    console.log('Best Practice Recommendations:');
    console.log('├── Implement soft-delete with cascading permanent deletion');
    console.log('├── Set up scheduled cleanup jobs (cron/CloudWatch Events)');
    console.log('├── Document legal basis for each retention period');
    console.log('├── Implement data retention audit logs');
    console.log('└── Review retention periods annually');
    console.log('');

    if (this.options.report) {
      this.generateDetailedReport();
    }
  }

  generateDetailedReport() {
    const reportPath = path.join(this.options.path, 'retention-compliance-report.json');
    const report = {
      generatedAt: new Date().toISOString(),
      policy: this.policy,
      statistics: this.stats,
      violations: this.violations,
      recommendations: [
        'Implement soft-delete with cascading permanent deletion',
        'Set up scheduled cleanup jobs',
        'Document legal basis for each retention period',
        'Implement data retention audit logs',
        'Review retention periods annually'
      ]
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Detailed report saved to: ${reportPath}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    policy: null,
    maxAge: DEFAULT_RETENTION_DAYS,
    strict: false,
    databases: false,
    logs: false,
    backups: false,
    report: false,
    path: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--policy':
      case '-p':
        options.policy = args[++i];
        break;
      case '--max-age':
        options.maxAge = parseInt(args[++i], 10);
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--databases':
        options.databases = true;
        break;
      case '--logs':
        options.logs = true;
        break;
      case '--backups':
        options.backups = true;
        break;
      case '--report':
        options.report = true;
        break;
    }
  }

  const checker = new RetentionPolicyChecker(options);
  const exitCode = await checker.check();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = RetentionPolicyChecker;
