---
description: Apply appropriate design patterns to improve code structure, maintainability, and extensibility
usage: "/apply-pattern [--pattern <pattern-name>] [--scope <selection|file|directory>] [--confidence <conservative|moderate>]"
examples:
  - "/apply-pattern --pattern strategy --scope selection"
  - "/apply-pattern --pattern repository --scope directory --confidence moderate"
  - "/apply-pattern"
tags: ["design-patterns", "architecture", "code-structure", "maintainability"]
---

# Apply Pattern

Intelligently apply design patterns to improve code architecture while maintaining existing functionality.

## What it does

This command analyzes code structure and suggests appropriate design patterns to address architectural issues like:

- **Tight coupling**: Introduce dependency injection, factory patterns
- **Duplicate logic**: Apply template method, strategy patterns
- **Complex conditionals**: Use chain of responsibility, command patterns
- **Hard-to-test code**: Introduce dependency inversion, proxy patterns
- **Scattered configuration**: Apply builder, configuration patterns

## Supported patterns

### Creational Patterns
- **Factory Method**: Centralize object creation logic
- **Builder**: Construct complex objects step-by-step
- **Singleton**: Ensure single instance (when appropriate)
- **Prototype**: Clone objects instead of creating from scratch

### Structural Patterns
- **Adapter**: Make incompatible interfaces work together
- **Decorator**: Add behavior dynamically
- **Facade**: Provide simplified interface to complex systems
- **Proxy**: Control access to objects
- **Composite**: Treat individual objects and compositions uniformly

### Behavioral Patterns
- **Strategy**: Encapsulate interchangeable algorithms
- **Observer**: Implement publish-subscribe messaging
- **Command**: Encapsulate requests as objects
- **Template Method**: Define algorithm skeleton, let subclasses override steps
- **Chain of Responsibility**: Pass requests along a chain of handlers
- **State**: Allow object to change behavior when internal state changes

### Architecture Patterns
- **Repository**: Abstract data access logic
- **Dependency Injection**: Invert dependencies for better testability
- **Middleware**: Process requests through a pipeline
- **Service Layer**: Separate business logic from presentation

## How it works

1. **Analysis phase**: Examines code structure and relationships
2. **Pattern matching**: Identifies where patterns would improve design
3. **Impact assessment**: Evaluates benefits, costs, and risks
4. **Proposal phase**: Presents pattern applications with code examples
5. **Refactoring phase**: Applies pattern with incremental changes
6. **Validation phase**: Ensures behavior is preserved

## Options

- `--pattern`: Specific pattern to apply (optional)
  - If not specified, analyzes and suggests appropriate patterns
  - Examples: `strategy`, `factory`, `repository`, `observer`

- `--scope`: Where to apply the pattern
  - `selection`: Apply to selected code (default)
  - `file`: Apply to entire file
  - `directory`: Apply to all files in directory

- `--confidence`: Application confidence level
  - `conservative`: Only suggest clear, safe applications (default)
  - `moderate`: Include patterns with moderate complexity

## Examples

### Strategy Pattern: Replace conditional logic

```typescript
// Before: Complex conditional
function calculateDiscount(customer, order) {
  if (customer.type === 'regular') {
    return order.total * 0.05;
  } else if (customer.type === 'premium') {
    return order.total * 0.10;
  } else if (customer.type === 'vip') {
    return order.total * 0.15;
  } else if (customer.type === 'employee') {
    return order.total * 0.20;
  }
}

// After: Strategy pattern
interface DiscountStrategy {
  calculate(order: Order): number;
}

class RegularDiscount implements DiscountStrategy {
  calculate(order: Order): number {
    return order.total * 0.05;
  }
}

class PremiumDiscount implements DiscountStrategy {
  calculate(order: Order): number {
    return order.total * 0.10;
  }
}

// Usage
const discount = customer.discountStrategy.calculate(order);
```

### Repository Pattern: Abstract data access

```python
# Before: Direct database calls scattered everywhere
class UserService:
    def get_user(self, user_id):
        return db.query('SELECT * FROM users WHERE id = ?', user_id)

class OrderService:
    def get_user_orders(self, user_id):
        return db.query('SELECT * FROM orders WHERE user_id = ?', user_id)

# After: Repository pattern
class UserRepository(ABC):
    @abstractmethod
    def find_by_id(self, user_id): pass

    @abstractmethod
    def find_all(self): pass

class SQLUserRepository(UserRepository):
    def find_by_id(self, user_id):
        return db.query('SELECT * FROM users WHERE id = ?', user_id)

# Usage
user = user_repository.find_by_id(user_id)
orders = order_repository.find_by_user(user_id)
```

### Factory Pattern: Centralize object creation

```java
// Before: Direct instantiation scattered
public class PaymentProcessor {
    public void processPayment(String type, double amount) {
        if (type.equals("creditcard")) {
            CreditCardPayment payment = new CreditCardPayment();
            payment.process(amount);
        } else if (type.equals("paypal")) {
            PayPalPayment payment = new PayPalPayment();
            payment.process(amount);
        }
    }
}

// After: Factory pattern
public interface Payment {
    void process(double amount);
}

public class PaymentFactory {
    public static Payment createPayment(String type) {
        return switch (type.toLowerCase()) {
            case "creditcard" -> new CreditCardPayment();
            case "paypal" -> new PayPalPayment();
            default -> throw new IllegalArgumentException("Unknown payment type");
        };
    }
}

// Usage
Payment payment = PaymentFactory.createPayment(type);
payment.process(amount);
```

## What you'll see

```
🔍 Analyzing code for pattern opportunities...

Found 4 pattern application opportunities:

1. [HIGH VALUE] Strategy Pattern for payment processing
   📍 Location: services/payment-processor.ts:45-89
   🎯 Problem: Complex conditional logic that changes frequently
   💡 Solution: Extract payment strategies for each payment type
   📊 Impact:
      - Extensibility: Add new payment types without modifying existing code
      - Testability: Test each payment strategy independently
      - Maintainability: Each strategy is self-contained
   ⚠️  Risk: Medium - requires refactoring payment flow
   🔧 Complexity: Moderate (~2 hours)

2. [MEDIUM VALUE] Repository Pattern for data access
   📍 Location: services/user-service.ts, services/auth-service.ts
   🎯 Problem: Database queries scattered across services
   💡 Solution: Create repository layer to abstract data access
   📊 Impact:
      - Testability: Mock repositories for testing
      - Flexibility: Switch data sources without changing business logic
   ⚠️  Risk: Low - preserves existing behavior
   🔧 Complexity: Low (~1 hour)

Apply which patterns? (all/specific/none)
```

## Pattern selection criteria

The command evaluates patterns based on:

1. **Frequency of change**: How often does this code change?
2. **Complexity**: How complex is the current implementation?
3. **Coupling**: How tightly is this code coupled to other components?
4. **Test coverage**: Are there tests to validate the refactoring?
5. **Team familiarity**: Is the team familiar with this pattern?

## Best practices

- Start with simple patterns before complex ones
- Apply patterns to solve real problems, not for the sake of it
- Ensure tests exist before applying patterns
- Document why the pattern was applied
- Consider team familiarity and codebase consistency
- Don't force patterns where they don't fit

## When NOT to apply patterns

- Simple code that doesn't change often
- One-off implementations without reuse potential
- Performance-critical code where pattern overhead matters
- Code that's already well-structured
- Over-engineering simple problems

## Risk assessment

- **LOW**: Simple extraction, well-tested code, minimal dependencies
- **MEDIUM**: Moderate complexity, some dependencies, good test coverage
- **HIGH**: Complex extraction, many dependencies, limited test coverage

## See also

- `/extract-duplication`: Remove code duplication before applying patterns
- `/modernize-code`: Update syntax before structural changes
- `/analyze-refactor-opportunities`: Get comprehensive refactoring analysis
