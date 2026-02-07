---
description: Recommend specific refactoring strategies based on code analysis and technical debt assessment
triggers:
  - High complexity code detected
  - Code smells identified
  - Performance issues found
  - Design pattern violations
  - Maintainability concerns
  - Test coverage gaps
---

# Refactoring Recommender

Provides specific, actionable refactoring recommendations based on identified technical debt and code quality issues.

## When This Skill Activates

Claude will automatically invoke this skill when:

1. **Technical Debt Detected**
   - After identifying code smells
   - When complexity thresholds exceeded
   - Upon discovering design violations

2. **Quality Improvements Requested**
   - "How can I improve this code?"
   - "What's the best way to refactor this?"
   - "Can you suggest a better approach?"

3. **Performance Concerns**
   - Slow code identified
   - Inefficient algorithms found
   - Resource optimization needed

4. **Testability Issues**
   - Hard-to-test code
   - Missing test coverage
   - Test design improvements

## Refactoring Catalog

### 1. Composing Methods

**Extract Method**
- When: Method is too long or does too much
- Target: Methods >20 lines or multiple responsibilities
- Benefit: Improved readability, reusability, testability
```javascript
// Before
function processOrder(order) {
  if (!order) return null
  if (order.items.length === 0) return null
  const total = order.items.reduce((sum, item) => sum + item.price, 0)
  if (total > 1000) order.discount = total * 0.1
  else if (total > 500) order.discount = total * 0.05
  order.total = total - order.discount
  return order
}

// After
function processOrder(order) {
  if (!isValidOrder(order)) return null
  const total = calculateTotal(order.items)
  applyDiscount(order, total)
  order.total = total - order.discount
  return order
}
```

**Inline Method**
- When: Method's body is as clear as its name
- Benefit: Eliminate unnecessary indirection

**Extract Variable**
- When: Complex expression used multiple times
- Benefit: Improved clarity, easier debugging

**Inline Temp**
- When: Variable used only once, simple expression
- Benefit: Reduce unnecessary variables

**Replace Temp with Query**
- When: Temp variable holds result of expression
- Benefit: Eliminates duplicate code, enables Extract Method

**Introduce Explaining Variable**
- When: Complex conditional logic
- Benefit: Self-documenting code

**Split Temporary Variable**
- When: Variable reused for different purposes
- Benefit: Clear intent, prevents bugs

**Remove Assignments to Parameters**
- When: Reassigning function parameters
- Benefit: Clearer data flow

### 2. Moving Features Between Objects

**Move Method**
- When: Method uses another class more than its own
- Benefit: Better encapsulation, reduced coupling

**Move Field**
- When: Field used by another class more than its own
- Benefit: Improved cohesion

**Extract Class**
- When: Class does too much (God Class)
- Benefit: Single Responsibility, better organization

**Inline Class**
- When: Class does very little
- Benefit: Simplification

**Hide Delegate**
- When: Client calls delegate of delegate
- Benefit: Reduced coupling

**Remove Middle Man**
- When: Delegate only passes through
- Benefit: Simpler code

**Introduce Foreign Method**
- When: Need method in class that can't modify
- Benefit: Better encapsulation

**Introduce Local Extension**
- When: Need multiple methods in unchangeable class
- Benefit: Better organization

### 3. Organizing Data

**Self Encapsulate Field**
- When: Direct field access, need to control access
- Benefit: Enables subclasses to override behavior

**Replace Data Value with Object**
- When: Data item needs behavior/data
- Benefit: Rich domain model

**Change Value to Reference**
- When: Same instance used in multiple places
- Benefit: Memory efficiency, consistency

**Change Reference to Value**
- When: Reference objects not needed
- Benefit: Simplification

**Replace Array with Object**
- When: Array elements have different meanings
- Benefit: Clearer data structure

**Duplicate Observed Data**
- When: Domain data separate from GUI
- Benefit: Decoupling, synchronization

**Change Unidirectional Association to Bidirectional**
- When: Need navigation both ways
- Benefit: Convenience

**Change Bidirectional Association to Unidirectional**
- When: Bidirectional not needed
- Benefit: Reduced coupling

**Replace Magic Number with Constant**
- When: Unnamed numeric literal
- Benefit: Meaning, maintainability

**Replace Type Code with Class**
- When: Type code affects behavior
- Benefit: Type safety, rich behavior

**Replace Type Code with Subclasses**
- When: Type code varies behavior
- Benefit: Polymorphism, eliminates conditionals

**Replace Type Code with State/Strategy**
- When: Type code changes at runtime
- Benefit: Flexibility, Open/Closed Principle

**Replace Subclass with Fields**
- When: Subclasses only differ by data
- Benefit: Simplification

### 4. Simplifying Conditional Expressions

**Decompose Conditional**
- When: Complex conditional logic
- Benefit: Extract to named methods

**Consolidate Conditional Expression**
- When: Multiple tests with same result
- Benefit: Eliminate duplication

**Consolidate Duplicate Conditional Fragments**
- When: Same code in all branches
- Benefit: Reduce duplication

**Replace Nested Conditional with Guard Clauses**
- When: Deep nesting for special cases
- Benefit: Improved readability

**Replace Conditional with Polymorphism**
- When: Switch on type
- Benefit: Eliminates conditionals, extensibility

**Introduce Null Object**
- When: Frequent null checks
- Benefit: Eliminates null checks

**Introduce Assertion**
- When: Assumptions need to be explicit
- Benefit: Fail-fast, better errors

### 5. Simplifying Method Calls

**Rename Method**
- When: Name doesn't express intent
- Benefit: Self-documenting code

**Add Parameter**
- When: Method needs more information
- Benefit: Completeness

**Remove Parameter**
- When: Parameter not used
- Benefit: Simplicity

**Separate Query from Modifier**
- When: Method both queries and modifies
- Benefit: Command-Query Separation

**Parameterize Method**
- When: Similar methods differ by value
- Benefit: Eliminate duplication

**Replace Parameter with Explicit Methods**
- When: Parameter controls selection
- Benefit: Clearer intent

**Preserve Whole Object**
- When: Getting values from object to pass
- Benefit: Better encapsulation

**Replace Parameter with Methods**
- When: Parameter can be calculated
- Benefit: Reduced parameter count

**Introduce Parameter Object**
- When: Related parameters group together
- Benefit: Improved clarity, reduces parameter count

**Remove Setting Method**
- When: Field shouldn't change
- Benefit: Immutability, safety

**Hide Method**
- When: Method not used externally
- Benefit: Encapsulation

**Replace Constructor with Factory Method**
- When: Constructor has complex logic
- Benefit: Flexibility, descriptive names

**Encapsulate Downcast**
- When: Downcasting in client code
- Benefit: Better encapsulation

**Replace Error Code with Exception**
- When: Returning error codes
- Benefit: Explicit error handling

**Replace Exception with Test**
- When: Exceptions used for expected cases
- Benefit: Performance, clarity

### 6. Dealing with Generalization

**Pull Up Method**
- When: Duplicated method in subclasses
- Benefit: Eliminate duplication

**Pull Up Field**
- When: Duplicated field in subclasses
- Benefit: Eliminate duplication

**Pull Up Constructor Body**
- When: Subclass constructors similar
- Benefit: Eliminate duplication

**Push Down Method**
- When: Method only used by some subclasses
- Benefit: Better separation

**Push Down Field**
- When: Field only used by some subclasses
- Benefit: Better separation

**Extract Subclass**
- When: Class has features used only sometimes
- Benefit: Better organization

**Extract Superclass**
- When: Classes share common features
- Benefit: Eliminate duplication

**Extract Interface**
- When: Multiple classes implement same methods
- Benefit: Polymorphism, decoupling

**Collapse Hierarchy**
- When: Superclass and subclass not very different
- Benefit: Simplification

**Form Template Method**
- When: Subclasses have similar steps
- Benefit: Consistency, reuse

**Replace Inheritance with Delegation**
- When: Inheritance not appropriate
- Benefit: Flexibility, composition

**Replace Delegation with Inheritance**
- When: Delegation complexity not worth it
- Benefit: Simplification

## Recommendation Process

### 1. Analyze Code Context
- Understand current code structure
- Identify specific problems
- Consider project constraints

### 2. Select Appropriate Refactoring
- Match refactoring to problem type
- Consider impact and effort
- Evaluate alternatives

### 3. Provide Implementation Guide
- Show before/after code
- Explain step-by-step process
- Highlight risks and considerations

### 4. Suggest Testing Strategy
- What tests to write
- How to verify refactoring
- Regression testing approach

## Recommendation Format

```markdown
## Refactoring Recommendation: Extract Payment Processing

**Current Issue:**
The `CheckoutController` class handles payment processing, inventory updates, and shipping notifications all in one 400-line method. This makes the code hard to test, modify, and understand.

**Recommended Refactoring: Extract Class + Move Method**

**Steps:**
1. Create new `PaymentService` class
2. Move payment logic to new service
3. Update `CheckoutController` to use service
4. Add tests for `PaymentService`
5. Verify checkout still works

**Before:**
```javascript
class CheckoutController {
  processCheckout(cart, payment) {
    // 50 lines of payment logic
    // 30 lines of inventory logic
    // 20 lines of shipping logic
  }
}
```

**After:**
```javascript
class CheckoutController {
  constructor(paymentService, inventoryService, shippingService) {
    this.payment = paymentService
    this.inventory = inventoryService
    this.shipping = shippingService
  }

  async processCheckout(cart, payment) {
    await this.payment.process(payment)
    await this.inventory.update(cart.items)
    await this.shipping.notify(cart.shipping)
  }
}
```

**Benefits:**
• Single Responsibility: Each class has one job
• Testability: Each service can be tested independently
• Reusability: Services can be used elsewhere
• Maintainability: Changes isolated to specific service

**Testing Strategy:**
1. Unit test `PaymentService` with mock payment gateway
2. Unit test `CheckoutController` with mock services
3. Integration test for full checkout flow
4. Regression test existing checkout scenarios

**Estimated Effort:** 4 hours
**Risk:** Medium (requires careful testing)
**Impact:** High (significantly improves code quality)
```

## Advanced Refactorings

### Large-Scale Restructuring
- **Microservices Extraction**: Extract bounded contexts
- **Layered Architecture**: Introduce clear layering
- **CQRS**: Separate read and write models
- **Event Sourcing**: Store events instead of state

### Performance Optimization
- **Lazy Loading**: Defer computation until needed
- **Caching**: Store expensive computations
- **Batching**: Group operations together
- **Async Processing**: Use non-blocking operations

### Security Improvements
- **Input Sanitization**: Add validation layers
- **Authorization**: Enforce access controls
- **Secure Defaults**: Eliminate security by obscurity
- **Audit Logging**: Track sensitive operations

## Best Practices

1. **Small Steps**: One refactoring at a time
2. **Test Coverage**: Never refactor without tests
3. **Continuous Integration**: Run tests after each change
4. **Code Review**: Have others review refactorings
5. **Documentation**: Update docs to reflect changes

## Anti-Patterns to Avoid

1. **Big Bang Refactoring**: Rewriting everything at once
2. **Refactoring Without Tests**: Risk of introducing bugs
3. **Premature Optimization**: Refactor for actual problems, not hypothetical
4. **Over-Engineering**: Don't add unnecessary abstraction
5. **Ignoring Context**: Consider project size and team size
