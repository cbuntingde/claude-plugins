# Changelog

All notable changes to the OpenAPI Generator Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added
- Initial release of OpenAPI/Swagger Generator plugin
- Slash command `/generate-openapi` with interactive and argument-based modes
- Agent skill for autonomous OpenAPI generation
- Framework analyzers:
  - Express.js analyzer (JavaScript/TypeScript)
  - FastAPI analyzer (Python)
  - Flask analyzer (Python)
  - Spring Boot analyzer (Java)
- Multi-language support (JS, TS, Python, Java)
- OpenAPI 3.0 and Swagger 2.0 format support
- JSON and YAML output formats
- Auto-detection of web frameworks
- Path parameter extraction
- Schema inference from type definitions
- JSDoc and docstring extraction
- Security scheme detection
- Comprehensive documentation

### Features
- Generate complete API specifications from code
- Extract endpoints, parameters, request/response schemas
- Support for REST frameworks across multiple languages
- Interactive command with guided workflow
- CLI-style arguments for automation
- Standalone analyzer scripts
- Extensible plugin architecture

## [Unreleased]

### Planned
- Additional framework analyzers:
  - NestJS
  - Fastify
  - Django REST Framework
  - Gin (Go)
  - Echo (Go)
  - ASP.NET Core (C#)
  - Rails API (Ruby)
  - Laravel (PHP)
- Enhanced type inference
- Better validation rule extraction
- Request/response example generation
- OAuth flow detection
- WebSocket endpoint support
- GraphQL schema generation
- OpenAPI 3.1 support
- Schema validation tools
- Diff between specifications
- Merge multiple specs
