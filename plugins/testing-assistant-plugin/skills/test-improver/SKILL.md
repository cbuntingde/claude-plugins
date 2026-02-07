---
name: test-improver
description: Analyzes and improves existing test suites for better coverage, clarity, and maintainability
invocation:
  automatic:
    - When reviewing existing tests
    - When user asks about test quality
    - When tests are failing or flaky
  manual:
    - "/improve-tests <file>"
    - "/review-tests"
---

# Test Improver

Analyzes existing test suites and provides actionable recommendations to improve test quality, coverage, clarity, and maintainability.

## Analysis Dimensions

### 1. **Coverage Gaps**
- Uncovered code paths and branches
- Missing edge case tests
- Inadequate error condition testing
- Integration scenarios not tested

### 2. **Test Quality**
- Clarity and readability of test code
- Appropriate use of assertions
- Proper test isolation and independence
- Descriptive test names and documentation

### 3. **Maintainability**
- Code duplication across tests
- Proper use of test helpers and fixtures
- Appropriate abstraction levels
- Clear test organization and structure

### 4. **Test Reliability**
- Flaky test identification
- Race conditions and timing issues
- Brittle test dependencies
- Proper mocking and stubbing

### 5. **Performance**
- Slow-running tests
- Inefficient setup/teardown
- Unnecessary I/O operations
- Optimal test parallelization opportunities

## Improvement Recommendations

### Coverage Improvements
- Add tests for uncovered branches
- Include edge case scenarios
- Test error conditions explicitly
- Add integration tests where appropriate

### Code Quality Improvements
- Replace magic numbers with named constants
- Extract common setup into fixtures/hooks
- Use more descriptive test names
- Add comments explaining complex scenarios
- Follow Arrange-Act-Assert pattern consistently

### Structural Improvements
- Group related tests logically
- Create parameterized tests for similar scenarios
- Use test helpers to reduce duplication
- Separate unit tests from integration tests
- Implement proper test hierarchy

### Reliability Improvements
- Fix race conditions with proper synchronization
- Replace brittle selectors/locators with stable alternatives
- Implement proper wait strategies
- Add retry logic for transient failures
- Mock external dependencies appropriately

## Example Analysis

**Before**:
```javascript
test('user', () => {
  let u = new User();
  u.name = 'John';
  expect(u.validate()).toBe(true);
});
```

**Issues Identified**:
- Test name doesn't describe what's being tested
- Missing edge cases (empty name, very long name)
- No test for invalid input
- Tests for name validation only, not other fields

**After**:
```javascript
describe('User validation', () => {
  test('should validate user with valid name', () => {
    const user = new User({ name: 'John Doe' });
    expect(user.validate()).toBe(true);
  });

  test('should reject user with empty name', () => {
    const user = new User({ name: '' });
    expect(user.validate()).toBe(false);
  });

  test('should reject user with name exceeding max length', () => {
    const user = new User({ name: 'a'.repeat(256) });
    expect(user.validate()).toBe(false);
  });
});
```

## Metrics to Track

- Code coverage percentage (target: >80%)
- Branch coverage percentage
- Number of flaky tests
- Test execution time
- Test failure rate
- Code duplication in tests
- Average test complexity

## Best Practices

- **One assertion per test** when possible
- **Descriptive test names** that read like documentation
- **Test independence** - tests shouldn't depend on each other
- **Fast feedback** - unit tests should run quickly
- **Clear failure messages** - make it obvious what failed
- **Test the behavior, not implementation** - focus on outcomes
- **Keep tests simple** - complex tests are hard to maintain
- **Review tests regularly** - they need maintenance too
