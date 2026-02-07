---
description: Automatically detect GDPR violations and compliance issues in code
capabilities:
  - Consent mechanism detection
  - Data retention analysis
  - Data portability verification
  - Privacy policy reference checking
  - Personal data processing assessment
triggers:
  - User mentions GDPR, consent, cookies, privacy
  - Code handles user data or personal information
  - Frontend code with cookie/tracking functionality
  - Backend code with user data storage/processing
---

# GDPR Scanner Skill

Automatically detects GDPR (General Data Protection Regulation) compliance issues and violations in your codebase.

## Activation Triggers

This skill activates when:

- User mentions GDPR, consent, cookies, privacy, or data protection
- Code contains user data handling or personal information processing
- Frontend code implements cookie or tracking mechanisms
- Backend code stores, processes, or transmits user data
- Files related to authentication, profiles, or user settings are modified

## What It Detects

### Consent Management (Article 7)
- Cookie consent banners
- Tracking consent mechanisms
- Permission requests for data processing
- Granular consent options
- Consent withdrawal functionality

### Data Retention (Article 17)
- Data deletion functions
- Data expiration policies
- User account deletion
- Data cleanup jobs
- Retention period configurations

### Data Portability (Article 20)
- Data export functionality
- Data download features
- Data format standards (JSON, XML, CSV)
- User data retrieval endpoints

### Privacy Documentation (Articles 13-14)
- Privacy policy references
- Terms of service links
- Data collection notices
- Cookie policy references

### Personal Data Processing (Article 6)
- User data storage
- Profile management
- Data processing operations
- Lawful basis references

## GDPR Requirements Checked

| Article | Requirement | Detection Method |
|---------|-------------|------------------|
| Article 6 | Lawful basis for processing | Scan for personal data processing with basis documentation |
| Article 7 | Conditions for consent | Detect consent mechanisms and granularity |
| Article 15 | Right of access | Identify data export/retrieval functions |
| Article 16 | Right to rectification | Find profile update functions |
| Article 17 | Right to erasure | Locate data deletion functions |
| Article 20 | Right to portability | Detect data export functionality |
| Article 25 | Data protection by design | Analyze privacy-conscious patterns |

## Analysis Approach

1. **Code Pattern Matching**: Use regex patterns to identify GDPR-related code
2. **Data Flow Analysis**: Track personal data through the application
3. **Consent Mechanism Review**: Evaluate consent implementation quality
4. **Documentation Verification**: Check for privacy policy references
5. **Compliance Gap Analysis**: Compare findings against GDPR requirements

## Recommendations Provided

For each detected issue, the skill provides:

- Specific GDPR article reference
- Description of the requirement
- Current implementation assessment
- Recommended remediation steps
- Code examples where applicable
- Links to official GDPR guidance

## Best Practices Enforced

- Explicit consent for cookies and tracking
- Data minimization in collection
- Clear privacy notices
- User-friendly consent withdrawal
- Data export in machine-readable format
- Right to erasure implementation
- Privacy by design and default

## Limitations

- Cannot assess legal adequacy of consent wording (consult legal)
- May produce false positives in test data
- Cannot verify actual data deletion implementation
- Requires manual verification of privacy policy completeness
