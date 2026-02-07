# Changelog

All notable changes to the "env-var-detect" plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Added
- Initial release of the Environment Variable Detection plugin
- Automatic detection via PostToolUse hooks
- Manual `/check-env` slash command
- Support for 8 programming languages:
  - JavaScript/TypeScript
  - Python
  - Shell/Bash
  - PHP
  - Ruby
  - Go
  - Java
- Detection of 10+ environment file patterns
- Detailed reporting with file-by-file breakdown
- Smart suggestions for missing variables
- Comprehensive documentation

### Features
- Zero-configuration setup
- Colorized terminal output
- Recursive directory scanning
- Excludes common directories (node_modules, .git, dist, build, etc.)
- Cross-platform compatibility (Windows, Linux, macOS)

[1.0.0]: https://github.com/chris-dev/env-var-detect/releases/tag/v1.0.0
