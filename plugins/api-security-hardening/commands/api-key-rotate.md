---
description: API key rotation utility with key generation, validation, and secure storage
---

# /api-key-rotate

Generate, rotate, and manage API keys securely. Includes key generation utilities, validation middleware, rotation scheduling, and secure storage recommendations.

## What it does

- **Key generation**: Creates cryptographically secure API keys
- **Rotation scheduling**: Sets up automated key rotation schedules
- **Validation middleware**: Validates API keys in requests
- **Key versioning**: Manages multiple key versions for smooth rotation
- **Secure storage**: Provides secure storage recommendations and implementations
- **Audit logging**: Tracks key usage and rotation events

## Usage

```bash
/api-key-rotate
```

Interactive key rotation setup.

```bash
/api-key-rotate --generate
```

Generate a new API key.

```bash
/api-key-rotate --rotate-all
```

Rotate all existing API keys.

```bash
/api-key-rotate --validate
```

Validate API key implementation.

## Options

- `--generate`: Generate a new API key
- `--rotate-all`: Rotate all existing keys
- `--key-id <id>`: Rotate specific key by ID
- `--key-length <length>`: Key length in bytes (default: 32)
- `--prefix <prefix>`: Add identifiable prefix to keys
- `--framework <name>`: Target framework (express, fastify, nestjs, koa)
- `--schedule <cron>`: Set up rotation schedule (cron expression)
- `--output <path>`: Output directory for generated code
- `--validate`: Validate existing API key implementation

## Examples

Generate new API key:
```bash
/api-key-rotate --generate --prefix prod_
```

Rotate all keys:
```bash
/api-key-rotate --rotate-all
```

Set up monthly rotation:
```bash
/api-key-rotate --schedule "0 0 1 * *" --key-id production-key
```

Generate validation middleware:
```bash
/api-key-rotate --framework express --output ./src/middleware
```

## Security Considerations

- Use minimum 32-byte (256-bit) keys for sufficient entropy
- Add prefixes for easy identification without exposing key type
- Never log or expose API keys in error messages
- Store keys securely using environment variables or secret managers
- Implement key rotation every 90 days or less
- Use key versioning to support graceful rotation
- Revoke old keys immediately after rotation
- Implement rate limiting on API key endpoints
- Track and audit all API key usage
- Use separate keys for different environments (dev, staging, prod)
- Implement key scopes for granular permissions
