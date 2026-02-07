# Changelog

All notable changes to the Code Migration Assistant plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added
- Initial release of Code Migration Assistant plugin
- `/migrate-plan` command for creating comprehensive migration plans
- `/migrate-check` command for compatibility checking
- `/migrate-apply` command for automated migrations
- `/migrate-analyze` command for codebase analysis
- Migration Analyzer Agent for deep codebase analysis
- Breaking Change Detector Agent for identifying deprecated APIs
- Code Translator Agent for language translations
- framework-upgrade skill for framework version upgrades
- language-translation skill for code translations
- dependency-migration skill for package management
- SessionStart hook to notify users of available features
- PostToolUse hook to suggest migration assistance when appropriate

### Supported Frameworks
- React (17 → 18, 18 → 19)
- Vue (2 → 3)
- Angular (14 → 17, 15 → 18)
- Next.js (12 → 14, 13 → 15)
- Express (4 → 5)
- Django (2 → 5)
- Rails (5 → 7)

### Supported Languages
- JavaScript ↔ TypeScript
- JavaScript ↔ Python
- Python 2 → Python 3
- React Class → Functional Components
- Vue Options API → Composition API
- Java → Kotlin
- Objective-C → Swift

### Features
- Automatic git commits before migrations
- Dry-run mode for safe preview
- Backup file creation
- Dependency analysis
- Breaking change detection
- Effort estimation
- Risk scoring
- Type inference for TypeScript conversions
- Idiomatic code generation
- Rollback strategies
- Comprehensive documentation

## [Unreleased]

### Planned Features
- Additional framework support (Svelte, Solid, Qwik, etc.)
- More language pairs (Go, Rust, C#, PHP, etc.)
- Enhanced codemods with AST transformations
- Migration progress tracking
- Automated testing integration
- Visual migration reports
- Team collaboration features
- CI/CD integration
- Migration history tracking

[1.0.0]: https://github.com/your-repo/code-migration-assistant/releases/tag/v1.0.0
