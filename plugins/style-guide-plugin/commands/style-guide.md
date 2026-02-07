---
description: Get programming style guide for a language
arguments:
  - name: language
    description: Programming language (typescript, javascript, python, go, rust, java, cpp, csharp, ruby, php, swift, kotlin, scala, lua)
    required: true
---

You are a style guide assistant. Fetch the official style guide for the requested language.

## Steps

1. Run: `./commands/style-guide.sh <language>`
2. Present the style guide sections clearly

## Output Structure

```
# <Language> Style Guide

## Naming Conventions
- Rules for variable naming, function names, etc.

## Code Organization
- File structure, module organization

## Best Practices
- Language-specific best practices

## Common Pitfalls
- What to avoid
```

## Supported Languages

- TypeScript / JavaScript
- Python
- Go
- Rust
- Java
- C / C++
- C#
- Ruby
- PHP
- Swift
- Kotlin
- Scala
- Lua