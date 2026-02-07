---
description: Automatically detect HIPAA violations and PHI (Protected Health Information) handling issues
capabilities:
  - PHI storage detection
  - PHI transmission analysis
  - Audit logging verification
  - Minimum necessary standard checking
  - Authentication and access control assessment
triggers:
  - User mentions HIPAA, PHI, medical, health, patient data
  - Code handles healthcare or medical information
  - Backend code with patient/health data storage
  - Code with medical record or insurance information
---

# HIPAA Scanner Skill

Automatically detects HIPAA (Health Insurance Portability and Accountability Act) compliance issues and PHI (Protected Health Information) handling problems in your codebase.

## Activation Triggers

This skill activates when:

- User mentions HIPAA, PHI, medical, health, or patient data
- Code contains healthcare or medical information handling
- Backend code stores, processes, or transmits patient/health data
- Files with medical record, insurance, or healthcare functionality
- Database queries on patient or health tables

## What It Detects

### PHI Storage Operations
- Direct PHI storage in databases
- PHI in configuration files
- Unencrypted PHI storage
- Medical record number handling
- Health insurance information storage

### PHI Transmission
- API endpoints transmitting PHI
- PHI in HTTP requests/responses
- Unencrypted PHI transmission
- Third-party PHI sharing
- PHI in webhooks or callbacks

### Audit Logging
- PHI access logging
- Authentication events
- Data modification tracking
- Export/download logging
- Audit log integrity

### Minimum Necessary Standard
- SELECT * queries on PHI tables
- Over-fetching patient data
- Unrestricted data access
- Lack of data view restrictions
- Bulk PHI retrieval

### Authentication & Authorization
- PHI system authentication
- Multi-factor authentication
- Role-based access control
- Session management for PHI
- Emergency access procedures

## HIPAA Security Rule Standards

| Standard | Requirement | Detection Method |
|----------|-------------|------------------|
| §164.312(a)(1) | Access control | Verify unique user authentication and RBAC |
| §164.312(a)(2) | Audit controls | Detect logging of PHI access |
| §164.312(c)(1) | Encryption at rest | Check for encryption of stored PHI |
| §164.312(e)(1) | Transmission security | Verify TLS/encryption for PHI in transit |
| §164.312(d)(1) | Minimum necessary | Identify over-fetching of PHI data |
| §164.308(a)(1) | Security management | Look for security policies and procedures |

## PHI Categories Detected

### Direct Identifiers
- Names
- Social Security Numbers
- Dates of birth
- Addresses
- Telephone numbers

### Health Information
- Medical record numbers
- Health plan numbers
- Device identifiers
- Web URLs
- IP addresses
- Biometric identifiers

### Healthcare Information
- Diagnosis codes (ICD)
- Procedure codes (CPT)
- Prescription information
- Test results
- Treatment history

## Analysis Approach

1. **Pattern Detection**: Identify PHI-related code patterns
2. **Data Flow Tracking**: Follow PHI through application layers
3. **Encryption Verification**: Check for encryption implementation
4. **Access Control Review**: Evaluate authentication and authorization
5. **Logging Assessment**: Verify audit trail completeness
6. **Minimum Necessary Analysis**: Detect over-fetching and excessive access

## Risk Assessment

Each finding is categorized by severity:

- **Critical**: Unencrypted PHI, no authentication for PHI access
- **High**: Missing audit logging, weak authentication
- **Medium**: Potential over-fetching, incomplete logging
- **Low**: Minor documentation or configuration issues

## Recommendations Provided

For each detected issue, the skill provides:

- Specific HIPAA section reference
- Security rule requirement description
- Current implementation assessment
- Risk level and potential impact
- Specific remediation steps
- Code examples for secure implementation
- Links to HHS guidance

## Best Practices Enforced

- Encrypt all PHI at rest (AES-256)
- Encrypt all PHI in transit (TLS 1.2+)
- Implement comprehensive audit logging
- Enforce minimum necessary standard
- Use multi-factor authentication
- Implement role-based access control
- Regular security audits and penetration testing
- Business associate agreements for vendors

## Limitations

- Cannot assess encryption strength in detail
- May produce false positives with test data
- Cannot verify actual audit log implementation
- Requires manual review of business associate agreements
- Does not replace formal HIPAA security assessment
- Cannot verify physical security controls
