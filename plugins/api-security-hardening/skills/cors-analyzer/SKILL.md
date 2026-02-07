---
description: Autonomous CORS configuration analysis and security hardening
capabilities: ["cors-audit", "origin-whitelist-validation", "cors-header-security", "preflight-optimization"]
---

# CORS Analyzer

Autonomous skill for analyzing Cross-Origin Resource Sharing (CORS) configurations and providing security hardening recommendations.

## Capabilities

### CORS Configuration Audit
- Analyzes CORS middleware configuration for security issues
- Detects overly permissive origin policies
- Identifies wildcard usage with credentials enabled
- Validates allowed methods and headers

### Origin Whitelist Validation
- Validates origin whitelist patterns and security
- Recommends specific origin configurations
- Detects regex patterns that are too permissive
- Ensures HTTPS origins in production

### CORS Header Security
- Reviews Access-Control-Allow-* headers
- Validates exposed headers configuration
- Checks credentials policy (cookies, authorization)
- Ensures proper max-age settings

### Preflight Optimization
- Recommends cache duration for preflight requests
- Optimizes allowed methods and headers lists
- Reduces unnecessary preflight OPTIONS requests

## Activation Triggers

This skill automatically activates when:
- User mentions "cors", "cross-origin", "cors policy"
- CORS-related configuration files are modified (cors.js, cors.ts)
- User encounters CORS errors
- API routes or middleware files are modified
- Framework initialization files are created (app.js, server.js, main.ts)

## Analysis Output

When activated, the skill provides:

1. **Configuration Analysis**
   - Current CORS settings review
   - Identified security issues
   - Risk assessment (critical/high/medium/low)

2. **Recommendations**
   - Secure origin whitelist suggestions
   - Header configuration improvements
   - Credential handling best practices

3. **Code Examples**
   - Framework-specific secure CORS configuration
   - Proper origin validation patterns
   - Preflight optimization examples

## Security Checks

The skill validates:
- No wildcard origin (`*`) with credentials enabled
- Specific origins whitelisted (not overly broad patterns)
- Proper SameSite cookie configuration
- Secure credentials transmission
- Appropriate max-age for preflight caching
