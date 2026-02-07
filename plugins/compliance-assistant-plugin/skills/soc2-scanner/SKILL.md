---
description: Automatically detect SOC2 compliance issues and security gaps
capabilities:
  - Access control analysis
  - Encryption verification
  - Logging and monitoring assessment
  - Change management review
  - Incident response evaluation
triggers:
  - User mentions SOC2, compliance, security controls, audit
  - Code implements authentication or authorization
  - Infrastructure or deployment code
  - Security-related configurations
---

# SOC2 Scanner Skill

Automatically detects SOC2 (Service Organization Control 2) compliance issues and security control gaps in your codebase.

## Activation Triggers

This skill activates when:

- User mentions SOC2, compliance, security controls, or audit
- Code implements authentication, authorization, or access control
- Infrastructure as code (Terraform, CloudFormation, etc.)
- CI/CD pipelines and deployment configurations
- Security-related configurations (SSL/TLS, firewalls)
- Logging and monitoring implementations

## What It Detects

### Access Control (CC6.1)
- Role-based access control implementation
- Authentication mechanisms
- Authorization checks
- Privilege escalation prevention
- Session management
- Multi-factor authentication

### Encryption (CC6.6)
- Data encryption at rest
- Data encryption in transit
- Key management practices
- Cryptographic standards
- TLS/SSL configuration

### Logging and Monitoring (CC6.7, CC7.2)
- Security event logging
- Audit trail implementation
- Log retention policies
- Monitoring and alerting
- Centralized log management

### Change Management (CC7.3, CC8.1)
- Deployment procedures
- Version control
- Change approval processes
- Configuration management
- Rollback procedures

### Incident Response (CC7.8)
- Error handling
- Exception management
- Incident detection
- Notification procedures
- Escalation processes

### Backup and Recovery (CC7.9, CC7.10)
- Data backup implementations
- Recovery procedures
- Redundancy configurations
- Disaster recovery planning
- RTO/RPO definitions

### Network Security (CC6.2, CC6.3)
- Firewall configurations
- Network segmentation
- Intrusion detection/prevention
- Network monitoring

### Vulnerability Management (CC8.4)
- Security scanning implementations
- Dependency management
- Patch management
- Penetration testing references

## SOC2 Trust Services Criteria

| Criteria | Key Requirements | Detection Method |
|----------|-----------------|------------------|
| Security | Access control, encryption, monitoring | Analyze auth, crypto, logging code |
| Availability | Backup, recovery, monitoring | Check backup implementations |
| Processing Integrity | Change management, data quality | Review deployment and validation |
| Confidentiality | Data classification, access controls | Assess data handling |
| Privacy | Data handling, consent, notices | Verify privacy practices |

## Analysis Approach

1. **Control Identification**: Identify implemented security controls
2. **Gap Analysis**: Compare against SOC2 requirements
3. **Risk Assessment**: Evaluate control effectiveness
4. **Documentation Review**: Check for policies and procedures
5. **Implementation Verification**: Validate control operation
6. **Testing Evidence**: Look for test coverage of controls

## Control Categories

### Automated Controls
- Automated access provisioning/deprovisioning
- Automated encryption
- Automated logging and alerting
- Automated backups
- Automated security scanning

### Manual Controls
- Security policy reviews
- Access recertification
- Incident response procedures
- Background checks
- Security awareness training

### Preventive Controls
- Access controls
- Encryption
- Network security
- Authentication

### Detective Controls
- Logging and monitoring
- Audit trails
- Intrusion detection
- Security scanning

### Corrective Controls
- Incident response
- Backup and recovery
- Patch management

## Risk Assessment

Each finding is categorized by severity and criteria:

- **Critical**: Missing encryption, no access controls (Security)
- **High**: Inadequate logging, unpatched vulnerabilities (Security)
- **Medium**: Incomplete change management (Processing Integrity)
- **Low**: Minor documentation gaps (any criteria)

## Recommendations Provided

For each detected issue, the skill provides:

- Specific SOC2 criteria reference
- Control requirement description
- Current implementation assessment
- Risk level and business impact
- Specific remediation steps
- Code examples for control implementation
- Evidence collection recommendations

## Best Practices Enforced

### Security
- Implement multi-factor authentication
- Use strong encryption (AES-256, TLS 1.2+)
- Comprehensive logging of security events
- Regular vulnerability scanning and patching
- Network security controls

### Availability
- Regular, tested backups
- Geographic redundancy
- Disaster recovery procedures
- Performance monitoring

### Processing Integrity
- Formal change management
- Data validation and quality checks
- Version control
- Configuration management

### Confidentiality
- Data classification
- Access controls on sensitive data
- Encryption of confidential data
- Privacy policies and procedures

### Privacy
- Data handling procedures
- Consent mechanisms
- Data subject rights
- Privacy notices

## Limitations

- Cannot assess control design effectiveness completely
- Requires evidence collection for audit readiness
- May produce false positives in development code
- Does not assess management governance
- Cannot verify physical security controls
- Requires manual review of policies and procedures

## Audit Readiness

The skill helps prepare for SOC2 audits by:

- Identifying control gaps before auditors
- Suggesting evidence to collect
- Highlighting areas requiring documentation
- Recommending testing procedures
- Providing implementation examples
- Tracking remediation progress
