# API Security Hardening Plugin

Comprehensive API security hardening plugin for Claude Code that provides CORS, CSRF, XSS protection, API key rotation, and JWT flow security.

## Description

This plugin helps you implement and maintain secure API configurations by:
- Generating secure CORS policies with origin whitelisting
- Implementing CSRF protection with token generation and validation
- Providing XSS prevention with input sanitization and Content Security Policy
- Validating and generating secure JWT implementations
- Managing API key generation, rotation, and validation

## Installation

```bash
# From local directory
claude plugin install ./plugins/api-security-hardening

# From marketplace (when published)
claude plugin install api-security-hardening
```

## Usage

### API Security Audit

Perform comprehensive security audit:

```bash
/api-security-audit
```

Audit specific directory:

```bash
/api-security-audit --path ./src/api
```

Focus on specific security area:

```bash
/api-security-audit --focus jwt
/api-security-audit --focus cors
/api-security-audit --focus xss
```

Filter by severity:

```bash
/api-security-audit --severity critical,high
```

### CORS Setup

Generate secure CORS configuration:

```bash
/cors-setup --framework express --origins "https://example.com,https://app.example.com"
```

With credentials support:

```bash
/cors-setup --framework express --origins "https://api.example.com" --credentials
```

Generate for different frameworks:

```bash
/cors-setup --framework fastify
/cors-setup --framework nestjs
/cors-setup --framework koa
```

### CSRF Protection

Implement CSRF protection:

```bash
/csrf-protection --framework express
```

With double-submit cookie pattern:

```bash
/csrf-protection --strategy double-submit --framework express
```

### XSS Prevention

Generate XSS prevention middleware:

```bash
/xss-prevention --framework express --sanitize-input
```

Generate strict CSP policy:

```bash
/xss-prevention --csp strict
```

With frontend integration:

```bash
/xss-prevention --frontend react --csp strict
/xss-prevention --frontend vue --sanitize-input
```

### JWT Validation

Validate JWT implementation:

```bash
/jwt-validate
```

Generate secure JWT implementation:

```bash
/jwt-validate --fix --framework express --algorithm RS256
```

With custom expiration:

```bash
/jwt-validate --fix --expiration 1h --refresh-expiration 30d
```

### API Key Rotation

Generate new API key:

```bash
/api-key-rotate --generate --prefix prod_
```

Validate API key implementation:

```bash
/api-key-rotate --validate
```

Generate API key middleware:

```bash
/api-key-rotate --generate-middleware --framework express
```

## Configuration

Create `.api-security.json` in your project root:

```json
{
  "cors": {
    "allowedOrigins": ["https://example.com"],
    "credentials": false,
    "maxAge": 86400
  },
  "csrf": {
    "cookieName": "_csrf",
    "headerName": "x-csrf-token",
    "strategy": "sync"
  },
  "jwt": {
    "algorithm": "RS256",
    "expiration": "15m",
    "refreshExpiration": "7d"
  },
  "apiKeys": {
    "keyLength": 32,
    "rotationDays": 90,
    "prefix": "sk"
  },
  "severity": "medium",
  "outputFormat": "text"
}
```

## Commands

| Command | Description |
|---------|-------------|
| `/api-security-audit` | Comprehensive API security audit |
| `/cors-setup` | Generate secure CORS configuration |
| `/csrf-protection` | Implement CSRF protection |
| `/xss-prevention` | Implement XSS prevention measures |
| `/jwt-validate` | Validate JWT implementation |
| `/api-key-rotate` | API key generation and rotation |

## Agents

Specialized security agents that activate automatically:

- **cors-security-auditor**: CORS configuration and origin whitelist validation
- **csrf-protection-specialist**: CSRF token generation and validation
- **xss-prevention-expert**: XSS prevention and Content Security Policy
- **jwt-security-analyst**: JWT implementation security
- **api-key-security-manager**: API key generation and rotation

## Skills

Autonomous security skills:

- **cors-analyzer**: Analyzes CORS configurations for security issues
- **jwt-validator**: Validates JWT implementations and token storage
- **xss-detector**: Detects XSS vulnerabilities and insecure patterns

## Security Considerations

### CORS
- Never use wildcard origin (`*`) with credentials enabled
- Always whitelist specific origins in production
- Use HTTPS origins only in production environments
- Limit exposed headers to only what's necessary

### CSRF
- Use SameSite=Strict or SameSite=Lax for cookies
- Always set HttpOnly flag on cookies
- Use Secure flag in production (HTTPS required)
- Regenerate tokens per session or per request
- Validate tokens on all state-changing operations

### XSS
- Always sanitize input on the server-side
- Use context-appropriate output encoding (HTML, JavaScript, CSS, URL)
- Implement Content-Security-Policy with strict mode
- Set X-Content-Type-Options: nosniff
- Set X-Frame-Options: DENY or SAMEORIGIN

### JWT
- Use asymmetric algorithms (RS256, ES256, PS256) for production
- Never use the "none" algorithm
- Use strong secrets (minimum 256 bits for symmetric keys)
- Validate all token claims (iss, aud, exp, nbf)
- Store access tokens in HttpOnly cookies
- Use short expiration times (5-15 minutes)
- Implement token refresh with rotation

### API Keys
- Use minimum 32-byte (256-bit) keys
- Store keys in environment variables or secret managers
- Implement key rotation every 90 days or less
- Use key versioning for graceful rotation
- Revoke old keys immediately after rotation
- Implement rate limiting per API key

## Troubleshooting

### Plugin not loading

1. Verify installation: `claude plugin list`
2. Check for errors: `claude --debug`
3. Validate manifest: `claude plugin validate`

### Scripts not executing

1. Ensure Node.js is installed (v18+)
2. Check `${CLAUDE_PLUGIN_ROOT}` path in hooks
3. Verify script permissions

## Output Format

Example audit output:

```
═════════════════════════════════════════════
    API SECURITY AUDIT REPORT
═════════════════════════════════════════════

Path: ./src
Total findings: 5
  Critical: 2
  High: 2
  Medium: 1

─── CORS ───

🔴 CRITICAL: CORS with Wildcard and Credentials
   File: ./src/server.js:45
   Code: app.use(cors({ origin: '*', credentials: true }))
   Fix: Cannot use wildcard origin with credentials. Specify exact origins.

─── JWT ───

🔴 CRITICAL: JWT in URL
   File: ./src/auth.js:23
   Code: const token = req.query.token
   Fix: Pass JWT in Authorization header instead of URL

═════════════════════════════════════════════
```

## License

MIT

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
