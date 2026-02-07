# GDPR Compliance Scan

Perform comprehensive GDPR compliance analysis on your codebase with automated detection of privacy violations, PII exposure, and compliance gaps.

## Usage

```bash
/gdpr-scan [options]
```

## Options

- `--severity, -s` - Minimum severity level (low, medium, high, critical). Default: `medium`
- `--output, -o` - Output format (json, table, markdown). Default: `table`
- `--path, -p` - Specific path to scan. Default: current directory
- `--exclude, -e` - Comma-separated paths to exclude
- `--fix` - Automatically fix applicable issues
- `--report` - Generate detailed compliance report

## What It Checks

### GDPR Article 25 (Privacy by Design)
- Data protection by default implementation
- Privacy impact assessments
- Minimal data collection practices
- Pseudonymization and encryption usage

### Data Subject Rights
- Right to be informed (privacy notices)
- Right of access (data subject access requests)
- Right to rectification
- Right to erasure (right to be forgotten)
- Right to restrict processing
- Right to data portability
- Right to object

### PII Detection
- Hardcoded personal data (names, emails, phones, SSNs, etc.)
- Insecure PII storage
- Unencrypted sensitive data
- PII in logs and error messages
- PII in URLs and query parameters

### Consent Management
- Consent tracking mechanisms
- Granular consent options
- Withdrawal of consent functionality
- Consent record-keeping
- Age verification where required

### Data Retention
- Retention policy implementation
- Automatic data deletion
- Data minimization practices
- Storage limitation compliance

### Security Measures
- Access control implementation
- Authentication and authorization
- Audit logging for PII operations
- Data breach detection and response
- Encryption at rest and in transit

## Examples

### Basic scan
```bash
/gdpr-scan
```

### Scan with critical severity only
```bash
/gdpr-scan --severity critical
```

### Generate JSON report
```bash
/gdpr-scan --output json --report
```

### Scan specific path
```bash
/gdpr-scan --path ./src/backend
```

### Auto-fix issues
```bash
/gdpr-scan --fix
```

### Exclude test directories
```bash
/gdpr-scan --exclude ./tests,./mock
```

## Output

The command outputs findings in the specified format with:

| Field | Description |
|-------|-------------|
| Rule | GDPR article or principle violated |
| Severity | Issue severity (low, medium, high, critical) |
| File | File path where issue was found |
| Line | Line number |
| Description | Detailed explanation of the issue |
| Recommendation | Suggested fix or mitigation |
| Reference | Link to GDPR guidance |

## Exit Codes

- `0` - No compliance issues found
- `1` - Compliance issues detected
- `2` - Execution error

## Integration

Can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/gdpr-check.yml
name: GDPR Compliance Check
on: [push, pull_request]
jobs:
  gdpr-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run GDPR Scan
        run: claude gdpr-scan --severity high --output json
```
