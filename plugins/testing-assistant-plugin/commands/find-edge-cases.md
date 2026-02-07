---
description: Analyze code to identify potential edge cases, boundary conditions, and error scenarios
---

# /find-edge-cases

Analyzes the provided code or files to identify potential edge cases, boundary conditions, and error scenarios that should be tested.

## Usage

```bash
/find-edge-cases [options] [files...]
```

## Options

| Option | Description |
|--------|-------------|
| `--include-boundary` | Include boundary value analysis (default: true) |
| `--include-null` | Include null/undefined checks (default: true) |
| `--include-type-mismatch` | Include type mismatch scenarios (default: true) |
| `--include-concurrency` | Include concurrency edge cases (default: false) |
| `--output <format>` | Output format: `json`, `markdown`, `text` (default: `markdown`) |
| `--verbose` | Show detailed analysis |

## Examples

```bash
# Analyze a specific file
/find-edge-cases src/utils.js

# Analyze with detailed output
/find-edge-cases --verbose --output json src/utils.js src/validation.js

# Include concurrency edge cases
/find-edge-cases --include-concurrency src/concurrent-worker.js
```

## What It Detects

### Boundary Conditions
- Array index boundaries (0, length-1, length, length+1)
- String length boundaries (empty, max length, overflow)
- Numeric boundaries (MIN_VALUE, MAX_VALUE, zero, negative)
- Collection size boundaries (empty, single element, large collections)

### Null/Undefined Scenarios
- Missing required parameters
- Optional parameters with undefined values
- Null object references
- Destructuring with missing properties

### Type Mismatch Cases
- Wrong type arguments
- Type coercion situations
- Invalid type conversions
- Union type edge cases

### Error Handling
- Exception throwing scenarios
- Error propagation paths
- Recovery from failures
- Timeout and cancellation

### Concurrency (when enabled)
- Race conditions
- Deadlock possibilities
- Resource contention
- Async timing issues

## Output Format

The command outputs a structured analysis with:
- **Category**: Type of edge case
- **Location**: File and line number
- **Description**: What the edge case is
- **Severity**: Low, Medium, High, Critical
- **Recommendation**: Suggested test approach
