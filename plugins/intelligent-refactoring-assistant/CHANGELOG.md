# Changelog

All notable changes to the Intelligent Refactoring Assistant plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added
- Initial release of Intelligent Refactoring Assistant
- `/extract-duplication` command for finding and removing code duplication
- `/modernize-code` command for updating syntax and APIs
- `/apply-pattern` command for applying design patterns
- `/analyze-refactor-opportunities` command for comprehensive analysis
- `/safe-rename` command for renaming symbols across codebase
- Legacy Modernizer agent for updating outdated code
- Duplication Extractor agent for eliminating duplicated logic
- Pattern Applier agent for applying design patterns
- Refactoring Verifier agent for validating changes
- Smart Refactor skill for autonomous refactoring suggestions
- Support for JavaScript, TypeScript, Python, Java, C#, Go, Ruby, and PHP
- Confidence-based recommendations (HIGH, MEDIUM, LOW)
- Cross-file refactoring capabilities
- Type safety preservation
- Behavior preservation guarantees

### Features
- Code duplication detection (exact and near-duplicates)
- Modernization opportunities detection
- Design pattern suggestion and application
- Complexity analysis and hot-spot identification
- Safe symbol renaming with conflict detection
- Impact analysis and risk assessment
- Before/after preview for all changes
- Comprehensive refactoring roadmaps
- Integration with existing test frameworks

[1.0.0]: https://github.com/anthropics/claude-code-plugins/releases/tag/v1.0.0
