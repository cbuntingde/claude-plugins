# Changelog

All notable changes to the Code Complexity Analyzer plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Added
- Initial release of Code Complexity Analyzer plugin
- Cyclomatic complexity analysis for functions
- Cognitive complexity evaluation
- Code smell detection (long methods, deep nesting, parameter lists)
- Multi-language support (Python, JavaScript, TypeScript, Java, Go)
- `/analyze-complexity` slash command with customizable options
- `complexity-analyzer` specialized agent
- `complexity-check` automated skill
- Post-edit hooks for automatic analysis
- Standalone Python analysis script
- Comprehensive refactoring recommendations
- Before/after code examples
- JSON output for CI/CD integration
- Table and detailed output formats
- Configurable complexity thresholds
- Environment variable configuration
- Comprehensive documentation and examples

### Features
- **Slash Command**: Manual complexity analysis with multiple options
- **Agent**: Specialized complexity analysis and refactoring guidance
- **Skill**: Automatic complexity checking during development
- **Hooks**: Optional post-edit analysis
- **Script**: Standalone CLI tool for batch analysis
- **Multi-format Output**: Table, detailed, and JSON formats
- **Customizable Thresholds**: Configure based on project needs

## [Unreleased]

### Planned Features
- Support for additional languages (C#, C++, PHP, Ruby)
- Visual complexity graphs and trends
- Integration with popular CI/CD platforms
- Team complexity metrics and dashboards
- Historical complexity tracking
- Automated refactoring pull request generation
- IDE integration support
