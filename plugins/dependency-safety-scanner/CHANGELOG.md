# Changelog

All notable changes to the Dependency Safety Scanner plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Dependency Safety Scanner plugin
- Comprehensive dependency safety checking
- Maintainer tracking and abandonment detection
- Dependency bloat analysis
- License compliance checking
- MCP servers for vulnerability data integration
- Automatic hooks for install-time checking
- Specialized agents for deep analysis
- Autonomous safety check skill

## [1.0.0] - 2026-01-17

### Features

#### Commands
- `/scan-dependencies` - Full dependency safety scan
- `/check-package` - Check specific package before installing
- `/analyze-bloat` - Dependency bloat analysis
- `/maintainer-status` - Maintainer trustworthiness check

#### Agents
- Vulnerability Analyzer Agent - Deep CVE analysis and exploitability assessment
- Maintainer Tracker Agent - Abandonment detection and acquisition tracking
- Bloat Inspector Agent - Dependency optimization
- License Auditor Agent - License compliance and copyleft tracking

#### Skills
- Dependency Safety Check - Automatic safety analysis during installs and reviews

#### MCP Servers
- Vulnerability Database Server - Multi-source vulnerability aggregation
- npm Audit Proxy Server - Cached npm audit results

#### Hooks
- Pre-install safety checks
- Post-install scanning
- package.json change detection
- Session start dependency health check

#### Backend Scripts
- `post-install-scan.sh` - Post-installation safety scanning
- `check-package.js` - Comprehensive package analysis
- `scan-dependencies.js` - Full dependency tree scanning

### Security
- CVE integration with npm audit, OSV, Snyk, GitHub Advisory
- Malicious package detection
- Typosquatting protection
- Supply chain attack detection

### Maintainer Intelligence
- Abandonment prediction
- Acquisition tracking
- Responsiveness metrics
- Bus factor analysis
- Portfolio concentration risk

### Bloat Analysis
- Duplicate dependency detection
- Unused dependency identification
- Bundle size impact
- Install time measurement
- Alternative package suggestions

### License Compliance
- Multi-license compatibility checking
- Copyleft obligation tracking
- License change monitoring
- Corporate policy validation
- Attribution generation

[Unreleased]: https://github.com/chrisdev/dependency-safety-scanner/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/chrisdev/dependency-safety-scanner/releases/tag/v1.0.0
