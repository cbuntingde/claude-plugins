---
description: Explains cryptic error messages with context and solutions
---

# Explain Error

Provides detailed explanations, context, and solutions for cryptic or confusing error messages.

When a user encounters an error message they don't understand, this command will:

1. **Parse the error message** - Identify the type, source, and key components
2. **Explain in plain language** - Translate technical jargon into understandable terms
3. **Identify the root cause** - Analyze what typically triggers this error
4. **Provide solutions** - Offer specific steps to resolve the error
5. **Suggest preventive measures** - Recommend how to avoid similar errors

## Usage

```
/explain [error message]
```

Or simply paste an error message and ask for explanation.

## Examples

```bash
# Explain a specific error
/explain "TypeError: Cannot read property 'map' of undefined"

# Or paste a full error stack trace
/explain [paste your error here]
```

## What it analyzes

- **Error type** - TypeError, ReferenceError, SyntaxError, etc.
- **Error message** - The specific error text
- **Stack trace** - File locations and call sequences (if provided)
- **Context clues** - Language, framework, environment indicators

## Output format

Each error explanation includes:

- **What happened** - Simple explanation of the error
- **Why it happened** - Root cause analysis
- **How to fix it** - Step-by-step solutions
- **Prevention tips** - Best practices to avoid recurrence
- **Related concepts** - Links to relevant documentation or concepts
