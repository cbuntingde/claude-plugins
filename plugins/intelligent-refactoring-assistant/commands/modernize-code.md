---
description: Modernize legacy code by updating outdated syntax, deprecated APIs, and old patterns to current best practices
usage: "/modernize-code [--target <language-version>] [--scope <all|current-file|selection>] [--auto-fix]"
examples:
  - "/modernize-code --target ES2022 --scope current-file"
  - "/modernize-code --target Python-3.12 --scope all --auto-fix"
  - "/modernize-code --target React-18"
tags: ["modernization", "legacy-code", "best-practices", "syntax"]
---

# Modernize Code

Safely update legacy code to use modern syntax, APIs, and patterns while preserving functionality.

## What it does

This command identifies and updates outdated code patterns to use current best practices and language features. It handles:

- **Syntax updates**: Convert to modern language syntax (e.g., var → const/let, callbacks → async/await)
- **Deprecated APIs**: Replace deprecated functions and methods with current alternatives
- **Pattern modernization**: Update outdated design patterns to modern approaches
- **Performance improvements**: Apply modern performance optimizations
- **Type system updates**: Leverage latest type system features

## Language support

Supports modernization for:
- **JavaScript/TypeScript**: ES6+, ES2020+, ES2022+, React patterns
- **Python**: 3.7+, 3.8+, 3.9+, 3.10+, 3.11+, 3.12+ features
- **Java**: 8+, 11+, 17+, 21+ features
- **C#**: 8+, 10+, 12+ features
- **Go**: Latest language idioms and patterns
- **Ruby**: Latest syntax and best practices
- **PHP**: 7.4+, 8.0+, 8.1+, 8.2+ features

## Safety guarantees

1. **Behavior preservation**: Modernized code behaves identically to legacy code
2. **Incremental updates**: Changes are small and independently verifiable
3. **Type safety**: Maintains type correctness in typed languages
4. **Test validation**: Ensures all tests pass after modernization
5. **Rollback safety**: Changes are easily reversible

## How it works

1. **Detection phase**: Scans code for outdated patterns and APIs
2. **Analysis phase**: Determines safe modernization strategies
3. **Planning phase**: Creates a modernization plan with risk assessment
4. **Proposal phase**: Presents changes with before/after comparisons
5. **Execution phase**: Applies changes with validation at each step

## Options

- `--target`: Target language version or framework
  - Examples: `ES2022`, `Python-3.12`, `React-18`, `Java-21`, `C#-12`
  - Default: Latest stable version for the detected language

- `--scope`: Modernization scope
  - `current-file`: Only modernize current file (default)
  - `selection`: Modernize selected code only
  - `directory`: Modernize all files in current directory
  - `all`: Modernize entire codebase

- `--auto-fix`: Apply changes automatically without confirmation
  - Not recommended for large scopes
  - Useful for small, safe modernizations

## Modernization examples

### JavaScript: Callbacks → Async/Await
```javascript
// Before
function fetchUser(id, callback) {
  database.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// After
async function fetchUser(id) {
  const results = await database.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return results[0];
}
```

### Python: Legacy class syntax → Dataclasses
```python
# Before
class User:
    def __init__(self, name, email, age):
        self.name = name
        self.email = email
        self.age = age
    def __repr__(self):
        return f'User(name={self.name}, email={self.email}, age={self.age})'

# After
from dataclasses import dataclass

@dataclass
class User:
    name: str
    email: str
    age: int
```

### Java: Anonymous classes → Lambdas
```java
// Before
button.addActionListener(new ActionListener() {
    @Override
    public void actionPerformed(ActionEvent e) {
        System.out.println("Button clicked");
    }
});

// After
button.addActionListener(e -> System.out.println("Button clicked"));
```

## What you'll see

```
🔍 Analyzing code for modernization opportunities...

Language: JavaScript (Target: ES2022)
Scope: Current file (utils.js)

Found 7 modernization opportunities:

1. [SAFE] var → const/let (Line 23)
   Old: var userData = ...
   New: const userData = ...
   Impact: Low - block scoping improvement
   Auto-fix available: ✓

2. [SAFE] Callback → async/await (Lines 45-52)
   Old: callback-based error handling
   New: async/await with try/catch
   Impact: Medium - improves readability
   Auto-fix available: ✓

3. [REVIEW] String concatenation → Template literals (Line 78)
   Old: 'Hello, ' + name + '!'
   New: `Hello, ${name}!`
   Impact: Low - readability improvement
   Auto-fix available: ✓

Modernization plan:
- Apply all 7 changes
- Estimated time: < 1 minute
- Risk level: Low

Preview changes? (yes/no/auto-fix-all)
```

## Best practices

- Always review changes before applying `--auto-fix`
- Test thoroughly after modernization, especially for:
  - Error handling behavior
  - Async operation timing
  - Type inference changes
- Use version control to easily rollback if needed
- Modernize incrementally rather than all at once
- Start with `--scope current-file` to build confidence

## Risk categories

- **SAFE**: Automatic, zero-behavior-change updates (e.g., syntax sugar)
- **LOW RISK**: Well-understood modernizations with extensive testing
- **MEDIUM RISK**: Changes that affect execution flow or timing
- **HIGH RISK**: Breaking changes or major paradigm shifts
- **REVIEW**: Requires human judgment to apply correctly

## Common modernizations by language

### JavaScript/TypeScript
- var → const/let
- Callbacks → Promises → async/await
- Function expressions → Arrow functions
- Prototype methods → class syntax
- CommonJS → ES modules
- String concat → Template literals

### Python
- % formatting → f-strings
- Legacy dicts → Dictionary merging operators (|)
- List comprehensions → Generator expressions
- Custom __eq__ → @dataclass.eq
- Threading → Asyncio (where appropriate)

### Java
- Anonymous classes → Lambdas
- Optional.isPresent() → Optional.ifPresent()
- Date → LocalDate/LocalDateTime
- Streams API enhancements
- Record classes for data carriers

## See also

- `/extract-duplication`: Eliminate code duplication
- `/apply-pattern`: Apply design patterns
- `/analyze-refactor-opportunities`: Get comprehensive refactoring suggestions
