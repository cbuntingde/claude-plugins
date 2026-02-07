---
description: Check for GDPR (General Data Protection Regulation) compliance violations
---

# /gdpr-check

Scan your codebase for GDPR compliance issues and violations of the General Data Protection Regulation (EU 2016/679).

## What it checks

- **Consent Management**: Cookie and tracking consent mechanisms
- **Data Retention**: Deletion and expiration policies
- **Data Portability**: Export and download functionality
- **Privacy Documentation**: Privacy policy and terms references
- **Personal Data Processing**: Lawful basis for processing

## Usage

```bash
/gdpr-check
```

Scan the entire codebase for GDPR compliance issues.

```bash
/gdpr-check --path ./frontend
```

Scan a specific directory.

```bash
/gdpr-check --severity critical,high
```

Only show critical and high severity issues.

## Options

- `--path <path>`: Specify directory or file to scan (default: current directory)
- `--severity <levels>`: Filter by severity levels (critical, high, medium, low)

## GDPR Articles Covered

### Article 6: Lawful Basis for Processing
Scans for personal data processing operations and ensures they reference a lawful basis.

### Article 7: Conditions for Consent
Identifies consent mechanisms for cookies and tracking.

### Article 15: Right of Access
Checks for data export and portability features.

### Article 17: Right to Erasure (Right to be Forgotten)
Looks for data deletion and removal capabilities.

### Article 20: Right to Data Portability
Identifies data export and transfer functionality.

### Article 25: Data Protection by Design and Default
Checks for privacy-conscious design patterns.

### Article 33: Notification of Data Breach
Identifies logging and monitoring that could support breach notification.

## Examples

Scan entire project:
```bash
/gdpr-check
```

Scan only frontend for consent mechanisms:
```bash
/gdpr-check --path ./frontend/src
```

Focus on high-severity issues:
```bash
/gdpr-check --severity high,critical
```

## Output

The check produces a report grouped by GDPR category:

- **Consent**: Cookie and tracking consent implementations
- **Retention**: Data deletion and retention policies
- **Portability**: Data export functionality
- **Documentation**: Privacy policy references
- **Processing**: Personal data processing operations

Each finding includes:
- File path and line number
- GDPR category
- Description of the issue
- Recommendation for compliance

## Key GDPR Requirements

### Lawful Basis for Processing (Article 6)
- Consent
- Contract performance
- Legal obligation
- Vital interests
- Public task
- Legitimate interests

### Data Subject Rights
- Right to be informed (Articles 13-14)
- Right of access (Article 15)
- Right to rectification (Article 16)
- Right to erasure (Article 17)
- Right to restrict processing (Article 18)
- Right to data portability (Article 20)
- Right to object (Article 21)

### Data Protection by Design and Default (Article 25)
- Privacy impact assessments
- Pseudonymization and encryption
- Data minimization
- Privacy by default settings

## Best Practices

1. **Maintain Records of Processing Activities**: Document all personal data processing
2. **Implement Consent Management**: Granular, revocable consent for cookies/tracking
3. **Data Minimization**: Collect only necessary data
4. **User Rights**: Implement mechanisms for access, erasure, and portability requests
5. **Privacy Policies**: Keep privacy policies up-to-date and accessible
6. **Data Breach Response**: Establish procedures for breach detection and notification
7. **DPIAs**: Conduct Data Protection Impact Assessments for high-risk processing

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [UK ICO Guide to GDPR](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [European Data Protection Board](https://edpb.europa.eu/)
