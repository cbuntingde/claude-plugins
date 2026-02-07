---
description: Generate test configuration files from project analysis
arguments:
  - name: target
    description: CI/CD platform (github, gitlab, jenkins, azure)
    required: false
---

# Generate Test Configuration

Analyze your project and generate optimized testing configurations.

## What it does

Analyzes your codebase to understand:

### Project Detection
- Language and framework detection
- Dependency analysis
- Existing test discovery
- Build system identification

### Configuration Generation

Creates tailored configurations for:

**Testing Frameworks:**
- Jest configuration
- Vitest configuration
- pytest configuration
- JUnit configuration

**CI/CD Pipelines:**
- GitHub Actions workflows
- GitLab CI pipelines
- Jenkins pipelines
- Azure DevOps pipelines

**Coverage Tools:**
- Istanbul/nyc
- Coverage.py
- Go cover

## Usage

```bash
/generate-test-config
```

For specific CI platform:

```bash
/generate-test-config --target=github
```

## Generated Files

```
project/
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── quality-gate.yml
├── jest.config.js
├── jest.setup.js
├── .nycrc
├── .eslintrc.js
└── tsconfig.json
```

## Configuration Features

### Parallel Test Execution
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
```

### Caching
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Distributed Testing
- Split tests across multiple workers
- Load balancing for faster execution
- Retry logic for flaky tests

## Examples

Generate GitHub Actions workflow:

> /generate-test-config --target=github

Generate all configurations:

> /generate-test-config

## Smart Defaults

The generator applies intelligent defaults based on:

- Project size (small/medium/large)
- Team size
- CI/CD platform capabilities
- Typical deployment frequency

## Notes

- Preserves existing configuration files
- Creates `.backup` directory before overwriting
- Interactive mode for custom selections
- Support for monorepo configurations
