---
description: Validate JWT implementation for secure token generation, verification, and refresh flows
---

# /jwt-validate

Analyze and validate your JWT (JSON Web Token) implementation for security vulnerabilities and best practices. Generates secure JWT middleware and token management code.

## What it validates

- **Algorithm security**: Checks for weak algorithms (none, HS256 with weak secrets)
- **Token claims**: Validates iss, sub, aud, exp, nbf, iat claims
- **Secret strength**: Validates secret key length and entropy
- **Token leakage**: Detects tokens in URLs, logs, error messages
- **Refresh flow**: Validates secure token refresh implementation
- **Storage security**: Checks secure token storage (HttpOnly cookies vs localStorage)

## Usage

```bash
/jwt-validate
```

Validate JWT implementation in current directory.

```bash
/jwt-validate --path ./src/auth
```

Validate specific directory.

```bash
/jwt-validate --fix
```

Generate secure JWT implementation.

## Options

- `--path <path>`: Directory to validate (default: current directory)
- `--fix`: Generate secure JWT implementation code
- `--algorithm <alg>`: Recommended algorithm (RS256, ES256, PS256)
- `--expiration <time>`: Token expiration time (default: 15m)
- `--refresh-expiration <time>`: Refresh token expiration (default: 7d)
- `--framework <name>`: Target framework (express, fastify, nestjs, koa)
- `--output <path>`: Output directory for generated code

## Examples

Validate JWT implementation:
```bash
/jwt-validate
```

Generate secure Express JWT middleware:
```bash
/jwt-validate --fix --framework express --algorithm RS256
```

Generate with RS256 and custom expiration:
```bash
/jwt-validate --fix --algorithm RS256 --expiration 1h --refresh-expiration 30d
```

## Security Considerations

- Use asymmetric algorithms (RS256, ES256, PS256) for better security
- Never use the "none" algorithm
- Use strong secrets (minimum 256 bits for symmetric keys)
- Validate all token claims (iss, aud, exp, nbf)
- Implement secure token refresh flow with refresh tokens
- Store access tokens in memory or HttpOnly cookies
- Store refresh tokens in HttpOnly, Secure, SameSite cookies
- Implement token revocation/blacklist for logout
- Don't include sensitive data in JWT payload
- Use short expiration times for access tokens (5-15 minutes)
- Implement rotation for refresh tokens
