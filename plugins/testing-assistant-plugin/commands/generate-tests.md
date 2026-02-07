---
description: Generate comprehensive test cases for the provided code
---

# /generate-tests

Generates comprehensive test cases for the provided code, including happy path, edge cases, and error scenarios.

## Usage

```bash
/generate-tests [options] <file|code>
```

## Options

| Option | Description |
|--------|-------------|
| `--framework <name>` | Test framework: `jest`, `mocha`, `vitest` (default: `jest`) |
| `--coverage <number>` | Target coverage percentage (default: 80) |
| `--include-happy-path` | Include happy path tests (default: true) |
| `--include-edge-cases` | Include edge case tests (default: true) |
| `--include-error-cases` | Include error handling tests (default: true) |
| `--output <file>` | Output file path (default: stdout) |
| `--no-comments` | Skip explanatory comments in generated tests |
| `--verbose` | Show detailed generation progress |

## Examples

```bash
# Generate tests for a single file
/generate-tests src/utils.js

# Generate with specific framework and coverage
/generate-tests --framework vitest --coverage 90 src/utils.js

# Generate and save to file
/generate-tests --output tests/utils.test.js src/utils.js

# Generate only edge case tests
/generate-tests --no-happy-path --include-edge-cases src/utils.js
```

## Generated Test Structure

### Happy Path Tests
- Normal input scenarios
- Typical use cases
- Expected behavior verification

### Edge Case Tests
- Boundary value scenarios
- Empty/null/undefined inputs
- Type edge cases
- Large data sets

### Error Handling Tests
- Invalid input validation
- Exception throwing
- Error message verification
- Recovery scenarios

## Framework-Specific Features

### Jest
- Uses `describe()` for test suites
- `test()` or `it()` for test cases
- `expect()` for assertions
- `beforeEach()`/`afterEach()` for setup/teardown

### Mocha
- Uses `describe()` for test suites
- `it()` for test cases
- `assert` or `expect` for assertions
- `before()`/`after()` for setup/teardown

### Vitest
- Same as Jest API
- Native ESM support
- Faster execution

## Output Example

```javascript
describe('utils', () => {
  describe('parseInput', () => {
    // Happy path
    it('should parse valid input correctly', () => {
      const result = parseInput('test-value');
      expect(result).toEqual({ value: 'test-value' });
    });

    // Edge cases
    it('should handle empty string', () => {
      const result = parseInput('');
      expect(result).toEqual({ value: '' });
    });

    it('should handle null input', () => {
      const result = parseInput(null);
      expect(result).toBeNull();
    });

    // Error cases
    it('should throw on invalid type', () => {
      expect(() => parseInput(123)).toThrow(TypeError);
    });
  });
});
