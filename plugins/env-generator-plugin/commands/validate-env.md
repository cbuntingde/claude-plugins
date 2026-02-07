---
description: Validate .env files and check for missing or unused variables
---

# /validate-env

Validate .env files against codebase usage and check for issues.

## Usage

```
/validate-env [options]
```

## Options

- `--file <path>` - Specify .env file to validate (default: `.env`)
- `--strict` - Fail on warnings
- `--unused` - Check for unused variables
- `--missing` - Check for missing required variables

## Examples

Validate default .env file:

```
/validate-env
```

Validate specific file with strict mode:

```
/validate-env --file .env.production --strict
```

Check for unused variables:

```
/validate-env --unused
```

Check for missing required variables:

```
/validate-env --missing
```

## What it checks

### Missing Variables
- Environment variables used in code but not defined in .env
- Variables referenced in configuration files
- Required variables without defaults

### Unused Variables
- Variables defined in .env but never used in codebase
- Commented-out variables that might be obsolete

### Type Validation
- Boolean values that should be true/false
- Numeric values that contain non-numeric characters
- URL format validation

### Security Issues
- Hardcoded secrets or passwords
- Sensitive data in example files
- Weak default values

### Best Practices
- Duplicate variable definitions
- Malformed variable names
- Empty required variables

## Example Output

```
✓ .env validation report

Missing Variables (3):
  ❌ DATABASE_URL - Used in: src/db/connection.js:45
  ❌ JWT_SECRET - Used in: src/auth/jwt.js:12
  ⚠️  API_TIMEOUT - Has default: 5000

Unused Variables (2):
  ⚠️  OLD_API_KEY - Not found in codebase
  ⚠️  DEBUG_MODE - Not found in codebase

Security Warnings (2):
  ⚠️  ADMIN_PASSWORD - Should use a strong password
  ⚠️  AWS_SECRET_KEY - Appears to be a placeholder

Type Issues (1):
  ⚠️  MAX_CONNECTIONS - Should be a number, found: "10"
```
