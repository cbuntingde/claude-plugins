#!/usr/bin/env node

/**
 * Consent Validate
 *
 * Validates consent management implementation against GDPR Article 7
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

class ConsentValidator {
  constructor(options = {}) {
    this.options = {
      consentTypes: options.consentTypes ? options.consentTypes.split(',') : ['all'],
      checkUI: options.checkUi || false,
      checkStorage: options.checkStorage || false,
      checkWithdrawal: options.checkWithdrawal || false,
      checkAge: options.checkAge || false,
      strict: options.strict || false,
      path: options.path || process.cwd()
    };

    this.violations = [];
    this.passedChecks = [];
  }

  async validate() {
    try {
      console.log('Starting Consent Validation...');
      console.log(`Path: ${this.options.path}`);
      console.log('');

      await this.checkConsentCollection();
      await this.checkConsentStorage();
      await this.checkConsentWithdrawal();
      await this.checkCookieConsent();
      this.generateReport();

      if (this.options.strict && this.violations.length > 0) {
        return 1;
      }
      return 0;
    } catch (error) {
      console.error(`Validation error: ${error.message}`);
      return 2;
    }
  }

  async checkConsentCollection() {
    console.log('Checking consent collection...');

    const files = globSync('**/*.{js,jsx,ts,tsx,html,vue}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundConsentForm = false;
    let foundPreChecked = false;
    let foundGranularOptions = false;
    let foundAffirmativeAction = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for consent form
      if (/consent.*form|cookie.*banner|privacy.*modal/i.test(content)) {
        foundConsentForm = true;
      }

      // Check for pre-checked boxes (violation)
      if (/checked\s*default|defaultChecked|:checked=\{true\}/i.test(content)) {
        foundPreChecked = true;
        this.addViolation({
          rule: 'No Pre-Checked Boxes',
          file: file,
          severity: 'critical',
          description: 'Pre-checked consent boxes detected',
          gdprArticle: 'Article 7(2) - Consent must be opt-in',
          recommendation: 'Remove pre-checked attributes. Consent must be affirmative action.'
        });
      }

      // Check for granular options
      if (/analytics.*checkbox|marketing.*checkbox|cookie.*category/i.test(content)) {
        foundGranularOptions = true;
      }

      // Check for explicit opt-in (affirmative action)
      if (/(onClick|onSubmit|addEventListener).*consent/i.test(content)) {
        foundAffirmativeAction = true;
      }
    }

    if (!foundConsentForm) {
      this.addViolation({
        rule: 'Consent UI Missing',
        file: 'N/A',
        severity: 'critical',
        description: 'No consent form or cookie banner found',
        gdprArticle: 'Article 7 - Conditions for Consent',
        recommendation: 'Implement a consent banner/form for data collection'
      });
    } else {
      this.passedChecks.push('Consent UI present');
    }

    if (!foundPreChecked) {
      this.passedChecks.push('No pre-checked consent boxes');
    }

    if (foundGranularOptions) {
      this.passedChecks.push('Granular consent options detected');
    } else {
      this.addViolation({
        rule: 'Granular Consent',
        file: 'consent UI',
        severity: 'critical',
        description: 'No granular consent options found',
        gdprArticle: 'Article 7(2) - Consent must be specific and granular',
        recommendation: 'Implement separate consent checkboxes for each processing purpose'
      });
    }

    if (foundAffirmativeAction) {
      this.passedChecks.push('Affirmative action required for consent');
    }

    console.log('');
  }

  async checkConsentStorage() {
    console.log('Checking consent storage...');

    const files = globSync('**/*.{js,ts,py}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundConsentStorage = false;
    let foundTimestamp = false;
    let foundPolicyVersion = false;
    let foundIPRecording = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for consent storage
      if (/consent.*storage|saveConsent|storeConsent/i.test(content)) {
        foundConsentStorage = true;

        // Check for timestamp
        if (/timestamp|givenAt|grantedAt|createdAt/i.test(content)) {
          foundTimestamp = true;
        }

        // Check for policy version
        if (/policyVersion|consentVersion/i.test(content)) {
          foundPolicyVersion = true;
        }

        // Check for IP address recording (good practice)
        if (/ipAddress|request\.ip/i.test(content)) {
          foundIPRecording = true;
        }
      }
    }

    if (!foundConsentStorage) {
      this.addViolation({
        rule: 'Consent Record-Keeping',
        file: 'N/A',
        severity: 'medium',
        description: 'No consent storage mechanism found',
        gdprArticle: 'Article 7(1) - Controller must demonstrate consent',
        recommendation: 'Implement consent record storage with timestamp and policy version'
      });
    } else {
      this.passedChecks.push('Consent storage mechanism found');

      if (!foundTimestamp) {
        this.addViolation({
          rule: 'Consent Timestamp',
          file: 'consent storage',
          severity: 'medium',
          description: 'Consent records lack timestamp',
          gdprArticle: 'Article 7(1) - Demonstrate when consent was given',
          recommendation: 'Add timestamp to all consent records'
        });
      } else {
        this.passedChecks.push('Consent timestamp recorded');
      }

      if (!foundPolicyVersion) {
        this.addViolation({
          rule: 'Policy Version Tracking',
          file: 'consent storage',
          severity: 'low',
          description: 'Consent records lack policy version',
          gdprArticle: 'Article 7 - Demonstrate applicable policy',
          recommendation: 'Record policy version with consent for audit trail'
        });
      }

      if (foundIPRecording) {
        this.passedChecks.push('IP address recorded with consent');
      }
    }

    console.log('');
  }

  async checkConsentWithdrawal() {
    console.log('Checking consent withdrawal...');

    const files = globSync('**/*.{js,ts,py}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundWithdrawalEndpoint = false;
    let foundWithdrawalHandler = false;
    let foundSelfService = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for withdrawal endpoint
      if (/withdraw.*consent|revoke.*consent|consent.*withdraw/i.test(content)) {
        foundWithdrawalHandler = true;

        // Check if it's an API endpoint
        if (/router\.|app\.|endpoint|@route|@Post/i.test(content)) {
          foundWithdrawalEndpoint = true;
        }
      }

      // Check for self-service UI
      if (/manage.*consent|consent.*preferences|cookie.*settings/i.test(content)) {
        foundSelfService = true;
      }
    }

    if (!foundWithdrawalHandler) {
      this.addViolation({
        rule: 'Withdrawal Mechanism',
        file: 'N/A',
        severity: 'high',
        description: 'No consent withdrawal mechanism found',
        gdprArticle: 'Article 7(3) - Right to withdraw consent',
        recommendation: 'Implement consent withdrawal endpoint'
      });
    } else {
      this.passedChecks.push('Consent withdrawal handler found');
    }

    if (foundWithdrawalEndpoint) {
      this.passedChecks.push('Self-service withdrawal endpoint available');
    } else {
      this.addViolation({
        rule: 'Easy Withdrawal',
        file: 'consent withdrawal',
        severity: 'high',
        description: 'Withdrawal may not be easily accessible',
        gdprArticle: 'Article 7(3) - Withdrawal must be as easy as giving consent',
        recommendation: 'Implement self-service consent management in user settings'
      });
    }

    if (foundSelfService) {
      this.passedChecks.push('Self-service consent UI available');
    }

    console.log('');
  }

  async checkCookieConsent() {
    console.log('Checking cookie consent...');

    const files = globSync('**/*.{js,jsx,ts,tsx,html}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });

    let foundCookieBanner = false;
    let foundCookieScript = false;
    let foundCategoryOptions = false;
    let foundRejectAll = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for cookie banner
      if (/cookie-banner|cookie.*consent|privacy.*banner/i.test(content)) {
        foundCookieBanner = true;
      }

      // Check for cookie script loading
      if (/google-analytics|gtag|fbq|_ga|cookie/i.test(content)) {
        foundCookieScript = true;
      }

      // Check for category options
      if (/essential.*cookie|analytics.*cookie|marketing.*cookie/i.test(content)) {
        foundCategoryOptions = true;
      }

      // Check for "Reject All" option
      if (/reject.*all|rejectAll|accept.*none/i.test(content)) {
        foundRejectAll = true;
      }
    }

    if (foundCookieBanner) {
      this.passedChecks.push('Cookie banner/consent present');
    } else if (foundCookieScript) {
      this.addViolation({
        rule: 'Cookie Consent Banner',
        file: 'N/A',
        severity: 'high',
        description: 'Cookies used without consent banner',
        gdprArticle: 'ePrivacy Directive Article 5(3)',
        recommendation: 'Implement cookie consent banner before loading tracking scripts'
      });
    }

    if (foundCategoryOptions) {
      this.passedChecks.push('Granular cookie options available');
    }

    if (foundRejectAll) {
      this.passedChecks.push('"Reject All" option available');
    } else {
      this.addViolation({
        rule: 'Reject All Option',
        file: 'cookie consent',
        severity: 'medium',
        description: 'No "Reject All" option found',
        gdprArticle: 'Article 7(2) - Consent must be freely given',
        recommendation: 'Add "Reject All" button to cookie banner'
      });
    }

    console.log('');
  }

  addViolation(violation) {
    this.violations.push({
      ...violation,
      id: `VIOL-${this.violations.length + 1}`
    });
  }

  generateReport() {
    console.log('');
    console.log('Consent Management Validation Report');
    console.log('=====================================');
    console.log('');
    console.log(`Evaluation Date: ${new Date().toISOString()}`);
    console.log(`GDPR Article: Article 7 - Conditions for Consent`);
    console.log('');

    const score = this.passedChecks.length + this.violations.length > 0
      ? Math.round((this.passedChecks.length / (this.passedChecks.length + this.violations.length)) * 100)
      : 0;

    console.log(`Overall Status: ${this.violations.length > 0 ? 'NON-COMPLIANT' : 'COMPLIANT'}`);
    console.log(`Compliance Score: ${score}%`);
    console.log('');

    if (this.violations.length > 0) {
      console.log('Issues Found:');
      console.log('─────────────');

      const critical = this.violations.filter(v => v.severity === 'critical');
      const high = this.violations.filter(v => v.severity === 'high');
      const medium = this.violations.filter(v => v.severity === 'medium');
      const low = this.violations.filter(v => v.severity === 'low');

      [...critical, ...high, ...medium, ...low].forEach(v => {
        console.log(`┌────────────────────────────────────────────────────────────────────────────┐`);
        console.log(`│ Rule: ${v.rule.padEnd(70)}│`);
        console.log(`│ File: ${v.file.padEnd(73)}│`);
        console.log(`│ Severity: ${v.severity.toUpperCase().padEnd(69)}│`);
        console.log(`│ Issue: ${v.description.substring(0, 68)}...│`);
        console.log(`│ GDPR Violation: ${v.gdprArticle.substring(0, 66)}...│`);
        console.log(`│ Fix: ${v.recommendation.substring(0, 74)}...│`);
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
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    consentTypes: null,
    checkUi: false,
    checkStorage: false,
    checkWithdrawal: false,
    checkAge: false,
    strict: false,
    path: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--consent-types':
        options.consentTypes = args[++i];
        break;
      case '--check-ui':
        options.checkUi = true;
        break;
      case '--check-storage':
        options.checkStorage = true;
        break;
      case '--check-withdrawal':
        options.checkWithdrawal = true;
        break;
      case '--check-age':
        options.checkAge = true;
        break;
      case '--strict':
        options.strict = true;
        break;
    }
  }

  const validator = new ConsentValidator(options);
  const exitCode = await validator.validate();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = ConsentValidator;
