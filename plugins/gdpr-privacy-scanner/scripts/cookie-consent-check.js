#!/usr/bin/env node

/**
 * Cookie Consent Check
 *
 * Validates cookie consent implementation (GDPR & ePrivacy Directive)
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

class CookieConsentChecker {
  constructor(options = {}) {
    this.options = {
      domain: options.domain || null,
      scanCookies: options.scanCookies || false,
      checkBanner: options.checkBanner || false,
      checkPreferences: options.checkPreferences || false,
      checkWithdrawal: options.checkWithdrawal || false,
      checkThirdParty: options.checkThirdParty || false,
      strict: options.strict || false,
      path: options.path || process.cwd()
    };

    this.violations = [];
    this.passedChecks = [];
    this.cookiesDetected = [];
  }

  async check() {
    try {
      console.log('Checking Cookie Consent Implementation...');
      console.log('');

      await this.checkCookieBanner();
      await this.checkCookieSettings();
      await this.checkThirdPartyScripts();
      this.generateReport();

      if (this.options.strict && this.violations.length > 0) {
        return 1;
      }
      return 0;
    } catch (error) {
      console.error(`Check error: ${error.message}`);
      return 2;
    }
  }

  async checkCookieBanner() {
    console.log('Checking cookie banner...');

    const files = globSync('**/*.{html,jsx,tsx,vue,js,ts}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', **/dist/**, '**/.git/**'],
      nodir: true
    });

    let foundBanner = false;
    let foundPrivacyLink = false;
    let foundPreChecked = false;
    let foundRejectAll = false;
    let foundGranular = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for cookie banner
      if (/cookie-banner|cookie.*consent|privacy.*banner/i.test(content)) {
        foundBanner = true;
      }

      // Check for privacy policy link
      if (/privacy-policy|privacy.*policy/i.test(content)) {
        foundPrivacyLink = true;
      }

      // Check for pre-checked boxes (violation)
      if (/checked\s*=\s*{|defaultChecked|:checked=\{true\}/i.test(content) &&
          /cookie|consent/i.test(content)) {
        foundPreChecked = true;
      }

      // Check for "Reject All" option
      if (/reject.*all|rejectAll|accept.*none/i.test(content)) {
        foundRejectAll = true;
      }

      // Check for granular options
      if (/analytics.*checkbox|marketing.*cookie|essential.*cookie/i.test(content)) {
        foundGranular = true;
      }
    }

    if (foundBanner) {
      this.passedChecks.push('Cookie banner present');
    } else {
      this.violations.push({
        rule: 'Cookie Consent Banner',
        severity: 'high',
        file: 'N/A',
        description: 'No cookie consent banner found',
        gdprArticle: 'ePrivacy Directive Article 5(3)',
        recommendation: 'Implement cookie consent banner before loading tracking scripts'
      });
    }

    if (foundPrivacyLink) {
      this.passedChecks.push('Privacy policy link provided');
    }

    if (foundPreChecked) {
      this.violations.push({
        rule: 'Pre-Checked Cookie Boxes',
        severity: 'critical',
        file: 'cookie banner',
        description: 'Cookie consent checkboxes are pre-checked',
        gdprArticle: 'GDPR Article 7(2) - Consent must be opt-in',
        recommendation: 'Remove pre-checked attributes. All cookies must be opt-in.'
      });
    } else {
      this.passedChecks.push('No pre-checked cookie boxes');
    }

    if (foundRejectAll) {
      this.passedChecks.push('"Reject All" option available');
    } else {
      this.violations.push({
        rule: 'Reject All Option',
        severity: 'medium',
        file: 'cookie banner',
        description: 'No "Reject All" option for cookies',
        gdprArticle: 'GDPR Article 7(2)',
        recommendation: 'Add "Reject All" button to cookie banner'
      });
    }

    if (foundGranular) {
      this.passedChecks.push('Granular cookie options available');
    } else {
      this.violations.push({
        rule: 'Granular Cookie Options',
        severity: 'medium',
        file: 'cookie banner',
        description: 'No granular cookie consent options',
        gdprArticle: 'GDPR Article 7(2) - Specific consent required',
        recommendation: 'Add separate checkboxes for each cookie category (essential, analytics, marketing)'
      });
    }

    console.log('');
  }

  async checkCookieSettings() {
    console.log('Checking cookie storage and management...');

    const files = globSync('**/*.{js,ts,jsx,tsx}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', **/dist/**, '**/.git/**'],
      nodir: true
    });

    let foundConsentStorage = false;
    let foundCookieManager = false;
    let foundPreferenceUI = false;

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for consent storage
      if (/cookie.*consent|localStorage.*consent|setCookie/i.test(content)) {
        foundConsentStorage = true;
      }

      // Check for cookie manager class/function
      if (/CookieManager|CookieConsent|consent.*manager/i.test(content)) {
        foundCookieManager = true;
      }

      // Check for preference UI
      if |/cookie.*settings|manage.*cookies|consent.*preferences/i.test(content)) {
        foundPreferenceUI = true;
      }
    }

    if (foundConsentStorage) {
      this.passedChecks.push('Cookie consent storage found');
    }

    if (foundCookieManager) {
      this.passedChecks.push('Cookie manager implemented');
    }

    if (foundPreferenceUI) {
      this.passedChecks.push('Cookie preference management UI found');
    } else {
      this.violations.push({
        rule: 'Cookie Preferences UI',
        severity: 'medium',
        file: 'N/A',
        description: 'No cookie preference management UI found',
        gdprArticle: 'GDPR Article 7(3) - Easy withdrawal',
        recommendation: 'Add "Manage Cookies" or "Preferences" link for users to change cookie choices'
      });
    }

    console.log('');
  }

  async checkThirdPartyScripts() {
    console.log('Checking third-party tracking scripts...');

    const files = globSync('**/*.{html,jsx,tsx,vue}', {
      cwd: this.options.path,
      ignore: ['**/node_modules/**', **/dist/**, '**/.git/**'],
      nodir: true
    });

    const trackingScripts = {
      googleAnalytics: /google-analytics|googletagmanager|gtag/i,
      facebookPixel: /connect\.facebook\.net|fbq\(|facebook.*pixel/i,
      googleAds: /googleadservices\.com|google.*ads/i,
      hotjar: /static\.hotjar\.com|hj\(/i,
      linkedin: /analytics\.linkedin\.com|lintrk/i
    };

    const detectedScripts = [];

    for (const file of files) {
      const filePath = path.join(this.options.path, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      for (const [name, pattern] of Object.entries(trackingScripts)) {
        if (pattern.test(content)) {
          detectedScripts.push({
            name,
            file,
            hasConsentCheck: /consent|cookie.*accept|beforeConsent/i.test(content)
          });
        }
      }
    }

    if (detectedScripts.length > 0) {
      console.log(`Detected ${detectedScripts.length} tracking script(s):`);

      detectedScripts.forEach(script => {
        if (!script.hasConsentCheck) {
          this.violations.push({
            rule: 'Script Loads Before Consent',
            severity: 'high',
            file: script.file,
            description: `${script.name} loads before user grants consent`,
            gdprArticle: 'ePrivacy Directive Article 5(3)',
            recommendation: `Defer loading ${script.name} until user grants consent`
          });
        }
      });
    }

    console.log('');
  }

  generateReport() {
    console.log('');
    console.log('Cookie Consent Compliance Report');
    console.log('==================================');
    console.log('');
    console.log(`Scan Date: ${new Date().toISOString()}`);
    console.log(`Regulations: GDPR Article 7, ePrivacy Directive Article 5(3)`);
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

      [...critical, ...high, ...medium].forEach(v => {
        console.log(`┌────────────────────────────────────────────────────────────────────────────┐`);
        console.log(`│ Rule: ${v.rule.padEnd(68)}│`);
        console.log(`│ File: ${v.file.padEnd(73)}│`);
        console.log(`│ Severity: ${v.severity.toUpperCase().padEnd(69)}│`);
        console.log(`│ Issue: ${v.description.substring(0, 68)}...│`);
        console.log(`│ GDPR Violation: ${v.gdprArticle.substring(0, 64)}...│`);
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

    console.log('Implementation Priority:');
    console.log('────────────────────────');
    console.log('Phase 1 (Critical - Complete within 1 week):');
    console.log('  └── Stop loading tracking scripts before consent');
    console.log('  └── Remove pre-checked checkboxes');
    console.log('  └── Add "Reject All" button');
    console.log('');
    console.log('Phase 2 (High - Complete within 2 weeks):');
    console.log('  ├── Implement granular consent checkboxes');
    console.log('  ├── Defer script loading until consent');
    console.log('  └── Add "Manage Cookies" link in footer');
    console.log('');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    domain: null,
    scanCookies: false,
    checkBanner: false,
    checkPreferences: false,
    checkWithdrawal: false,
    checkThirdParty: false,
    strict: false,
    path: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--domain':
        options.domain = args[++i];
        break;
      case '--scan-cookies':
        options.scanCookies = true;
        break;
      case '--check-banner':
        options.checkBanner = true;
        break;
      case '--check-preferences':
        options.checkPreferences = true;
        break;
      case '--check-withdrawal':
        options.checkWithdrawal = true;
        break;
      case '--check-third-party':
        options.checkThirdParty = true;
        break;
      case '--strict':
        options.strict = true;
        break;
    }
  }

  const checker = new CookieConsentChecker(options);
  const exitCode = await checker.check();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = CookieConsentChecker;
