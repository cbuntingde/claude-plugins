#!/usr/bin/env node

/**
 * Right to Be Forgotten Validator
 *
 * Validates implementation of GDPR Article 17 - Right to Erasure
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

class ErasureValidator {
  constructor(options = {}) {
    this.options = {
      userId: options.userId || null,
      checkCascades: options.checkCascades || false,
      checkBackups: options.checkBackups || false,
      checkLogs: options.checkLogs || false,
      checkThirdParties: options.checkThirdParties || false,
      dryRun: options.dryRun || false,
      validate: options.validate || false,
      path: options.path || process.cwd()
    };

    this.violations = [];
    this.passedChecks = [];
    this.tablesAffected = [];
  }

  async validate() {
    try {
      console.log('Validating Right to Erasure Implementation...');
      console.log(`Path: ${this.options.path}`);
      console.log('');

      await this.checkErasureHandler();
      await this.checkCascadingDeletion();
      await this.checkIdentityVerification();
      await this.checkBackupHandling();
      await this.checkThirdPartyNotification();
      await this.checkLegalHolds();
      this.generateReport();

      return 0;
    } catch (error) {
      console.error(`Validation error: ${error.message}`);
      return 2;
    }
  }

  async checkErasureHandler() {
    console.log('Checking erasure handler...');

    const files = globSync('**/*.{js,ts,py}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundErasureEndpoint = false;
    let foundDeletionLogic = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for erasure/erasure/deletion endpoint
      if (/erasure|delete.*user|right.*to.*forget|gdpr.*delete/i.test(content)) {
        foundErasureEndpoint = true;

        // Check for actual deletion
        if (/DELETE|delete\(|\.remove\(\)|destroy/i.test(content)) {
          foundDeletionLogic = true;
        }
      }
    }

    if (foundErasureEndpoint) {
      this.passedChecks.push('Erasure request endpoint found');
    } else {
      this.violations.push({
        rule: 'Erasure Endpoint',
        severity: 'critical',
        file: 'N/A',
        description: 'No user deletion/erasure endpoint found',
        gdprArticle: 'Article 17 - Right to Erasure',
        recommendation: 'Implement DELETE /users/:id endpoint for right to erasure'
      });
    }

    if (foundDeletionLogic) {
      this.passedChecks.push('Deletion logic implemented');
    }

    console.log('');
  }

  async checkCascadingDeletion() {
    console.log('Checking cascading deletion...');

    const files = globSync('**/*.{js,ts,py,sql}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    const userTables = new Set();
    const cascadeDeletionFound = new Set();

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Detect user-related tables
      const tableMatches = content.match(/(?:from|into|table)\s+(\w*(?:user|customer|account|profile)\w*)/gi);
      if (tableMatches) {
        tableMatches.forEach(match => {
          const tableName = match.replace(/(?:from|into|table)\s+/i, '');
          userTables.add(tableName);
        });
      }

      // Check for cascading deletion
      if (/CASCADE|ON DELETE CASCADE|cascade.*delete/i.test(content)) {
        cascadeDeletionFound.add(file);
      }
    }

    this.tablesAffected = Array.from(userTables);

    if (cascadeDeletionFound.size > 0) {
      this.passedChecks.push(`Cascading deletion found in ${cascadeDeletionFound.size} file(s)`);
    } else {
      this.violations.push({
        rule: 'Cascading Deletion',
        severity: 'critical',
        file: 'database schema',
        description: 'User deletion does not cascade to related tables',
        gdprArticle: 'Article 17(1) - Complete erasure not achieved',
        recommendation: 'Implement foreign key cascades or manual deletion of related records',
        tables: Array.from(userTables)
      });
    }

    console.log('');
  }

  async checkIdentityVerification() {
    console.log('Checking identity verification...');

    const files = globSync('**/*.{js,ts,py}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundIdentityCheck = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for identity verification before deletion
      if (/verifyIdentity|checkAuth|authenticate.*before|identity.*verified/i.test(content)) {
        foundIdentityCheck = true;
      }
    }

    if (foundIdentityCheck) {
      this.passedChecks.push('Identity verification mechanism found');
    } else {
      this.violations.push({
        rule: 'Identity Verification',
        severity: 'critical',
        file: 'erasure handler',
        description: 'Erasure requests processed without identity verification',
        gdprArticle: 'Article 12 - Identity verification required',
        recommendation: 'Implement robust identity verification before processing erasure requests'
      });
    }

    console.log('');
  }

  async checkBackupHandling() {
    console.log('Checking backup deletion...');

    const files = globSync('**/*.{js,ts,py,sh,yaml,yml}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', **/dist/**, '**/.git/**'],
      nodir: true
    });

    let foundBackupDeletion = false;
    let foundImmutableLogs = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for backup deletion logic
      if (/backup.*delete|delete.*backup|expir(e|y).*backup/i.test(content)) {
        foundBackupDeletion = true;
      }

      // Check for immutable logs (alternative approach)
      if (/immutable|WORM|write.*once|retention.*policy/i.test(content)) {
        foundImmutableLogs = true;
      }
    }

    if (foundBackupDeletion) {
      this.passedChecks.push('Backup deletion mechanism found');
    } else if (foundImmutableLogs) {
      this.passedChecks.push('Immutable logs with expiry found');
    } else {
      this.violations.push({
        rule: 'Backup Deletion',
        severity: 'high',
        file: 'backup system',
        description: 'No mechanism to delete user data from backups',
        gdprArticle: 'Article 17(1) - Data must be erased from all storage',
        recommendation: 'Queue deletion from backups or implement immutable logs with expiry'
      });
    }

    console.log('');
  }

  async checkThirdPartyNotification() {
    console.log('Checking third-party notification...');

    const files = globSync('**/*.{js,ts,py}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundNotification = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for third-party notification on deletion
      if (/notify.*third.*party|notify.*processor|inform.*vendor/i.test(content)) {
        foundNotification = true;
      }
    }

    if (foundNotification) {
      this.passedChecks.push('Third-party notification system found');
    } else {
      this.violations.push({
        rule: 'Third-Party Notification',
        severity: 'medium',
        file: 'erasure handler',
        description: 'No notification to third parties when data is erased',
        gdprArticle: 'Article 17(2) - Controller must inform third parties',
        recommendation: 'Implement notification system to all data processors when user data is erased'
      });
    }

    console.log('');
  }

  async checkLegalHolds() {
    console.log('Checking legal hold handling...');

    const files = globSync('**/*.{js,ts,py,sql}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', **/dist/**, '**/.git/**'],
      nodir: true
    });

    let foundLegalHoldCheck = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for legal hold checks before deletion
      if (/legal.*hold|hold.*legal|litigation.*hold|retention.*hold/i.test(content)) {
        foundLegalHoldCheck = true;
      }
    }

    if (foundLegalHoldCheck) {
      this.passedChecks.push('Legal hold checking found');
    } else {
      this.violations.push({
        rule: 'Legal Hold Checks',
        severity: 'medium',
        file: 'erasure handler',
        description: 'Erasure does not check for legal holds before deletion',
        gdprArticle: 'Article 17(3) - Deletion may be refused for legal obligations',
        recommendation: 'Implement legal hold tracking system to prevent deletion when required by law'
      });
    }

    console.log('');
  }

  generateReport() {
    console.log('');
    console.log('Right to Erasure Validation Report');
    console.log('===================================');
    console.log('');
    console.log(`Evaluation Date: ${new Date().toISOString()}`);
    console.log(`GDPR Article: Article 17 - Right to Erasure`);
    console.log('');

    const score = this.passedChecks.length + this.violations.length > 0
      ? Math.round((this.passedChecks.length / (this.passedChecks.length + this.violations.length)) * 100)
      : 0;

    console.log(`Overall Status: ${this.violations.length > 0 ? 'NON-COMPLIANT' : 'COMPLIANT'}`);
    console.log(`Compliance Score: ${score}%`);
    console.log('');

    if (this.violations.length > 0) {
      console.log('Critical Issues:');
      console.log('─────────────────');

      const critical = this.violations.filter(v => v.severity === 'critical');
      const high = this.violations.filter(v => v.severity === 'high');
      const medium = this.violations.filter(v => v.severity === 'medium');

      [...critical, ...high, ...medium].forEach(v => {
        console.log(`┌────────────────────────────────────────────────────────────────────────────┐`);
        console.log(`│ Rule: ${v.rule.padEnd(68)}│`);
        console.log(`│ Location: ${v.file.padEnd(67)}│`);
        console.log(`│ Severity: ${v.severity.toUpperCase().padEnd(63)}│`);
        console.log(`│ Issue: ${v.description.substring(0, 66)}...│`);
        console.log(`│ Impact: ${v.gdprArticle.substring(0, 67)}...│`);
        console.log(`│ Fix: ${v.recommendation.substring(0, 70)}...│`);
        console.log(`└────────────────────────────────────────────────────────────────────────────┘`);
      });
      console.log('');
    }

    if (this.passedChecks.length > 0) {
      console.log('Passed Checks:');
      console.log('──────────────');
      this.passedChecks.forEach(check => {
        console.log(`  ✓ ${check}`);
      });
      console.log('');
    }

    if (this.tablesAffected.length > 0) {
      console.log('Tables Affected by User Deletion:');
      console.log('─────────────────────────────────');
      this.tablesAffected.forEach(table => {
        console.log(`  ├── ${table}`);
      });
      console.log('');
    }

    console.log('Implementation Checklist:');
    console.log('─────────────────────────');
    console.log('  [ ] Erasure Request API');
    console.log('  [ ] Identity Verification');
    console.log('  [ ] Cascading Deletion');
    console.log('  [ ] Backup Handling');
    console.log('  [ ] Third-Party Notification');
    console.log('  [ ] Legal Hold Checks');
    console.log('  [ ] Request Tracking');
    console.log('  [ ] User Confirmation');
    console.log('');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    userId: null,
    checkCascades: false,
    checkBackups: false,
    checkLogs: false,
    checkThirdParties: false,
    dryRun: false,
    validate: false,
    path: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--user-id':
        options.userId = args[++i];
        break;
      case '--check-cascades':
        options.checkCascades = true;
        break;
      case '--check-backups':
        options.checkBackups = true;
        break;
      case '--check-logs':
        options.checkLogs = true;
        break;
      case '--check-third-parties':
        options.checkThirdParties = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--validate':
        options.validate = true;
        break;
    }
  }

  const validator = new ErasureValidator(options);
  const exitCode = await validator.validate();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = ErasureValidator;
