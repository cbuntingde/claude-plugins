# Changelog

All notable changes to the Migration Generator plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added
- Initial release of Migration Generator plugin
- Slash command `/generate-migration` with framework and description arguments
- Migration Generator skill for autonomous invocation
- Migration Expert agent for complex schema tasks
- Support for 7 major frameworks:
  - Django (Python)
  - Rails (Ruby)
  - Prisma (TypeScript/Node.js)
  - SQLAlchemy (Python with Alembic)
  - TypeORM (TypeScript/Node.js)
  - Knex (JavaScript)
  - Entity Framework Core (C#/.NET)
- Automatic type inference from common field patterns
- Relationship detection (one-to-one, one-to-many, many-to-many)
- Index and constraint generation
- Rollback migration support
- Comprehensive documentation and examples
- Plugin manifest with metadata and keywords

### Features
- Natural language schema description parsing
- Framework-specific migration file generation
- Proper timestamp naming conventions
- Foreign key relationship creation
- Index generation for performance
- Default value handling
- Not null constraint enforcement
- Unique constraint detection
- Multi-table migration support

## [Unreleased]

### Planned
- Data migration generation
- Schema diff analysis
- Migration rollback validation
- Additional framework support (Sequelize, MikroORM, etc.)
- Visual schema diagrams
- Migration testing helpers
- Zero-downtime migration strategies
- Schema documentation generation
