# Changelog

All notable changes to the API Integration Generator plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-17

### Added
- Initial release of API Integration Generator plugin
- `/api-gen` command for generating API clients from OpenAPI specs
- `/api-update` command for updating existing clients when APIs change
- Multi-language support (TypeScript, Python, Go)
- Automatic API integration detection via skills
- API integration expert agent for complex scenarios
- MCP server for fetching and parsing API documentation
- Background script to check for API updates
- Comprehensive error handling in generated clients
- Authentication scheme support (API Key, Bearer, OAuth2)
- Type safety for all generated code
- Change detection between API versions
- Migration guides for breaking changes
- Automatic backup creation before updates
- Version history tracking

### Features
- **TypeScript Clients**: Full type definitions, interfaces, error handling
- **Python Clients**: Pydantic models, asyncio support, proper typing
- **Go Clients**: Struct definitions, proper error handling
- **Auto-updates**: Periodic checks for API specification changes
- **Change Detection**: Detailed diff between API versions
- **Rollback Support**: Restore previous versions of generated clients
- **CI/CD Integration**: Scripts for automated workflows

### Documentation
- Comprehensive README with usage examples
- Command reference with all options
- Example OpenAPI specification for testing
- Architecture documentation
- Best practices guide

## [Unreleased]

### Planned
- GraphQL schema support
- WebSocket client generation
- Additional languages (Rust, Java, C#)
- Mock server generation
- Performance optimization tools
- Contract testing generation
- Advanced retry strategies
- Rate limiting helpers
