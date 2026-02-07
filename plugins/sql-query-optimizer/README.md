# SQL Query Optimizer Plugin

A comprehensive SQL query optimization plugin for Claude Code that analyzes, refactors, and optimizes complex SQL queries for better database performance.

## Features

### 🔍 Intelligent Query Analysis

- **Performance bottleneck identification**: Automatically find slow operations and expensive scans
- **Execution plan analysis**: Deep understanding of how queries execute
- **Multi-database support**: PostgreSQL, MySQL, SQLite, SQL Server, Oracle
- **Anti-pattern detection**: N+1 queries, SELECT *, missing indexes, and more

### 🚀 Optimization Commands

#### `/optimize-sql`
Analyzes and optimizes SQL queries for better performance.

```bash
# Optimize a specific query
/optimize-sql ./queries/slow-report.sql

# Aggressive optimization (may change semantics)
/optimize-sql ./query.sql --aggressive

# With schema context
/optimize-sql ./query.sql --schema ./schema.sql
```

#### `/analyze-query`
Performs comprehensive analysis of SQL query performance.

```bash
# Deep analysis
/analyze-query ./sql/analytics.sql --deep

# Focus on performance
/analyze-query ./query.sql --focus performance

# Generate HTML report
/analyze-query ./query.sql --format html
```

#### `/explain-plan`
Generates and analyzes database execution plans.

```bash
# Basic execution plan
/explain-plan "SELECT * FROM users WHERE email = ?"

# Execute and show actual performance
/explain-plan ./query.sql --analyze --buffers

# Compare plans
/explain-plan ./query-v1.sql --compare ./query-v2-plan.json
```

#### `/suggest-indexes`
Recommends optimal indexes for SQL queries.

```bash
# Basic index suggestions
/suggest-indexes ./queries/report.sql

# Analyze entire directory
/suggest-indexes ./sql/ --batch

# Include write impact analysis
/suggest-indexes ./query.sql --analyze-writes --estimate-size

# Output as SQL migration
/suggest-indexes ./sql/ --format sql --output migrations/add_indexes.sql
```

#### `/refactor-query`
Refactors SQL queries for better structure and maintainability.

```bash
# Basic refactoring
/refactor-query ./sql/legacy-query.sql

# Convert to CTEs
/refactor-query ./query.sql --ctes

# Apply style guide
/refactor-query ./queries.sql --style google

# Interactive mode
/refactor-query ./sql/ --interactive --in-place
```

### 🤖 SQL Optimization Expert Agent

A specialized agent for deep database performance analysis:

- Root cause analysis of slow queries
- Index optimization strategies (composite, partial, expression indexes)
- Query refactoring (subqueries to JOINs, CTE optimization)
- Database-specific optimization patterns
- Execution plan interpretation

### ⚡ Query Optimization Detector Skill

Automatically detects SQL optimization opportunities while you code:

- SELECT * in production queries
- N+1 query patterns
- Functions on indexed columns
- Missing WHERE clauses
- Inefficient JOIN patterns
- Index opportunities

### 🪝 Automatic Hooks

- **Post-write analysis**: Analyzes SQL files when saved
- **Keyword triggers**: Automatically invokes expert agent for SQL-related queries
- **Session start**: Detects schema and database configuration
- **On read**: Detects optimization opportunities in SQL files

## Installation

### Install via Claude Code

```bash
claude plugin install sql-query-optimizer
```

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/cbuntingde/claude-plugins-dev.git
```

2. Navigate to the plugin directory:
```bash
cd claude-plugins-dev/plugins/sql-query-optimizer
```

3. Install dependencies:
```bash
npm install
```

## Quick Start

### 1. Install the Plugin

```bash
claude plugin install sql-query-optimizer
```

### 2. Configure Database Dialect

Create `.claude/settings.json`:
```json
{
  "sqlQueryOptimizer": {
    "dialect": "postgresql",
    "enabled": true
  }
}
```

### 3. Provide Schema Context (Optional)

Create `schema.sql` in your project root:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

### 4. Analyze Your Queries

```bash
/analyze-query ./sql/slow-query.sql
```

## Usage Examples

### Example 1: Optimize Slow Report Query

**Problem**: Report takes 30 seconds to generate

```sql
-- Original query (slow-report.sql)
SELECT o.*,
       (SELECT name FROM customers WHERE id = o.customer_id) as customer_name,
       (SELECT SUM(total) FROM order_items WHERE order_id = o.id) as item_total
FROM orders o
WHERE o.status = 'pending'
  AND o.created_at > '2024-01-01'
ORDER BY o.created_at DESC;
```

```bash
# Analyze the query
/analyze-query ./sql/slow-report.sql --deep

# Get optimization suggestions
/optimize-sql ./sql/slow-report.sql

# Suggest indexes
/suggest-indexes ./sql/slow-report.sql
```

**Result**:
```sql
-- Optimized query (30s → 200ms)
WITH order_stats AS (
    SELECT
        o.id,
        o.customer_id,
        o.status,
        o.created_at,
        c.name as customer_name,
        SUM(oi.total) as item_total
    FROM orders o
    JOIN customers c ON c.customer_id = c.id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'pending'
      AND o.created_at > '2024-01-01'
    GROUP BY o.id, o.customer_id, o.status, o.created_at, c.name
)
SELECT * FROM order_stats
ORDER BY created_at DESC;
```

### Example 2: Fix N+1 Query Pattern

**Problem**: Application makes N database calls in a loop

```python
# Application code (users.py)
def get_users_with_orders():
    users = db.execute("SELECT * FROM users WHERE active = true")
    for user in users:
        user['orders'] = db.execute(
            "SELECT * FROM orders WHERE user_id = ?",
            (user['id'],)
        )
    return users
```

```bash
# The skill detects N+1 pattern automatically
# Run optimization
/optimize-sql ./api/users.py
```

**Solution**: Single query with JOIN
```sql
SELECT
    u.*,
    json_agg(
        json_build_object(
            'id', o.id,
            'total', o.total,
            'status', o.status
        )
    ) as orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = true
GROUP BY u.id;
```

### Example 3: Index Optimization

**Problem**: Query performs full table scan

```sql
-- Query
SELECT * FROM orders
WHERE status = 'pending'
  AND created_at > '2024-01-01'
ORDER BY created_at DESC
LIMIT 100;
```

```bash
# Suggest indexes
/suggest-indexes ./sql/query.sql --analyze-writes
```

**Recommendation**:
```sql
-- Priority: HIGH
-- Expected improvement: 95% reduction
-- Index size: ~50 MB
-- Write impact: +5% on INSERT/UPDATE
CREATE INDEX CONCURRENTLY idx_orders_status_created
ON orders (status, created_at DESC);

-- Or partial index for even better performance
CREATE INDEX CONCURRENTLY idx_orders_pending_active
ON orders (created_at DESC)
WHERE status = 'pending';
```

### Example 4: Query Refactoring

**Problem**: Complex nested subqueries hard to maintain

```sql
-- Original
SELECT * FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id
) AS freq
WHERE cnt > 10
  AND user_id IN (SELECT id FROM users WHERE active = true);
```

```bash
# Refactor to CTEs
/refactor-query ./query.sql --ctes --modernize
```

**Result**:
```sql
WITH active_users AS (
    SELECT id FROM users WHERE active = true
),
frequent_buyers AS (
    SELECT
        user_id,
        COUNT(*) as order_count
    FROM orders
    WHERE status = 'completed'
      AND user_id IN (SELECT id FROM active_users)
    GROUP BY user_id
    HAVING COUNT(*) > 10
)
SELECT fb.*, u.name, u.email
FROM frequent_buyers fb
JOIN users u ON u.id = fb.user_id;
```

## Optimization Categories

### Query Structure
- Eliminate unnecessary subqueries
- Convert correlated subqueries to JOINs
- Optimize JOIN order and types
- Use CTEs for readability and performance
- Apply modern SQL features

### Indexing
- Suggest missing indexes
- Identify unused indexes
- Recommend composite indexes
- Optimize index column order
- Suggest partial/filtered indexes
- Expression/functional indexes

### Performance Patterns
- Reduce full table scans
- Optimize JOIN strategies
- Minimize sorting operations
- Eliminate N+1 queries
- Batch operations

### Anti-Patterns
- SELECT * in production
- Functions on indexed columns
- OR conditions preventing index use
- Deep pagination with OFFSET
- Implicit type conversions

## Configuration

### Project Settings

Create `.claude/settings.json`:
```json
{
  "sqlQueryOptimizer": {
    "enabled": true,
    "dialect": "postgresql",
    "autoAnalyze": true,
    "severity": "medium",
    "ignorePatterns": [
      "node_modules/**",
      "dist/**",
      "**/*.test.sql"
    ],
    "rules": {
      "selectStar": "warning",
      "nPlusOne": "error",
      "missingWhere": "warning",
      "functionOnIndexed": "warning"
    }
  }
}
```

### Style Guide

Choose a SQL style:
```bash
/refactor-query ./sql/ --style google    # Google SQL Style Guide
/refactor-query ./sql/ --style standard  # Standard SQL style
/refactor-query ./sql/ --style github    # GitHub SQL style
```

## Database-Specific Features

### PostgreSQL
- Parallel query optimization
- CTE materialization control (MATERIALIZED/NOT MATERIALIZED)
- GiST, GIN, SP-GiST indexes
- Partial indexes
- Expression indexes
- FILTER clause in aggregates
- LATERAL joins

### MySQL
- Index merge optimization
- EXPLAIN FORMAT=JSON
- Functional indexes (8.0+)
- Invisible indexes
- Window functions (8.0+)
- CTEs (8.0+)

### SQL Server
- Execution plan cache analysis
- Missing index DMVs
- Parameter sniffing
- Columnstore indexes
- Filtered indexes
- Query hints

### SQLite
- Query planner control
- WITHOUT ROWID tables
- Partial indexes
- Expression indexes
- ANALYZE command

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/sql-review.yml
name: SQL Review

on: [pull_request]

jobs:
  sql-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Claude Code
        run: npm install -g claude-code

      - name: Install plugin
        run: claude plugin install sql-query-optimizer

      - name: Analyze SQL files
        run: |
          claude analyze-query ./sql/ \
            --format json \
            --schema ./schema.sql \
            > analysis.json

      - name: Check for critical issues
        run: |
          python scripts/check-sql-issues.py analysis.json --max-severity high
```

### Pre-commit Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check SQL files
for file in $(git diff --cached --name-only | grep '\.sql$'); do
    claude analyze-query "$file" --severity high
    if [ $? -ne 0 ]; then
        echo "SQL issues found in $file"
        exit 1
    fi
done
```

## Best Practices

1. **Always test optimizations** with production-like data volumes
2. **Measure before/after** using EXPLAIN ANALYZE
3. **Consider write performance** when adding indexes
4. **Update statistics** (ANALYZE) before optimization
5. **Monitor in production** after applying changes
6. **Use version control** for query changes
7. **Review optimizations** with your team
8. **Document changes** for future reference

## Troubleshooting

### Plugin Not Loading
```bash
claude plugin list | grep sql-query-optimizer
claude plugin info sql-query-optimizer
```

### Schema Not Found
Ensure `schema.sql` exists or specify path:
```json
{
  "sqlQueryOptimizer": {
    "schemaPath": "./db/schema.sql"
  }
}
```

### Dialect Not Detected
Specify explicitly in settings or command:
```bash
/analyze-query ./query.sql --dialect postgresql
```

## Contributing

Contributions welcome! Areas for improvement:
- Additional database support (Cassandra, MongoDB, etc.)
- More advanced index recommendations
- Machine learning for cost estimation
- Visual query plan representation
- Query history and regression detection

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- Issues: [GitHub Issues](https://github.com/your-org/sql-query-optimizer/issues)
- Discussions: [GitHub Discussions](https://github.com/your-org/sql-query-optimizer/discussions)

## Acknowledgments

Built with:
- [Claude Code Plugin System](https://code.claude.com/docs/en/plugins)
- Database-specific optimization techniques from community
- SQL best practices from Google's SQL Style Guide
