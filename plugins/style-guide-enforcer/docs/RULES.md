# Style Guide Rules Reference

This document describes all available style guide rules that can be configured in `.style-guide.json`.

## Naming Convention Rules

### Variables
- **camelCase**: `myVariable`, `userCount`, `isLoading`
- **snake_case**: `my_variable`, `user_count`, `is_loading`
- **PascalCase**: `MyVariable`, `UserCount`, `IsLoading`

### Functions
- **camelCase**: `getUserData()`, `calculateTotal()`, `isValid()`
- **snake_case**: `get_user_data()`, `calculate_total()`, `is_valid()`

### Classes
- **PascalCase**: `UserService`, `DataManager`, `ApiClient`

### Constants
- **UPPER_SNAKE_CASE**: `MAX_RETRIES`, `API_BASE_URL`, `DEFAULT_TIMEOUT`

### Files
- **kebab-case**: `user-service.ts`, `api-client.js`
- **camelCase**: `userService.ts`, `apiClient.js`
- **PascalCase**: `UserService.ts`, `ApiClient.js`

## Formatting Rules

### Indentation
```json
{
  "formatting": {
    "indentation": "spaces",  // or "tabs"
    "indentSize": 2           // number of spaces
  }
}
```

### Line Length
```json
{
  "formatting": {
    "maxLineLength": 100  // maximum characters per line
  }
}
```

### Whitespace
```json
{
  "formatting": {
    "trailingWhitespace": false,  // forbid trailing whitespace
    "insertFinalNewline": true     // require newline at end of file
  }
}
```

### Quotes
```json
{
  "formatting": {
    "quoteStyle": "single"  // "single" or "double"
  }
}
```

## Import Rules

### Order
Imports are organized in this order:
1. **stdlib**: Node.js/built-in modules
2. **external**: npm packages
3. **internal**: Your project files

```json
{
  "imports": {
    "order": ["stdlib", "external", "internal"],
    "blankLineBetweenGroups": true,
    "sortWithinGroups": true
  }
}
```

## Documentation Rules

### JavaScript/TypeScript
```json
{
  "documentation": {
    "requireFunctionDocs": false,
    "requireParamTypes": true,
    "requireReturnTypes": true
  }
}
```

### Python
```json
{
  "documentation": {
    "requireDocstrings": true,
    "docstringStyle": "google"  // "google", "numpy", or "sphinx"
  }
}
```

## Structure Rules

```json
{
  "structure": {
    "maxFileLength": 500,
    "maxFunctionLength": 50,
    "maxParameterCount": 5
  }
}
```

## Language-Specific Rules

### JavaScript/TypeScript
```json
{
  "javascript": {
    "semicolons": true,
    "trailingCommas": "es5",  // "none", "es5", or "all"
    "arrowFunctions": "prefer"  // "prefer" or "allow"
  }
}
```

### Python
```json
{
  "python": {
    "styleGuide": "PEP8",
    "maxLineLength": 88,
    "quotes": "double"
  }
}
```

## Severity Levels

Violations can be reported at different severity levels:

- **error**: Must be fixed before committing
- **warning**: Should be fixed, but not blocking
- **info**: Suggestion for improvement

```json
{
  "enforcement": {
    "onWrite": true,
    "onEdit": true,
    "severity": "warning"  // "error", "warning", or "info"
  }
}
```

## Example Configuration

```json
{
  "rules": {
    "naming": {
      "variables": "camelCase",
      "functions": "camelCase",
      "classes": "PascalCase",
      "constants": "UPPER_SNAKE_CASE",
      "files": "kebab-case"
    },
    "formatting": {
      "indentation": "spaces",
      "indentSize": 2,
      "maxLineLength": 100,
      "trailingWhitespace": false,
      "quoteStyle": "single"
    },
    "imports": {
      "order": ["stdlib", "external", "internal"],
      "blankLineBetweenGroups": true
    }
  }
}
```
