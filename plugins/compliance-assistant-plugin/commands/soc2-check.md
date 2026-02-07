---
description: Check for SOC2 (Service Organization Control 2) compliance violations
---

# /soc2-check

Scan your codebase for SOC2 compliance issues and alignment with SOC2 Trust Services Criteria.

## What it checks

- **Access Control**: Role-based access and permission checks
- **Encryption**: Cryptographic operations
- **Logging**: Logging and monitoring operations
- **Change Management**: Deploy, release, and version operations
- **Incident Response**: Error handling and exception management
- **Backup**: Data backup and recovery operations
- **Network Security**: Firewall, network, and TLS/SSL references
- **Vulnerability Management**: Security scanning and testing references

## Usage

```bash
/soc2-check
```

Scan the entire codebase for SOC2 compliance issues.

```bash
/soc2-check --path ./infrastructure
```

Scan a specific directory.

```bash
/soc2-check --severity critical,high
```

Only show critical and high severity issues.

## Options

- `--path <path>`: Specify directory or file to scan (default: current directory)
- `--severity <levels>`: Filter by severity levels (critical, high, medium, low)

## SOC2 Trust Services Criteria

### Security (Common Criteria)
- Access controls and authentication
- Encryption of data at rest and in transit
- Network and system monitoring
- Vulnerability management
- Incident response procedures

### Availability
- Backup and recovery procedures
- Business continuity planning
- Performance monitoring
- Disaster recovery testing

### Processing Integrity
- Change management processes
- Data quality validation
- Input validation and processing controls
- Output review and reconciliation

### Confidentiality
- Data classification and handling
- Privacy policies and procedures
- Access controls for sensitive data
- Encryption of confidential information

### Privacy
- Privacy notice and consent
- Data collection and use practices
- Data subject rights
- Data transfer and disclosure practices

## Examples

Scan entire project:
```bash
/soc2-check
```

Scan infrastructure code:
```bash
/soc2-check --path ./infrastructure
```

Focus on critical security issues:
```bash
/soc2-check --severity critical,high
```

## Output

The check produces a report grouped by SOC2 category:

- **Access Control**: Permission checks and role-based access
- **Encryption**: Cryptographic operations
- **Logging**: Logging operations
- **Change Management**: Deployment and versioning
- **Incident Response**: Error handling
- **Backup**: Backup and recovery operations
- **Network Security**: Network security references
- **Vulnerability Management**: Security scanning references

Each finding includes:
- File path and line number
- SOC2 category
- Severity level
- Description of the issue
- Recommendation for compliance

## Key SOC2 Requirements

### Access Control (CC6.1)
- Unique user identification
- Authentication mechanisms (MFA recommended)
- Role-based access control
- Principle of least privilege
- Access review and revocation
- Session management

### Encryption (CC6.6)
- **Data at Rest**: AES-256 or equivalent
- **Data in Transit**: TLS 1.2 or higher
- **Key Management**: Secure key generation, storage, rotation
- **Cryptographic Standards**: NIST-approved algorithms

### Logging and Monitoring (CC6.7, CC7.2)
- Comprehensive logging of security events
- Log retention (minimum 90 days, recommended 1 year)
- Log protection and integrity
- Real-time monitoring and alerting
- Centralized log management

### Change Management (CC7.3, CC8.1)
- Formal change management process
- Change approval and documentation
- Testing before production deployment
- Rollback procedures
- Configuration management

### Incident Response (CC7.8)
- Incident response plan
- Incident detection and response
- Incident notification procedures
- Post-incident review
- Root cause analysis

### Backup and Recovery (CC7.9, CC7.10)
- Regular backup schedules
- Backup testing and restoration
- Geographic redundancy
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)

### Network Security (CC6.2, CC6.3)
- Network segmentation
- Firewall rules and configurations
- Intrusion detection/prevention
- Network monitoring

### Vulnerability Management (CC8.4)
- Regular vulnerability scanning
- Penetration testing
- Patch management
- Threat intelligence
- Security awareness training

## Best Practices

1. **Implement RBAC**: Role-based access control with least privilege
2. **Encrypt Everything**: Encrypt data at rest and in transit
3. **Comprehensive Logging**: Log all security-relevant events
4. **Change Management**: Document and approve all changes
5. **Regular Backups**: Test backups regularly
6. **Network Security**: Use network segmentation and firewalls
7. **Vulnerability Management**: Regular scanning and patching
8. **Incident Response**: Have a tested incident response plan

## Common SOC2 Findings

- Lack of multi-factor authentication
- Unencrypted sensitive data
- Insufficient logging and monitoring
- No formal change management process
- Untested backup and recovery procedures
- Missing network security controls
- Lack of vulnerability scanning
- Incomplete incident response procedures

## Resources

- [AICPA Trust Services Criteria](https://www.aicpa.org/trust-services-criteria)
- [SOC2 Guide](https://www.drata.com/resources/guides/what-is-soc-2)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)
