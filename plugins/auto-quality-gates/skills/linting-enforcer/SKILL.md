---
description: Enforce code quality standards through automated linting and style checking
invocationKeywords:
  - lint code
  - fix linting errors
  - code style
  - enforce standards
  - code quality checks
---

# Linting Enforcer Skill

Automatically detect, fix, and enforce code quality standards through linting.

## Overview

This skill runs linters on your code, auto-fixes issues, and enforces consistent coding standards across your project.

## When It Activates

The skill activates when you:

- Request code linting
- Ask to fix linting errors
- Want to enforce code style
- Need code quality checks

## Linting Categories

### Code Quality Issues

**Critical Errors** (Must fix)
```javascript
// ✗ Critical: Unused variable
const unusedVar = 42;

// ✗ Critical: Undefined variable
console.log(undefinedVar);

// ✗ Critical: unreachable code
return;
console.log('never reached');
```

**Warnings** (Should fix)
```javascript
// ⚠️ Warning: Console statement in production
console.log('Debug info');

// ⚠️ Warning: Empty block
if (condition) { }

// ⚠️ Warning: Unused function parameter
function process(data, unused) { }
```

### Style Violations

**Inconsistent Style**
```javascript
// ✗ Inconsistent spacing
if(condition){  // Missing spaces
    doSomething();
}

// ✓ Consistent spacing
if (condition) {
  doSomething();
}
```

**Naming Conventions**
```javascript
// ✗ Violates convention
const User_Name = 'john';

// ✓ Follows convention (camelCase)
const userName = 'john';
```

### Best Practices

**Modern JavaScript**
```javascript
// ✗ Old way
var x = 10;

// ✓ Modern way
const x = 10;
let y = 20;

// ✗ var
var i = 0;

// ✓ const/let
for (const item of items) { }
```

**Security Issues**
```javascript
// ✗ Security risk: eval()
eval(userInput);

// ✗ Security risk: innerHTML
element.innerHTML = userInput;

// ✓ Safe alternative
element.textContent = userInput;
```

## Auto-Fixable Issues

### Formatting
```javascript
// Before
const obj ={name:'test',value:123};
const arr =[1,2,3];

// After auto-fix
const obj = { name: 'test', value: 123 };
const arr = [1, 2, 3];
```

### Imports
```javascript
// Before
import{func1,func2}from'./utils';

// After auto-fix
import { func1, func2 } from './utils';
```

### Quotes
```javascript
// Before (inconsistent)
const str1 = "double";
const str2 = 'single';

// After auto-fix (consistent)
const str1 = 'double';
const str2 = 'single';
```

### Semicolons
```javascript
// Before
const x = 10
const y = 20

// After auto-fix
const x = 10;
const y = 20;
```

## Language-Specific Linters

### JavaScript/TypeScript
**ESLint Rules**
```json
{
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "complexity": ["warn", 10]
  }
}
```

### Python
**Pylint Rules**
```python
# C0111: Missing docstring
# W0612: Unused variable
# R0913: Too many arguments
# E1101: No member
```

### Go
**golint Checks**
```go
// Don't use leading underscores
var _privateVar  // ✗

// Export comment should be full name
// Client ...  // ✗
// Client represents ...  // ✓
```

## Severity Levels

| Level | Description | Auto-fix | Example |
|-------|-------------|----------|---------|
| **Error** | Blocks production | Sometimes | `const x = undefined` |
| **Warning** | Best practice violation | Yes | `console.log()` in prod |
| **Info** | Style suggestion | Yes | Inconsistent quotes |
| **Hint** | Optimization tip | No | Use `const` instead of `let` |

## Enforcement Modes

### Strict Mode
```javascript
{
  "rules": {
    "no-console": "error",        // Fail on console.log
    "no-debugger": "error",       // Fail on debugger
    "no-unused-vars": "error",    // Fail on unused vars
    "prefer-const": "error"       // Enforce const
  }
}
```

### Moderate Mode
```javascript
{
  "rules": {
    "no-console": "warn",         // Warn on console.log
    "no-debugger": "warn",        // Warn on debugger
    "no-unused-vars": "error",    // Fail on unused vars
    "prefer-const": "warn"        // Suggest const
  }
}
```

### Relaxed Mode
```javascript
{
  "rules": {
    "no-console": "off",          // Allow console.log
    "no-debugger": "warn",        // Warn on debugger
    "no-unused-vars": "warn",     // Warn on unused vars
    "prefer-const": "off"         // Allow let/const choice
  }
}
```

## Integration Points

### Pre-commit Hooks
```json
{
  "hooks": {
    "pre-commit": "npm run lint -- --fix"
  }
}
```

### CI/CD Pipeline
```yaml
lint:
  script:
    - npm run lint
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```

### IDE Integration
- VS Code: ESLint extension
- JetBrains: Built-in linters
- Vim/Neovim: ALE, coc.nvim

## Report Formats

### Console Output
```
Linting Report
━━━━━━━━━━━━
✓ utils/helpers.js - No issues
✗ services/api.js - 5 errors, 3 warnings
✗ models/user.js - 2 errors

services/api.js:47:12
✗ 'err' is defined but never used. (no-unused-vars)
✗ Unexpected console statement. (no-console)

services/api.js:89:5
✗ Expected '===' and instead saw '=='. (eqeqeq)

3 errors, 1 warning potentially fixable with --fix
```

### JSON Output
```json
{
  "files": [
    {
      "filePath": "services/api.js",
      "errors": [
        {
          "line": 47,
          "column": 12,
          "severity": "error",
          "message": "'err' is defined but never used",
          "ruleId": "no-unused-vars",
          "fixable": true
        }
      ]
    }
  ],
  "errorCount": 5,
  "warningCount": 3,
  "fixableErrorCount": 3,
  "fixableWarningCount": 1
}
```

## Usage Examples

> Lint all JavaScript files in the project

> Fix all auto-fixable linting errors

> Check linting for only the services directory

> Enforce strict linting rules on the codebase

> Show me all linting errors in the payment module

## Best Practices

1. **Fix Early** - Lint on every save (IDE integration)
2. **Fix Automatically** - Use `--fix` flag
3. **Team Consistency** - Share lint config via repo
4. **Gradual Adoption** - Start with warnings, escalate to errors
5. **Custom Rules** - Add project-specific rules
6. **Pre-commit Hooks** - Catch issues before commit
7. **CI Enforcement** - Fail builds on lint errors
