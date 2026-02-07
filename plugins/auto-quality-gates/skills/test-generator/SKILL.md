---
description: Generate comprehensive unit tests automatically from code analysis
invocationKeywords:
  - generate tests
  - write unit tests
  - create test cases
  - test coverage
  - automated testing
---

# Test Generator Skill

Automatically generate comprehensive unit tests for your codebase.

## Overview

This skill analyzes your code and generates production-ready unit tests that follow best practices and provide meaningful coverage.

## When It Activates

The skill activates when you:

- Ask to generate tests for a file or function
- Request test coverage improvements
- Need tests for new code
- Want to test edge cases

## What It Generates

### Test Structure
```javascript
describe('UserService', () => {
  describe('authenticate', () => {
    it('should authenticate valid credentials', async () => {
      // Arrange
      const mockUser = { id: 1, email: 'test@example.com' };
      User.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await UserService.authenticate('test@example.com', 'password');

      // Assert
      expect(result).toEqual(mockUser);
      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw error for invalid credentials', async () => {
      // Test implementation
    });

    it('should handle database errors', async () => {
      // Test implementation
    });
  });
});
```

### Test Categories

1. **Happy Path Tests** - Normal operation scenarios
2. **Edge Cases** - Boundary conditions and limits
3. **Error Cases** - Exception handling
4. **Integration Tests** - Multiple component interaction
5. **Performance Tests** - Load and stress testing

### Coverage Generated

- Unit tests for individual functions
- Integration tests for component interactions
- Mock and stub implementations
- Test data factories
- Test fixtures and utilities

## Testing Patterns

### AAA Pattern (Arrange-Act-Assert)
```javascript
it('calculates total with tax', () => {
  // Arrange
  const subtotal = 100;
  const taxRate = 0.1;

  // Act
  const total = Calculator.calculateTotal(subtotal, taxRate);

  // Assert
  expect(total).toBe(110);
});
```

### Given-When-Then Pattern
```javascript
it('updates user profile', () => {
  // Given
  const user = createUser();
  const updates = { name: 'New Name' };

  // When
  user.update(updates);

  // Then
  expect(user.name).toBe('New Name');
});
```

## Mock Generation

Automatically generates mocks for:
- Database queries
- API calls
- External services
- File system operations
- Time-dependent functions

### Example Mock
```javascript
jest.mock('./database');
const Database = require('./database');

Database.query.mockImplementation((query) => {
  if (query.includes('SELECT')) {
    return Promise.resolve([{ id: 1, name: 'Test' }]);
  }
  return Promise.reject(new Error('Query failed'));
});
```

## Test Data Generation

Creates realistic test data using:
- Factory pattern
- Faker library integration
- Domain-specific data generators
- Edge case data sets

### Factory Example
```javascript
const UserFactory = {
  build: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
  }),

  buildList: (count, overrides) =>
    Array.from({ length: count }, () => UserFactory.build(overrides))
});
```

## Framework Support

Automatically adapts to your testing framework:
- Jest / Vitest
- pytest / unittest
- JUnit / TestNG
- Go testing package
- RSpec

## Usage Examples

> Generate tests for the UserService class

> Create unit tests for all functions in utils.js

> Add test coverage for the payment processing module

> Write tests covering edge cases for the validation function

## Notes

- Tests follow AAA pattern for clarity
- Includes descriptive test names
- Generates appropriate mocks and stubs
- Covers success and failure scenarios
- Includes edge cases and boundary conditions
- Follows framework-specific conventions
