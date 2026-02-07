---
description: Automatically validate configuration files for security misconfigurations, exposed secrets, and security best practices
invocation:
  triggers:
    - "validate.*config"
    - "check.*settings"
    - "security.*config"
    - "environment.*variables"
  priority: high
---

# Configuration Validator Skill

Autonomously validates configuration files, environment variables, and infrastructure-as-code for security misconfigurations, exposed secrets, and compliance with security best practices.

## When this skill activates

- Configuration files are modified (*.json, *.yaml, *.toml, .env*, ini, conf)
- Infrastructure-as-code files are changed (Terraform, CloudFormation, Helm)
- Kubernetes manifests are updated
- Docker files or compose files are modified
- User mentions configuration, settings, or environment variables
- Deployment configurations are being prepared
- CI/CD pipeline configurations are changed

## What it validates

### Application configuration
- **Security headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Cookie security**: Secure, HttpOnly, SameSite attributes
- **CORS policies**: Overly permissive origins
- **HTTPS enforcement**: TLS/SSL configuration
- **Authentication settings**: Session timeouts, password policies
- **Rate limiting**: API rate limits and throttling
- **Debug mode**: Disabled in production
- **Error handling**: Generic error messages (no stack traces)
- **Logging**: Security event logging, audit trails

### Infrastructure configuration
- **Cloud security groups**: Overly permissive firewall rules (0.0.0.0/0)
- **IAM policies**: Over-privileged roles and users
- **Storage security**: Public S3 buckets, exposed databases
- **Container security**: Running as root, exposed ports
- **Kubernetes**: RBAC, network policies, pod security
- **TLS certificates**: Valid certificates, secure protocols
- **Secrets management**: No secrets in config files

### Environment variables
- **Hardcoded secrets**: API keys, passwords, tokens
- **Exposed credentials**: Database URLs, service credentials
- **Sensitive data**: Private keys, certificates
- **Configuration drift**: Dev/staging/prod inconsistencies

### CI/CD configuration
- **Secrets in workflows**: Exposed secrets in GitHub Actions, GitLab CI
- **Insecure scripts**: Unvalidated inputs, dangerous commands
- **Artifact security**: Unsigned artifacts, unverified sources
- **Access control**: Overly permissive pipeline triggers

## Validation categories

```markdown
## 🔧 Configuration Security Validation

### 🔴 Critical Misconfigurations
[Issues that expose the application to immediate attacks]

### 🟡 High Priority Issues
[Security weaknesses that should be addressed soon]

### 🔵 Medium Priority Issues
[Configuration improvements and hardening]

### ⚪ Low Priority / Best Practices
[Optional improvements and optimizations]

### ✓ Compliant Configurations
[Security best practices that are properly configured]
```

## Example validation

**Input**: User modifies config/production.json or .env file

**Output**:
```markdown
## 🔧 Configuration Security Validation

File: config/production.json

### 🔴 Critical Misconfigurations

**1. Missing HTTPS Enforcement**
- Location: `config.server.forceHttps` (not set)
- Impact: Application accessible over HTTP, vulnerable to MITM attacks
- Fix:
  ```json
  {
    "server": {
      "forceHttps": true,
      "hsts": {
        "enabled": true,
        "maxAge": 31536000,
        "includeSubDomains": true
      }
    }
  }
  ```

**2. Exposed Database Password**
- Location: `database.password`
- Issue: Hardcoded password in configuration file
- Impact: Credential exposure if file is leaked
- Fix: Use environment variable or secret manager
  ```json
  {
    "database": {
      "password": "${DB_PASSWORD}" // Use environment variable
    }
  }
  ```

### 🟡 High Priority Issues

**3. Overly Permissive CORS**
- Location: `cors.origin: "*"`
- Issue: Allows requests from any origin
- Impact: CSRF attacks, data theft
- Fix:
  ```json
  {
    "cors": {
      "origin": ["https://example.com", "https://app.example.com"]
    }
  }
  ```

**4. Debug Mode Enabled**
- Location: `debug: true`
- Issue: Debug mode exposed in production
- Impact: Information disclosure, stack traces
- Fix: Set `debug: false`

**5. Missing Rate Limiting**
- Location: `api.rateLimit` (not configured)
- Issue: No rate limiting on API endpoints
- Impact: DoS attacks, brute force attacks
- Fix:
  ```json
  {
    "api": {
      "rateLimit": {
        "windowMs": 900000,
        "max": 100
      }
    }
  }
  ```

### 🔵 Medium Priority Issues

**6. Missing Security Headers**
- Issue: Content-Security-Policy header not set
- Recommendation: Implement CSP to prevent XSS
  ```json
  {
    "headers": {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'"
    }
  }
  ```

**7. Weak Session Configuration**
- Issue: Session cookies missing Secure and HttpOnly flags
- Fix:
  ```json
  {
    "session": {
      "cookie": {
        "secure": true,
        "httpOnly": true,
        "sameSite": "strict",
        "maxAge": 3600000
      }
    }
  }
  ```

### ✓ Compliant Configurations

✓ TLS 1.2+ required
✓ Strong cipher suites configured
✓ Server tokens hidden
✓ X-Frame-Options set to DENY

### Recommendations

**Immediate Actions:**
1. Enable HTTPS enforcement
2. Move database password to environment variable
3. Restrict CORS origins to whitelisted domains
4. Disable debug mode

**High Priority:**
5. Implement rate limiting
6. Add security headers (CSP, HSTS, X-Frame-Options)
7. Harden session cookie configuration

**Medium Priority:**
8. Implement proper logging and monitoring
9. Add request validation
10. Review and restrict API access controls
```

## Supported file types

### Application configs
- JSON (*.json)
- YAML (*.yaml, *.yml)
- TOML (*.toml)
- INI (*.ini, *.cfg)
- XML (*.xml)
- Properties (*.properties)
- Environment files (.env, .env.*, .envrc)
- Config files (*.conf, *.config)

### Infrastructure as Code
- Terraform (*.tf)
- CloudFormation (*.yaml, *.json)
- AWS CDK (*.ts, *.js, *.py)
- Pulumi (*.ts, *.js, *.py, *.go)
- Kubernetes (*.yaml)
- Docker Compose (docker-compose.yml)
- Helm Charts (values.yaml, Chart.yaml)

### CI/CD configs
- GitHub Actions (.github/workflows/*.yml)
- GitLab CI (.gitlab-ci.yml)
- Jenkins (Jenkinsfile)
- Azure Pipelines (azure-pipelines.yml)
- CircleCI (.circleci/config.yml)

## Detection patterns

### Hardcoded secrets
```bash
# Patterns that trigger alerts:
- /api[_-]?key\s*[=:]\s*['"]([^'"]{20,})['"]/
- /password\s*[=:]\s*['"]([^'"]{8,})['"]/
- /secret[_-]?key\s*[=:]\s*['"]([^'"]{20,})['"]/
- /token\s*[=:]\s*['"]([^'"]{30,})['"]/
- /private[_-]?key\s*[=:]\s*['"]([^'"]{50,})['"]/
- /(AKIA[0-9A-Z]{16})/  # AWS access key
- /(ghp_[a-zA-Z0-9]{36})/  # GitHub personal access token
- /(sk-[a-zA-Z0-9]{48})/  # Stripe secret key
```

### Insecure configurations
```bash
# Patterns that indicate misconfigurations:
- /debug\s*[=:]\s*true/
- /cors\.origin\s*[=:]\s*['"]\*['"]/
- /ssl\s*[=:]\s*false/
- /https\s*[=:]\s*false/
- /auth\s*[=:]\s*false/
- /0\.0\.0\.0\/0/  # Open to the world
```

## Custom validation rules

Create `.config-security-rules.json`:

```json
{
  "severity": "high",
  "rules": {
    "requireHttps": true,
    "forbiddenOrigins": ["*"],
    "requireSecurityHeaders": ["CSP", "HSTS", "X-Frame-Options"],
    "maxSessionDuration": "8h",
    "forbiddenEnvVars": ["PASSWORD", "SECRET", "KEY"],
    "requiredEnvVars": ["DB_HOST", "DB_NAME"],
    "allowedCidrBlocks": ["10.0.0.0/8", "192.168.0.0/16"]
  },
  "exemptions": {
    "config/development.json": "debug mode allowed for local dev",
    "docker-compose.dev.yml": "local development override"
  }
}
```

## Integration

This skill autonomously activates when:
- Configuration files are modified
- Infrastructure-as-code is changed
- User mentions configuration security
- Deployment validation is required
- Environment variables are being set

Works seamlessly with:
- `/security-scan` command
- Security Auditor agent
- Security hooks on configuration changes
- Pre-deployment validation
- CI/CD security gates

Ensures security by validating configuration before deployment.
