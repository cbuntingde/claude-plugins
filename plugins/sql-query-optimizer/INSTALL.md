# Installation Guide: SQL Query Optimizer Plugin

## Prerequisites

- Claude Code CLI installed
- Git (for cloning)
- Appropriate database client (optional, for actual execution plans)

## Installation Methods

### Method 1: From Marketplace (Recommended)

```bash
claude plugin install sql-query-optimizer
```

### Method 2: Manual Installation

1. **Clone or download the plugin**
```bash
git clone https://github.com/your-org/sql-query-optimizer.git
cd sql-query-optimizer
```

2. **Install to your preferred scope**

```bash
# User scope (recommended) - available to all your projects
claude plugin install ./sql-query-optimizer --scope user

# Project scope - shared with team via version control
claude plugin install ./sql-query-optimizer --scope project

# Local scope - not shared, gitignored
claude plugin install ./sql-query-optimizer --scope local
```

3. **Verify installation**
```bash
claude plugin list | grep sql-query-optimizer
```

## Post-Installation Setup

### 1. Configure Database Dialect

Create or edit `.claude/settings.json` in your project:

```json
{
  "sqlQueryOptimizer": {
    "dialect": "postgresql",
    "enabled": true,
    "autoAnalyze": true,
    "severity": "medium"
  }
}
```

Supported dialects:
- `postgresql`
- `mysql`
- `sqlite`
- `sqlserver`
- `oracle`

### 2. Provide Schema Context (Optional but Recommended)

Place your schema definition in one of these locations:

```
schema.sql
db/schema.sql
migrations/schema.sql
.claude/schema.sql
```

Example schema.sql:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(20),
    total DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 3. Enable Auto-Analysis (Optional)

The plugin can automatically analyze SQL files as you work:

```json
{
  "sqlQueryOptimizer": {
    "autoAnalyze": true,
    "analyzeOnSave": true,
    "analyzeOnRead": true
  }
}
```

## Configuration Options

### Full Configuration Example

```json
{
  "sqlQueryOptimizer": {
    "enabled": true,
    "dialect": "postgresql",
    "autoAnalyze": true,
    "analyzeOnSave": true,
    "analyzeOnRead": false,
    "severity": "medium",
    "ignorePatterns": [
      "node_modules/**",
      "dist/**",
      "**/*.test.sql",
      "migrations/**"
    ],
    "rules": {
      "selectStar": "warning",
      "nPlusOne": "error",
      "missingWhere": "warning",
      "functionOnIndexed": "warning",
      "missingIndex": "info"
    },
    "outputFormat": "markdown",
    "includeSchema": true,
    "schemaPath": "./db/schema.sql"
  }
}
```

### Severity Levels

- `error`: Blocks completion, must fix
- `warning`: Highlights but allows continuation
- `info`: Informative suggestions only
- `off`: Disable the rule

## Database-Specific Setup

### PostgreSQL

1. Ensure you have access to run `EXPLAIN ANALYZE`:
```sql
-- Grant explain permissions
GRANT USAGE ON SCHEMA public TO your_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO your_user;
```

2. Optional: Install additional tools:
```bash
# For better analysis
brew install pgexplain  # macOS
# or
apt-get install postgresql-client  # Linux
```

### MySQL

1. Ensure user has permissions:
```sql
GRANT SELECT ON database_name.* TO 'user'@'host';
GRANT SHOW DATABASES ON *.* TO 'user'@'host';
```

2. For EXPLAIN analysis:
```sql
-- Enable profiling (MySQL 5.7 and earlier)
SET profiling = 1;
```

### SQL Server

1. Grant permissions:
```sql
GRANT SHOWPLAN TO your_user;
GRANT VIEW DEFINITION TO your_user;
```

### SQLite

No special permissions needed. Ensure SQLite3 command-line tool is installed:
```bash
# macOS
brew install sqlite

# Linux
apt-get install sqlite3

# Windows
# Download from https://www.sqlite.org/download.html
```

## Verification

### Test the Installation

1. Create a test SQL file:
```bash
echo "SELECT * FROM users WHERE email LIKE '%@example.com'" > test-query.sql
```

2. Run analysis:
```bash
claude analyze-query test-query.sql --dialect postgresql
```

3. Check for suggestions

### Test Commands

```bash
# List all available commands
claude sql-query-optimizer --help

# Run optimization
claude optimize-sql ./queries/report.sql --dry-run

# Generate index suggestions
claude suggest-indexes ./queries/ --format sql
```

## IDE Integration

### VS Code

1. Install Claude Code extension
2. Plugin commands available via command palette (Cmd/Ctrl + Shift + P)
3. SQL files show inline suggestions

### JetBrains IDEs

1. Install Claude Code plugin
2. SQL optimization available in right-click menu
3. Real-time query analysis in editor

### Vim/Neovim

Add to `.vimrc` or `init.lua`:
```vim
" Auto-analyze SQL files
autocmd BufWritePost *.sql silent! !claude analyze-query "%:p" &
```

## Updating the Plugin

```bash
# Update to latest version
claude plugin update sql-query-optimizer

# Check version
claude plugin info sql-query-optimizer
```

## Uninstallation

```bash
# Uninstall from current scope
claude plugin uninstall sql-query-optimizer

# Or from specific scope
claude plugin uninstall sql-query-optimizer --scope user
```

## Troubleshooting

### Plugin Not Loading

```bash
# Check if plugin is installed
claude plugin list

# Check plugin status
claude plugin info sql-query-optimizer

# Check logs
claude --debug
```

### Schema Not Found

**Problem**: "Schema context not available"

**Solution**:
1. Ensure schema.sql exists in project root or `.claude/` directory
2. Or specify schema path in settings:
```json
{
  "sqlQueryOptimizer": {
    "schemaPath": "./db/schema.sql"
  }
}
```

### Database Connection Issues

**Problem**: Cannot execute EXPLAIN queries

**Solution**:
- Plugin doesn't need DB connection for most features
- For actual EXPLAIN ANALYZE, provide execution plan as file:
```bash
claude explain-plan --analyze --file ./plan.json
```

### Dialect Not Detected

**Problem**: "Cannot determine SQL dialect"

**Solution**: Specify dialect explicitly:
```bash
claude analyze-query ./query.sql --dialect postgresql
```

Or in settings:
```json
{
  "sqlQueryOptimizer": {
    "dialect": "postgresql"
  }
}
```

## Getting Help

- Documentation: [Plugin Docs](https://code.claude.com/docs/en/plugins)
- Issues: [GitHub Issues](https://github.com/your-org/sql-query-optimizer/issues)
- Discussions: [GitHub Discussions](https://github.com/your-org/sql-query-optimizer/discussions)

## Next Steps

1. Read the [README](README.md) for usage examples
2. Run `/analyze-query` on your existing SQL files
3. Review index recommendations with `/suggest-indexes`
4. Apply optimizations with `/optimize-sql`
5. Configure CI/CD integration for automated checks
