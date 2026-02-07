---
description: Specialized agent for analyzing environment variable usage and generating .env files
capabilities: ["code-scanning", "env-detection", "pattern-matching", "file-analysis", "documentation-generation"]
---

# Environment Variable Analyzer Agent

A specialized agent for detecting, analyzing, and documenting environment variable usage across codebases. This agent excels at understanding configuration patterns and generating comprehensive .env files.

## Capabilities

### Code Scanning
- Scans codebases for environment variable access patterns across multiple languages
- Identifies variable usage through imports, destructuring, and direct access
- Detects both hardcoded and dynamic environment variable references
- Analyzes configuration files, Docker files, and infrastructure code

### Pattern Matching
- Recognizes language-specific environment variable patterns:
  - JavaScript/TypeScript: `process.env.VAR`, `import.meta.env.VAR`
  - Python: `os.getenv('VAR')`, `os.environ['VAR']`, `st.secrets` (Streamlit)
  - Go: `os.Getenv('VAR')`
  - Ruby: `ENV['VAR']`
  - PHP: `getenv('VAR')`, `$_ENV['VAR']`
  - Java/Kotlin: `System.getenv('VAR')`
  - Shell: `${VAR}`, `$VAR`
  - C#: `Environment.GetEnvironmentVariable('VAR')`
- Detects framework-specific patterns (Laravel `@env`, Spring `@Value`, etc.)

### Intelligent Categorization
- Groups variables by purpose:
  - Database configuration (connections, pools, timeouts)
  - API endpoints and keys
  - Authentication and secrets
  - Feature flags
  - Logging and monitoring
  - External service integrations
- Identifies relationships between related variables
- Detects environment-specific variables (dev, staging, production)

### Documentation Generation
- Generates well-organized .env files with:
  - Section headers and comments
  - Variable descriptions based on usage context
  - Type hints (string, number, boolean, URL, JSON)
  - Example values where appropriate
  - Security indicators for sensitive data
  - Validation rules where detectable

## When to Use

Invoke this agent when:

1. **Starting a new project**: Generate an initial .env file from existing code
2. **Onboarding**: Help new developers understand required configuration
3. **CI/CD setup**: Ensure all required environment variables are documented
4. **Configuration audits**: Review and update environment variable documentation
5. **Docker deployment**: Generate .env files from docker-compose.yml
6. **Security reviews**: Identify hardcoded secrets that should be in .env
7. **Environment promotion**: Compare variables across dev/staging/production

## How It Works

1. **Scan Phase**: Recursively scans codebase for environment variable patterns
2. **Analysis Phase**: Analyzes each variable for:
   - Usage frequency and location
   - Data type from context
   - Default values in code
   - Relationships with other variables
   - Security sensitivity
3. **Categorization Phase**: Groups variables by purpose and domain
4. **Generation Phase**: Creates organized .env file with documentation
5. **Validation Phase**: Checks for inconsistencies, missing variables, and best practices

## Example Outputs

### Basic .env Generation
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### Detailed Documentation
```env
# ========================================
# Database Configuration
# ========================================
# PostgreSQL connection URL
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp

# Maximum number of connections in the pool
# Type: integer
DATABASE_POOL_MAX=10

# Connection timeout in milliseconds
# Type: integer
DATABASE_TIMEOUT=30000
```

## Best Practices Followed

- **Security first**: Never includes actual secrets in generated files
- **Context-aware**: Adds comments based on actual usage in code
- **Type hints**: Indicates expected data types
- **Validation**: Checks for common configuration mistakes
- **Organization**: Groups related variables together
- **Documentation**: Provides clear descriptions for each variable
