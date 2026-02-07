---
description: Generate secure CORS configuration for Express, Fastify, NestJS, or plain Node.js servers
---

# /cors-setup

Generate secure CORS configuration tailored to your application's needs. The command guides you through creating a secure cross-origin resource sharing policy.

## What it does

- **Guides you through origin configuration**: Whitelist specific origins instead of allowing all
- **Sets secure headers**: Configures Access-Control-Allow-Origin, Credentials, Methods, Headers
- **Prevents common misconfigurations**: Avoids overly permissive policies that expose your API
- **Supports multiple frameworks**: Express, Fastify, NestJS, Koa, plain Node.js

## Usage

```bash
/cors-setup
```

Interactive setup for your application.

```bash
/cors-setup --framework express
```

Generate configuration for Express.js.

```bash
/cors-setup --origins "https://example.com,https://app.example.com"
```

Specify allowed origins.

## Options

- `--framework <name>`: Target framework (express, fastify, nestjs, koa, vanilla)
- `--origins <urls>`: Comma-separated list of allowed origins
- `--credentials`: Enable credentials (cookies, authorization headers)
- `--max-age <seconds>`: Preflight cache duration (default: 86400)
- `--exposed-headers <headers>`: Comma-separated headers to expose
- `--output <path>`: Output file path

## Examples

Generate Express CORS config:
```bash
/cors-setup --framework express --origins "https://myapp.com"
```

Generate with credentials support:
```bash
/cors-setup --framework fastify --credentials --origins "https://api.example.com"
```

## Security Considerations

- Never use `origin: '*'` with `credentials: true`
- Always whitelist specific origins in production
- Use HTTPS origins in production environments
- Limit exposed headers to only what's necessary
- Set appropriate max-age to reduce preflight requests
