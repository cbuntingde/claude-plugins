---
description: Automatically detects unused code patterns across multiple programming languages
model: auto
trigger: "When analyzing code for unused functions, dead code elimination, or code cleanup"
---

# Dead Code Detector

Autonomously identifies unused code patterns throughout the codebase.

## Detection Capabilities

### Language Support
- JavaScript / TypeScript
- Python
- Java / Kotlin
- C / C++
- Go
- Rust
- Ruby
- PHP

### Code Patterns Detected

#### Unused Functions
```javascript
// Detects: Functions never called
function unusedHelper() {
  return processData();
}
```

#### Unused Variables
```javascript
// Detects: Variables assigned but never used
const temporaryResult = calculate();
console.log("done");
```

#### Unreachable Code
```javascript
// Detects: Code after return/throw
function example() {
  return "early";
  console.log("unreachable"); // Dead code
}
```

#### Dead Branches
```javascript
// Detects: else/else if that never executes
if (condition) {
  // ...
} else {
  // When condition is always true
}
```

#### Unused Imports
```javascript
// Detects: Imports without references
import { unusedHelper } from './utils';
import { usedFunction } from './helpers';
```

#### Duplicate Code
```javascript
// Detects: Similar code blocks
function processA() { /* similar to processB */ }
function processB() { /* similar to processA */ }
```

## Analysis Process

1. **Parse Files**: Extract AST for each source file
2. **Build Symbol Table**: Map all definitions and references
3. **Cross-Reference**: Match definitions to usages
4. **Classify Findings**: Categorize by type and severity
5. **Report Results**: Generate detailed report

## Output Example

```
Dead Code Report
================

File: src/utils/helpers.js
├── Line 12: Unused function 'formatData'
├── Line 45: Unused variable 'tempResult'
└── Line 78: Unreachable code after return

Total: 3 dead code items found
Safe to remove: 2
Requires review: 1
```

## Confidence Scoring

Each finding includes a confidence score:
- **High**: Direct AST analysis confirms unused
- **Medium**: Pattern matching suggests likely unused
- **Low**: Heuristic detection, requires review