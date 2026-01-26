# Changelog

All notable changes to the Architecture Advisor plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added
- Initial release of Architecture Advisor plugin
- Design Pattern Reviewer agent for comprehensive pattern analysis
- SOLID Principles Analyzer agent for principle adherence evaluation
- `/architecture-review` slash command for customizable architecture reviews
- `/pattern-suggest` slash command for intelligent pattern recommendations
- Architecture Reviewer skill with automatic activation
- Support for multiple programming languages (TypeScript, JavaScript, Python, Java, C#, Go, Ruby, PHP)
- Anti-pattern detection (God Objects, Shotgun Surgery, Feature Envy, etc.)
- SOLID principles evaluation (SRP, OCP, LSP, ISP, DIP)
- Coupling and cohesion analysis
- Comprehensive documentation and examples

### Features
- **Design Pattern Analysis**
  - Creational patterns: Singleton, Factory, Builder, Prototype
  - Structural patterns: Adapter, Decorator, Facade, Proxy, Composite
  - Behavioral patterns: Strategy, Observer, Command, State, Template Method
  - Architectural patterns: MVC, MVP, MVVM, Clean Architecture

- **Code Quality Assessment**
  - Anti-pattern detection with severity ratings
  - Coupling analysis between components
  - Cohesion evaluation within modules
  - Code duplication detection
  - Complexity metrics

- **Improvement Recommendations**
  - Specific pattern suggestions with examples
  - Before/after code examples
  - Prioritized refactoring roadmap
  - Best practices for various architectures

[1.0.0]: https://github.com/your-username/architecture-advisor/releases/tag/v1.0.0
