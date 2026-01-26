# Architecture Advisor Plugin

A Claude Code plugin that provides intelligent architecture reviews, design pattern analysis, and improvement suggestions for your codebase.

## Features

### Intelligent Agents
- **Design Pattern Reviewer**: Analyzes code for design patterns, identifies anti-patterns, and suggests improvements
- **SOLID Principles Analyzer**: Evaluates adherence to SOLID principles with specific refactoring recommendations

### Slash Commands
- **/architecture-review**: Comprehensive architecture analysis with customizable focus areas
- **/pattern-suggest**: Get intelligent design pattern recommendations based on your specific problems

### Auto-Invoked Skills
- **Architecture Reviewer Skill**: Automatically activates when you ask about architecture, design patterns, code smells, or structural improvements

## Capabilities

### Design Pattern Analysis
- **Creational Patterns**: Singleton, Factory, Builder, Prototype, and more
- **Structural Patterns**: Adapter, Decorator, Facade, Proxy, Composite, etc.
- **Behavioral Patterns**: Strategy, Observer, Command, State, Template Method, etc.
- **Architectural Patterns**: MVC, MVP, MVVM, Clean Architecture, Hexagonal, etc.

### Code Quality Assessment
- Identify God Objects, Shotgun Surgery, and other anti-patterns
- Analyze coupling levels between components
- Evaluate cohesion within modules
- Detect code duplication and abstraction opportunities
- Review error handling patterns

### SOLID Principles Review
- **Single Responsibility**: Classes should have one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

## Installation

### From Local Directory

```bash
claude plugin install ./architecture-advisor
```

### From Marketplace

```bash
claude plugin install architecture-advisor
```

## Usage Examples

### Architecture Review
```bash
# Review entire codebase
/architecture-review

# Review specific module
/architecture-review src/auth

# Focus on SOLID principles
/architecture-review --focus solid

# Focus on design patterns
/architecture-review src/services --focus patterns
```

### Pattern Suggestions
```bash
# Get pattern recommendation
/pattern-suggest Need to handle multiple payment methods

# Specify language
/pattern-suggest --language python How to implement undo/redo

# Complex scenario
/pattern-suggest Object creation has many optional parameters and complex validation
```

### Automatic Activation
The Architecture Reviewer skill automatically activates when you ask questions like:
- "Review the architecture of this authentication module"
- "What design patterns should I use for this feature?"
- "Does this class follow SOLID principles?"
- "Find anti-patterns in this codebase"
- "Suggest improvements for the service layer"

## Plugin Structure

```
architecture-advisor/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── agents/                       # Specialized subagents
│   ├── design-pattern-reviewer.md
│   └── solid-principle-analyzer.md
├── commands/                     # Slash commands
│   ├── architecture-review.md
│   └── pattern-suggest.md
├── skills/                       # Auto-invoked skills
│   └── architecture-reviewer/
│       └── SKILL.md
├── README.md                     # This file
├── LICENSE                       # MIT License
└── CHANGELOG.md                  # Version history
```

## What You'll Get

1. **Pattern Inventory**: List of patterns currently in use
2. **Issue Detection**: Anti-patterns and code smells with severity ratings
3. **Improvement Suggestions**: Specific patterns to apply with examples
4. **Refactoring Roadmap**: Prioritized list of improvements
5. **Best Practices Recommendations**: Industry-standard approaches for your context

## Output Format

### Executive Summary
- High-level health score and critical issues
- Quick overview of architectural state

### Detailed Findings
- Issue category and severity
- File locations with line numbers
- Description of the problem
- Impact on maintainability

### Recommendations
- Specific refactoring suggestions
- Before/after code examples
- Priority ranking
- Estimated effort

### Action Plan
- Prioritized improvement list
- Dependencies between changes
- Risk assessment

## Language Support

The plugin adapts recommendations to:
- TypeScript, JavaScript, Python, Java, C#, Go, Ruby, PHP, and more
- Frameworks like Express, Django, Spring, .NET, Rails, etc.
- OOP, functional, or hybrid programming paradigms
- Monolith, microservices, serverless, or modular architectures

## Best Practices

1. **Run Regularly**: Conduct reviews during development, not just at the end
2. **Focus Incremental**: Use `--focus` for targeted analysis
3. **Address Critical Issues**: Prioritize high-severity findings
4. **Track Progress**: Compare reviews over time to measure improvement
5. **Team Discussion**: Use findings for architecture decision records

## Configuration

### Configuration File

You can customize the analyzer behavior using a JSON configuration file:

```json
{
  "maxFileSize": 1048576,
  "allowedExtensions": [".ts", ".js", ".py", ".java", ".go", ".rs"],
  "excludedPatterns": ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
  "antiPatternRules": {
    "maxClassLines": 300,
    "maxMethodLines": 50,
    "maxDepth": 4,
    "maxInheritanceDepth": 3
  }
}
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `maxFileSize` | number | `1048576` | Maximum file size in bytes (1MB) |
| `allowedExtensions` | string[] | `['.ts', '.js', '.py', '.java', '.go', '.rs']` | File extensions to analyze |
| `excludedPatterns` | string[] | See default | Glob patterns to exclude |
| `antiPatternRules` | object | See below | Threshold values for anti-pattern detection |

#### Anti-Pattern Rules

| Rule | Default | Description |
|------|---------|-------------|
| `maxClassLines` | `300` | Maximum lines in a class before flagging |
| `maxMethodLines` | `50` | Maximum lines in a method before flagging |
| `maxDepth` | `4` | Maximum nesting depth before flagging |
| `maxInheritanceDepth` | `3` | Maximum inheritance depth before flagging |

### Command Options

#### `/architecture-review` Options

| Option | Description | Default |
|--------|-------------|---------|
| `path` | Directory or file to review | Current directory |
| `--focus` | Focus area (all, patterns, solid, anti-patterns) | `all` |
| `--depth` | Detail level (standard, detailed) | `standard` |
| `--config` | Path to configuration file | Built-in defaults |

#### `/pattern-suggest` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--language` | Programming language for examples | `typescript` |
| `--complexity` | Complexity level (simple, moderate, complex) | `moderate` |

### Environment Variables

No environment variables required for this plugin.

## Security

This plugin handles file system operations and implements security best practices:

### Path Traversal Protection
- All file paths are validated and sanitized before use
- Paths are resolved and checked to ensure they remain within the specified base directory
- Null bytes, URLs, and Windows device paths are rejected

### Input Validation
- All user inputs are validated against strict allow-lists
- Problem descriptions are limited to 10,000 characters to prevent DoS
- Language and complexity options are validated against allowed values

### Safe File Operations
- Maximum file size limits prevent memory exhaustion
- Excluded patterns prevent analysis of sensitive directories (node_modules, .git, etc.)
- File access errors are handled gracefully with informative messages

### Logging
- Structured JSON logging with request IDs for traceability
- Sensitive data is never logged
- Log levels: DEBUG, INFO, WARN, ERROR, FATAL

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Version History

See CHANGELOG.md for version history and changes.

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins/tree/main/plugins/architecture-advisor
