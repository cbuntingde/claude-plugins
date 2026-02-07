# PII Audit

Comprehensive audit of Personally Identifiable Information (PII) handling throughout the codebase, including detection, classification, and risk assessment.

## Usage

```bash
/pii-audit [options]
```

## Options

- `--type, -t` - PII types to check (email, phone, ssn, credit-card, ip-address, passport, all). Default: `all`
- `--strict` - Enable strict mode (fail on any PII detection)
- `--false-positives` - Load false positive patterns from file
- `--export` - Export findings to CSV file
- `--visualize` - Generate data flow visualization

## PII Types Detected

### Direct Identifiers
- **Full Name** - Person's full legal name
- **Email Address** - Email addresses
- **Phone Number** - Telephone/mobile numbers
- **Social Security Number** - SSN, national ID numbers
- **Passport Number** - Passport and travel document numbers
- **Driver's License** - Driver license numbers
- **Credit Card Number** - Payment card numbers (PAN)
- **Bank Account Number** - IBAN, routing + account numbers
- **Health Information** - Medical record numbers, diagnoses
- **Biometric Data** - Fingerprints, facial recognition data

### Indirect Identifiers
- **IP Address** - IPv4 and IPv6 addresses
- **MAC Address** - Network device identifiers
- **Geolocation** - GPS coordinates, addresses
- **Cookie IDs** - Tracking identifiers
- **Device IDs** - Mobile device identifiers
- **Vehicle Registration** - License plate numbers

## What It Checks

### Code Patterns
```javascript
// VULNERABLE - Hardcoded PII
const userEmail = "john.doe@example.com";
const ssn = "123-45-6789";

// VULNERABLE - PII in logs
console.log(`User ${user.name} logged in`);

// VULNERABLE - PII in URL
fetch(`/api/users/${email}/profile`);

// SECURE - Parameterized queries
db.query('SELECT * FROM users WHERE email = ?', [email]);
```

### Configuration Files
- Environment variables with default PII values
- Config files containing test data with real PII
- Database connection strings with embedded credentials

### Data Storage
- Database schemas without encryption flags
- Unencrypted file storage for sensitive data
- Insecure serialization of PII

### Data Transmission
- Unencrypted API endpoints handling PII
- PII in query parameters
- Sensitive data in HTTP headers

## Examples

### Audit all PII types
```bash
/pii-audit
```

### Check specific PII types
```bash
/pii-audit --type email,ssn,credit-card
```

### Export findings to CSV
```bash
/pii-audit --export pii-findings.csv
```

### Strict mode for CI/CD
```bash
/pii-audit --strict
```

### Generate data flow diagram
```bash
/pii-audit --visualize
```

## Output Format

```
PII Audit Report
================

Files Scanned: 1,247
PII Findings: 23
Risk Level: HIGH

Critical Findings:
┌────────────────────────────────────────────────────────────────────────────┐
│ Type: Credit Card Number                                                   │
│ File: src/payment/processor.ts:156                                         │
│ Risk: CRITICAL                                                             │
│ Context: const cardNumber = "4532-1234-5678-9010";                         │
│ Impact: PCI DSS violation, potential fraud, financial liability            │
│ Fix: Remove hardcoded card data, use tokenization                          │
└────────────────────────────────────────────────────────────────────────────┘

High Priority:
┌────────────────────────────────────────────────────────────────────────────┐
│ Type: Email Address                                                        │
│ File: src/auth/login.js:42                                                 │
│ Risk: HIGH                                                                 │
│ Context: logger.info(`Login attempt: ${email}`);                           │
│ Impact: PII leakage in logs, privacy violation                             │
│ Fix: Hash email in logs or use user ID                                    │
└────────────────────────────────────────────────────────────────────────────┘

PII Classification Summary:
├── Direct Identifiers: 18
├── Indirect Identifiers: 5
├── Sensitive Personal Data: 3
└── Special Category Data: 1

Data Flow Map:
src/auth/login.js → Database (users table)
src/payment/processor.ts → Payment Gateway
src/user/profile.ts → Cache → Database
```

## GDPR Article Relevance

- **Article 4** - Definition of personal data
- **Article 6** - Lawfulness of processing
- **Article 9** - Processing of special category data
- **Article 32** - Security of processing
- **Article 33** - Notification of personal data breach

## Best Practices

1. **Data Minimization** - Only collect PII absolutely necessary
2. **Pseudonymization** - Replace direct identifiers with pseudonyms
3. **Encryption** - Encrypt PII at rest and in transit
4. **Access Control** - Restrict PII access to authorized personnel
5. **Retention Limits** - Delete PII when no longer needed
6. **Audit Logging** - Log all PII access and modifications

## False Positive Handling

Create `.pii-ignore` file to manage false positives:

```regex
# Test fixtures
**/*.test.js
**/*.spec.ts
**/fixtures/**
**/mocks/**

# Example domains
**/example.com**
**@test\.local**
**\+1-555-01**

# Documentation
**/README.md
**/docs/examples/**
```
