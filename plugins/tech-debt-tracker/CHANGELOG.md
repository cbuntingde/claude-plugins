# Changelog

All notable changes to the Technical Debt Tracker plugin will be documented in this file.

## [1.0.0] - 2024-01-15

### Added
- Initial release of Technical Debt Tracker plugin
- Core commands: `/debt-scan`, `/debt-report`, `/debt-prioritize`, `/debt-resolve`
- Debt Analyzer agent for comprehensive code analysis
- Code Smell Detector agent for identifying 24+ code smells
- Debt Assessment skill for automatic quality analysis
- Refactoring Recommender skill with 60+ refactoring techniques
- PostToolUse hook for real-time debt detection
- SessionStart/SessionEnd hooks for debt tracking
- Multi-dimensional debt scoring (complexity, duplication, security, design)
- Prioritization strategies (impact, effort, ROI, timeline)
- Comprehensive reporting with trends and analytics
- Support for multiple output formats (table, JSON, markdown)
- Configurable thresholds and ignore patterns

### Features
- **Complexity Analysis**: Cyclomatic complexity, cognitive load, nesting depth
- **Code Smell Detection**: Long methods, large classes, feature envy, etc.
- **Duplication Analysis**: Exact and near-duplicate detection
- **Security Assessment**: SQL injection, XSS, hardcoded secrets, dependencies
- **Architecture Evaluation**: SOLID principles, coupling, design patterns
- **Test Coverage Analysis**: Untested code, coverage gaps
- **Prioritization System**: Impact scoring, effort estimation, ROI calculation
- **Trend Tracking**: Monitor debt accumulation over time
- **Hotspot Identification**: Files/modules with highest debt concentration

### Documentation
- Comprehensive README with usage examples
- Detailed command documentation
- Agent capability descriptions
- Skill activation triggers
- Hook configuration guide
- Configuration examples
- Best practices guide

## [Unreleased]

### Planned
- Integration with popular CI/CD platforms
- Language-specific analyzers (Python, Java, Go)
- Custom rule definition support
- Team collaboration features
- Debt remediation tracking
- Export to Jira, GitHub Projects, etc.
- Historical debt visualization
- Machine learning for debt prediction
- Integration with SonarQube, CodeClimate
- IDE extension for real-time feedback
- Custom refactoring templates
- Batch refactoring capabilities
- Dependency analysis
- Performance profiling integration
- Security scan integration
- Test generation suggestions
- Documentation generation for debt items
- Team metrics and leaderboards
- Sprint planning integration
- Automated refactoring suggestions in PRs
