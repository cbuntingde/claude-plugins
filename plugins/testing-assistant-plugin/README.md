# Testing Assistant Plugin

> Enterprise-grade testing assistant for Claude Code - automated test generation, edge case identification, and test quality improvement

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Plugin Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/cbuntingde/testing-assistant-plugin)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Compatible-green.svg)](https://code.claude.com)

## Overview

Testing Assistant is a comprehensive Claude Code plugin that helps you write better tests faster. It generates test suites, identifies edge cases, and improves existing test quality - all while being framework-agnostic and respecting your workflow.

### Why Testing Assistant?

- **Automated Test Generation**: Create comprehensive test suites for any code
- **Smart Edge Case Discovery**: Find boundary conditions and failure scenarios
- **Test Quality Analysis**: Review and improve existing tests
- **Framework Agnostic**: Works with Jest, pytest, JUnit, Go testing, and more
- **Intelligent Suggestions**: Get proactive recommendations without interruption
- **Privacy First**: All processing happens locally - no external services

## Features

### 🚀 Automated Test Generation
- Analyzes code structure and behavior
- Generates tests for happy paths, edge cases, and errors
- Supports all major programming languages and frameworks
- Creates clear, maintainable test code with proper assertions

### 🔍 Edge Case Discovery
- Boundary condition analysis (min/max, empty, single items)
- Null/undefined input detection
- Security vulnerability scanning
- State and concurrency issues
- Integration failure points

### 📊 Test Quality Analysis
- Coverage gap identification
- Code quality improvements
- Maintainability enhancements
- Reliability fixes for flaky tests
- Performance optimization

### 🎯 Intelligent Hooks
- Context-aware test suggestions
- Non-intrusive reminders
- Configurable frequency limits
- Respects your workflow

## Quick Start

### Installation

```bash
# Install to user scope (available in all projects)
claude plugin install testing-assistant

# Install to project scope (shared with team via git)
claude plugin install testing-assistant --scope project

# Install to local scope (gitignored, for personal use)
claude plugin install testing-assistant --scope local
```

### Basic Usage

#### Generate Tests

```bash
# Generate tests for a file
/generate-tests src/utils/AuthService.js

# Specify framework and coverage target
/gen-tests src/models/User.py --framework=pytest --coverage=90

# Generate with high coverage
/generate-tests PaymentProcessor.ts --coverage=95
```

#### Find Edge Cases

```bash
# Find all edge cases
/find-edge-cases src/validators.js

# Focus on specific category
/edge-cases Calculator.ts --category=boundary
/find-edges AuthController.js --category=security
```

#### Improve Existing Tests

```bash
# Analyze and improve test file
/improve-tests tests/services/User.test.js

# Focus on coverage gaps
/review-tests tests/ --focus=coverage

# Fix flaky tests
/test-improve tests/integration/ --focus=reliability
```

## Documentation

- **[Installation Guide](#installation)** - Detailed installation instructions
- **[Usage Guide](#usage)** - Comprehensive usage examples
- **[Configuration](#configuration)** - Customize plugin behavior
- **[Architecture](docs/ARCHITECTURE.md)** - Plugin architecture and design
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Security Policy](SECURITY.md)** - Security and privacy information

## Installation

### Prerequisites

- Claude Code installed
- Git (for project scope installation)
- Basic familiarity with command line

### Installation Methods

#### User Scope (Recommended)

Installs for your user account, available in all projects:

```bash
claude plugin install testing-assistant
```

#### Project Scope

Installs for a specific project, shared via git:

```bash
cd your-project
claude plugin install testing-assistant --scope project
git add .claude/
git commit -m "Add testing assistant plugin"
```

#### Local Scope

Installs for a specific project, not shared via git:

```bash
cd your-project
claude plugin install testing-assistant --scope local
```

### Verification

Verify the plugin is installed:

```bash
claude plugin list
```

Look for `testing-assistant` in the output.

### Updating

Update to the latest version:

```bash
claude plugin update testing-assistant
```

### Uninstalling

Remove the plugin:

```bash
claude plugin uninstall testing-assistant --scope user
```

## Usage

### Test Generation

#### Basic Test Generation

```bash
# Generate tests for a JavaScript file
/generate-tests src/utils/AuthService.js

# Output: Creates src/utils/AuthService.test.js
```

#### Framework-Specific Generation

```bash
# Python with pytest
/gen-tests auth/models.py --framework=pytest

# Java with JUnit
/generate-tests UserService.java --framework=junit

# Go with testing package
/gen-tests handler.go --framework=go
```

#### Coverage Targets

```bash
# Target 90% coverage
/generate-tests PaymentProcessor.ts --coverage=90

# Target 100% coverage (aggressive)
/gen-tests Validator.js --coverage=100
```

### Edge Case Discovery

#### Comprehensive Analysis

```bash
# Analyze all edge cases
/find-edge-cases src/utils/PaymentProcessor.js

# Output includes:
# - Boundary conditions
# - Null/undefined scenarios
# - Security vulnerabilities
# - Performance concerns
# - Concurrency issues
```

#### Category-Specific Analysis

```bash
# Focus on boundary conditions
/edge-cases ArrayHelper.ts --category=boundary

# Focus on security
/find-edges AuthController.js --category=security

# Focus on performance
/edge-cases DataProcessor.py --category=performance
```

### Test Improvement

#### Quality Analysis

```bash
# Analyze test quality
/improve-tests tests/services/User.test.js

# Provides:
# - Coverage gaps
# - Code quality issues
# - Maintainability concerns
# - Performance issues
```

#### Focused Improvements

```bash
# Fix flaky tests
/test-improve tests/integration/ --focus=reliability

# Improve coverage
/review-tests tests/ --focus=coverage

# Optimize performance
/improve-tests tests/ --focus=performance
```

## Supported Languages and Frameworks

| Language | Frameworks | Status |
|----------|------------|--------|
| JavaScript/TypeScript | Jest, Mocha, Vitest, Jasmine, AVA | ✅ Full Support |
| Python | pytest, unittest, nose2, doctest | ✅ Full Support |
| Java | JUnit, TestNG | ✅ Full Support |
| Go | testing, testify, ginkgo | ✅ Full Support |
| C# | NUnit, xUnit, MSTest | ✅ Full Support |
| Ruby | RSpec, Minitest | ✅ Full Support |
| PHP | PHPUnit | ✅ Full Support |
| Rust | built-in testing | ✅ Full Support |
| C++ | Google Test, Catch2 | ✅ Support |
| Swift | XCTest, Quick | ✅ Support |

## Configuration

### Plugin Settings

Configure the plugin by editing `.claude-plugin/plugin.json`:

```json
{
  "settings": {
    "defaultCoverage": 80,              // Default coverage target
    "maxSuggestionsPerSession": 5,      // Limit automated suggestions
    "enableAutoSuggestions": true,      // Enable/disable hooks
    "respectGitignore": true            // Honor .gitignore patterns
  }
}
```

### Customizing Coverage Targets

Set your default coverage percentage:

```json
{
  "settings": {
    "defaultCoverage": 90
  }
}
```

### Disabling Automated Suggestions

Disable the suggestion hooks:

```json
{
  "settings": {
    "enableAutoSuggestions": false
  }
}
```

Or remove `hooks/hooks.json` entirely.

### Adjusting Suggestion Frequency

Limit how often hooks suggest tests:

```json
{
  "settings": {
    "maxSuggestionsPerSession": 3
  }
}
```

## Examples

### Example 1: Test-Driven Development Workflow

```bash
# Write your function
echo 'export function add(a, b) { return a + b; }' > math.js

# Generate tests
/generate-tests math.js

# Run tests
npm test math.test.js

# Output: All tests pass ✅
```

### Example 2: Finding Security Edge Cases

```bash
/edge-cases src/auth/LoginController.js

# Output:
# Security Edge Cases Found:
# ⚠️  SQL Injection: User input not sanitized
# ⚠️  XSS Attack: Error messages not escaped
# ⚠️  Brute Force: No rate limiting on login
# ⚠️  Session Fixation: Session not regenerated
#
# Test examples provided for each vulnerability
```

### Example 3: Improving Test Coverage

```bash
/improve-tests tests/

# Analysis Report:
# Current Coverage: 68%
# Target Coverage: 80%
# Gap: 12%
#
# Recommendations:
# 1. Add tests for error paths (5 files)
# 2. Test edge cases in validators (3 files)
# 3. Add integration tests (2 files)
#
# Quick Wins:
# - src/auth/Auth.test.js: +8% coverage
# - src/utils/Validator.test.js: +4% coverage
```

## Plugin Components

### Agents

**Test Architect**: Comprehensive testing specialist
- Test strategy development
- Automated test generation
- Edge case discovery
- Coverage analysis
- Test improvement recommendations

### Skills

1. **Test Generator**: Automatically generates test cases
   - Framework detection
   - Test structure generation
   - Mock and fixture creation

2. **Edge Case Finder**: Discovers edge cases
   - Boundary conditions
   - Security vulnerabilities
   - State issues
   - Integration failures

3. **Test Improver**: Enhances existing tests
   - Coverage analysis
   - Quality improvements
   - Reliability fixes
   - Performance optimization

### Commands

- `/generate-tests` - Generate comprehensive test cases
- `/find-edge-cases` - Identify edge cases and boundary conditions
- `/improve-tests` - Analyze and improve existing tests

### Hooks

- **PostToolUse**: Suggests tests after code changes
- **PreToolUse**: Reminds to test before deployment

## Best Practices

### Test Generation

1. **Review generated tests** before committing
2. **Adjust assertions** based on business logic
3. **Add domain-specific test cases**
4. **Keep tests simple and focused**

### Edge Case Analysis

1. **Prioritize by likelihood and impact**
2. **Create tests for high-priority cases first**
3. **Add input validation** to prevent invalid states
4. **Document expected behavior**

### Test Improvement

1. **Address high-priority items first**
2. **Run tests after each change**
3. **Gradually improve** rather than rewrite
4. **Document changes** for team review

## Troubleshooting

### Plugin Not Loading

```bash
# Check installation
claude plugin list

# Validate plugin
claude plugin validate testing-assistant

# Reinstall if needed
claude plugin uninstall testing-assistant
claude plugin install testing-assistant
```

### Commands Not Found

```bash
# Restart Claude Code
# Check plugin is loaded
claude plugin list | grep testing-assistant

# Verify command files exist
ls testing-assistant/commands/
```

### Too Many Suggestions

Adjust settings in `.claude-plugin/plugin.json`:

```json
{
  "settings": {
    "maxSuggestionsPerSession": 3,
    "enableAutoSuggestions": true
  }
}
```

For more troubleshooting help, see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

## Architecture

The plugin is built with a modular architecture:

```
testing-assistant/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── agents/                   # Specialized agents
│   └── test-architect.md
├── skills/                   # Automatic skills
│   ├── test-generator/
│   ├── edge-case-finder/
│   └── test-improver/
├── commands/                 # User commands
│   ├── generate-tests.md
│   ├── find-edge-cases.md
│   └── improve-tests.md
├── hooks/                    # Event handlers
│   └── hooks.json
└── docs/                     # Documentation
    ├── ARCHITECTURE.md
    └── TROUBLESHOOTING.md
```

For detailed architecture information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security

- ✅ No external network calls
- ✅ All processing is local
- ✅ No telemetry collection
- ✅ Respects access permissions
- ✅ Transparent operations

For security policies, see [SECURITY.md](SECURITY.md).

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Documentation**: [README.md](README.md), [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/cbuntingde/testing-assistant-plugin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cbuntingde/testing-assistant-plugin/discussions)
- **Security**: cbuntingde@gmail.com

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Acknowledgments

- Built with [Claude Code](https://code.claude.com)
- Inspired by testing best practices across the industry
- Community feedback and contributions

---

**Made with ❤️ by the Testing Assistant Contributors**
