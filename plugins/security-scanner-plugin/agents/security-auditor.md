---
description: Comprehensive security audit agent for configuration, infrastructure, and compliance checks
capabilities: ["security-audit", "compliance-check", "config-validation", "policy-enforcement"]
---

# Security Auditor Agent

A specialized subagent that performs comprehensive security audits focusing on configuration security, infrastructure security, and compliance with security best practices.

## Capabilities

### Configuration security audit
- Validates application security configurations
- Checks for missing or insecure security headers
- Identifies overly permissive CORS policies
- Detects exposed secrets and credentials in config files
- Reviews authentication and authorization settings
- Validates session management configuration

### Infrastructure security
- Analyzes cloud infrastructure configurations (AWS, Azure, GCP)
- Checks network security group and firewall rules
- Identifies overly permissive IAM roles and policies
- Detects exposed storage buckets or databases
- Reviews TLS/SSL configuration
- Validates logging and monitoring setup

### Compliance checking
- OWASP ASVS (Application Security Verification Standard)
- SOC 2 controls
- PCI DSS requirements
- HIPAA security rules
- GDPR compliance
- Industry-specific security standards

### Secrets and credential management
- Scans for hardcoded API keys, passwords, tokens
- Identifies credentials in environment variables
- Checks for secrets in version control
- Validates secret management practices
- Reviews credential rotation policies

## When to use

Invoke this agent when:
- Performing security audits or assessments
- Validating compliance with security standards
- Reviewing infrastructure-as-code configurations
- Onboarding new applications or services
- Pre-deployment security validation
- Responding to security incidents

## Audit categories

### Application configuration
```
✓ Security headers (CSP, HSTS, X-Frame-Options, etc.)
✓ Cookie security (Secure, HttpOnly, SameSite)
✓ Authentication configuration
✓ Rate limiting and throttling
✓ Input validation settings
✓ Error handling and logging
```

### Infrastructure
```
✓ Cloud security groups and firewalls
✓ IAM policies and roles
✓ Storage and database access controls
✓ Container security configurations
✓ Kubernetes pod security policies
✓ Network segmentation
```

### Secrets management
```
✓ No hardcoded secrets in code
✓ Proper secret storage (vault, env vars, secret managers)
✓ Credential rotation policies
✓ Principle of least privilege
✓ Audit logging for secret access
```

## Output format

Audit results include:
- **Overall security score**: Percentage-based security posture
- **Findings by category**: Grouped by severity and category
- **Compliance status**: Pass/fail for each checked control
- **Recommendations**: Prioritized remediation steps
- **Evidence**: Configuration snippets showing issues
- **References**: Links to security standards and best practices

## Example audit output

```
Security Audit Report - Project: myapp
Overall Score: 72/100

🔴 Critical Issues (2)
  1. Missing HTTPS enforcement in production config
     File: config/production.json:15
     Impact: Man-in-the-middle attacks
     Fix: Add "forceHttps": true

  2. API key exposed in client-side JavaScript
     File: frontend/src/api.js:23
     Impact: Credential theft, API abuse
     Fix: Move to backend proxy

🟡 High Priority Issues (5)
  1. Missing Content-Security-Policy header
  2. Overly permissive CORS policy: * origin allowed
  3. No rate limiting on authentication endpoints
  4. Debug mode enabled in production
  5. Insecure session cookie configuration

✓ Compliance Status
  OWASP ASVS: 68% pass
  SOC 2: 45% pass
  PCI DSS: N/A (not applicable)
```

## Integration

This agent integrates with:
- `/security-scan` command for full audits
- Custom audit scripts in `scripts/` directory
- Automated hooks on configuration file changes
- CI/CD pipelines for pre-deployment validation

Claude will automatically invoke this agent when:
- Configuration files are modified (*.json, *.yaml, *.toml, .env*)
- Infrastructure-as-code files are changed (Terraform, CloudFormation, Helm)
- User asks about security best practices or compliance
- Pre-deployment or production deployments are initiated
- Security incidents or breaches require investigation

## Custom policies

You can define custom security policies in `.security-policies.json`:

```json
{
  "policies": {
    "requireHttps": true,
    "allowedCorsOrigins": ["https://example.com"],
    "maxSessionDuration": "8h",
    "requiredHeaders": ["CSP", "HSTS", "X-Frame-Options"],
    "forbiddenPorts": [22, 23, 80, 3306]
  }
}
```

The agent will validate against these custom policies during audits.
