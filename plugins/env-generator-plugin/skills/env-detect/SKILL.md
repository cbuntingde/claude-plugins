---
name: env-detect
description: Detect and document environment variable usage in code
category: code-analysis
---

# Environment Variable Detection Skill

Automatically detect, analyze, and document environment variable usage across your codebase. This skill helps you understand what configuration your application needs and generates proper .env files.

## When This Skill Is Used

Claude will automatically invoke this skill when:

- You're working with code that uses environment variables
- Configuration files are being created or modified
- CI/CD or deployment configurations are being set up
- You ask about environment setup or configuration
- Docker or containerization files are being created
- Questions arise about required environment variables

## What It Does

This skill performs comprehensive analysis of your codebase to:

1. **Detect Environment Variables**
   - Scans for all environment variable access patterns
   - Identifies variables across multiple programming languages
   - Finds variables in configuration files and Docker setups
   - Detects dynamic variable access patterns

2. **Analyze Usage Context**
   - Determines where and how each variable is used
   - Identifies required vs optional variables
   - Detects default values from code
   - Understands variable types and constraints

3. **Generate Documentation**
   - Creates well-organized .env files
   - Adds helpful comments and descriptions
   - Groups variables by purpose
   - Provides example values where appropriate

4. **Validate Configuration**
   - Checks for missing required variables
   - Identifies unused variables
   - Detects potential security issues
   - Suggests best practices

## How It Works

The skill uses a multi-phase approach:

### Phase 1: Pattern Detection
Scans codebase using language-specific patterns:
- JavaScript/TypeScript: `process.env.*`, `import.meta.env.*`
- Python: `os.getenv()`, `os.environ[]`, `os.environ.get()`
- Go: `os.Getenv()`
- Ruby: `ENV[]`
- PHP: `getenv()`, `$_ENV`
- Java: `System.getenv()`
- Shell scripts: `${VAR}`, `$VAR`

### Phase 2: Context Analysis
For each detected variable:
- Finds all usage locations
- Determines data type from usage
- Extracts default values
- Identifies related variables
- Assesses security sensitivity

### Phase 3: Categorization
Groups variables by domain:
- Database configuration
- API endpoints and keys
- Authentication and secrets
- Application settings
- Feature flags
- External services
- Logging and monitoring

### Phase 4: Documentation Generation
Creates comprehensive .env files with:
- Clear section organization
- Descriptive comments
- Type hints
- Example values
- Security indicators

## Supported Languages

- JavaScript / TypeScript
- Python
- Go
- Ruby
- PHP
- Java / Kotlin
- C# / .NET
- Shell scripts (bash, zsh)
- Docker configurations
- Kubernetes configs
- Terraform

## Example Output

```env
# ============================================
# Database Configuration
# ============================================
# PostgreSQL connection string
# Required: Yes
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# Connection pool maximum size
# Type: integer
# Default: 10
DATABASE_POOL_MAX=10

# ============================================
# API Configuration
# ============================================
# External API base URL
# Required: Yes
API_BASE_URL=https://api.example.com

# API authentication key
# Required: Yes
# Security: Sensitive - keep secret
API_KEY=your_api_key_here

# ============================================
# Application Settings
# ============================================
# Application environment (development, staging, production)
# Type: enum
# Default: development
NODE_ENV=development

# Server port
# Type: integer
# Default: 3000
PORT=3000
```

## Best Practices

This skill promotes configuration best practices:

1. **Documentation First**: Every variable has clear documentation
2. **Type Safety**: Types are explicitly documented
3. **Security Awareness**: Sensitive values are flagged
4. **Validation**: Built-in checks for common issues
5. **Organization**: Logical grouping of related variables
6. **Examples**: Helpful example values for development

## Integration with Other Tools

Works seamlessly with:
- Docker and docker-compose
- Kubernetes ConfigMaps and Secrets
- CI/CD pipelines
- Configuration management tools
- Secret management systems

## Notes

- Never includes actual secrets or passwords in output
- Respects existing .env files and merges changes
- Provides safe example values for development
- Follows .env file format standards
