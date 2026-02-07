---
description: Analyze code coverage reports and identify gaps in test coverage
invocationKeywords:
  - code coverage
  - test coverage
  - coverage gaps
  - untested code
  - coverage analysis
---

# Coverage Analyzer Skill

Analyze code coverage to identify untested code and suggest improvements.

## Overview

This skill examines coverage reports and code to identify coverage gaps, prioritize testing efforts, and recommend specific test cases.

## When It Activates

The skill activates when you:

- Request coverage analysis
- Ask about untested code
- Want to improve coverage percentages
- Need coverage reports

## Coverage Metrics Analyzed

### Statement Coverage
```
✓ Covered: if (user.isValid) { ... }
✗ Not covered: else { ... }
```

### Branch Coverage
```
✓ Both branches tested:
  if (type === 'admin') { ... }
  else { ... }

✗ Only one branch tested:
  if (isLoading) { ... }
  // else branch never executed
```

### Function Coverage
```
✓ Tested: validateEmail()
✗ Not tested: sanitizeInput()
```

### Line Coverage
```
Coverage by file:
✓ utils/helpers.js: 95%
✗ services/api.js: 45%
✗ models/user.js: 60%
```

## Analysis Output

### Coverage Report
```
Coverage Summary
━━━━━━━━━━━━━━━━
File              | Statements | Branch | Functions | Lines
──────────────────┼─────────────┼────────┼───────────┼──────
utils/helpers.js  | 95%        | 90%    | 100%      | 95%
services/api.js   | 45% ⚠️     | 30%    | 50%       | 45%
models/user.js    | 60%        | 55%    | 67%       | 60%
──────────────────┼─────────────┼────────┼───────────┼──────
Total             | 72%        | 65%    | 78%       | 71%

Threshold: 80%
Status: FAILED
```

### Gap Analysis

**Critical Gaps** (High priority)
```
services/api.js:45-67
  Branch not covered: error handling in fetchData()
  Impact: Unhandled error scenarios
  Recommendation: Add test for network errors

models/user.js:123
  Function not covered: deleteAccount()
  Impact: Critical business logic untested
  Recommendation: Test account deletion flow
```

**Moderate Gaps** (Medium priority)
```
utils/format.js:89
  Edge case not covered: empty string input
  Recommendation: Add test for empty input validation
```

**Minor Gaps** (Low priority)
```
components/button.js:15
  Optional feature not tested: disabled state
  Recommendation: Test if button displays correctly when disabled
```

## Prioritization Matrix

| Impact | Coverage | Priority |
|--------|----------|----------|
| Critical | <50% | 🔴 Immediate |
| High | 50-70% | 🟠 High |
| Medium | 70-85% | 🟡 Medium |
| Low | >85% | 🟢 Low |

## Recommendations Generated

### Test Suggestions
```javascript
// Untested branch found in services/api.js:47
describe('API.fetchData', () => {
  // Existing test
  it('should fetch data successfully', async () => {
    // ...
  });

  // Suggested test
  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    await expect(API.fetchData()).rejects.toThrow('Network error');
  });

  it('should handle timeout errors', async () => {
    // Test timeout scenario
  });
});
```

### Coverage Improvement Strategy

**Quick Wins** (Easy, high impact)
1. Add tests for error handling branches
2. Test edge cases (null, empty, boundary values)
3. Cover validation functions

**Strategic Investments** (Medium effort, high impact)
1. Test integration points
2. Cover async operations
3. Test error recovery paths

**Long Term** (Comprehensive coverage)
1. End-to-end scenario testing
2. Performance testing
3. Chaos engineering

## Coverage Heatmap

```
File: services/payment.js

1  ✓ processPayment() {                     100%
2  ✓   if (!this.validate()) {               100%
3  ✗     throw new Error('Invalid');         0%
4  ✓   }                                     100%
5  ✓   const result = await this.charge();   100%
6  ✗   if (result.status === 'failed') {     0%
7  ✗     this.retry();                       0%
8  ✗   }                                     0%
9  ✓   return result;                        100%
10 }                                         100%

Missing coverage:
- Line 3: Error throwing (need invalid input test)
- Lines 6-8: Failure handling (need failure scenario test)
```

## Coverage Trends

```
Coverage History
━━━━━━━━━━━━━━━━
Date        | Coverage | Change | Tests
────────────┼──────────┼────────┼──────
2025-01-17  | 72%      | +2%    | 245
2025-01-16  | 70%      | +5%    | 238
2025-01-15  | 65%      | -1%    | 230
2025-01-14  | 66%      | +3%    | 225

Trend: Improving ✓
Velocity: +2.3% per day
Est. to reach 80%: 4 days
```

## Framework Support

Works with coverage reports from:
- Istanbul/nyc (JavaScript)
- Coverage.py (Python)
- JaCoCo (Java)
- Go cover (Go)
- dotCover (C#)

## Usage Examples

> Analyze coverage for my entire project

> Find all untested code in the payment module

> Show me coverage gaps in services/api.js

> What tests do I need to reach 80% coverage?

> Generate tests for all uncovered branches

## Best Practices Enforced

1. **Meaningful Coverage** - Focus on critical paths, not just percentage
2. **Branch Coverage** - Prefer over line coverage for better quality
3. **Trend Monitoring** - Track coverage over time
4. **Threshold Enforcement** - Fail builds when coverage drops
5. **Incremental Improvement** - Add coverage with new features
