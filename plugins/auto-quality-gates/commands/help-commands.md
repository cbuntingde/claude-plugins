---
description: Display available testing commands and their usage
---

# Help: Available Testing Commands

This plugin provides the following quality gates commands:

## Setup Commands

| Command | Description |
|---------|-------------|
| `/setup-testing` | Set up automated testing framework for your project |
| `/configure-quality-gates` | Configure quality gates thresholds and rules |
| `/generate-test-config` | Generate test configuration files |

## Quality Check Commands

| Command | Description |
|---------|-------------|
| `/run-quality-check` | Run all quality checks (lint, test, coverage) |

## Framework Support

- **JavaScript/TypeScript**: Jest, Vitest, Mocha
- **Python**: pytest, unittest
- **Java**: JUnit, TestNG
- **Go**: testing package, testify

## Quick Start

```bash
# Set up testing framework
/setup-testing --framework=jest --coverage=80

# Configure quality gates
/configure-quality-gates

# Run quality checks
/run-quality-check
```

## Configuration

Quality gates can be configured via:
- `.quality-gates.json` in project root
- `package.json` qualityGates section
- Environment variables

For more details, see the [README](../README.md).