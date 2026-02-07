---
description: Scan codebase for missing environment variables
---

# Check Environment Variables

Manually scan your codebase for missing environment variables and get a detailed report of what's defined and what's missing.

## What it does

- Scans all code files for environment variable usage patterns
- Checks `.env` files and other environment configuration files
- Reports which variables are used but not defined
- Provides suggestions for adding missing variables
- Supports multiple languages (JavaScript, TypeScript, Python, Shell, PHP, Ruby, Go, Java)

## Usage

Run this command to perform a complete scan:

```bash
/check-env
```

## What gets checked

**Environment file patterns:**
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.test`
- `.env.example`
- `.env.template`
- And more...

**Supported languages:**
- JavaScript/TypeScript: `process.env.VAR`, `import.meta.env.VAR`
- Python: `os.environ['VAR']`, `os.getenv('VAR')`
- Shell: `$VAR`, `${VAR}`
- PHP: `$_ENV['VAR']`, `getenv('VAR')`
- Ruby: `ENV['VAR']`
- Go: `os.Getenv('VAR')`
- Java: `System.getenv('VAR')`

## Output

The command provides:
1. ✅ Count of defined environment variables
2. 📄 Number of files scanned
3. ⚠️ List of missing variables grouped by file
4. 📋 Summary statistics
5. 💡 Suggested `.env` additions

## Example output

```
🔍 Detecting Environment Variables...

✓ Found 12 defined environment variable(s)
✓ Scanning 45 file(s)...

⚠️  Found 3 missing environment variable(s):

📄 src/config/database.ts
   • DB_HOST
   • DB_PORT

📄 src/services/api.ts
   • API_KEY

📋 Summary:
   Missing: 3
   Defined: 12
   Used in code: 15

💡 Suggested .env additions:
DB_HOST=
DB_PORT=
API_KEY=
```

## Automatic detection

This plugin also automatically runs after file writes/edits to catch missing environment variables as you work.

## Tips

- Keep your `.env.example` file updated with all required variables
- Use descriptive variable names in uppercase with underscores
- Document sensitive variables that need manual configuration
- Run this command before deploying to production
