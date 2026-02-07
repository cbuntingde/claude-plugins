---
description: Autonomous JWT security validation and secure implementation guidance
capabilities: ["jwt-algorithm-check", "claims-validation", "token-storage-check", "refresh-flow-validation"]
---

# JWT Validator

Autonomous skill for validating JWT (JSON Web Token) implementations and providing secure token management guidance.

## Capabilities

### JWT Algorithm Check
- Detects weak algorithms (none, HS256 with short secrets)
- Validates algorithm choice for use case
- Checks for algorithm confusion vulnerabilities
- Recommends asymmetric algorithms (RS256, ES256)

### Claims Validation
- Validates required claims (iss, sub, aud, exp, nbf, iat)
- Checks claim format and structure
- Validates expiration times (access vs refresh tokens)
- Ensures proper issuer and audience validation

### Token Storage Check
- Validates token storage method (cookies vs localStorage)
- Detects token leakage in URLs or query parameters
- Checks for HttpOnly and Secure cookie flags
- Recommends secure storage patterns

### Refresh Flow Validation
- Analyzes refresh token implementation
- Validates refresh token rotation
- Checks for token revocation mechanisms
- Ensures secure token transmission

## Activation Triggers

This skill automatically activates when:
- User mentions "jwt", "json web token", "token auth"
- JWT-related files are modified (jwt.js, token.js, auth.js)
- Token generation or validation code is detected
- Authentication middleware is created/modified
- Libraries like jsonwebtoken, jose are imported

## Analysis Output

When activated, the skill provides:

1. **Security Analysis**
   - Algorithm strength assessment
   - Secret key validation
   - Claims structure review
   - Storage security evaluation

2. **Vulnerability Detection**
   - Weak algorithm usage
   - Missing claim validation
   - Insecure token storage
   - Leaked tokens in code

3. **Recommendations**
   - Secure algorithm selection
   - Proper claims implementation
   - Secure storage patterns
   - Refresh flow best practices

## Security Checks

The skill validates:
- No "none" algorithm usage
- Minimum 256-bit secrets for symmetric algorithms
- Asymmetric algorithms recommended for production
- All required claims validated (iss, aud, exp)
- Short expiration for access tokens (5-15 minutes)
- HttpOnly, Secure, SameSite cookies for storage
- Token not exposed in URLs or error messages
