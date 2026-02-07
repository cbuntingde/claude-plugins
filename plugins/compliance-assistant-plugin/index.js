#!/usr/bin/env node
/**
 * Compliance & Security Assistant Plugin
 * Main entry point for Claude Code plugin
 * Detects GDPR, HIPAA, SOC2 violations and PII handling issues
 */

const path = require('path');
const fs = require('fs');

/**
 * Plugin metadata
 */
const pluginInfo = {
  name: 'compliance-assistant-plugin',
  version: '1.0.0',
  description: 'Comprehensive compliance scanner for GDPR, HIPAA, SOC2 violations and PII handling detection'
};

/**
 * PII Patterns for detection
 */
const PIIPatterns = {
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    severity: 'high',
    category: 'contact',
    description: 'Email address'
  },
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
    severity: 'critical',
    category: 'identification',
    description: 'Social Security Number'
  },
  creditCard: {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b\d{13,19}\b/g,
    severity: 'critical',
    category: 'financial',
    description: 'Credit card number'
  },
  phone: {
    pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    severity: 'medium',
    category: 'contact',
    description: 'Phone number'
  },
  ipAddress: {
    pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    severity: 'medium',
    category: 'technical',
    description: 'IP address'
  },
  passport: {
    pattern: /\b[A-Za-z]{1,2}\d{6,9}\b/g,
    severity: 'high',
    category: 'identification',
    description: 'Passport number'
  },
  driversLicense: {
    pattern: /\b[A-Za-z]{1}\d{12,14}\b|\b\d{8,12}[A-Za-z]{1}\b/g,
    severity: 'high',
    category: 'identification',
    description: 'Driver\'s license number'
  },
  bankAccount: {
    pattern: /\b\d{8,17}\b/g,
    severity: 'critical',
    category: 'financial',
    description: 'Bank account number'
  },
  dateOfBirth: {
    pattern: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g,
    severity: 'medium',
    category: 'identification',
    description: 'Date of birth'
  },
  medicalRecord: {
    pattern: /\bMRN\s*[:=]?\s*\d+/gi,
    severity: 'critical',
    category: 'health',
    description: 'Medical record number'
  },
  healthInsurance: {
    pattern: /\b(?:insurance|member|policy|group)\s*(?:number|num|no|id|#)?\s*[:=]?\s*[\dA-Z-]+/gi,
    severity: 'critical',
    category: 'health',
    description: 'Health insurance number'
  }
};

/**
 * GDPR compliance patterns
 */
const GDPRPatterns = {
  consentRequired: {
    pattern: /(?:cookie|tracking|analytics)\s*(?:consent|permission|agreement)/gi,
    severity: 'high',
    category: 'consent',
    description: 'Cookie/tracking consent mechanism',
    recommendation: 'Ensure explicit consent collection for GDPR compliance'
  },
  dataRetention: {
    pattern: /(?:delete|remove|purge|expire)\s*(?:data|user|record)/gi,
    severity: 'medium',
    category: 'retention',
    description: 'Data retention/deletion logic',
    recommendation: 'Document data retention policies and implement user deletion requests'
  },
  dataExport: {
    pattern: /(?:export|download|transfer)\s*(?:user|data|profile)/gi,
    severity: 'medium',
    category: 'portability',
    description: 'Data export functionality',
    recommendation: 'Implement data portability features for GDPR right to data portability'
  },
  privacyPolicy: {
    pattern: /privacy[-_]?policy|terms[-_]?service|cookie[-_]?policy/gi,
    severity: 'low',
    category: 'documentation',
    description: 'Privacy policy reference',
    recommendation: 'Maintain up-to-date privacy policy and terms of service'
  },
  personalDataProcessing: {
    pattern: /(?:process|handle|store|save)\s*(?:personal|user|sensitive)\s*data/gi,
    severity: 'high',
    category: 'processing',
    description: 'Personal data processing',
    recommendation: 'Ensure lawful basis for processing under GDPR Article 6'
  }
};

/**
 * HIPAA compliance patterns
 */
const HIPPAApatterns = {
  phiStorage: {
    pattern: /(?:store|save|insert)\s*(?:medical|health|patient|phi)/gi,
    severity: 'critical',
    category: 'phi-storage',
    description: 'PHI storage operation',
    recommendation: 'Ensure PHI is encrypted at rest with AES-256 or stronger'
  },
  phiTransmission: {
    pattern: /(?:send|transmit|transfer|api)\s*(?:medical|health|patient|phi)/gi,
    severity: 'critical',
    category: 'phi-transmission',
    description: 'PHI transmission',
    recommendation: 'Ensure PHI is encrypted in transit (TLS 1.2+) and access is logged'
  },
  auditLogging: {
    pattern: /(?:log|audit|track)\s*(?:access|view|read)\s*(?:patient|health|medical)/gi,
    severity: 'high',
    category: 'audit',
    description: 'PHI access logging',
    recommendation: 'Implement comprehensive audit logging for all PHI access'
  },
  minimumNecessary: {
    pattern: /(?:select|get|fetch|query)\s*\*\s*from\s*(?:patients?|medical|health)/gi,
    severity: 'high',
    category: 'minimum-necessary',
    description: 'Potential over-fetching of PHI',
    recommendation: 'Apply minimum necessary standard - fetch only required fields'
  },
  authentication: {
    pattern: /(?:login|auth|session)\s*(?:patient|health|medical)/gi,
    severity: 'critical',
    category: 'authentication',
    description: 'PHI system authentication',
    recommendation: 'Implement multi-factor authentication for PHI access'
  }
};

/**
 * SOC2 compliance patterns
 */
const SOC2Patterns = {
  accessControl: {
    pattern: /(?:role|permission|access)\s*(?:check|verify|validate)/gi,
    severity: 'high',
    category: 'access-control',
    description: 'Access control mechanism',
    recommendation: 'Implement principle of least privilege and role-based access control'
  },
  encryption: {
    pattern: /(?:encrypt|decrypt|cipher|crypto)/gi,
    severity: 'critical',
    category: 'encryption',
    description: 'Cryptographic operation',
    recommendation: 'Use strong encryption (AES-256-GCM) and proper key management'
  },
  logging: {
    pattern: /(?:console\.log|logger|log\s*\(|winston|bunyan)/gi,
    severity: 'medium',
    category: 'logging',
    description: 'Logging operation',
    recommendation: 'Ensure sensitive data is not logged and logs are protected'
  },
  changeManagement: {
    pattern: /(?:deploy|release|version|rollback)/gi,
    severity: 'medium',
    category: 'change-management',
    description: 'Change management operation',
    recommendation: 'Document changes and maintain change approval process'
  },
  incidentResponse: {
    pattern: /(?:error|exception|fail|crash)\s*(?:handle|catch|report)/gi,
    severity: 'medium',
    category: 'incident-response',
    description: 'Error handling',
    recommendation: 'Implement incident response procedures and monitoring'
  },
  dataBackup: {
    pattern: /(?:backup|restore|replica|snapshot)/gi,
    severity: 'high',
    category: 'backup',
    description: 'Backup operation',
    recommendation: 'Implement regular, tested backup procedures'
  },
  networkSecurity: {
    pattern: /(?:firewall|network|port|protocol|tls|ssl)/gi,
    severity: 'medium',
    category: 'network-security',
    description: 'Network security reference',
    recommendation: 'Ensure network security controls are in place'
  },
  vulnerabilityScan: {
    pattern: /(?:audit|scan|check|test)\s*(?:security|vulnerability)/gi,
    severity: 'medium',
    category: 'vulnerability-management',
    description: 'Security scanning',
    recommendation: 'Conduct regular vulnerability scans and penetration testing'
  }
};

/**
 * Load plugin configuration
 */
function loadConfig() {
  const configPaths = [
    path.join(process.cwd(), '.compliance-assistant.json'),
    path.join(process.cwd(), '.claude', 'compliance-assistant.json'),
    path.join(__dirname, 'config.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        // Continue with defaults
      }
    }
  }

  return getDefaultConfig();
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return {
    frameworks: ['gdpr', 'hipaa', 'soc2'],
    piiDetection: true,
    ignorePatterns: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**', 'build/**', 'test/**', 'spec/**'],
    outputFormat: 'text',
    severityThreshold: 'medium'
  };
}

/**
 * Scan directory for compliance issues
 */
function scanDirectory(dir, patterns, scanExtensions, skipDirs) {
  const findings = [];

  if (!fs.existsSync(dir)) {
    return findings;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!skipDirs.has(item)) {
        findings.push(...scanDirectory(fullPath, patterns, scanExtensions, skipDirs));
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (scanExtensions.includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            for (const [key, patternConfig] of Object.entries(patterns)) {
              const matches = lines[i].match(patternConfig.pattern);
              if (matches) {
                for (const match of matches) {
                  findings.push({
                    file: fullPath,
                    line: i + 1,
                    type: key,
                    category: patternConfig.category,
                    severity: patternConfig.severity,
                    description: patternConfig.description,
                    recommendation: patternConfig.recommendation,
                    code: lines[i].trim().substring(0, 100),
                    match: match
                  });
                }
              }
            }
          }
        } catch (error) {
          // Skip unreadable files
        }
      }
    }
  }

  return findings;
}

/**
 * Compliance scan command handler
 */
function complianceScan(params = {}) {
  const scanPath = params.path || '.';
  const frameworks = params.frameworks || ['gdpr', 'hipaa', 'soc2'];
  const checkPII = params.pii !== false;
  const severity = params.severity || 'medium';

  const config = loadConfig();
  const findings = [];
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs', '.sql', '.json', '.yaml', '.yml'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build', '.next', '.nuxt']);

  // Scan for each framework
  for (const framework of frameworks) {
    let patterns;
    switch (framework.toLowerCase()) {
      case 'gdpr':
        patterns = GDPRPatterns;
        break;
      case 'hipaa':
        patterns = HIPPAApatterns;
        break;
      case 'soc2':
        patterns = SOC2Patterns;
        break;
      default:
        continue;
    }

    const frameworkFindings = scanDirectory(scanPath, patterns, scanExtensions, skipDirs);
    findings.push(...frameworkFindings.map(f => ({ ...f, framework })));
  }

  // Scan for PII if enabled
  if (checkPII) {
    const piiFindings = scanDirectory(scanPath, PIIPatterns, scanExtensions, skipDirs);
    findings.push(...piiFindings.map(f => ({ ...f, framework: 'PII' })));
  }

  // Filter by severity
  const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
  const minLevel = severityLevels[severity] || 1;
  const filteredFindings = findings.filter(f => severityLevels[f.severity] >= minLevel);

  // Generate report
  const summary = {
    total: filteredFindings.length,
    critical: filteredFindings.filter(f => f.severity === 'critical').length,
    high: filteredFindings.filter(f => f.severity === 'high').length,
    medium: filteredFindings.filter(f => f.severity === 'medium').length,
    low: filteredFindings.filter(f => f.severity === 'low').length,
    byFramework: {
      GDPR: filteredFindings.filter(f => f.framework === 'gdpr').length,
      HIPAA: filteredFindings.filter(f => f.framework === 'hipaa').length,
      SOC2: filteredFindings.filter(f => f.framework === 'soc2').length,
      PII: filteredFindings.filter(f => f.framework === 'PII').length
    }
  };

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    COMPLIANCE SCAN REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Total findings: ${summary.total}\n`;
  outputText += `  Critical: ${summary.critical}\n`;
  outputText += `  High: ${summary.high}\n`;
  outputText += `  Medium: ${summary.medium}\n`;
  outputText += `  Low: ${summary.low}\n\n`;
  outputText += `By Framework:\n`;
  outputText += `  GDPR: ${summary.byFramework.GDPR}\n`;
  outputText += `  HIPAA: ${summary.byFramework.HIPAA}\n`;
  outputText += `  SOC2: ${summary.byFramework.SOC2}\n`;
  outputText += `  PII Detection: ${summary.byFramework.PII}\n\n`;

  for (const finding of filteredFindings) {
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    outputText += `${severityEmoji[finding.severity]} ${finding.severity.toUpperCase()} [${finding.framework.toUpperCase()}]\n`;
    outputText += `   Category: ${finding.category}\n`;
    outputText += `   Description: ${finding.description}\n`;
    outputText += `   File: ${finding.file}:${finding.line}\n`;
    if (finding.recommendation) {
      outputText += `   Recommendation: ${finding.recommendation}\n`;
    }
    outputText += `   Code: ${finding.code}\n\n`;
  }

  outputText += '═════════════════════════════════════════════\n';

  return {
    success: true,
    text: outputText,
    summary,
    findings: filteredFindings
  };
}

/**
 * PII scan command handler
 */
function piiScan(params = {}) {
  const scanPath = params.path || '.';
  const categories = params.categories || Object.keys(PIIPatterns);
  const severity = params.severity || 'medium';

  const config = loadConfig();
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs', '.sql', '.json', '.yaml', '.yml', '.env', '.txt', '.md'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  // Filter patterns by categories
  const filteredPatterns = {};
  for (const category of categories) {
    if (PIIPatterns[category]) {
      filteredPatterns[category] = PIIPatterns[category];
    }
  }

  const findings = scanDirectory(scanPath, filteredPatterns, scanExtensions, skipDirs);

  // Filter by severity
  const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
  const minLevel = severityLevels[severity] || 1;
  const filteredFindings = findings.filter(f => severityLevels[f.severity] >= minLevel);

  // Group by category
  const byCategory = {};
  for (const finding of filteredFindings) {
    if (!byCategory[finding.category]) {
      byCategory[finding.category] = [];
    }
    byCategory[finding.category].push(finding);
  }

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    PII DETECTION REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Total PII findings: ${filteredFindings.length}\n\n`;

  for (const [category, items] of Object.entries(byCategory)) {
    outputText += `${category.toUpperCase()} (${items.length} findings):\n\n`;
    for (const item of items) {
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🔵'
      };

      outputText += `  ${severityEmoji[item.severity]} ${item.description}\n`;
      outputText += `     File: ${item.file}:${item.line}\n`;
      outputText += `     Match: ${item.match.substring(0, 50)}...\n\n`;
    }
  }

  outputText += '═════════════════════════════════════════════\n';
  outputText += '\n⚠️  IMPORTANT: Verify all findings manually before taking action.\n';
  outputText += '    Some matches may be false positives.\n';
  outputText += '    Ensure proper handling of any confirmed PII data.\n';

  return {
    success: true,
    text: outputText,
    summary: {
      total: filteredFindings.length,
      byCategory: Object.fromEntries(
        Object.entries(byCategory).map(([k, v]) => [k, v.length])
      )
    },
    findings: filteredFindings
  };
}

/**
 * GDPR check command handler
 */
function gdprCheck(params = {}) {
  const scanPath = params.path || '.';
  const severity = params.severity || 'medium';

  const config = loadConfig();
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs', '.html', '.css'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  const findings = scanDirectory(scanPath, GDPRPatterns, scanExtensions, skipDirs);

  // Filter by severity
  const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
  const minLevel = severityLevels[severity] || 1;
  const filteredFindings = findings.filter(f => severityLevels[f.severity] >= minLevel);

  // Group by category
  const byCategory = {};
  for (const finding of filteredFindings) {
    if (!byCategory[finding.category]) {
      byCategory[finding.category] = [];
    }
    byCategory[finding.category].push(finding);
  }

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    GDPR COMPLIANCE REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Total findings: ${filteredFindings.length}\n\n`;

  for (const [category, items] of Object.entries(byCategory)) {
    outputText += `${category.toUpperCase()}:\n`;
    for (const item of items) {
      outputText += `  📍 ${item.file}:${item.line}\n`;
      outputText += `     ${item.description}\n`;
      outputText += `     Recommendation: ${item.recommendation}\n\n`;
    }
  }

  outputText += '═════════════════════════════════════════════\n';
  outputText += '\nGDPR Key Requirements:\n';
  outputText += '  ✓ Lawful basis for processing (Article 6)\n';
  outputText += '  ✓ Consent management (Article 7)\n';
  outputText += '  ✓ Right to erasure (Article 17)\n';
  outputText += '  ✓ Right to portability (Article 20)\n';
  outputText += '  ✓ Data protection by design and default (Article 25)\n';
  outputText += '  ✓ Data breach notification (Article 33)\n';

  return {
    success: true,
    text: outputText,
    summary: {
      total: filteredFindings.length,
      byCategory: Object.fromEntries(
        Object.entries(byCategory).map(([k, v]) => [k, v.length])
      )
    },
    findings: filteredFindings
  };
}

/**
 * HIPAA check command handler
 */
function hipaaCheck(params = {}) {
  const scanPath = params.path || '.';
  const severity = params.severity || 'medium';

  const config = loadConfig();
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs', '.sql'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  const findings = scanDirectory(scanPath, HIPPAApatterns, scanExtensions, skipDirs);

  // Filter by severity
  const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
  const minLevel = severityLevels[severity] || 1;
  const filteredFindings = findings.filter(f => severityLevels[f.severity] >= minLevel);

  // Group by category
  const byCategory = {};
  for (const finding of filteredFindings) {
    if (!byCategory[finding.category]) {
      byCategory[finding.category] = [];
    }
    byCategory[finding.category].push(finding);
  }

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    HIPAA COMPLIANCE REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Total findings: ${filteredFindings.length}\n\n`;

  for (const [category, items] of Object.entries(byCategory)) {
    outputText += `${category.toUpperCase()}:\n`;
    for (const item of items) {
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🔵'
      };

      outputText += `  ${severityEmoji[item.severity]} ${item.file}:${item.line}\n`;
      outputText += `     ${item.description}\n`;
      outputText += `     Recommendation: ${item.recommendation}\n\n`;
    }
  }

  outputText += '═════════════════════════════════════════════\n';
  outputText += '\nHIPAA Security Rule Requirements:\n';
  outputText += '  ✓ Administrative safeguards (policies and procedures)\n';
  outputText += '  ✓ Physical safeguards (facility access and control)\n';
  outputText += '  ✓ Technical safeguards (access control, audit controls, integrity)\n';
  outputText += '  ✓ Encryption at rest and in transit\n';
  outputText += '  ✓ Access authentication and authorization\n';
  outputText += '  ✓ Audit logging for PHI access\n';
  outputText += '  ✓ Minimum necessary standard\n';

  return {
    success: true,
    text: outputText,
    summary: {
      total: filteredFindings.length,
      byCategory: Object.fromEntries(
        Object.entries(byCategory).map(([k, v]) => [k, v.length])
      )
    },
    findings: filteredFindings
  };
}

/**
 * SOC2 check command handler
 */
function soc2Check(params = {}) {
  const scanPath = params.path || '.';
  const severity = params.severity || 'medium';

  const config = loadConfig();
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs', '.sql', '.yaml', '.yml', '.json'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  const findings = scanDirectory(scanPath, SOC2Patterns, scanExtensions, skipDirs);

  // Filter by severity
  const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
  const minLevel = severityLevels[severity] || 1;
  const filteredFindings = findings.filter(f => severityLevels[f.severity] >= minLevel);

  // Group by category
  const byCategory = {};
  for (const finding of filteredFindings) {
    if (!byCategory[finding.category]) {
      byCategory[finding.category] = [];
    }
    byCategory[finding.category].push(finding);
  }

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    SOC2 COMPLIANCE REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Total findings: ${filteredFindings.length}\n\n`;

  for (const [category, items] of Object.entries(byCategory)) {
    outputText += `${category.toUpperCase()}:\n`;
    for (const item of items) {
      outputText += `  📍 ${item.file}:${item.line}\n`;
      outputText += `     ${item.description}\n`;
      outputText += `     Recommendation: ${item.recommendation}\n\n`;
    }
  }

  outputText += '═════════════════════════════════════════════\n';
  outputText += '\nSOC2 Trust Services Criteria:\n';
  outputText += '  Security:\n';
  outputText += '  ✓ Access controls and authentication\n';
  outputText += '  ✓ Encryption of data at rest and in transit\n';
  outputText += '  ✓ Network and system monitoring\n';
  outputText += '  ✓ Vulnerability management\n';
  outputText += '  ✓ Incident response procedures\n\n';
  outputText += '  Availability:\n';
  outputText += '  ✓ Backup and recovery procedures\n';
  outputText += '  ✓ Business continuity planning\n\n';
  outputText += '  Processing Integrity:\n';
  outputText += '  ✓ Change management processes\n';
  outputText += '  ✓ Data quality validation\n\n';
  outputText += '  Confidentiality:\n';
  outputText += '  ✓ Data classification and handling\n';
  outputText += '  ✓ Privacy policies and procedures\n';

  return {
    success: true,
    text: outputText,
    summary: {
      total: filteredFindings.length,
      byCategory: Object.fromEntries(
        Object.entries(byCategory).map(([k, v]) => [k, v.length])
      )
    },
    findings: filteredFindings
  };
}

module.exports = {
  // Plugin metadata
  ...pluginInfo,

  // Configuration
  loadConfig,
  getDefaultConfig,

  // Command handlers
  complianceScan,
  piiScan,
  gdprCheck,
  hipaaCheck,
  soc2Check
};
