---
description: Check for HIPAA (Health Insurance Portability and Accountability Act) compliance violations
---

# /hipaa-check

Scan your codebase for HIPAA compliance issues and violations of the Health Insurance Portability and Accountability Act Security Rule.

## What it checks

- **PHI Storage**: Protected Health Information storage operations
- **PHI Transmission**: PHI transmission and transfer operations
- **Audit Logging**: Access logging for PHI
- **Minimum Necessary**: Potential over-fetching of PHI data
- **Authentication**: Authentication mechanisms for PHI systems

## Usage

```bash
/hipaa-check
```

Scan the entire codebase for HIPAA compliance issues.

```bash
/hipaa-check --path ./backend
```

Scan a specific directory.

```bash
/hipaa-check --severity critical,high
```

Only show critical and high severity issues.

## Options

- `--path <path>`: Specify directory or file to scan (default: current directory)
- `--severity <levels>`: Filter by severity levels (critical, high, medium, low)

## HIPAA Security Rule Standards

### Administrative Safeguards
- Security management process
- Assigned security responsibility
- Workforce security
- Information access management
- Security awareness and training
- Security incident procedures
- Contingency planning
- Business associate agreements

### Physical Safeguards
- Facility access controls
- Workstation use
- Workstation security
- Device and media controls

### Technical Safeguards
- Access control (unique user identification, emergency access, automatic logoff, encryption)
- Audit controls
- Integrity controls
- Transmission security (encryption)

## Examples

Scan entire project:
```bash
/hipaa-check
```

Scan backend for PHI handling:
```bash
/hipaa-check --path ./backend/src
```

Focus on critical issues:
```bash
/hipaa-check --severity critical
```

## Output

The check produces a report grouped by HIPAA category:

- **PHI Storage**: Operations storing protected health information
- **PHI Transmission**: Operations transmitting PHI
- **Audit**: Logging and auditing of PHI access
- **Minimum Necessary**: Queries that may fetch more data than needed
- **Authentication**: Authentication mechanisms for PHI access

Each finding includes:
- File path and line number
- HIPAA category
- Severity level
- Description of the issue
- Recommendation for compliance

## Key HIPAA Requirements

### PHI (Protected Health Information)
Individually identifiable health information:
- Demographics
- Medical history
- Test results
- Insurance information
- Other data that identifies an individual

### Encryption Requirements
- **At Rest**: AES-256 or equivalent
- **In Transit**: TLS 1.2 or higher
- **Key Management**: Secure key generation, storage, and rotation

### Access Control
- Unique user identification
- Role-based access control
- Principle of least privilege
- Emergency access procedures

### Audit Logging
- Log all PHI access (create, read, update, delete)
- Include: user, timestamp, action, data accessed
- Retain logs for minimum 6 years
- Protect audit logs from tampering

### Minimum Necessary Standard
- Access only the PHI needed for the task
- Implement role-based data access limits
- Avoid SELECT * queries on patient/PHI tables
- Implement view-level restrictions

### Business Associate Agreements (BAA)
- Required for all vendors handling PHI
- Define permitted uses and disclosures
- Specify security requirements
- Include breach notification procedures

## Best Practices

1. **Encrypt Everywhere**: Encrypt PHI at rest and in transit
2. **Audit Everything**: Log all PHI access with context
3. **Least Privilege**: Grant minimum necessary access
4. **Access Controls**: Implement multi-factor authentication
5. **Data Minimization**: Store only necessary PHI
6. **Regular Audits**: Conduct security audits and penetration testing
7. **Training**: Train workforce on HIPAA security procedures
8. **Breach Response**: Establish incident response procedures

## Common Violations

- Unencrypted PHI storage
- PHI transmitted over HTTP
- Lack of audit logging for PHI access
- Over-fetching PHI data (SELECT *)
- Shared or default credentials
- Lack of access controls
- Missing business associate agreements
- Inadequate employee training

## Resources

- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [NIST HIPAA Security Rule Toolkit](https://www.nist.gov/itl/smallbusiness-publication/hipaa-security-rule-toolkit)
- [OCR HIPAA Guidance](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/index.html)
