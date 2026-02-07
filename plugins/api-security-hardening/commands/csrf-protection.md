---
description: Implement CSRF protection with token generation, validation, and cookie security
---

# /csrf-protection

Generate and implement CSRF protection for your application. Includes token generation, validation middleware, and secure cookie configuration.

## What it does

- **Token generation**: Creates cryptographically secure CSRF tokens
- **Validation middleware**: Validates tokens on state-changing operations
- **Cookie security**: Configures SameSite, HttpOnly, Secure flags
- **Framework support**: Express, Fastify, NestJS, Koa, plain Node.js
- **Frontend integration**: Generates client-side code for token submission

## Usage

```bash
/csrf-protection
```

Interactive setup for CSRF protection.

```bash
/csrf-protection --framework express
```

Generate CSRF protection for Express.js.

```bash
/csrf-protection --strategy sync
```

Use synchronous token strategy.

## Options

- `--framework <name>`: Target framework (express, fastify, nestjs, koa, vanilla)
- `--strategy <type>`: Token strategy (sync, double-submit, encrypted)
- `--cookie-name <name>`: Custom cookie name (default: _csrf)
- `--header-name <name>`: Custom header name (default: x-csrf-token)
- `--ignore-methods <methods>`: Methods to ignore (default: GET, HEAD, OPTIONS)
- `--output <path>`: Output directory for generated files

## Examples

Generate Express CSRF middleware:
```bash
/csrf-protection --framework express
```

Generate with double-submit cookie pattern:
```bash
/csrf-protection --strategy double-submit --framework fastify
```

## Security Considerations

- Use SameSite=Strict or SameSite=Lax for cookies
- Always set HttpOnly flag on cookies
- Use Secure flag in production (HTTPS required)
- Regenerate tokens per session or per request
- Validate tokens on all state-changing operations (POST, PUT, DELETE, PATCH)
- Use cryptographically secure random token generation
