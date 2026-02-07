---
description: Implement XSS prevention with input sanitization, output encoding, and CSP headers
---

# /xss-prevention

Generate and implement XSS (Cross-Site Scripting) prevention measures for your application. Includes input sanitization, output encoding, Content Security Policy headers, and secure response handling.

## What it does

- **Input sanitization**: Validates and sanitizes user input against XSS patterns
- **Output encoding**: Context-aware encoding for HTML, JavaScript, CSS, URLs
- **CSP headers**: Generates secure Content-Security-Policy configurations
- **Response headers**: Sets X-Content-Type-Options, X-Frame-Options
- **Framework integration**: Middleware for Express, Fastify, NestJS, Koa
- **Frontend utilities**: Safe rendering functions for React, Vue, Angular

## Usage

```bash
/xss-prevention
```

Interactive setup for XSS prevention.

```bash
/xss-prevention --framework express
```

Generate XSS prevention middleware for Express.

```bash
/xss-prevention --csp strict
```

Generate strict CSP policy.

## Options

- `--framework <name>`: Target framework (express, fastify, nestjs, koa, vanilla)
- `--csp <level>`: CSP strictness (strict, moderate, permissive)
- `sanitize-input`: Enable input sanitization middleware
- `encode-output`: Enable output encoding utilities
- `frontend <framework>`: Frontend framework (react, vue, angular, vanilla)
- `--output <path>`: Output directory for generated files

## Examples

Generate Express XSS prevention:
```bash
/xss-prevention --framework express --sanitize-input
```

Generate strict CSP for React app:
```bash
/xss-prevention --csp strict --frontend react
```

Full XSS prevention suite:
```bash
/xss-prevention --framework nestjs --sanitize-input --encode-output --csp strict
```

## Security Considerations

- Always sanitize input on the server-side (never trust client-side only)
- Use context-appropriate output encoding (HTML, JavaScript, CSS, URL)
- Implement Content-Security-Policy with strict mode
- Set X-Content-Type-Options: nosniff
- Set X-Frame-Options: DENY or SAMEORIGIN
- Use textContent instead of innerHTML when possible
- Sanitize Markdown and rich text content before rendering
- Validate and whitelist HTML tags and attributes
