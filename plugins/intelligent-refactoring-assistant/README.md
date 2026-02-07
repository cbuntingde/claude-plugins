# Intelligent Refactoring Assistant

> Safe, context-aware refactoring tools for modernizing legacy code, extracting duplicated logic, and applying design patterns with confidence.

## Overview

Most developers know what needs refactoring but are afraid to touch it. This plugin provides safe, intelligent refactoring tools that understand the full context of your codebase and help you modernize code with confidence.

The **Intelligent Refactoring Assistant** focuses on "safe" refactoring—changes that clearly improve maintainability without introducing risk. It analyzes your code comprehensively, suggests improvements with confidence levels, and provides the tools to execute them safely.

## Features

### 🔍 Smart Analysis
- **Code Duplication Detection**: Find exact and near-duplicate code patterns
- **Modernization Opportunities**: Identify outdated syntax and deprecated APIs
- **Design Pattern Suggestions**: Recognize where patterns would improve structure
- **Complexity Analysis**: Locate overly complex code that needs simplification

### 🛠️ Powerful Commands
- `/extract-duplication`: Safely extract duplicated logic into reusable components
- `/modernize-code`: Update to modern language syntax and APIs
- `/apply-pattern`: Apply design patterns to improve architecture
- `/analyze-refactor-opportunities`: Get comprehensive refactoring recommendations
- `/safe-rename`: Rename symbols across the entire codebase

### 🤖 Specialized Agents
- **Legacy Modernizer**: Expert in updating outdated code
- **Duplication Extractor**: Specializes in eliminating code duplication
- **Pattern Applier**: Applies appropriate design patterns
- **Refactoring Verifier**: Validates that changes preserve behavior

### ⚡ Autonomous Skills
- **Smart Refactor**: Continuously analyzes code as you work and suggests safe improvements

## Installation

```bash
# Install to user scope (available across all projects)
claude plugin install intelligent-refactoring-assistant

# Install to project scope (shared with team via version control)
claude plugin install intelligent-refactoring-assistant --scope project

# Install to local scope (gitignored, project-specific)
claude plugin install intelligent-refactoring-assistant --scope local
```

## Usage

### Available Commands

| Command | Description |
|---------|-------------|
| `/analyze-refactor-opportunities` | Analyze code for all refactoring opportunities |
| `/extract-duplication` | Find and eliminate duplicated code patterns |
| `/modernize-code` | Update legacy code to modern syntax |
| `/apply-pattern` | Apply design patterns to improve architecture |
| `/safe-rename` | Rename symbols safely across the codebase |

### Command Options

#### analyze-refactor-opportunities
```bash
/analyze-refactor-opportunities --scope <file|directory|all> --focus <duplication|modernization|patterns|complexity|all>
```

#### extract-duplication
```bash
/extract-duplication --scope <current-file|directory|all> --confidence <conservative|moderate|aggressive>
```

#### modernize-code
```bash
/modernize-code --target <language-version> --scope <current-file|selection|directory|all>
```

#### apply-pattern
```bash
/apply-pattern --pattern <pattern-name> --scope <selection|file|directory> --confidence <conservative|moderate>
```

#### safe-rename
```bash
/safe-rename <old-name> <new-name> --scope <file|directory|all> --preview
```

## Quick Start

### 1. Analyze Your Code

Get a comprehensive view of refactoring opportunities:

```bash
/analyze-refactor-opportunities --scope current-file
```

This will show you:
- Code duplication across your codebase
- Modernization opportunities
- Design pattern applications
- Complexity hotspots
- Prioritized recommendations

### 2. Extract Duplicated Logic

Find and eliminate code duplication:

```bash
/extract-duplication --scope all --confidence conservative
```

Example output:
```
🔍 Analyzing code for duplication patterns...

Found 3 duplication opportunities:

1. [HIGH CONFIDENCE] Validation logic repeated in 4 files
   📍 Locations: auth.js:45-52, user-service.js:78-85, ...
   💡 Suggestion: Extract to shared validation utility
   📦 New file: src/utils/validation.js
   ⚠️  Risk: Low - pure function with no side effects

Extract these 3 opportunities? (yes/no/details)
```

### 3. Modernize Legacy Code

Update to modern language features:

```bash
/modernize-code --target ES2022 --scope all
```

This will:
- Convert `var` to `const/let`
- Transform callbacks to async/await
- Update to modern syntax
- Replace deprecated APIs

### 4. Apply Design Patterns

Improve code architecture:

```bash
/apply-pattern --pattern strategy --scope selection
```

Common pattern applications:
- **Strategy Pattern**: Replace complex conditionals
- **Repository Pattern**: Abstract data access
- **Factory Pattern**: Centralize object creation
- **Observer Pattern**: Implement event handling

## Use Cases

### Working with Legacy Code

When you inherit an older codebase:

```bash
# First, get an overview
/analyze-refactor-opportunities --scope all

# Start with safe modernization
/modernize-code --target ES2022 --scope all --confidence conservative

# Extract duplication
/extract-duplication --scope all

# Apply patterns to improve structure
/apply-pattern --pattern repository --scope directory
```

### Eliminating Code Duplication

When you find the same logic in multiple places:

```bash
/extract-duplication --scope all --confidence conservative
```

The plugin will:
1. Find duplicated code across your files
2. Suggest safe extractions
3. Show you exactly what will change
4. Wait for your approval before making changes

### Improving Code Architecture

When code is hard to maintain or test:

```bash
/analyze-refactor-opportunities --focus patterns --scope all

# Apply suggested patterns
/apply-pattern --pattern strategy
/apply-pattern --pattern repository
/apply-pattern --pattern dependency-injection
```

### Safe Renaming

When you need to rename functions, variables, or classes:

```bash
/safe-rename getUser fetchUser --scope all --preview
```

This ensures:
- All references are updated
- No naming conflicts are introduced
- Type safety is preserved
- Changes can be previewed first

## How It Works

### Safety First

Every refactoring operation follows these principles:

1. **Behavior Preservation**: Refactored code must work identically
2. **Impact Analysis**: Understand what will change before changing it
3. **Incremental Changes**: Make small, testable improvements
4. **Confidence Levels**: Clear indication of suggestion safety
5. **Easy Rollback**: Changes can be easily reverted

### Confidence Levels

- **HIGH**: Safe, automatic changes with clear benefit
  - Exact code duplication (3+ occurrences)
  - Simple syntax modernization (var → const)
  - Pure function extraction

- **MEDIUM**: Valuable improvements with some complexity
  - Near-duplicate code extraction
  - Design pattern applications
  - Async modernization

- **LOW**: Complex changes requiring careful consideration
  - Architectural refactoring
  - Complex pattern applications
  - Changes with unclear trade-offs

### Context Awareness

The plugin understands:
- Your codebase structure and conventions
- Type information in typed languages
- Test coverage and quality
- File change frequency (from git history)
- Dependencies and coupling

## Examples

### Example 1: Extracting Duplicated Validation

**Before** (validation repeated in 4 files):

```javascript
// auth/service.js
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// user/service.js
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// admin/service.js
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

**After** (extracted to shared utility):

```javascript
// src/utils/validation.js
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// auth/service.js
import { validateEmail } from '@/utils/validation';

// user/service.js
import { validateEmail } from '@/utils/validation';

// admin/service.js
import { validateEmail } from '@/utils/validation';
```

### Example 2: Modernizing Callback Code

**Before** (callback hell):

```javascript
function fetchUserOrders(userId, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return callback(err);
    db.query('SELECT * FROM orders WHERE user_id = ?', [userId], (err, orders) => {
      if (err) return callback(err);
      callback(null, { user, orders });
    });
  });
}
```

**After** (modern async/await):

```javascript
async function fetchUserOrders(userId) {
  const user = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  const orders = await db.query(
    'SELECT * FROM orders WHERE user_id = ?',
    [userId]
  );
  return { user, orders };
}
```

### Example 3: Applying Strategy Pattern

**Before** (complex conditional):

```typescript
class PaymentProcessor {
  processPayment(type: string, amount: number) {
    if (type === 'creditcard') {
      // Credit card logic (20 lines)
    } else if (type === 'paypal') {
      // PayPal logic (20 lines)
    } else if (type === 'bitcoin') {
      // Bitcoin logic (20 lines)
    }
  }
}
```

**After** (strategy pattern):

```typescript
interface PaymentStrategy {
  process(amount: number): Promise<void>;
}

class CreditCardStrategy implements PaymentStrategy {
  async process(amount: number) {
    // Credit card logic
  }
}

class PayPalStrategy implements PaymentStrategy {
  async process(amount: number) {
    // PayPal logic
  }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  async process(amount: number) {
    return this.strategy.process(amount);
  }
}
```

## Best Practices

1. **Start Small**: Begin with `--confidence conservative` to build trust
2. **Test First**: Ensure good test coverage before major refactoring
3. **Commit Often**: Create git commits before refactoring for easy rollback
4. **Review Changes**: Always review what will change before applying
5. **Focus on Value**: Prioritize high-frequency, high-change code
6. **Team Alignment**: Ensure refactoring aligns with team conventions

## Configuration

The plugin can be configured in your Claude Code settings:

```json
{
  "plugins": {
    "intelligent-refactoring-assistant": {
      "enabled": true,
      "confidence": "conservative",
      "autoSuggest": true,
      "maxSuggestions": 5,
      "excludePatterns": ["node_modules/**", "dist/**", "*.min.js"]
    }
  }
}
```

## Language Support

- **JavaScript/TypeScript**: Full support
- **Python**: Full support
- **Java**: Full support
- **C#**: Full support
- **Go**: Full support
- **Ruby**: Full support
- **PHP**: Full support

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with ❤️ for the Claude Code plugin ecosystem.

## Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [Plugin Reference](https://code.claude.com/docs/en/plugins-reference)
- [Agent Skills Overview](https://code.claude.com/docs/en/agent-skills)

## Support

For issues, questions, or suggestions, please:
- Open an issue on GitHub
- Check the documentation
- Join the community discussion

---

**Made with Claude Code Plugin System**
