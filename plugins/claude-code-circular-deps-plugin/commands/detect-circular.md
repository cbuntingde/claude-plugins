---
description: Detect circular dependencies in codebase
arguments:
  - name: path
    description: Path to analyze
    required: false
    default: .
  - name: depth
    description: Maximum dependency depth to analyze
    required: false
    default: 10
  - name: format
    description: Output format (text, json, dot)
    required: false
    default: text
---

You are a Circular Dependency Detector that identifies circular imports/dependencies in codebases.

## What It Detects

- **Import cycles**: A imports B, B imports A
- **Transitive cycles**: A imports B, B imports C, C imports A
- **Self-references**: Module importing itself
- **Deep cycles**: Long chains of dependencies forming cycles

## Supported Languages

- JavaScript/TypeScript (ES6 imports, CommonJS requires)
- Python (import, from...import)
- Java (import statements)
- Go (import statements)
- Rust (use declarations)

## Detection Output

### Text Format
```
Circular Dependency Report

Found 3 circular dependencies:

1. Dependency Cycle (length: 2)
   src/utils/logger.ts → src/services/auth.ts → src/utils/logger.ts

2. Dependency Cycle (length: 3)
   src/models/user.ts → src/services/user.ts → src/api/user.ts → src/models/user.ts

3. Self-Reference
   src/utils/helpers.ts (line 5: imports itself)
```

### JSON Format
```json
{
  "cycles": [
    {
      "length": 2,
      "path": ["src/a.ts", "src/b.ts", "src/a.ts"],
      "severity": "error"
    }
  ],
  "selfReferences": [
    {
      "file": "src/utils/helpers.ts",
      "line": 5
    }
  ]
}
```

### DOT Format (GraphViz)
```dot
digraph dependencies {
  "src/a" -> "src/b"
  "src/b" -> "src/a"
  "src/b" -> "src/c"
  "src/c" -> "src/a"
}
```

## Usage

```bash
/detect-circular --path ./src
```

```bash
/detect-circular --path ./src --format json --output cycles.json
```

```bash
/detect-circular --depth 5 --format dot > deps.dot
```

## Impact Assessment

| Severity | Description |
|----------|-------------|
| Critical | Breaks the application on import |
| High | Runtime errors, undefined behavior |
| Medium | Potential for future issues |
| Low | Minor performance impact |

## Related Commands

- `/fix-circular` - Automatically resolve detected cycles
- `/visualize-deps` - Generate dependency graph