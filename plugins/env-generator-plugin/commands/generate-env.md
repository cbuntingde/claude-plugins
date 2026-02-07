---
description: Generate .env files by analyzing code for environment variable usage
---

# /generate-env

Generate a .env file by scanning the codebase for environment variable usage patterns.

## Usage

```
/generate-env [options]
```

## Options

- `--output <file>` - Specify output file (default: `.env`)
- `--examples` - Include example values in comments
- `--required-only` - Only include variables without default values
- `--format` - Output format: `env` (default) or `yaml`

## Examples

Generate a basic .env file:

```
/generate-env
```

Generate with example values:

```
/generate-env --examples
```

Generate to custom location:

```
/generate-env --output .env.production
```

Generate only required variables:

```
/generate-env --required-only
```

## What it does

1. **Scans codebase** for environment variable usage patterns:
   - `process.env.VARIABLE` (Node.js)
   - `os.getenv('VARIABLE')` (Python)
   - `ENV['VARIABLE']` (Ruby)
   - `getenv()` (PHP)
   - `System.getenv()` (Java/Kotlin)
   - `@env('VARIABLE')` (Laravel)
   - `${VARIABLE}` in shell scripts

2. **Analyzes configuration files**:
   - `.env.example`
   - `docker-compose.yml`
   - Dockerfile `ENV` instructions
   - Configuration schemas

3. **Extracts variable details**:
   - Variable names
   - Default values from code
   - Usage context
   - Data type hints

4. **Generates organized .env file** with:
   - Categorized sections (Database, API, Auth, etc.)
   - Descriptive comments
   - Example values (optional)
   - Type hints
   - Security indicators for sensitive data

## Example Output

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# API Configuration
API_BASE_URL=https://api.example.com
API_KEY=your_api_key_here
API_TIMEOUT=5000

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
SESSION_SECRET=your_session_secret_here

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

## Features

- **Multi-language detection**: Supports JavaScript, TypeScript, Python, Ruby, PHP, Go, Java, and more
- **Smart categorization**: Groups variables by purpose (Database, API, Auth, etc.)
- **Type detection**: Identifies string, number, boolean, and URL types
- **Security awareness**: Flags sensitive variables (passwords, secrets, keys)
- **Existing file merge**: Preserves existing values when updating .env files
- **Validation**: Checks for common mistakes and best practices
