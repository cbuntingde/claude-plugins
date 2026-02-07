---
description: Detect Personally Identifiable Information (PII) in your codebase
---

# /pii-scan

Scan your codebase to detect Personally Identifiable Information (PII) that may be exposed in code, configuration files, or documentation.

## What it detects

- **Contact Information**: Email addresses, phone numbers
- **Identification Documents**: SSNs, passport numbers, driver's licenses
- **Financial Information**: Credit card numbers, bank account numbers
- **Technical Identifiers**: IP addresses
- **Health Information**: Medical record numbers, health insurance numbers
- **Personal Dates**: Dates of birth

## Usage

```bash
/pii-scan
```

Scan the entire codebase for all PII types.

```bash
/pii-scan --path ./config
```

Scan a specific directory for PII.

```bash
/pii-scan --categories email,ssn,creditCard
```

Scan only specific PII categories.

```bash
/pii-scan --severity high,critical
```

Only show high and critical severity PII findings.

## Options

- `--path <path>`: Specify directory or file to scan (default: current directory)
- `--categories <list>`: Comma-separated list of PII categories to scan
- `--severity <levels>`: Filter by severity levels (critical, high, medium, low)

## PII Categories

### Contact Information
- `email`: Email addresses (high severity)
- `phone`: Phone numbers (medium severity)

### Identification Documents
- `ssn`: Social Security Numbers (critical severity)
- `passport`: Passport numbers (high severity)
- `driversLicense`: Driver's license numbers (high severity)

### Financial Information
- `creditCard`: Credit card numbers (critical severity)
- `bankAccount`: Bank account numbers (critical severity)

### Technical Identifiers
- `ipAddress`: IP addresses (medium severity)

### Health Information
- `medicalRecord`: Medical record numbers (critical severity)
- `healthInsurance`: Health insurance numbers (critical severity)

### Personal Information
- `dateOfBirth`: Dates of birth (medium severity)

## Examples

Scan for all PII types:
```bash
/pii-scan
```

Scan configuration files only:
```bash
/pii-scan --path ./config
```

Scan only for critical PII (SSNs, credit cards, health info):
```bash
/pii-scan --categories ssn,creditCard,medicalRecord,healthInsurance
```

## Output

The scan produces a detailed report grouped by PII category:

- **Category summary**: Number of findings per PII type
- **Detailed findings**: Each PII occurrence with:
  - File path and line number
  - PII type and description
  - Severity level
  - Matched text (truncated)

## Best Practices

1. **Verify findings**: Pattern matching may produce false positives
2. **Remove confirmed PII**: Move secrets and sensitive data to environment variables
3. **Use secrets management**: Implement proper secrets vaulting (HashiCorp Vault, AWS Secrets Manager)
4. **Git history cleanup**: Use BFG Repo-Cleaner or git filter-repo for past exposures
5. **Enable commit hooks**: Automatically scan for PII before commits
6. **Documentation**: Never document real credentials or PII in docs

## Important Notes

- This scanner uses pattern matching and may produce false positives
- Always verify findings before taking action
- Some detected items may be test data or examples
- Ensure proper handling of any confirmed PII data
- Consider legal and regulatory requirements for PII handling
