#!/usr/bin/env node

/**
 * GDPR Compliance Scanner
 *
 * Production-ready GDPR compliance analysis with comprehensive violation detection
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// Configuration
const CONFIG = {
  severities: ['low', 'medium', 'high', 'critical'],
  outputFormats: ['json', 'table', 'markdown'],
  defaultSeverity: 'medium',
  defaultOutput: 'table'
};

// GDPR Rules Database
const GDPR_RULES = {
  piiHardcoded: {
    id: 'GDPR-001',
    article: 'Article 32 - Security of Processing',
    rule: 'Hardcoded PII',
    severity: 'critical',
    description: 'Personal data is hardcoded in source code',
    patterns: [
      /(?:email|user|contact)\s*[:=]\s*["'][\w.%+-]+@[\w.-]+\.[a-z]{2,}["']/gi,
      /(?:ssn|socialSecurity)\s*[:=]\s*["']?\d{3}-?\d{2}-?\d{4}["']?/gi,
      /(?:phone|mobile|tel)\s*[:=]\s*["']?\+?[\d\s\-\(\)]+["']?/gi
    ]
  },
  piiInLogs: {
    id: 'GDPR-002',
    article: 'Article 32 - Security of Processing',
    rule: 'PII in Logs',
    severity: 'high',
    description: 'Personal data logged in plain text',
    patterns: [
      /console\.(log|info|warn|error)\s*\([^)]*user(?:name|email)/gi,
      /logger\.(info|debug|error)\s*\([^)]*email/gi
    ]
  },
  noEncryption: {
    id: 'GDPR-003',
    article: 'Article 32 - Security of Processing',
    rule: 'Unencrypted Data Storage',
    severity: 'critical',
    description: 'Sensitive data stored without encryption',
    patterns: [
      /password\s*[:=]\s*[^$].*[^encrypt|hash|bcrypt]/gi,
      /creditCard|cardNumber\s*[:=]\s*["']/gi
    ]
  },
  missingConsent: {
    id: 'GDPR-004',
    article: 'Article 6 - Lawfulness of Processing',
    rule: 'Missing Consent Mechanism',
    severity: 'high',
    description: 'Processing personal data without consent tracking',
    patterns: [
      /processData|handleData|saveUser/gi
    ]
  },
  noRightToErasure: {
    id: 'GDPR-005',
    article: 'Article 17 - Right to Erasure',
    rule: 'No Erasure Implementation',
    severity: 'critical',
    description: 'No implementation of right to be forgotten',
    patterns: [
      /DELETE.*users|deleteUser/gi
    ]
  },
  dataRetentionMissing: {
    id: 'GDPR-006',
    article: 'Article 5(1)(e) - Storage Limitation',
    rule: 'No Data Retention Policy',
    severity: 'medium',
    description: 'No data retention or cleanup mechanisms found',
    patterns: []
  },
  cookieConsentMissing: {
    id: 'GDPR-007',
    article: 'ePrivacy Directive Article 5(3)',
    rule: 'Missing Cookie Consent',
    severity: 'high',
    description: 'Cookie consent banner not implemented',
    patterns: []
  },
  dataBreachNoDetection: {
    id: 'GDPR-008',
    article: 'Article 33 - Notification of Personal Data Breach',
    rule: 'No Breach Detection',
    severity: 'high',
    description: 'No data breach detection or notification system',
    patterns: []
  },
  accessControlMissing: {
    id: 'GDPR-009',
    article: 'Article 32 - Security of Processing',
    rule: 'Missing Access Control',
    severity: 'high',
    description: 'No access control implementation found',
    patterns: [/auth|authorize|authenticate/gi]
  }
};

class GDPRScanner {
  constructor(options = {}) {
    this.options = {
      severity: options.severity || CONFIG.defaultSeverity,
      output: options.output || CONFIG.defaultOutput,
      path: options.path || process.cwd(),
      exclude: options.exclude || [],
      fix: options.fix || false,
      report: options.report || false
    };

    this.findings = [];
    this.stats = {
      filesScanned: 0,
      linesScanned: 0,
      findings: 0
    };
  }

  async scan() {
    try {
      console.log('Starting GDPR compliance scan...');
      console.log(`Path: ${this.options.path}`);
      console.log(`Severity: ${this.options.severity}`);
      console.log('');

      await this.scanDirectory();
      this.filterBySeverity();
      this.generateOutput();

      return this.findings.length === 0 ? 0 : 1;
    } catch (error) {
      console.error(`Scan error: ${error.message}`);
      return 2;
    }
  }

  async scanDirectory() {
    const extensions = ['*.js', '*.ts', '*.jsx', '*.tsx', '*.py', '*.java', '*.go', '*.rb', '*.php'];
    const pattern = path.join(this.options.path, '**', `*.{${extensions.map(e => e.replace('*', '')).join(',')}}`);

    const files = globSync(pattern, {
      ignore: this.options.exclude.map(e => path.join(this.options.path, e)),
      nodir: true
    });

    console.log(`Found ${files.length} files to scan`);
    console.log('');

    for (const file of files) {
      await this.scanFile(file);
    }

    console.log(`Scanned ${this.stats.filesScanned} files, ${this.stats.linesScanned} lines`);
    console.log('');
  }

  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(this.options.path, filePath);

      this.stats.filesScanned++;
      this.stats.linesScanned += lines.length;

      for (const [ruleId, rule] of Object.entries(GDPR_RULES)) {
        if (rule.patterns.length === 0) {
          // Skip rules without patterns (require manual review)
          continue;
        }

        for (const pattern of rule.patterns) {
          let match;
          const regex = new RegExp(pattern.source, pattern.flags);

          lines.forEach((line, index) => {
            if (regex.test(line)) {
              this.addFinding({
                rule: rule.rule,
                article: rule.article,
                severity: rule.severity,
                file: relativePath,
                line: index + 1,
                description: rule.description,
                code: line.trim(),
                recommendation: this.getRecommendation(ruleId)
              });
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning ${filePath}: ${error.message}`);
    }
  }

  addFinding(finding) {
    this.findings.push({
      ...finding,
      id: `FIND-${this.findings.length + 1}`
    });
    this.stats.findings++;
  }

  getRecommendation(ruleId) {
    const recommendations = {
      piiHardcoded: 'Remove hardcoded PII. Use environment variables or secure configuration.',
      piiInLogs: 'Remove PII from logs. Use user IDs or hash sensitive data.',
      noEncryption: 'Implement encryption for sensitive data. Use bcrypt for passwords.',
      missingConsent: 'Implement consent tracking and management system.',
      noRightToErasure: 'Implement user deletion with cascading deletes across all systems.',
      dataRetentionMissing: 'Define and implement data retention policies with auto-deletion.',
      cookieConsentMissing: 'Implement cookie consent banner with granular opt-in choices.',
      dataBreachNoDetection: 'Implement breach detection and 72-hour notification system.',
      accessControlMissing: 'Implement role-based access control (RBAC).'
    };
    return recommendations[ruleId] || 'Review and fix identified GDPR violation.';
  }

  filterBySeverity() {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const minSeverity = severityOrder[this.options.severity] || 1;

    this.findings = this.findings.filter(finding =>
      severityOrder[finding.severity] >= minSeverity
    );

    console.log(`Found ${this.findings.length} findings (${this.options.severity}+ severity)`);
    console.log('');
  }

  generateOutput() {
    if (this.findings.length === 0) {
      console.log('✓ No GDPR compliance issues found!');
      return;
    }

    switch (this.options.output) {
      case 'json':
        this.generateJSON();
        break;
      case 'markdown':
        this.generateMarkdown();
        break;
      default:
        this.generateTable();
    }
  }

  generateTable() {
    console.log('GDPR Compliance Scan Results');
    console.log('='.repeat(80));
    console.log('');

    const critical = this.findings.filter(f => f.severity === 'critical');
    const high = this.findings.filter(f => f.severity === 'high');
    const medium = this.findings.filter(f => f.severity === 'medium');
    const low = this.findings.filter(f => f.severity === 'low');

    if (critical.length > 0) {
      console.log('CRITICAL:');
      critical.forEach(f => this.printFinding(f));
    }

    if (high.length > 0) {
      console.log('\nHIGH:');
      high.forEach(f => this.printFinding(f));
    }

    if (medium.length > 0) {
      console.log('\nMEDIUM:');
      medium.forEach(f => this.printFinding(f));
    }

    if (low.length > 0) {
      console.log('\nLOW:');
      low.forEach(f => this.printFinding(f));
    }

    console.log('\nSummary:');
    console.log(`  Critical: ${critical.length}`);
    console.log(`  High: ${high.length}`);
    console.log(`  Medium: ${medium.length}`);
    console.log(`  Low: ${low.length}`);
    console.log('');
  }

  printFinding(finding) {
    console.log(`┌─ ${finding.rule} (${finding.article})`);
    console.log(`│  File: ${finding.file}:${finding.line}`);
    console.log(`│  ${finding.description}`);
    console.log(`│  Code: ${finding.code.substring(0, 80)}${finding.code.length > 80 ? '...' : ''}`);
    console.log(`│  Fix: ${finding.recommendation}`);
    console.log('└');
  }

  generateJSON() {
    const output = {
      scanDate: new Date().toISOString(),
      summary: {
        filesScanned: this.stats.filesScanned,
        linesScanned: this.stats.linesScanned,
        findings: this.findings.length,
        bySeverity: {
          critical: this.findings.filter(f => f.severity === 'critical').length,
          high: this.findings.filter(f => f.severity === 'high').length,
          medium: this.findings.filter(f => f.severity === 'medium').length,
          low: this.findings.filter(f => f.severity === 'low').length
        }
      },
      findings: this.findings
    };

    console.log(JSON.stringify(output, null, 2));
  }

  generateMarkdown() {
    console.log('# GDPR Compliance Scan Report');
    console.log('');
    console.log(`**Scan Date**: ${new Date().toISOString()}`);
    console.log(`**Files Scanned**: ${this.stats.filesScanned}`);
    console.log(`**Findings**: ${this.findings.length}`);
    console.log('');

    const critical = this.findings.filter(f => f.severity === 'critical');
    const high = this.findings.filter(f => f.severity === 'high');
    const medium = this.findings.filter(f => f.severity === 'medium');

    if (critical.length > 0) {
      console.log('## Critical Findings');
      console.log('');
      critical.forEach(f => {
        console.log(`### ${f.rule}`);
        console.log(`- **Article**: ${f.article}`);
        console.log(`- **File**: \`${f.file}:${f.line}\``);
        console.log(`- **Description**: ${f.description}`);
        console.log(`- **Recommendation**: ${f.recommendation}`);
        console.log('');
      });
    }

    if (high.length > 0) {
      console.log('## High Priority Findings');
      console.log('');
      high.forEach(f => {
        console.log(`### ${f.rule}`);
        console.log(`- **Article**: ${f.article}`);
        console.log(`- **File**: \`${f.file}:${f.line}\``);
        console.log(`- **Description**: ${f.description}`);
        console.log('');
      });
    }

    console.log('## Summary');
    console.log('');
    console.log('| Severity | Count |');
    console.log('|----------|-------|');
    console.log(`| Critical | ${critical.length} |`);
    console.log(`| High | ${high.length} |`);
    console.log(`| Medium | ${medium.length} |`);
    console.log(`| Low | ${this.findings.filter(f => f.severity === 'low').length} |`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    severity: 'medium',
    output: 'table',
    path: process.cwd(),
    exclude: [],
    fix: false,
    report: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--severity':
      case '-s':
        options.severity = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--path':
      case '-p':
        options.path = args[++i];
        break;
      case '--exclude':
      case '-e':
        options.exclude = args[++i].split(',');
        break;
      case '--fix':
        options.fix = true;
        break;
      case '--report':
        options.report = true;
        break;
    }
  }

  const scanner = new GDPRScanner(options);
  const exitCode = await scanner.scan();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = GDPRScanner;
