---
description: Automatically analyzes code complexity and suggests refactoring opportunities
invocation:
  - When code is being written or modified
  - During code review discussions
  - When refactoring is mentioned
  - When technical debt is discussed
  - When code quality concerns are raised
---

# Complexity Check

Automatically analyzes code complexity metrics and provides refactoring recommendations to improve maintainability.

## When This Skill Activates

Claude will automatically invoke this skill when:

- You're writing or modifying functions
- Code review or quality is discussed
- Refactoring is mentioned or requested
- Technical debt analysis is needed
- Complexity concerns are raised
- Maintainability questions come up

## What It Analyzes

This skill evaluates code across multiple complexity dimensions:

### Cyclomatic Complexity
- Counts decision points (if, for, while, case, catch, etc.)
- Measures the number of independent paths through code
- Higher values = more test cases needed = harder to maintain

### Cognitive Complexity
- Evaluates how hard code is for humans to understand
- Penalizes nesting, control flow breaks, and hidden flows
- Better predictor of maintenance effort than cyclomatic complexity

### Code Smells
- **Long methods**: Functions exceeding 50 lines
- **Deep nesting**: More than 4 indentation levels
- **Parameter lists**: More than 5 parameters
- **Complex conditionals**: Multiple nested or chained conditions
- **Duplicate code**: Repeated patterns that could be extracted

## How It Works

1. **Context Detection**: Identifies when complexity analysis is relevant
2. **Code Analysis**: Parses and analyzes target code
3. **Metric Calculation**: Computes complexity metrics
4. **Threshold Evaluation**: Compares against best-practice thresholds
5. **Recommendation Generation**: Provides specific, actionable suggestions
6. **Code Examples**: Shows before/after refactoring examples

## Output Format

```markdown
🔍 **Complexity Analysis**

Function: `processUserData` (src/user.js:45-120)
- Cyclomatic Complexity: **24** ⚠️ (High - threshold: 15)
- Cognitive Complexity: **18** ⚠️ (High)
- Lines: 75
- Nesting: 5 levels
- Parameters: 4

**Issues:**
1. High cyclomatic complexity indicates many decision paths
2. Deep nesting makes code hard to follow
3. Multiple responsibilities detected

**Refactoring Recommendations:**

1️⃣ **Extract Method Pattern**
   Break into smaller, focused functions:
   ```javascript
   // Before
   function processUserData(user) {
     // 75 lines of complex logic
   }

   // After
   function processUserData(user) {
     validateUser(user);
     const data = extractUserData(user);
     return transformData(data);
   }
   ```

2️⃣ **Early Returns to Reduce Nesting**
   ```javascript
   // Before
   if (user) {
     if (user.active) {
       if (user.hasPermission) {
         // do work
       }
     }
   }

   // After
   if (!user) return;
   if (!user.active) return;
   if (!user.hasPermission) return;
   // do work
   ```

3️⃣ **Strategy Pattern for Complex Logic**
   Replace complex conditionals with strategy objects

**Impact:**
- ✅ Reduced cyclomatic complexity: 24 → 8
- ✅ Improved readability
- ✅ Easier to test
- ✅ Better maintainability
```

## Complexity Thresholds

| Metric | Good | Moderate | High | Critical |
|--------|------|----------|------|----------|
| Cyclomatic | 1-10 | 11-20 | 21-50 | 50+ |
| Cognitive | 1-10 | 11-20 | 21-50 | 50+ |
| Lines | 1-25 | 26-50 | 51-100 | 100+ |
| Nesting | 1-2 | 3 | 4 | 5+ |
| Parameters | 1-3 | 4-5 | 6-8 | 9+ |

## Best Practices

✅ **Aim for:**
- Functions with single responsibility
- Cyclomatic complexity under 15
- Nesting depth of 3 or less
- 5 or fewer parameters
- Under 50 lines per function

❌ **Avoid:**
- God functions that do everything
- Arrow-shaped code (deep nesting)
- Magic numbers and strings
- Duplicate code patterns
- Complex boolean expressions

## Common Refactoring Patterns

### Extract Method
Break large functions into smaller, named pieces:

```python
# Before
def process_order(order):
    # 80 lines of validation, processing, and notification

# After
def process_order(order):
    validate_order(order)
    items = process_items(order.items)
    send_notification(order)
```

### Guard Clauses
Replace nested conditions with early returns:

```javascript
// Before
function calculateDiscount(user, cart) {
  if (user) {
    if (user.isActive) {
      if (cart.total > 100) {
        // calculate
      }
    }
  }
}

// After
function calculateDiscount(user, cart) {
  if (!user) return 0;
  if (!user.isActive) return 0;
  if (cart.total <= 100) return 0;
  // calculate
}
```

### Strategy Pattern
Replace complex conditionals with strategy objects:

```typescript
// Before
function processPayment(type, amount) {
  if (type === 'credit') { /* complex logic */ }
  else if (type === 'debit') { /* complex logic */ }
  else if (type === 'paypal') { /* complex logic */ }
}

// After
const paymentStrategies = {
  credit: new CreditCardStrategy(),
  debit: new DebitCardStrategy(),
  paypal: new PayPalStrategy()
};

function processPayment(type, amount) {
  return paymentStrategies[type].process(amount);
}
```

### Parameter Object
Replace long parameter lists with objects:

```java
// Before
public void createUser(String name, String email, int age,
                       String address, String phone, boolean active)

// After
public void CreateUser(UserDetails details)
```

## Integration

This skill works seamlessly with:
- **/analyze-complexity**: Manual command for detailed analysis
- **complexity-analyzer agent**: Direct access for custom analysis
- **Post-edit hooks**: Automatic analysis after code changes

## Configuration

Customize thresholds via environment variables:

```bash
export CLAUDE_COMPLEXITY_CYCLOMATIC_THRESHOLD=15
export CLAUDE_COMPLEXITY_COGNITIVE_THRESHOLD=15
export CLAUDE_COMPLEXITY_MAX_LINES=50
export CLAUDE_COMPLEXITY_MAX_NESTING=4
export CLAUDE_COMPLEXITY_MAX_PARAMETERS=5
```

Enable automatic checking after edits:

```bash
export CLAUDE_COMPLEXITY_AUTO_CHECK=true
```

## Example Conversations

**User:** "This function is getting hard to understand"
**Claude:** [Activates complexity-check skill]
**Analysis:** "I can see this function has cyclomatic complexity of 28. Here are some suggestions to simplify it..."

**User:** "Can you review this code?"
**Claude:** [Analyzes complexity as part of review]
**Finding:** "The `validateUser` function is quite complex (score: 32). Consider breaking it into smaller functions..."

**User:** "I need to refactor this module"
**Claude:** [Performs complexity analysis]
**Recommendation:** "Here are the 3 most complex functions that would benefit most from refactoring..."
