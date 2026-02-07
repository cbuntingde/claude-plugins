# Auto Quality Gates Plugin

Comprehensive automated testing and quality gates configuration framework for Claude Code.

## Overview

This plugin helps you set up, configure, and enforce automated testing and quality standards across your projects. It provides commands, agents, and skills to ensure code quality throughout the development lifecycle.

## Features

- **Automated Testing Setup**: Quick setup for popular testing frameworks
- **Quality Gates**: Enforce coverage, linting, and security standards
- **Test Generation**: Automatically generate unit tests from your code
- **Coverage Analysis**: Identify and prioritize untested code
- **Linting Enforcement**: Auto-fix and enforce code style standards
- **CI/CD Integration**: Generate optimized CI/CD pipeline configurations

## Installation

```bash
claude plugin install auto-quality-gates
```

## Quick Start

### 1. Setup Testing Framework

Initialize testing for your project:

```bash
/setup-testing --framework=jest --coverage=80
```

### 2. Configure Quality Gates

Define quality standards:

```bash
/configure-quality-gates --coverage-threshold=80 --lint-rules=strict --security-checks
```

### 3. Run Quality Checks

Execute all quality gates:

```bash
/run-quality-check
```

## Commands

### `/setup-testing`
Set up automated testing framework for your project.

**Arguments:**
- `--framework`: Testing framework (jest, pytest, junit, etc.)
- `--coverage`: Minimum coverage percentage

**Example:**
```bash
/setup-testing --framework=pytest --coverage=85
```

### `/configure-quality-gates`
Define and enforce quality gates for code changes.

**Arguments:**
- `--coverage-threshold`: Minimum coverage (0-100)
- `--lint-rules`: Strictness level (strict, moderate, relaxed)
- `--security-checks`: Enable security scanning

**Example:**
```bash
/configure-quality-gates --coverage-threshold=90 --lint-rules=strict
```

### `/run-quality-check`
Execute all quality gate checks and generate report.

**Arguments:**
- `--fix`: Auto-fix fixable issues
- `--report-format`: Output format (json, html, markdown)

**Example:**
```bash
/run-quality-check --fix --report-format=html
```

### `/generate-test-config`
Generate test configuration files from project analysis.

**Arguments:**
- `--target`: CI/CD platform (github, gitlab, jenkins, azure)

**Example:**
```bash
/generate-test-config --target=github
```

## Agents

### Test Architect
Designs comprehensive testing strategies and architectures.

**When to use:**
- Starting a new project
- Need test strategy recommendations
- Scaling test infrastructure

**Example:**
> Design a testing strategy for a microservices architecture

### Quality Analyst
Analyzes code quality metrics and recommends improvements.

**When to use:**
- Comprehensive quality assessment
- Tracking quality trends
- Identifying technical debt

**Example:**
> Analyze code quality and identify areas needing improvement

### CI Configurator
Configures and optimizes CI/CD pipelines with quality gates.

**When to use:**
- Setting up CI/CD
- Optimizing slow pipelines
- Integrating quality gates

**Example:**
> Create a GitHub Actions workflow with automated quality gates

## Skills

### Test Generator
Automatically generates comprehensive unit tests from code analysis.

**Activates when:**
- You ask to generate tests
- Need test coverage improvements
- Writing tests for new code

**Example:**
> Generate unit tests for the UserService class

### Coverage Analyzer
Analyzes coverage reports and identifies test gaps.

**Activates when:**
- Requesting coverage analysis
- Identifying untested code
- Improving coverage percentages

**Example:**
> Find all untested code in the payment module

### Linting Enforcer
Enforces code quality standards through automated linting.

**Activates when:**
- Running linting checks
- Fixing style violations
- Enforcing coding standards

**Example:**
> Fix all linting errors in the project

## Configuration

Quality gate settings are stored in `.quality-gates.json`:

```json
{
  "coverage": {
    "threshold": 80,
    "branches": true,
    "functions": true,
    "lines": true,
    "statements": true
  },
  "linting": {
    "rules": "strict",
    "autoFix": true
  },
  "security": {
    "enabled": true,
    "scanDependencies": true
  }
}
```

## CI/CD Integration

The plugin generates CI/CD configurations that integrate quality gates:

### GitHub Actions
```yaml
name: Quality Gates

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Check coverage
        run: npm run test:coverage
      - name: Lint
        run: npm run lint
```

### GitLab CI
```yaml
quality-gate:
  stage: test
  script:
    - npm run test
    - npm run test:coverage
    - npm run lint
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
```

## Hooks

The plugin includes automated hooks:

- **PostToolUse**: Auto-fix linting after code changes
- **SessionStart**: Display testing hints
- **PreToolUse**: Safety checks for destructive commands

## Quality Gate Levels

| Level | Coverage | Linting | Security |
|-------|----------|---------|----------|
| **Strict** | 90% | Error on all | Full scan |
| **Standard** | 80% | Error critical | Standard scan |
| **Relaxed** | 60% | Warnings only | Basic scan |

## Supported Languages

- JavaScript / TypeScript (Jest, Vitest, Mocha)
- Python (pytest, unittest)
- Java (JUnit, TestNG)
- Go (testing, testify)
- C# (xUnit, NUnit)
- Ruby (RSpec, Minitest)

## Best Practices

1. **Start Early**: Set up testing when project begins
2. **Enforce Gates**: Make quality gates mandatory in CI/CD
3. **Monitor Trends**: Track quality metrics over time
4. **Fix Quickly**: Address quality issues immediately
5. **Review Regularly**: Update quality standards as project evolves

## Usage

### Running Quality Checks

Execute all quality gates:

```bash
/run-quality-check
```

With auto-fix enabled:

```bash
/run-quality-check --fix
```

Generate HTML report:

```bash
/run-quality-check --report-format=html
```

### Setting Up Testing Framework

Initialize testing for your project:

```bash
/setup-testing --framework=jest --coverage=80
```

### Configuring Quality Gates

Define quality standards:

```bash
/configure-quality-gates --coverage-threshold=80 --lint-rules=strict --security-checks
```

### Generating Test Configuration

Generate CI/CD configuration:

```bash
/generate-test-config --target=github
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/cbuntingde/claude-plugins-dev/issues
- Documentation: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/auto-quality-gates

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/auto-quality-gates
