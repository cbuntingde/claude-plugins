---
description: Set up automated testing framework for your project
arguments:
  - name: framework
    description: Testing framework to use (jest, pytest, junit, etc.)
    required: false
  - name: coverage
    description: Minimum code coverage percentage
    required: false
---

# Setup Testing Framework

Initialize and configure automated testing infrastructure for your project.

## What it does

- Detects your project type and recommends appropriate testing frameworks
- Installs necessary testing dependencies
- Creates test directory structure
- Generates initial test configuration files
- Sets up test scripts in package.json or equivalent

## Framework support

Supports popular testing frameworks:
- **JavaScript/TypeScript**: Jest, Vitest, Mocha, Jasmine
- **Python**: pytest, unittest, nose2
- **Java**: JUnit, TestNG
- **Go**: testing package, testify
- **C#**: xUnit, NUnit, MSTest
- **Ruby**: RSpec, Minitest

## Usage

```bash
/setup-testing
```

With specific framework:

```bash
/setup-testing --framework=pytest --coverage=80
```

## What gets created

Based on your project type:

```
project/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── jest.config.js
├── pytest.ini
└── coverage/
```

## Examples

Setup Jest for a React project:

> /setup-testing --framework=jest --coverage=75

Setup pytest for Python:

> /setup-testing --framework=pytest --coverage=85

## Notes

- Automatically detects project type from existing files
- Respects existing test configurations
- Creates backup of conflicting files
- Installs dependencies via package manager
- Configures coverage thresholds
