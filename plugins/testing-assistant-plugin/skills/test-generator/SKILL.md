---
name: test-generator
description: Automatically generate comprehensive test cases for functions, classes, and modules
invocation:
  automatic:
    - When user asks to write tests for code
    - When user mentions test coverage or testing
    - When implementing new features that need tests
  manual:
    - "/test-generate <file/function>"
    - "/gen-tests"
---

# Test Generator

Automatically generates comprehensive test suites for any code, analyzing the implementation to create thorough test coverage.

## How It Works

1. Analyzes the target code structure, inputs, outputs, and behavior
2. Identifies normal operations, edge cases, and error conditions
3. Determines the appropriate testing framework for the language
4. Generates clear, maintainable test cases with proper assertions
5. Includes setup, teardown, and mocking as needed
6. Adds descriptive test names and documentation

## Test Coverage Includes

- **Happy path tests**: Normal operations with valid inputs
- **Boundary tests**: Min/max values, empty collections, single items
- **Error handling**: Invalid inputs, null/undefined values, error conditions
- **Integration points**: Interactions with dependencies, databases, APIs
- **State transitions**: Before/after states, side effects
- **Performance cases**: Large inputs, concurrent operations

## Example Usage

**User**: "Generate tests for the UserValidator class"
**Skill**: Creates comprehensive test suite covering:
- Valid user data
- Invalid email formats
- Missing required fields
- Boundary conditions for username/password lengths
- Duplicate username handling

## Best Practices

- Tests should be independent and isolated
- Use descriptive test names that explain what is being tested
- Arrange-Act-Assert pattern for clarity
- Mock external dependencies appropriately
- Include both positive and negative test cases
- Test error messages and error codes
- Consider performance and security implications

## Framework Support

Works with:
- JavaScript/TypeScript: Jest, Mocha, Vitest, Jasmine
- Python: pytest, unittest, nose2
- Java: JUnit, TestNG
- Go: testing package, testify
- C#: NUnit, xUnit, MSTest
- Ruby: RSpec, Minitest
- PHP: PHPUnit
- And many more...
