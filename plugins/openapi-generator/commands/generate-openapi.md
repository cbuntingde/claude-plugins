---
description: Generate OpenAPI/Swagger specification from code
usage: |
  /generate-openapi [options]
examples:
  - "/generate-openapi --framework express --output api-spec.json"
  - "/generate-openapi --framework fastapi --path ./src --output openapi.yaml"
  - "/generate-openapi --framework spring-boot --output swagger.json"
  - "/generate-openapi --auto-detect"
---

# Generate OpenAPI/Swagger Specification

Automatically analyze your codebase and generate OpenAPI 3.0/Swagger 2.0 specifications from your API implementations.

## Features

- **Multi-framework support**: Express.js, FastAPI, Spring Boot, Flask, Django REST Framework, NestJS, and more
- **Auto-detection**: Automatically detect the framework and API endpoints
- **Interactive**: Guided workflow to specify output format and scope
- **Comprehensive specs**: Generate paths, components, schemas, security schemes, and examples

## Options

- `--framework <name>`: Specify framework (express, fastapi, spring-boot, flask, django, nestjs, etc.)
- `--path <directory>`: Specify directory to analyze (default: current directory)
- `--output <file>`: Output file path (default: openapi.json)
- `--format <format>`: Output format: json or yaml (default: json)
- `--version <version>`: OpenAPI version: 3.0 or 2.0 (default: 3.0)
- `--auto-detect`: Automatically detect framework and endpoints
- `--include-tags`: Include operation tags for grouping
- `--include-examples`: Include request/response examples

## Interactive Mode

Run without arguments to enter interactive mode and configure options step-by-step.

## Examples

**Generate from Express.js app:**
```bash
/generate-openapi --framework express --output api-spec.json
```

**Auto-detect framework and generate YAML:**
```bash
/generate-openapi --auto-detect --format yaml --output openapi.yaml
```

**Generate for FastAPI with examples:**
```bash
/generate-openapi --framework fastapi --include-examples --output spec.json
```

**Generate for specific directory:**
```bash
/generate-openapi --path ./src/api --framework nestjs --output api.json
```

## Supported Frameworks

- **Node.js**: Express.js, Fastify, NestJS, Koa, Hapi
- **Python**: FastAPI, Flask, Django REST Framework, Tornado
- **Java**: Spring Boot, JAX-RS (Jersey)
- **Go**: Gin, Echo, Fiber
- **C#**: ASP.NET Core Web API
- **Ruby**: Rails API, Grape
- **PHP**: Laravel, Symfony

## Output Formats

The generated specification includes:
- API metadata (title, version, description)
- Servers and base URLs
- Paths with operations (GET, POST, PUT, DELETE, etc.)
- Parameters (path, query, header, cookie)
- Request bodies and schemas
- Responses with status codes and schemas
- Security schemes and requirements
- Components and reusable schemas
- Tags for grouping operations
- External documentation links

## Notes

- The tool analyzes route definitions, controller annotations, and decorator patterns
- Type definitions and interfaces are used to generate schemas
- JSDoc, docstrings, and comments are included as descriptions
- Validation rules and constraints are documented in schemas
- Authentication middleware is detected and mapped to security schemes
