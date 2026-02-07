---
description: Reviews systems for GDPR Article 25 privacy by design and by default implementation
capabilities: ["privacy_by_design_check", "default_privacy_settings", "pseudonymization_detection", "data_minimization_analysis"]
---

# Privacy by Design Reviewer Skill

Reviews system architectures and implementations for GDPR Article 25 compliance - privacy by design and by default.

## GDPR Article 25 Requirements

### Article 25(1) - Data Protection by Design
> The controller shall, both at the time of the determination of the means for processing and at the time of the processing itself, implement appropriate technical and organisational measures, such as pseudonymisation, which are designed to implement data-protection principles.

### Article 25(2) - Data Protection by Default
> The controller shall implement appropriate technical and organisational measures for ensuring that, by default, only personal data which are necessary for each specific purpose of the processing are processed.

## Review Principles

### Privacy by Design (PbD) Principles

1. **Proactive not Reactive** - Anticipate and prevent privacy intrusions
2. **Privacy as Default** - Privacy-protective settings are default
3. **Privacy Embedded** - Privacy integrated into design
4. **Full Functionality** - Privacy doesn't reduce functionality
5. **End-to-End Security** - Security throughout lifecycle
6. **Visibility and Transparency** - Open about practices
7. **Respect for User Privacy** - Keep user-centric focus

### Implementation Requirements

- [x] **Data Minimisation** - Collect only what's necessary
- [x] **Pseudonymization** - Replace direct identifiers where possible
- [x] **Encryption** - Protect data at rest and in transit
- [x] **Access Controls** - Restrict access to authorized users
- [x] **Audit Logging** - Track all data access
- [x] **Security Testing** - Regular penetration testing
- [x] **Privacy Impact Assessment** - DPIA for high-risk processing

## Detection Capabilities

### Data Minimisation Checks

```typescript
// GOOD - Minimal data collection
interface MinimalRegistration {
  email: string;
  passwordHash: string;
  consentGiven: boolean;
}

// BAD - Excessive data collection
interface ExcessiveRegistration {
  email: string;
  passwordHash: string;
  consentGiven: boolean;
  fullName: string;          // Unnecessary
  dateOfBirth: Date;         // Unnecessary
  address: string;           // Unnecessary
  phoneNumber: string;       // Unnecessary
  gender: string;            // Unnecessary
  title: string;             // Unnecessary
}

// Detection pattern
const detectDataMinimisation = (schema: object) => {
  const requiredFields = Object.keys(schema).length;
  const expectedMaxFields = 5; // Adjust based on use case

  if (requiredFields > expectedMaxFields) {
    return {
      compliant: false,
      issue: 'Excessive data collection',
      recommendation: 'Remove unnecessary fields or move to optional collection'
    };
  }

  return { compliant: true };
};
```

### Pseudonymization Detection

```typescript
// Pseudonymization example
interface PseudonymizedUser {
  userId: string;           // Original: john.doe@example.com
  pseudonym: string;        // Pseudonymized: a1b2c3d4@example.com
  createdAt: Date;
}

const pseudonymizeEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  const hash = crypto.createHash('sha256')
    .update(local + process.env.PSEUDONYM_SALT)
    .digest('hex')
    .substring(0, 8);
  return `${hash}@${domain}`;
};

// Detection
const detectPseudonymization = (config: object) => {
  const hasHashing = /hash|pseudonym|anonym/i.test(JSON.stringify(config));
  const hasSaltKey = /PSEUDONYM_SALT|SALT|ANONYMIZATION_KEY/i.test(JSON.stringify(config));

  return {
    hasPseudonymization: hasHashing && hasSaltKey,
    recommendation: !hasPseudonymization
      ? 'Implement pseudonymization for direct identifiers'
      : undefined
  };
};
```

### Encryption Verification

```typescript
// Encryption at rest check
const detectEncryptionAtRest = (dbConfig: object) => {
  const encryptionIndicators = [
    /encryption/i,
    /encrypted/i,
    /AES/i,
    /TDE/i, // Transparent Data Encryption
    /kms/i  // Key Management Service
  ];

  const hasEncryption = encryptionIndicators.some(pattern =>
    pattern.test(JSON.stringify(dbConfig))
  );

  return {
    hasEncryption,
    recommendation: !hasEncryption
      ? 'Enable encryption at rest (AES-256) for all personal data'
      : undefined
  };
};

// Encryption in transit check
const detectEncryptionInTransit = (serverConfig: object) => {
  const tlsIndicators = [
    /tls/i,
    /ssl/i,
    /https/i,
    /wss/i  // WebSocket Secure
  ];

  const hasTLS = tlsIndicators.some(pattern =>
    pattern.test(JSON.stringify(serverConfig))
  );

  return {
    hasTLS,
    recommendation: !hasTLS
      ? 'Enable TLS 1.3 for all connections'
      : undefined
  };
};
```

## Architecture Review Checklist

### Database Layer
- [ ] Encryption at rest enabled
- [ ] Pseudonymization for direct identifiers
- [ ] Access control (RBAC) implemented
- [ ] Audit logging for all queries
- [ ] Data retention policies defined
- [ ] Backup encryption enabled
- [ ] Connection encryption (TLS)

### API Layer
- [ ] TLS 1.3 for all endpoints
- [ ] Authentication required
- [ ] Authorization checks on all endpoints
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization
- [ ] No PII in URLs
- [ ] No PII in error messages
- [ ] API key rotation

### Application Layer
- [ ] Environment variables for secrets
- [ ] No hardcoded PII or credentials
- [ ] Logging excludes PII
- [ ] Error handling doesn't expose data
- [ ] Session management secure
- [ ] CSRF protection
- [ ] Security headers (CSP, HSTS, etc.)

### Infrastructure Layer
- [ ] Network isolation (VPC, subnets)
- [ ] Firewall rules restrictive
- [ ] Secrets manager (KMS, Vault)
- [ ] Intrusion detection/prevention
- [ ] Log aggregation and monitoring
- [ ] Incident response procedures
- [ ] Regular security assessments

## Privacy by Default Implementation

### Default Settings

```typescript
// Privacy-protective defaults
const defaultPrivacySettings = {
  // Opt-in for all non-essential processing
  analyticsEnabled: false,
  marketingConsent: false,
  dataSharing: false,
  cookies: {
    essential: true,   // Required for functionality
    analytics: false,
    marketing: false
  },

  // Data minimization
  profileVisibility: 'private', // Not public by default
  shareDataWithPartners: false,

  // Security defaults
  twoFactorAuth: true,
  sessionTimeout: 900, // 15 minutes
  passwordMinLength: 12,

  // Privacy defaults
  dataRetentionPolicy: 'standard', // Not indefinite
  anonymousAnalytics: true, // Pseudonymized by default
  emailSearchability: false // Email not searchable by other users
};

// User cannot override security defaults
const SECURITY_DEFAULTS = ['twoFactorAuth', 'sessionTimeout', 'passwordMinLength'];
```

### Privacy Controls

```typescript
interface PrivacyControls {
  // Data collection controls
  dataCollection: {
    minimized: boolean;
    necessaryOnly: boolean;
    justified: boolean;
  };

  // Processing controls
  processing: {
    lawfulBasis: 'consent' | 'contractual' | 'legitimate_interest';
    purposeLimitation: boolean;
    dataMinimisation: boolean;
  };

  // Access controls
  access: {
    authenticationRequired: boolean;
    roleBasedAccess: boolean;
    principleOfLeastPrivilege: boolean;
  };

  // Security controls
  security: {
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    pseudonymization: boolean;
    auditLogging: boolean;
  };

  // Rights controls
  rights: {
    rightToAccess: boolean;
    rightToRectification: boolean;
    rightToErasure: boolean;
    rightToPortability: boolean;
    rightToObject: boolean;
  };
}
```

## Review Output

The reviewer provides:

1. **Compliance Score** - Percentage of PbD principles met
2. **Critical Findings** - High-priority violations
3. **Recommendations** - Prioritized improvement steps
4. **Code Examples** - Secure implementation patterns
5. **Configuration Examples** - Production-ready configs
6. **Best Practice Guide** - Industry-standard approaches

## Integration

The reviewer skill checks:

- **Database schemas** - For encryption, access control
- **API specifications** - For TLS, authentication
- **Application code** - For data minimisation, logging
- **Configuration files** - For security settings
- **Infrastructure configs** - For network security
- **Deployment manifests** - For production security

## Best Practices

1. **Start with privacy** - Design systems with privacy first
2. **Default to secure** - Most secure settings are default
3. **Minimize data** - Collect only what's necessary
4. **Encrypt everything** - All PII encrypted at rest and in transit
5. **Pseudonymize early** - Replace identifiers when possible
6. **Control access** - Restrict to those who need it
7. **Log everything** - Audit trail for compliance
8. **Test regularly** - Penetration testing, security audits
9. **Document decisions** - Privacy impact assessments
10. **Review continuously** - Regular privacy reviews
