# Code Complexity Analyzer Plugin

A comprehensive Claude Code plugin that analyzes code complexity and provides intelligent refactoring suggestions to improve maintainability and readability.

## Features

- **Cyclomatic Complexity Analysis**: Measures decision points and independent code paths
- **Cognitive Complexity Assessment**: Evaluates how difficult code is for humans to understand
- **Code Smell Detection**: Identifies long methods, deep nesting, and parameter lists
- **Automated Refactoring Suggestions**: Provides specific, actionable recommendations
- **Multi-Language Support**: Python, JavaScript, TypeScript, Java, Go, and more
- **Automated Hooks**: Optional automatic analysis after code edits

## Installation

### From Marketplace (Recommended)

```bash
claude plugin install code-complexity-analyzer
```

### Manual Installation

1. Clone or download this plugin to your local machine
2. Install to your preferred scope:

```bash
# User scope (available across all projects)
claude plugin install ./code-complexity-analyzer

# Project scope (shared with team via git)
claude plugin install ./code-complexity-analyzer --scope project

# Local scope (gitignored, project-specific)
claude plugin install ./code-complexity-analyzer --scope local
```

## Usage

### Slash Command

The main way to use this plugin is via the `/analyze-complexity` command:

```bash
# Analyze current directory
/analyze-complexity

# Analyze specific file
/analyze-complexity src/utils/dataProcessor.js

# Analyze with custom threshold
/analyze-complexity src/ --threshold=10

# Table view with custom threshold
/analyze-complexity src/ --threshold=10 --output=table

# Include cognitive complexity
/analyze-complexity --cognitive --minimal

# JSON output for CI/CD
/analyze-complexity --output=json > report.json

# Get refactoring suggestions
/analyze-complexity src/components/UserForm.tsx --suggest
```

### Agent

The `complexity-analyzer` agent provides detailed analysis and refactoring guidance:

```bash
"Can you analyze the complexity of this file using the complexity analyzer?"
```

### Enable Automatic Checking

```bash
# Enable automatic complexity checking after edits
export CLAUDE_COMPLEXITY_AUTO_CHECK=true
```

## Quick Start

### Basic Usage

```bash
# Analyze current directory
/analyze-complexity

# Analyze specific file
/analyze-complexity src/utils/dataProcessor.js

# Analyze with custom threshold
/analyze-complexity src/ --threshold=10

# Get refactoring suggestions
/analyze-complexity src/components/UserForm.tsx --suggest
```

### Enable Automatic Checking

```bash
# Enable automatic complexity checking after edits
export CLAUDE_COMPLEXITY_AUTO_CHECK=true

# Customize thresholds
export CLAUDE_COMPLEXITY_CYCLOMATIC_THRESHOLD=15
export CLAUDE_COMPLEXITY_COGNITIVE_THRESHOLD=15
export CLAUDE_COMPLEXITY_MAX_LINES=50
export CLAUDE_COMPLEXITY_MAX_NESTING=4
export CLAUDE_COMPLEXITY_MAX_PARAMETERS=5
```

## Components

### 1. Slash Command: `/analyze-complexity`

Manually trigger complexity analysis with customizable options.

**Usage:**
```bash
/analyze-complexity [target] [options]
```

**Options:**
- `--threshold=N`: Set complexity threshold (default: 15)
- `--output=table|detailed|json`: Output format
- `--cognitive`: Include cognitive complexity
- `--minimal`: Only show functions exceeding thresholds
- `--suggest`: Include refactoring suggestions

**Examples:**
```bash
# Table view with custom threshold
/analyze-complexity src/ --threshold=10 --output=table

# Include cognitive complexity
/analyze-complexity --cognitive --minimal

# JSON output for CI/CD
/analyze-complexity --output=json > report.json
```

### 2. Agent: `complexity-analyzer`

Specialized agent for comprehensive complexity analysis and refactoring guidance.

**Automatic Invocation:**
The agent activates automatically when:
- Code review is requested
- Refactoring discussions occur
- Technical debt analysis is needed
- Code quality concerns are raised

**Manual Invocation:**
```bash
# Ask Claude to invoke the agent
"Can you analyze the complexity of this file using the complexity analyzer?"
```

### 3. Skill: `complexity-check`

Automatically invoked during coding to provide real-time complexity feedback.

**Triggers:**
- Writing or modifying functions
- Code review discussions
- Refactoring requests
- Technical debt analysis

**What It Does:**
- Calculates complexity metrics in real-time
- Flags overly complex code immediately
- Suggests specific refactoring patterns
- Shows before/after code examples

### 4. Hooks: Automatic Post-Edit Analysis

Automatically analyze code after edits when enabled.

**Configuration:**
```bash
export CLAUDE_COMPLEXITY_AUTO_CHECK=true
```

**Behavior:**
After each Write or Edit operation, the plugin will:
1. Analyze the modified file(s)
2. Flag functions exceeding thresholds
3. Provide refactoring suggestions
4. Display complexity metrics

## Complexity Metrics

### Cyclomatic Complexity

Measures the number of linearly independent paths through code.

| Score | Risk Level | Description |
|-------|-----------|-------------|
| 1-10  | Low | Simple, easy to test and maintain |
| 11-20 | Moderate | Moderate risk, should consider refactoring |
| 21-50 | High | High risk, should refactor |
| 50+   | Very High | Critical risk, immediate refactoring needed |

### Cognitive Complexity

Measures how difficult code is for humans to understand.

**Factors:**
- Nesting depth (each level adds complexity)
- Control flow breaks (break, continue, return)
- Hidden flows (catch blocks, recursive calls)
- Multiple conditions in single statement

### Code Smells Detected

- **Long Methods**: Functions exceeding 50 lines
- **Deep Nesting**: More than 4 indentation levels
- **Parameter Lists**: More than 5 parameters
- **Complex Conditionals**: Nested or chained conditions
- **Duplicate Code**: Repeated patterns

## Refactoring Patterns

### 1. Extract Method

Break large functions into smaller, named pieces.

**Before:**
```python
def process_order(order):
    # 80 lines of validation, processing, and notification
    if not order:
        return False
    # ... lots of code ...
    return True
```

**After:**
```python
def process_order(order):
    validate_order(order)
    items = process_items(order.items)
    send_notification(order)
    return True
```

### 2. Guard Clauses

Replace nested conditions with early returns.

**Before:**
```javascript
function calculateDiscount(user, cart) {
  if (user) {
    if (user.isActive) {
      if (cart.total > 100) {
        return cart.total * 0.1;
      }
    }
  }
  return 0;
}
```

**After:**
```javascript
function calculateDiscount(user, cart) {
  if (!user) return 0;
  if (!user.isActive) return 0;
  if (cart.total <= 100) return 0;
  return cart.total * 0.1;
}
```

### 3. Strategy Pattern

Replace complex conditionals with strategy objects.

**Before:**
```typescript
function processPayment(type: string, amount: number) {
  if (type === 'credit') {
    // 20 lines of credit card logic
  } else if (type === 'debit') {
    // 20 lines of debit card logic
  } else if (type === 'paypal') {
    // 20 lines of PayPal logic
  }
}
```

**After:**
```typescript
interface PaymentStrategy {
  process(amount: number): void;
}

class CreditCardStrategy implements PaymentStrategy {
  process(amount: number) { /* credit card logic */ }
}

class DebitCardStrategy implements PaymentStrategy {
  process(amount: number) { /* debit card logic */ }
}

const strategies = {
  credit: new CreditCardStrategy(),
  debit: new DebitCardStrategy(),
};

function processPayment(type: string, amount: number) {
  return strategies[type].process(amount);
}
```

### 4. Parameter Object

Replace long parameter lists with objects.

**Before:**
```java
public void createUser(String name, String email, int age,
                       String address, String phone, boolean active) {
  // method body
}
```

**After:**
```java
public void createUser(UserDetails details) {
  // method body
}
```

## Output Examples

### Table Output

```
Complexity Analysis Report

┌─────────────────────────────┬───────┬──────────┬────────┬───────┬─────────┐
│ File                        │ Func  │ Cycloma  │ Lines  │ Nest  │ Params  │
├─────────────────────────────┼───────┼──────────┼────────┼───────┼─────────┤
│ src/processor.js            │ parse │ 28       │ 89     │ 5     │ 3       │
│ src/processor.js            │ valid │ 12       │ 45     │ 3     │ 2       │
│ utils/helper.js             │ fetch │ 35       │ 124    │ 6     │ 4       │
└─────────────────────────────┴───────┴──────────┴────────┴───────┴─────────┘

Threshold: 15
⚠️ 3 functions exceed complexity threshold
```

### Detailed Output

```markdown
## Complexity Analysis for: src/processor.js

### Function: parseData (lines 15-103)
🔴 **HIGH COMPLEXITY** - Action Required

**Metrics:**
- Cyclomatic Complexity: **28** ⚠️ (threshold: 15)
- Cognitive Complexity: **18** ⚠️ (threshold: 15)
- Lines of Code: 89
- Nesting Depth: 5 levels
- Parameters: 3

**Issues:**
1. Excessive cyclomatic complexity (13 over threshold)
2. Deep nesting detected (5 levels)
3. Function too long (89 lines)

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

**Impact:**
- ✅ Reduced cyclomatic complexity: 28 → 8
- ✅ Improved readability
- ✅ Easier to test
- ✅ Better maintainability
```

## Configuration

### Environment Variables

```bash
# Enable automatic checking after edits
export CLAUDE_COMPLEXITY_AUTO_CHECK=true

# Cyclomatic complexity threshold (default: 15)
export CLAUDE_COMPLEXITY_CYCLOMATIC_THRESHOLD=15

# Cognitive complexity threshold (default: 15)
export CLAUDE_COMPLEXITY_COGNITIVE_THRESHOLD=15

# Maximum lines per function (default: 50)
export CLAUDE_COMPLEXITY_MAX_LINES=50

# Maximum nesting depth (default: 4)
export CLAUDE_COMPLEXITY_MAX_NESTING=4

# Maximum parameters per function (default: 5)
export CLAUDE_COMPLEXITY_MAX_PARAMETERS=5
```

### Script Usage

The plugin includes a standalone Python script for complexity analysis:

```bash
# Basic usage
python3 scripts/complexity-analyzer.py path/to/file.py

# Custom threshold
python3 scripts/complexity-analyzer.py path/to/file.py --threshold=10

# Table output
python3 scripts/complexity-analyzer.py path/to/file.py --output=table

# JSON output
python3 scripts/complexity-analyzer.py path/to/file.py --output=json

# Multiple files
python3 scripts/complexity-analyzer.py src/**/*.py
```

## Best Practices

1. **Set Realistic Thresholds**: Start with defaults and adjust based on your codebase
2. **Focus on High-Impact Areas**: Prioritize the most complex functions first
3. **Iterate Gradually**: Refactor in small steps to avoid breaking changes
4. **Track Trends**: Monitor complexity over time to catch technical debt early
5. **Pair with Testing**: Ensure tests pass before and after refactoring
6. **Document Decisions**: Explain why complex code exists if it can't be simplified

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Complexity Check

on: [pull_request]

jobs:
  complexity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check Complexity
        run: |
          python3 .claude-plugins/code-complexity-analyzer/scripts/complexity-analyzer.py \
            src/**/*.py --output=json --threshold=15 > complexity-report.json
      - name: Comment PR
        if: steps.complexity.outputs.status != '0'
        uses: actions/github-script@v6
        with:
          script: |
            const report = require('./complexity-report.json');
            const body = `⚠️ Complexity Issues Found:\n${JSON.stringify(report, null, 2)}`;
            github.rest.issues.createComment({ issue_number: context.issue.number, owner: context.repo.owner, repo: context.repo.repo, body });
```

## Plugin Structure

```
code-complexity-analyzer/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   └── analyze-complexity.md    # Slash command
├── agents/
│   └── complexity-analyzer.md   # Complexity analysis agent
├── skills/
│   └── complexity-check/
│       └── SKILL.md            # Automated checking skill
├── hooks/
│   └── hooks.json              # Post-edit analysis hooks
├── scripts/
│   └── complexity-analyzer.py  # Standalone analysis script
└── README.md                   # This file
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [Claude Code documentation](https://code.claude.com/docs)
- Review the [plugin reference](https://code.claude.com/docs/en/plugins-reference)

## Acknowledgments

Built with [Claude Code](https://code.claude.com) plugin system.
