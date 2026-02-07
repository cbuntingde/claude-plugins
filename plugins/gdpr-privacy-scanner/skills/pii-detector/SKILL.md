---
description: Advanced PII detection and classification with GDPR Article 4 compliance
capabilities: ["pii_detection", "pii_classification", "risk_scoring", "false_positive_filtering"]
---

# PII Detector Skill

Automatically detects, classifies, and assesses risk for Personally Identifiable Information (PII) in code, configuration files, and data stores.

## Detection Capabilities

### Direct Identifiers (High Risk)
- **Full Name** - Person's complete legal name
- **Email Address** - Electronic mail addresses
- **Phone Number** - Telephone/mobile numbers
- **Social Security Number** - National identification numbers
- **Passport Number** - Travel document identifiers
- **Driver's License** - Government-issued license numbers
- **Credit Card Number** - Payment card PANs
- **Bank Account Details** - IBANs, account numbers, routing numbers
- **Health Information** - Medical record numbers, diagnoses
- **Biometric Data** - Fingerprints, facial recognition data

### Indirect Identifiers (Medium Risk)
- **IP Address** - IPv4 and IPv6 addresses
- **MAC Address** - Network device identifiers
- **Geolocation** - GPS coordinates, addresses
- **Cookie IDs** - Tracking identifiers
- **Device IDs** - Mobile device identifiers
- **Vehicle Registration** - License plate numbers

### Special Category Data (Critical Risk)
- **Racial or ethnic origin**
- **Political opinions**
- **Religious beliefs**
- **Trade union membership**
- **Genetic data**
- **Biometric data (for identification)**
- **Health data**
- **Sex life or sexual orientation**

## Usage

The PII detector skill automatically analyzes:

1. **Code files** - JavaScript, TypeScript, Python, Java, Go, Ruby, PHP
2. **Configuration files** - JSON, YAML, .env files
3. **Database schemas** - SQL, Prisma, ORM definitions
4. **Documentation** - README files, markdown docs
5. **Test fixtures** - Test data, mocks, examples

## Detection Patterns

```typescript
// Email detection
const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// SSN detection (US)
const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;

// Credit card detection
const ccPattern = /\b(?:\d[ -]*?){13,16}\b/g;

// IP address detection
const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

// Phone number detection
const phonePattern = /\+?[\d\s\-\(\)]{10,}/g;
```

## Risk Scoring

```typescript
interface PIIRisk {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  weight: number;
  factors: string[];
}

const riskScores: Record<string, PIIRisk> = {
  creditCard: {
    type: 'Credit Card Number',
    severity: 'critical',
    weight: 10,
    factors: ['PCI DSS scope', 'financial fraud risk', 'GDPR Article 10']
  },
  ssn: {
    type: 'Social Security Number',
    severity: 'critical',
    weight: 10,
    factors: ['identity theft risk', 'US federal law', 'GDPR Article 10']
  },
  healthData: {
    type: 'Health Information',
    severity: 'critical',
    weight: 10,
    factors: ['special category data', 'GDPR Article 9', 'HIPAA']
  },
  email: {
    type: 'Email Address',
    severity: 'medium',
    weight: 3,
    factors: ['contact information', 'GDPR Article 4(1)']
  },
  ipAddress: {
    type: 'IP Address',
    severity: 'low',
    weight: 1,
    factors: ['indirect identifier', 'can be pseudonymized']
  }
};
```

## False Positive Filtering

Automatically filters out:

- Example domains (example.com, test.example)
- Placeholder values (test@test.local, 1-555-01XX)
- Local addresses (localhost, 127.0.0.1, 0.0.0.0)
- Documentation placeholders
- Well-known test credentials

## Integration

The skill integrates with:

- **Write/Edit tools** - Check for PII before code changes
- **Bash tool** - Scan command output for PII exposure
- **Read tool** - Analyze file contents for PII
- **Grep tool** - Enhance searches with PII context

## Best Practices

1. **Minimize PII in code** - Never hardcode personal data
2. **Use environment variables** - Store secrets securely
3. **Hash sensitive identifiers** - Use irreversible hashing
4. **Pseudonymize when possible** - Replace direct identifiers
5. **Encrypt at rest** - Use AES-256 for stored PII
6. **Encrypt in transit** - Use TLS 1.3 for PII transmission
7. **Log safely** - Never log PII in plain text
8. **Access control** - Restrict PII access to authorized personnel
9. **Audit PII access** - Log who accesses what data
10. **Retention limits** - Delete PII when no longer needed
