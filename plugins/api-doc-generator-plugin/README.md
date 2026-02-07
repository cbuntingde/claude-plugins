# API Documentation Generator Plugin

Generates comprehensive API documentation from source code and OpenAPI specifications.

## Installation

```bash
# Available via Claude marketplace
```

## Usage

### Generate API Docs

```
/generate-api-docs
```

Scans codebase for API endpoints and generates documentation including:
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Error codes
- Rate limiting information

### Generate OpenAPI Spec

```
/generate-openapi
```

Creates an OpenAPI 3.0 specification file from analyzed endpoints.

### Update API Docs

```
/update-api-docs
```

Updates existing API documentation with changes detected in the codebase.

## Supported Formats

- OpenAPI 3.0 (JSON/YAML)
- Swagger 2.0
- Markdown
- ReDoc

## Features

- Automatic endpoint detection
- Request/response example generation
- Authentication documentation
- Security scheme mapping
- Deprecation notices

## Configuration

### Environment Variables

No environment variables required for basic usage.

### Plugin Settings

The plugin uses command-line arguments for configuration:

| Option | Description | Default |
|--------|-------------|---------|
| `--path` | Path to source code or OpenAPI spec | `.` |
| `--format` | Output format (markdown, openapi, html, json) | `markdown` |
| `--output` | Output file path | `API.md` |

### Supported Frameworks

The plugin automatically detects and generates documentation for:

- **Express.js** (JavaScript/TypeScript)
- **Fastify** (JavaScript/TypeScript)
- **FastAPI** (Python)
- **Spring Boot** (Java)
- **NestJS** (TypeScript)
- **Django REST** (Python)

### Output Formats

| Format | Description | File Extension |
|--------|-------------|----------------|
| markdown | Human-readable Markdown documentation | `.md` |
| openapi | OpenAPI 3.0 specification (JSON) | `.json` |
| html | Styled HTML documentation | `.html` |
| json | Structured documentation data | `.json` |

---

## Author

[cbuntingde](https://github.com/cbuntingde)

## License

MIT