---
description: Analyze and improve existing test coverage with additional test cases
---

# /improve-tests

Analyzes existing test coverage and suggests improvements to increase test coverage and quality.

## Usage

```bash
/improve-tests [options] <test-file> [source-files...]
```

## Options

| Option | Description |
|--------|-------------|
| `--target <number>` | Target coverage percentage (default: 80) |
| `--add-missing` | Auto-add missing test cases (default: false) |
| `--refactor` | Refactor existing tests (default: true) |
| `--suggestions` | Show improvement suggestions (default: true) |
| `--output <file>` | Output file for improved tests |
| `--verbose` | Show detailed analysis |

## Examples

```bash
# Analyze test coverage
/improve-tests tests/utils.test.js src/utils.js

# Generate improvement suggestions
/improve-tests --suggestions tests/utils.test.js src/utils.js

# Auto-add missing tests
/improve-tests --add-missing --output tests/utils.test.js tests/utils.test.js src/utils.js

# Target higher coverage
/improve-tests --target 95 tests/utils.test.js src/utils.js
```

## What It Analyzes

### Coverage Gaps
- Untested functions/methods
- Uncovered branches
- Missing edge cases
- Untested error paths

### Test Quality
- Assertion completeness
- Test isolation
- Setup/teardown adequacy
- Test readability

### Improvement Suggestions

#### Missing Test Categories
- Boundary value tests
- Error handling tests
- Integration scenarios
- Performance tests

#### Test Structure Improvements
- Better test descriptions
- Data-driven test patterns
- Parametrized tests
- Shared test utilities

## Output Example

```
Coverage Analysis for tests/utils.test.js:
==========================================
Overall Coverage: 72%
Functions: 85%
Branches: 65%
Lines: 78%

Improvement Suggestions:
========================
1. Add test for parseInput with empty string
2. Add test for parseInput with special characters
3. Add test for parseInput with unicode characters
4. Add test for parseInput with very long input
5. Add error handling test for invalid JSON

Missing Edge Cases:
- Empty string input
- Whitespace-only input
- Maximum length input
- Special character input
- Unicode emoji input
```

## Auto-Improvement Modes

### Suggestion Mode (default)
Shows what tests are missing without modifying files.

### Refactor Mode
Improves existing test structure and readability.

### Auto-Add Mode
Adds missing test cases to the test file.

## Best Practices

1. **Target 80%+ coverage** for business logic
2. **100% coverage** for security-critical code
3. **Test both success and failure** paths
4. **Use descriptive test names** explaining the scenario
5. **Keep tests isolated** - no dependencies between tests
6. **Use parametrized tests** for similar test cases
