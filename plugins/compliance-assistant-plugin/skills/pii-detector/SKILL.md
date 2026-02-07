---
description: Automatically detect Personally Identifiable Information (PII) in code and configuration
capabilities:
  - Multi-format PII pattern detection
  - Risk assessment based on context
  - Data classification and categorization
  - Remediation recommendations
  - False positive filtering
triggers:
  - Code contains potential PII patterns
  - Configuration files with sensitive data
  - User mentions PII, personal data, or sensitive information
  - Files with high entropy (possible encrypted data)
---

# PII Detector Skill

Automatically detects Personally Identifiable Information (PII) in code, configuration files, and documentation, providing risk assessment and remediation guidance.

## Activation Triggers

This skill activates when:

- Code patterns match PII signatures (emails, SSNs, credit cards, etc.)
- Configuration files contain sensitive-looking data
- User mentions PII, personal data, or sensitive information
- Files with high entropy (possible encrypted data or secrets)
- Documentation with real-looking examples
- Environment files or secrets files

## What It Detects

### Contact Information
- Email addresses: `user@example.com`
- Phone numbers: `(555) 123-4567`, `555-123-4567`
- Physical addresses: Multi-line address patterns
- Fax numbers

### Identification Documents
- Social Security Numbers: `123-45-6789`, `123456789`
- Passport numbers: `A1234567`, `AB1234567`
- Driver's licenses: State-specific patterns
- Tax IDs: Country-specific patterns
- National IDs: Country-specific patterns

### Financial Information
- Credit cards: Visa, MC, Amex, Discover patterns
- Bank account numbers: 8-17 digit sequences
- IBAN numbers: International format
- Routing numbers: 9-digit US routing

### Health Information
- Medical record numbers: `MRN: 1234567`
- Health insurance numbers: Various formats
- Patient IDs: Hospital-specific patterns
- Prescription numbers: Pharmacy patterns

### Technical Identifiers
- IP addresses: IPv4 and IPv6
- MAC addresses: `00:1A:2B:3C:4D:5E`
- Device IDs: Various formats
- API keys: High entropy strings

### Personal Demographics
- Dates of birth: Various date formats
- Ages (in context with other PII)
- Names (when combined with other PII)

## Detection Methods

### Pattern Matching
- Regular expressions for structured PII
- Heuristic analysis for unstructured data
- Context-aware pattern matching
- Multi-format detection

### Entropy Analysis
- High entropy detection for secrets
- Statistical analysis of data randomness
- Base64 encoded data detection

### Context Analysis
- Variable name analysis (e.g., `userEmail`, `customer_ssn`)
- Comment and documentation analysis
- File type and location consideration
- Surrounding code context

### Data Flow Tracking
- Trace PII through application
- Identify storage locations
- Detect transmission points
- Find exposure risks

## Risk Assessment Factors

| Factor | High Risk | Medium Risk | Low Risk |
|--------|-----------|-------------|----------|
| Location | Public repo | Private repo | Local dev |
| File Type | Code/Config | Documentation | Comments |
| Exposure | Committed | Staged | Uncommitted |
| Sensitivity | SSN, Credit Card | Email, Phone | Name, DOB |
| Scope | Production | All environments | Test/Dev only |

## Risk Levels

- **Critical**: SSN, credit cards, health info in public repos
- **High**: Financial info, IDs in committed code
- **Medium**: Contact info, IPs in configuration
- **Low**: Names, DOBs in documentation

## Remediation Recommendations

### Immediate Action (Critical/High)

```bash
# 1. Remove from current version
git rm --cached <file>
git commit -m "Remove PII from code"

# 2. Clean git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch <file>" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Rotate credentials
# - Change passwords
# - Regenerate API keys
# - Reissue certificates
# - Notify users if needed
```

### Short-term Actions

1. **Implement Secrets Management**
   - Use environment variables
   - Deploy secrets vault (HashiCorp Vault, AWS Secrets Manager)
   - Never commit secrets to version control

2. **Add Pre-commit Hooks**
   - Install PII scanner in pre-commit
   - Block commits with detected PII
   - Configure allowed patterns for test data

3. **Update .gitignore**
   - Add sensitive file patterns
   - Include environment files
   - Add secrets directories

### Long-term Actions

1. **Establish Data Governance**
   - Classify all data types
   - Define handling procedures
   - Create data retention policies

2. **Developer Training**
   - Secure coding practices
   - Secrets management
   - Regular security awareness

3. **Regular Scanning**
   - Include PII detection in CI/CD
   - Schedule periodic repository scans
   - Monitor for exposed secrets

## Best Practices

1. **Never Commit PII**
   - Use environment variables
   - Implement secrets management
   - Educate development team

2. **Data Minimization**
   - Collect only necessary data
   - Anonymize when possible
   - Use test data generators

3. **Encrypt Sensitive Data**
   - Encrypt at rest (AES-256)
   - Encrypt in transit (TLS 1.2+)
   - Secure key management

4. **Access Controls**
   - Role-based access
   - Principle of least privilege
   - Audit access logs

5. **Regular Auditing**
   - Scan repositories for PII
   - Review access logs
   - Test data handling

## False Positive Handling

The skill uses context-aware analysis to reduce false positives:

- Check for test data indicators (test, mock, dummy)
- Verify against common example values
- Analyze variable names and comments
- Consider file location and type

You can configure allowed patterns:

```json
{
  "allowedPatterns": [
    "test@example.com",
    "user@test\\.com",
    "\\d{3}-\\d{2}-\\d{4}"  // Only in test files
  ],
  "excludedDirectories": [
    "test/",
    "spec/",
    "examples/"
  ]
}
```

## Compliance Mapping

Detected PII is mapped to regulatory requirements:

- **GDPR**: Articles 15-21 (data subject rights)
- **HIPAA**: PHI handling requirements
- **CCPA**: Consumer privacy act
- **PCI DSS**: Payment card industry standards

## Output Format

```
PII Detection Report
====================

Summary:
  Total Findings: 15
  Critical: 3 (SSN, Credit Cards)
  High: 5 (IDs, Financial)
  Medium: 5 (Contact Info, IPs)
  Low: 2 (Names, DOB)

By Category:
  Identification: 6
  Financial: 4
  Contact: 3
  Technical: 2

Critical Findings:
  File: config/database.json:12
    Type: Social Security Number
    Pattern: 123-45-6789
    Risk: CRITICAL - In public repository
    Action: Remove immediately, rotate, clean history
```

## Limitations

- Cannot distinguish real from test data with 100% accuracy
- May miss obfuscated or encoded PII
- Requires manual verification of findings
- Cannot detect PII in binary files
- Context analysis has limitations
- Pattern matching produces false positives
