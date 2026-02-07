#!/usr/bin/env node

/**
 * PII Audit Scanner
 *
 * Comprehensive audit of Personally Identifiable Information handling
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// PII Detection Patterns
const PII_PATTERNS = {
  email: {
    name: 'Email Address',
    severity: 'medium',
    patterns: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    ],
    examples: ['user@example.com', 'john.doe@company.co.uk']
  },
  phone: {
    name: 'Phone Number',
    severity: 'high',
    patterns: [
      /\+?[\d\s\-\(\)]{10,}/g
    ],
    examples: ['+1-555-123-4567', '(555) 123-4567', '07700 900123']
  },
  ssn: {
    name: 'Social Security Number',
    severity: 'critical',
    patterns: [
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b\d{3}\s?\d{2}\s?\d{4}\b/g
    ],
    examples: ['123-45-6789', '123 45 6789']
  },
  creditCard: {
    name: 'Credit Card Number',
    severity: 'critical',
    patterns: [
      /\b(?:\d[ -]*?){13,16}\b/g
    ],
    examples: ['4532-1234-5678-9010', '4532123456789010']
  },
  ipAddress: {
    name: 'IP Address',
    severity: 'low',
    patterns: [
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g
    ],
    examples: ['192.168.1.1', '2001:0db8:85a3::8a2e:0370:7334']
  },
  passport: {
    name: 'Passport Number',
    severity: 'critical',
    patterns: [
      /\b[A-Z]{1,2}\d{6,9}\b/g
    ],
    examples: ['AB1234567', 'US12345678']
  },
  apiKey: {
    name: 'API Key or Token',
    severity: 'critical',
    patterns: [
      /(?:api[_-]?key|token|secret)\s*[:=]\s*["']?[\w\-]{20,}["']?/gi
    ],
    examples: ['api_key="AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe"']
  }
};

// False positive patterns
const FALSE_POSITIVES = [
  /example\.com/i,
  /test\.example/i,
  /@test\.local/i,
  /1-555-01/,
  /@localhost/,
  /\b127\.0\.0\.1\b/,
  /\b0\.0\.0\.0\b/,
  /password/i,
  /username/i,
  /localhost/i
];

class PIIScanner {
  constructor(options = {}) {
    this.options = {
      types: options.types ? options.types.split(',') : Object.keys(PII_PATTERNS),
      strict: options.strict || false,
      export: options.export || null,
      visualize: options.visualize || false,
      path: options.path || process.cwd()
    };

    this.findings = [];
    this.stats = {
      filesScanned: 0,
      piiByType: {},
      riskScore: 0
    };

    Object.keys(PII_PATTERNS).forEach(type => {
      this.stats.piiByType[type] = 0;
    });
  }

  async scan() {
    try {
      console.log('Starting PII Audit...');
      console.log(`Path: ${this.options.path}`);
      console.log(`PII Types: ${this.options.types.join(', ')}`);
      console.log('');

      await this.scanDirectory();
      this.calculateRiskScore();
      this.generateReport();

      if (this.options.strict && this.findings.length > 0) {
        return 1;
      }
      return 0;
    } catch (error) {
      console.error(`Audit error: ${error.message}`);
      return 2;
    }
  }

  async scanDirectory() {
    const extensions = ['*.js', '*.ts', '*.jsx', '*.tsx', '*.py', '*.java', '*.go', '*.rb', '*.php', '*.json', '*.yaml', '*.yml', '*.env*', '*.config.*', '*.md'];
    const pattern = path.join(this.options.path, '**', `*.{${extensions.map(e => e.replace('*', '')).join(',')}}`);

    const files = globSync(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
      nodir: true
    });

    console.log(`Found ${files.length} files to scan`);
    console.log('');

    for (const file of files) {
      await this.scanFile(file);
    }

    console.log(`Scanned ${this.stats.filesScanned} files`);
    console.log('');
  }

  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(this.options.path, filePath);

      this.stats.filesScanned++;

      for (const piiType of this.options.types) {
        const piiConfig = PII_PATTERNS[piiType];
        if (!piiConfig) continue;

        for (const pattern of piiConfig.patterns) {
          lines.forEach((line, index) => {
            const matches = line.match(pattern);
            if (matches) {
              matches.forEach(match => {
                if (!this.isFalsePositive(match)) {
                  this.addFinding({
                    type: piiConfig.name,
                    typeId: piiType,
                    severity: piiConfig.severity,
                    file: relativePath,
                    line: index + 1,
                    value: this.maskValue(match, piiType),
                    context: line.trim()
                  });
                  this.stats.piiByType[piiType]++;
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning ${filePath}: ${error.message}`);
    }
  }

  isFalsePositive(value) {
    return FALSE_POSITIVES.some(pattern => pattern.test(value));
  }

  maskValue(value, type) {
    if (value.length < 5) return '*'.repeat(value.length);

    switch (type) {
      case 'email':
        const [local, domain] = value.split('@');
        return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 5))}@${domain}`;
      case 'ssn':
        return '***-**-****';
      case 'creditCard':
        return '*'.repeat(value.length - 4) + value.slice(-4);
      default:
        return value.substring(0, 2) + '*'.repeat(Math.min(value.length - 2, 10));
    }
  }

  addFinding(finding) {
    this.findings.push({
      ...finding,
      id: `PII-${this.findings.length + 1}`,
      timestamp: new Date().toISOString()
    });
  }

  calculateRiskScore() {
    const severityWeights = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1
    };

    let score = 0;
    this.findings.forEach(finding => {
      score += severityWeights[finding.severity] || 0;
    });

    this.stats.riskScore = score;

    if (score > 50) {
      this.stats.riskLevel = 'CRITICAL';
    } else if (score > 20) {
      this.stats.riskLevel = 'HIGH';
    } else if (score > 10) {
      this.stats.riskLevel = 'MEDIUM';
    } else {
      this.stats.riskLevel = 'LOW';
    }
  }

  generateReport() {
    console.log('PII Audit Report');
    console.log('================');
    console.log('');
    console.log(`Files Scanned: ${this.stats.filesScanned}`);
    console.log(`PII Findings: ${this.findings.length}`);
    console.log(`Risk Level: ${this.stats.riskLevel}`);
    console.log(`Risk Score: ${this.stats.riskScore}`);
    console.log('');

    if (this.findings.length === 0) {
      console.log('✓ No PII detected!');
      return;
    }

    const critical = this.findings.filter(f => f.severity === 'critical');
    const high = this.findings.filter(f => f.severity === 'high');
    const medium = this.findings.filter(f => f.severity === 'medium');
    const low = this.findings.filter(f => f.severity === 'low');

    if (critical.length > 0) {
      console.log('Critical Findings:');
      console.log('─────────────────');
      critical.forEach(f => this.printFinding(f));
      console.log('');
    }

    if (high.length > 0) {
      console.log('High Priority:');
      console.log('──────────────');
      high.slice(0, 10).forEach(f => this.printFinding(f));
      if (high.length > 10) {
        console.log(`... and ${high.length - 10} more high-priority findings`);
      }
      console.log('');
    }

    console.log('PII Classification Summary:');
    console.log('─────────────────────────');
    for (const [type, count] of Object.entries(this.stats.piiByType)) {
      if (count > 0) {
        console.log(`  ${PII_PATTERNS[type].name}: ${count}`);
      }
    }
    console.log('');

    console.log('Risk by Severity:');
    console.log('─────────────────');
    console.log(`  Critical: ${critical.length}`);
    console.log(`  High: ${high.length}`);
    console.log(`  Medium: ${medium.length}`);
    console.log(`  Low: ${low.length}`);
    console.log('');

    if (this.options.export) {
      this.exportCSV();
    }
  }

  printFinding(finding) {
    console.log(`┌─ ${finding.type} (${finding.severity.toUpperCase()})`);
    console.log(`│  File: ${finding.file}:${finding.line}`);
    console.log(`│  Value: ${finding.value}`);
    console.log(`│  Context: ${finding.context.substring(0, 80)}...`);
    console.log(`└`);
  }

  exportCSV() {
    const csv = [
      'ID,Type,Severity,File,Line,Value,Context',
      ...this.findings.map(f =>
        `"${f.id}","${f.type}","${f.severity}","${f.file}",${f.line},"${f.value}","${f.context.replace(/"/g, '""')}"`
      )
    ].join('\n');

    fs.writeFileSync(this.options.export, csv);
    console.log(`Exported findings to ${this.options.export}`);
    console.log('');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    types: null,
    strict: false,
    export: null,
    visualize: false,
    path: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--type':
      case '-t':
        options.types = args[++i];
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--export':
        options.export = args[++i];
        break;
      case '--visualize':
        options.visualize = true;
        break;
      case '--path':
      case '-p':
        options.path = args[++i];
        break;
    }
  }

  const scanner = new PIIScanner(options);
  const exitCode = await scanner.scan();
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(2);
  });
}

module.exports = PIIScanner;
