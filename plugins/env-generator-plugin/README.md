# Environment Variable Generator Plugin

A Claude Code plugin that automatically generates `.env` files by analyzing your codebase for environment variable usage patterns.

## Features

- **Automatic Detection**: Scans code for environment variable usage across multiple languages
- **Smart Categorization**: Groups variables by purpose (Database, API, Auth, etc.)
- **Type Detection**: Identifies data types (string, number, boolean, URL, JSON)
- **Security Awareness**: Flags sensitive variables (passwords, secrets, keys)
- **Validation**: Checks for missing, unused, or misconfigured variables
- **Multi-Language Support**: Works with JavaScript, Python, Go, Ruby, PHP, Java, and more

## Installation

```bash
claude plugin install env-generator
```

## Usage

### Generate .env File

```bash
# Generate basic .env file
/generate-env

# Generate with example values
/generate-env --examples

# Generate to custom location
/generate-env --output .env.production

# Generate only required variables
/generate-env --required-only
```

### Validate .env File

```bash
# Validate default .env
/validate-env

# Validate specific file
/validate-env --file .env.production

# Check for unused variables
/validate-env --unused

# Check for missing required variables
/validate-env --missing
```

## Components

### Commands

- `/generate-env` - Generate .env files from code analysis
- `/validate-env` - Validate .env files and check for issues

### Agents

- **Environment Variable Analyzer** - Specialized agent for analyzing environment variable usage

### Skills

- **env-detect** - Automatic detection and documentation of environment variables

## Configuration

No configuration is required for basic usage. The plugin uses sensible defaults for all options.

### Environment Variables

The generated `.env` files support the following patterns:

- `KEY=value` - Standard key-value pairs
- `# Comments` - Lines starting with # are ignored
- Blank lines are preserved

### Categories Detected

Variables are automatically grouped by purpose:

| Category | Pattern Examples |
|----------|------------------|
| Database | `DATABASE_URL`, `DB_HOST`, `DATABASE_POOL_MAX` |
| API | `API_KEY`, `API_BASE_URL`, `API_TIMEOUT` |
| Auth | `JWT_SECRET`, `AUTH_TOKEN`, `SESSION_SECRET` |
| AWS | `AWS_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` |
| Application | `PORT`, `NODE_ENV`, `LOG_LEVEL` |

## Supported Patterns

The plugin detects environment variables in:

- **JavaScript/TypeScript**: `process.env.VAR`, `import.meta.env.VAR`
- **Python**: `os.getenv('VAR')`, `os.environ['VAR']`
- **Go**: `os.Getenv('VAR')`
- **Ruby**: `ENV['VAR']`
- **PHP**: `getenv('VAR')`, `$_ENV['VAR']`
- **Java/Kotlin**: `System.getenv('VAR')`
- **Shell**: `${VAR}`, `$VAR`
- **C#**: `Environment.GetEnvironmentVariable('VAR')`

## Example Output

```env
# ============================================
# Database Configuration
# ============================================
# PostgreSQL connection string
# Type: URL
# Required: Yes
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# Maximum number of connections in the pool
# Type: integer
# Default: 10
DATABASE_POOL_MAX=10

# Connection timeout in milliseconds
# Type: integer
# Default: 30000
DATABASE_TIMEOUT=30000

# ============================================
# API Configuration
# ============================================
# External API base URL
# Type: URL
# Required: Yes
API_BASE_URL=https://api.example.com

# API authentication key
# Type: string
# Required: Yes
# Security: Sensitive - keep secret
API_KEY=your_api_key_here

# ============================================
# Application Settings
# ============================================
# Application environment
# Type: enum (development, staging, production)
# Default: development
NODE_ENV=development

# Server port
# Type: integer
# Default: 3000
PORT=3000

# Log level
# Type: enum (error, warn, info, debug)
# Default: info
LOG_LEVEL=info
```

## Development

### Project Structure

```
env-generator-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   ├── generate-env.md      # Generate .env command
│   └── validate-env.md      # Validate .env command
├── agents/
│   └── env-analyzer.md      # Environment analyzer agent
├── skills/
│   └── env-detect/
│       └── SKILL.md         # Auto-detection skill
└── README.md
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Chris

## Version

1.0.0
