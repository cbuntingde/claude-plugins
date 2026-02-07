---
description: Perform comprehensive compliance scan for GDPR, HIPAA, SOC2 violations and PII handling
---

# /compliance-scan

Perform a comprehensive compliance scan of your codebase to detect violations of GDPR, HIPAA, SOC2 regulations and identify PII (Personally Identifiable Information) handling issues.

## What it scans

- **GDPR Violations**: Consent management, data retention, data portability, personal data processing
- **HIPAA Violations**: PHI storage and transmission, audit logging, minimum necessary standard, authentication
- **SOC2 Violations**: Access controls, encryption, logging, change management, incident response
- **PII Detection**: Emails, SSNs, credit cards, phone numbers, IPs, passport numbers, medical records

## Usage

```bash
/compliance-scan
```

Scan the entire codebase for all compliance frameworks.

```bash
/compliance-scan --path ./src
```

Scan a specific directory or file.

```bash
/compliance-scan --frameworks gdpr,hipaa
```

Scan only specific compliance frameworks.

```bash
/compliance-scan --severity critical,high
```

Only show critical and high severity issues.

```bash
/compliance-scan --no-pii
```

Skip PII detection and only scan for compliance violations.

## Options

- `--path <path>`: Specify directory or file to scan (default: current directory)
- `--frameworks <list>`: Comma-separated list of frameworks (gdpr, hipaa, soc2)
- `--severity <levels>`: Filter by severity levels (critical, high, medium, low)
- `--pii` / `--no-pii`: Enable/disable PII detection (default: enabled)
- `--output <format>`: Output format (text, json)

## Examples

Scan your entire project:
```bash
/compliance-scan
```

Scan only backend for HIPAA compliance:
```bash
/compliance-scan --path ./backend --frameworks hipaa --severity critical,high
```

Get JSON output for CI/CD:
```bash
/compliance-scan --output json > compliance-report.json
```

## Output

The scan produces a detailed report including:

- **Summary statistics**: Total issues found, breakdown by severity and framework
- **Detailed findings**: Each violation with:
  - File path and line number
  - Severity level
  - Compliance framework
  - Category and description
  - Recommended remediation
  - Code snippet

## Framework Details

### GDPR (General Data Protection Regulation)
- Consent mechanisms for cookies and tracking
- Data retention and deletion policies
- Data export/portability features
- Privacy policy documentation
- Lawful basis for data processing

### HIPAA (Health Insurance Portability and Accountability Act)
- PHI (Protected Health Information) storage encryption
- PHI transmission encryption
- Audit logging for PHI access
- Minimum necessary standard compliance
- Authentication requirements

### SOC2 (Service Organization Control 2)
- Access control implementation
- Encryption at rest and in transit
- Comprehensive logging
- Change management processes
- Incident response procedures
- Data backup and recovery
- Network security controls
- Vulnerability management

## Integration with hooks

This command integrates with automated compliance hooks that run on:
- File writes (PostToolUse)
- Before commits (pre-commit style)
- Session start (periodic scans)

See `hooks/hooks.json` for configuration.
