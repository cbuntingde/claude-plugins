# GDPR/Privacy Scanner

Production-ready GDPR compliance scanner with comprehensive PII detection, data retention validation, and consent management verification.

## Description

The GDPR/Privacy Scanner is a comprehensive plugin for ensuring GDPR compliance across your codebase. It provides automated detection of privacy violations, validation of consent mechanisms, assessment of data retention policies, and generation of required documentation.

## Features

### Core Capabilities

- **GDPR Compliance Scanning** - Comprehensive analysis against GDPR Articles 5-32
- **PII Detection & Classification** - Automated detection of personally identifiable information
- **Data Retention Validation** - Verify Article 5(1)(e) storage limitation compliance
- **Consent Management Review** - Validate Article 7 consent mechanisms
- **Privacy Impact Assessments** - Generate DPIA documents as required by Article 35
- **Right to Erasure Validation** - Verify Article 17 right to be forgotten implementation
- **Data Mapping** - Create Article 30 processing activity records
- **Cookie Consent Checking** - Validate ePrivacy Directive compliance

### Advanced Features

- **Automated Agents** - GDPR compliance officer, privacy architect, DPO assistant
- **Privacy Skills** - PII detection, consent analysis, retention validation, privacy-by-design review
- **Pre-commit Hooks** - Automatic GDPR compliance checks before code changes
- **Multi-format Reports** - JSON, Markdown, CSV, table output
- **CI/CD Integration** - Run scans in automated pipelines

## Installation

### From Marketplace

```bash
claude plugin install gdpr-privacy-scanner@chris-claude-plugins-dev
```

### Local Development

```bash
cd plugins/gdpr-privacy-scanner
npm install
```

## Usage

### GDPR Compliance Scan

Perform comprehensive GDPR compliance analysis:

```bash
/gdpr-scan [options]
```

**Options:**
- `--severity, -s` - Minimum severity level (low, medium, high, critical)
- `--output, -o` - Output format (json, table, markdown)
- `--path, -p` - Specific path to scan
- `--exclude, -e` - Comma-separated paths to exclude
- `--fix` - Automatically fix applicable issues
- `--report` - Generate detailed compliance report

**Examples:**
```bash
# Basic scan
/gdpr-scan

# Scan with critical severity only
/gdpr-scan --severity critical

# Generate JSON report
/gdpr-scan --output json --report

# Auto-fix issues
/gdpr-scan --fix
```

### PII Audit

Comprehensive PII handling audit:

```bash
/pii-audit [options]
```

**Options:**
- `--type, -t` - PII types (email, phone, ssn, credit-card, ip-address, all)
- `--strict` - Fail on any PII detection
- `--export` - Export findings to CSV
- `--visualize` - Generate data flow visualization

**Example:**
```bash
/pii-audit --type email,ssn,credit-card --export pii-findings.csv
```

### Data Retention Check

Validate data retention policies:

```bash
/data-retention-check [options]
```

**Options:**
- `--policy, -p` - Path to retention policy file
- `--max-age` - Maximum allowed retention period (days)
- `--strict` - Fail on retention violations
- `--databases` - Check database retention policies
- `--logs` - Check log retention policies
- `--backups` - Check backup retention policies

**Example:**
```bash
/data-retention-check --policy ./retention-policy.json --strict
```

### Consent Validation

Validate consent management implementation:

```bash
/consent-validate [options]
```

**Options:**
- `--consent-types` - Consent types to check (marketing, analytics, cookies, all)
- `--check-ui` - Validate consent UI/UX
- `--check-storage` - Validate consent record storage
- `--check-withdrawal` - Validate consent withdrawal
- `--check-age` - Validate age verification

**Example:**
```bash
/consent-validate --check-ui --check-storage --check-withdrawal
```

### Privacy Impact Assessment

Generate DPIA documents:

```bash
/privacy-impact-assessment [options]
```

**Options:**
- `--project, -p` - Project name to assess
- `--template` - Template (minimal, standard, comprehensive)
- `--output, -o` - Output format (markdown, pdf, html)
- `--stakeholders` - Comma-separated stakeholder list
- `--update` - Update existing DPIA

**Example:**
```bash
/privacy-impact-assessment --project "AI Recruitment Tool" --template comprehensive
```

### Right to Be Forgotten

Validate erasure implementation:

```bash
/right-to-be-forgotten [options]
```

**Options:**
- `--user-id` - Specific user to test
- `--check-cascades` - Verify cascading deletions
- `--check-backups` - Verify backup deletion
- `--check-logs` - Verify deletion from logs
- `--check-third-parties` - Verify third-party notification
- `--dry-run` - Simulate deletion

**Example:**
```bash
/right-to-be-forgotten --check-cascades --check-backups --check-third-parties
```

### Data Mapping

Generate Article 30 records:

```bash
/data-mapping [options]
```

**Options:**
- `--format` - Output format (json, yaml, csv)
- `--include-external` - Include third-party processors
- `--visualize` - Generate data flow diagram
- `--cross-border` - Highlight cross-border transfers

**Example:**
```bash
/data-mapping --format json --include-external --visualize
```

### Cookie Consent Check

Validate cookie consent implementation:

```bash
/cookie-consent-check [options]
```

**Options:**
- `--domain` - Specific domain to check
- `--scan-cookies` - Scan website for cookies
- `--check-banner` - Validate cookie banner UI
- `--check-preferences` - Validate preference management
- `--check-withdrawal` - Validate consent withdrawal

**Example:**
```bash
/cookie-consent-check --domain example.com --check-banner --check-preferences
```

## Configuration

### Retention Policy

Create `retention-policy.json` in your project root:

```json
{
  "version": "1.0",
  "lastUpdated": "2025-01-20",
  "dataCategories": [
    {
      "category": "user_accounts",
      "retentionPeriod": "7 years",
      "retentionPeriodDays": 2555,
      "justification": "Tax compliance requirements",
      "legalBasis": "contractual",
      "deletionMethod": "soft_delete_then_permanent",
      "dataLocation": ["database.users"]
    }
  ]
}
```

### Environment Variables

None required - plugin operates with file system access only.

## Security

### Considerations

- **No data transmission** - All analysis performed locally
- **No external dependencies** - Uses only Node.js built-ins and glob
- **No credential storage** - No API keys or secrets needed
- **Read-only operations** - Does not modify code unless `--fix` is used
- **Secure PII handling** - Detected PII is masked in output

### Best Practices

1. **Scan before commit** - Use pre-commit hooks for continuous compliance
2. **Review findings** - Manually verify all detected issues
3. **Document exceptions** - Create `.pii-ignore` for false positives
4. **Regular audits** - Schedule weekly compliance scans
5. **Update policies** - Keep retention policies current

## Output Examples

### GDPR Scan Output

```
GDPR Compliance Scan Results
═════════════════════════════

Scanned 1,247 files, 45,678 lines
Found 23 findings (medium+ severity)

CRITICAL:
┌─ Hardcoded PII (Article 32)
│  File: src/api/users.ts:42
│  Personal data is hardcoded in source code
│  Fix: Remove hardcoded PII. Use environment variables.

HIGH:
┌─ PII in Logs (Article 32)
│  File: src/auth/login.js:89
│  Personal data logged in plain text
│  Fix: Remove PII from logs. Use user IDs.

Summary:
  Critical: 2
  High: 8
  Medium: 11
  Low: 2
```

### PII Audit Output

```
PII Audit Report
═══════════════

Files Scanned: 847
PII Findings: 34
Risk Level: HIGH

Critical Findings:
┌─ Credit Card Number (CRITICAL)
│  File: src/payment/processor.ts:156
│  Value: ****-****-****-9010
│  Impact: PCI DSS violation, financial liability
│  Fix: Remove hardcoded card data, use tokenization

Risk by Severity:
  Critical: 3
  High: 12
  Medium: 15
  Low: 4
```

## GDPR Article Coverage

| Article | Topic | Coverage |
|---------|-------|----------|
| Article 5 | Processing Principles | ✓ Full |
| Article 6 | Lawfulness of Processing | ✓ Full |
| Article 7 | Conditions for Consent | ✓ Full |
| Article 9 | Special Category Data | ✓ Partial |
| Article 15-20 | Data Subject Rights | ✓ Full |
| Article 17 | Right to Erasure | ✓ Full |
| Article 25 | Privacy by Design | ✓ Full |
| Article 30 | Records of Processing | ✓ Full |
| Article 32 | Security of Processing | ✓ Full |
| Article 35 | DPIA | ✓ Full (generation) |
| Article 33 | Breach Notification | ✓ Guidance |

## Troubleshooting

### Common Issues

**Issue:** High false positive rate in PII detection
- **Solution:** Create `.pii-ignore` file with patterns for test data, example domains, and documentation

**Issue:** Retention policy not found
- **Solution:** Create `retention-policy.json` in project root or use `--policy` flag

**Issue:** Scan taking too long
- **Solution:** Use `--path` to scan specific directories, or `--exclude` to skip node_modules, dist, etc.

**Issue:** CI/CD pipeline failing
- **Solution:** Adjust severity threshold with `--severity` flag, or add false positive patterns

## Development

### Running Tests

```bash
npm test
```

### Project Structure

```
gdpr-privacy-scanner/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   ├── gdpr-compliance-officer.md
│   ├── privacy-architect.md
│   └── dpo-assistant.md
├── commands/
│   ├── gdpr-scan.md
│   ├── pii-audit.md
│   ├── data-retention-check.md
│   ├── consent-validate.md
│   ├── privacy-impact-assessment.md
│   ├── right-to-be-forgotten.md
│   ├── data-mapping.md
│   └── cookie-consent-check.md
├── hooks/
│   └── hooks.json
├── scripts/
│   ├── gdpr-scan.js
│   ├── pii-audit.js
│   ├── data-retention-check.js
│   ├── consent-validate.js
│   ├── privacy-impact-assessment.js
│   ├── right-to-be-forgotten.js
│   ├── data-mapping.js
│   └── cookie-consent-check.js
├── skills/
│   ├── pii-detector/
│   ├── consent-analyzer/
│   ├── retention-policy-validator/
│   └── privacy-by-design-reviewer/
├── index.js
├── package.json
└── README.md
```

## Contributing

Contributions welcome! Please ensure:

1. All commands have complete documentation and implementation
2. Error handling is comprehensive
3. Output formats are consistent
4. GDPR article references are accurate
5. Code follows project style guidelines

## License

MIT License - See LICENSE file for details

## Author

Chris Bunting (cbuntingde@gmail.com)

## Links

- **Homepage:** https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/gdpr-privacy-scanner
- **Repository:** https://github.com/cbuntingde/claude-plugins-dev
- **Issues:** https://github.com/cbuntingde/claude-plugins-dev/issues
