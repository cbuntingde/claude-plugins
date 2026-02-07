# Compliance & Security Assistant Plugin

A comprehensive compliance scanner plugin for Claude Code that detects GDPR, HIPAA, SOC2 violations and PII (Personally Identifiable Information) handling issues.

## Features

- **GDPR Compliance**: Detect consent management, data retention, portability, and processing issues
- **HIPAA Compliance**: Identify PHI storage, transmission, audit logging, and access control issues
- **SOC2 Compliance**: Check access controls, encryption, logging, change management, and incident response
- **PII Detection**: Find emails, SSNs, credit cards, phone numbers, IPs, passport numbers, and health information
- **Automated Hooks**: Real-time compliance checks on file operations
- **Compliance Agents**: Specialized AI agents for comprehensive compliance auditing
- **Auto-Fix Suggestions**: Provides specific remediation steps for each violation found

## Installation

### Option 1: Install from Local Directory

```bash
# Navigate to your project directory
cd /path/to/your/project

# Install the plugin
claude plugin install /path/to/compliance-assistant-plugin
```

### Option 2: Copy to Project

```bash
# Copy plugin to your project's .claude directory
cp -r compliance-assistant-plugin /path/to/your/project/.claude/plugins/compliance-assistant
```

## Quick Start

After installation, the plugin automatically:

1. **Runs on session start**: Quick compliance check for obvious issues
2. **Scans on file writes**: Automatically analyzes code when you save files
3. **Provides commands**: Use slash commands for comprehensive scans

## Usage

### Running Compliance Scans

```bash
# Full compliance scan (GDPR, HIPAA, SOC2, PII)
/compliance-scan

# Scan specific frameworks
/compliance-scan --frameworks gdpr,hipaa

# Scan specific directory
/compliance-scan --path ./src

# Filter by severity
/compliance-scan --severity critical,high

# Skip PII detection
/compliance-scan --no-pii
```

### PII Detection

```bash
# Scan for all PII types
/pii-scan

# Scan specific PII categories
/pii-scan --categories email,ssn,creditCard

# Scan configuration files
/pii-scan --path ./config

# High severity only
/pii-scan --severity critical,high
```

### Framework-Specific Checks

```bash
# GDPR compliance check
/gdpr-check

# HIPAA compliance check
/hipaa-check

# SOC2 compliance check
/soc2-check
```

## Commands

### `/compliance-scan`

Perform a comprehensive compliance scan of your codebase.

```bash
/compliance-scan                                    # Scan entire project
/compliance-scan --path ./src                      # Scan specific directory
/compliance-scan --frameworks gdpr,hipaa           # Scan specific frameworks
/compliance-scan --severity critical,high          # Only show critical/high issues
/compliance-scan --no-pii                          # Skip PII detection
/compliance-scan --output json > report.json       # Export JSON report
```

### `/pii-scan`

Detect Personally Identifiable Information in your codebase.

```bash
/pii-scan                                          # Scan for all PII types
/pii-scan --path ./config                          # Scan specific directory
/pii-scan --categories email,ssn,creditCard        # Scan specific categories
/pii-scan --severity high,critical                 # Filter by severity
```

**PII Categories:**
- `email`: Email addresses
- `ssn`: Social Security Numbers
- `creditCard`: Credit card numbers
- `phone`: Phone numbers
- `ipAddress`: IP addresses
- `passport`: Passport numbers
- `driversLicense`: Driver's license numbers
- `bankAccount`: Bank account numbers
- `dateOfBirth`: Dates of birth
- `medicalRecord`: Medical record numbers
- `healthInsurance`: Health insurance numbers

### `/gdpr-check`

Check for GDPR (General Data Protection Regulation) compliance violations.

```bash
/gdpr-check                                        # Scan entire project
/gdpr-check --path ./frontend                     # Scan specific directory
/gdpr-check --severity high,critical              # Filter by severity
```

**GDPR Articles Covered:**
- Article 6: Lawful basis for processing
- Article 7: Conditions for consent
- Article 15: Right of access
- Article 17: Right to erasure
- Article 20: Right to data portability
- Article 25: Data protection by design

### `/hipaa-check`

Check for HIPAA (Health Insurance Portability and Accountability Act) compliance violations.

```bash
/hipaa-check                                       # Scan entire project
/hipaa-check --path ./backend                     # Scan backend code
/hipaa-check --severity critical                  # Critical issues only
```

**HIPAA Security Rule Standards:**
- Administrative safeguards
- Physical safeguards
- Technical safeguards (access control, audit controls, encryption)
- Minimum necessary standard

### `/soc2-check`

Check for SOC2 (Service Organization Control 2) compliance violations.

```bash
/soc2-check                                        # Scan entire project
/soc2-check --path ./infrastructure               # Scan infrastructure code
/soc2-check --severity high,critical              # Filter by severity
```

**SOC2 Trust Services Criteria:**
- Security (access controls, encryption)
- Availability (backup, disaster recovery)
- Processing Integrity (change management)
- Confidentiality (data classification)
- Privacy (data handling practices)

## Agents

The plugin includes specialized compliance agents:

### Compliance Auditor Agent

Performs comprehensive compliance audits across GDPR, HIPAA, and SOC2 frameworks.

**When it activates:**
- User mentions compliance, audit, or regulatory requirements
- Preparing for compliance audits
- Implementing new features with sensitive data

### PII Detector Agent

Detects and analyzes Personally Identifiable Information in code and data.

**When it activates:**
- Code contains PII patterns
- User mentions PII, personal data, or sensitive information
- Configuration files with sensitive data

## Skills

Autonomous compliance skills that automatically activate:

### GDPR Scanner Skill

Detects GDPR violations and compliance issues.

**Triggers:**
- User mentions GDPR, consent, cookies, privacy
- Code handles user data or personal information
- Frontend code with cookie/tracking functionality

### HIPAA Scanner Skill

Detects HIPAA violations and PHI handling issues.

**Triggers:**
- User mentions HIPAA, PHI, medical, health, patient data
- Code handles healthcare or medical information
- Backend code with patient/health data storage

### SOC2 Scanner Skill

Detects SOC2 compliance issues and security gaps.

**Triggers:**
- User mentions SOC2, compliance, security controls
- Code implements authentication or authorization
- Infrastructure or deployment code

### PII Detector Skill

Detects Personally Identifiable Information in code.

**Triggers:**
- Code contains potential PII patterns
- Configuration files with sensitive data
- User mentions PII or personal data

## Automated Hooks

The plugin automatically runs compliance checks:

- **On file writes**: Scans modified files for compliance issues
- **On session start**: Runs quick compliance check
- **On user prompts**: Provides compliance-focused responses when relevant

## Configuration

### Compliance Rules

Create `.compliance-assistant.json` in your project root:

```json
{
  "frameworks": ["gdpr", "hipaa", "soc2"],
  "piiDetection": true,
  "ignorePatterns": [
    "node_modules/**",
    "vendor/**",
    ".git/**",
    "dist/**",
    "build/**",
    "test/**",
    "spec/**"
  ],
  "outputFormat": "text",
  "severityThreshold": "medium"
}
```

### PII Detection Configuration

```json
{
  "allowedPatterns": [
    "test@example.com",
    "user@test\\.com"
  ],
  "excludedDirectories": [
    "test/",
    "spec/",
    "examples/"
  ]
}
```

## Examples

### Scan a React Project

```bash
# Full compliance scan
/compliance-scan --path ./src

# Check for PII in config
/pii-scan --path ./config

# GDPR compliance check
/gdpr-check --path ./frontend/src
```

### Scan a Python Backend

```bash
# Scan backend directory
/compliance-scan --path ./backend

# HIPAA compliance check
/hipaa-check --path ./backend

# SOC2 compliance check
/soc2-check --path ./backend
```

### CI/CD Integration

```yaml
# Example GitHub Actions
- name: Compliance Scan
  run: claude compliance-scan --output json > compliance-report.json

- name: Check for Critical Issues
  run: |
    if grep -q '"severity": "critical"' compliance-report.json; then
      echo "Critical compliance issues found!"
      exit 1
    fi
```

## Output Format

### Compliance Scan Report

```
═════════════════════════════════════════════
    COMPLIANCE SCAN REPORT
═════════════════════════════════════════════

Total findings: 15
  Critical: 2
  High: 5
  Medium: 6
  Low: 2

By Framework:
  GDPR: 5
  HIPAA: 4
  SOC2: 4
  PII Detection: 2

🔴 CRITICAL [PII]
   Category: identification
   Description: Social Security Number
   File: config/users.json:45
   Recommendation: Remove immediately, rotate, clean history
   Code: "ssn": "123-45-6789"

🔴 CRITICAL [HIPAA]
   Category: phi-storage
   Description: PHI storage operation
   File: src/patients.js:23
   Recommendation: Ensure PHI is encrypted at rest with AES-256
   Code: const savePatient = (patient) => db.patients.create(patient);

═════════════════════════════════════════════
```

## Best Practices

1. **Run Regularly**: Execute compliance scans regularly, not just before audits
2. **CI/CD Integration**: Add compliance scanning to your pipeline
3. **Fix Critical First**: Prioritize critical and high severity findings
4. **Verify Findings**: Pattern matching may produce false positives
5. **Document Remediation**: Track fixes and maintain compliance evidence
6. **Stay Updated**: Keep the plugin updated for new compliance patterns

## Security Considerations

### Limitations

- **False Positives**: The scanner uses pattern matching and may produce false positives
- **Context Awareness**: Cannot fully understand context or intent
- **Real vs Test Data**: Cannot distinguish real data from test data with 100% accuracy
- **Legal Advice**: Does not constitute legal advice or professional consultation

### Recommendations

1. **Verify All Findings**: Manually review all detected issues
2. **Consult Legal Professionals**: For definitive compliance guidance
3. **Regular Assessments**: Use as part of broader compliance program
4. **Evidence Collection**: Document all remediation efforts
5. **Training**: Educate team on compliance requirements

## Compliance Frameworks

### GDPR (General Data Protection Regulation)

**Key Requirements:**
- Lawful basis for processing (Article 6)
- Consent management (Article 7)
- Data subject rights (Articles 15-21)
- Data protection by design (Article 25)
- Data breach notification (Article 33)

**Resources:**
- [GDPR Official Text](https://gdpr-info.eu/)
- [UK ICO GDPR Guide](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)

### HIPAA (Health Insurance Portability and Accountability Act)

**Key Requirements:**
- Administrative safeguards
- Physical safeguards
- Technical safeguards
- PHI encryption at rest and in transit
- Audit logging for PHI access
- Minimum necessary standard

**Resources:**
- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

### SOC2 (Service Organization Control 2)

**Key Requirements:**
- Security: Access controls, encryption, monitoring
- Availability: Backup, disaster recovery
- Processing Integrity: Change management
- Confidentiality: Data classification
- Privacy: Data handling practices

**Resources:**
- [AICPA Trust Services Criteria](https://www.aicpa.org/trust-services-criteria)

## Troubleshooting

### Plugin not loading

1. Verify installation: `claude plugin list`
2. Check for errors: `claude --debug`
3. Validate manifest: Check `.claude-plugin/plugin.json`

### Scripts not executing

1. Make scripts executable: `chmod +x scripts/*.sh`
2. Check shebang lines
3. Verify Node.js is installed

### Too many false positives

1. Adjust severity threshold in configuration
2. Add allowed patterns for test data
3. Exclude test directories
4. Use framework-specific checks for targeted analysis

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new compliance patterns
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [GDPR](https://gdpr-info.eu/)
- [HIPAA](https://www.hhs.gov/hipaa/)
- [SOC2](https://www.aicpa.org/trust-services-criteria)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Support

- GitHub Issues: [compliance-assistant-plugin/issues](https://github.com/cbuntingde/claude-plugins-dev/issues)
