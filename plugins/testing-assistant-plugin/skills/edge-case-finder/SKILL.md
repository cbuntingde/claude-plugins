---
name: edge-case-finder
description: Identifies edge cases, boundary conditions, and potential failure points in code
invocation:
  automatic:
    - When analyzing code for testing gaps
    - When reviewing test coverage
    - When user asks about edge cases or boundary conditions
  manual:
    - "/edge-cases <file/function>"
    - "/find-edges"
---

# Edge Case Finder

Systematically discovers edge cases, boundary conditions, and corner cases that could cause failures, security issues, or unexpected behavior.

## Edge Case Categories

### 1. **Boundary Conditions**
- Numeric limits: INT_MIN, INT_MAX, zero, negative numbers
- Collection boundaries: empty, single item, max capacity
- String boundaries: empty string, single character, max length
- Date/time boundaries: epoch, leap years, timezone transitions

### 2. **Null and Undefined Inputs**
- Null/None/undefined values
- Empty arrays/collections
- Missing object properties
- Optional parameters not provided

### 3. **Data Type Edge Cases**
- Type coercion scenarios
- Mixed types in collections
- Numeric overflow/underflow
- Floating point precision issues
- Unicode and encoding issues

### 4. **State-Related Cases**
- Initial/uninitialized state
- Concurrent modification
- Resource exhaustion (memory, disk space)
- Transaction rollback scenarios

### 5. **Integration Edge Cases**
- Network timeouts and failures
- API rate limits
- Database connection issues
- File system errors
- External service unavailability

### 6. **Security Edge Cases**
- SQL injection patterns
- XSS attack vectors
- Path traversal attempts
- Buffer overflow conditions
- Authentication/authorization edge cases

## Analysis Process

1. **Input Analysis**: Examine all function inputs and their constraints
2. **State Analysis**: Identify state variables and transitions
3. **Dependency Analysis**: Map external dependencies and failure modes
4. **Data Flow Analysis**: Trace data transformations and potential issues
5. **Concurrency Analysis**: Identify race conditions and synchronization issues
6. **Resource Analysis**: Check resource management and cleanup

## Output Format

For each identified edge case, provides:
- **Description**: Clear explanation of the edge case
- **Trigger**: What conditions cause this edge case
- **Impact**: Potential consequences (crash, data loss, security issue)
- **Test Example**: Concrete test case to verify handling
- **Recommendation**: How to handle or prevent the issue

## Example

**Input**: A function that processes user payments

**Edge Cases Identified**:
- Payment amount of exactly 0.00
- Negative payment amounts
- Payment amount exceeding maximum allowed
- Payment with currency conversion at exact boundary rates
- Concurrent payment attempts for same invoice
- Payment processing during system maintenance window
- Payment with expired credit card (but card number valid)
- Payment amount with more than 2 decimal places

## Best Practices

- Always test at boundaries (0, 1, max, max+1)
- Test with all possible null/undefined combinations
- Consider concurrent access patterns
- Include negative test cases
- Test resource exhaustion scenarios
- Verify error handling and messages
- Check for timing-related issues
