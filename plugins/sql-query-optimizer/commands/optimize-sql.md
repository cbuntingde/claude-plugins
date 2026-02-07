---
description: Optimize SQL queries for better performance
---

# Optimize SQL

Analyzes and optimizes SQL queries to improve database performance, reduce execution time, and minimize resource usage.

## Usage

```
/optimize-sql [query] [options]
```

### Arguments

- `query`: SQL query to optimize. Can be a file path, raw SQL string, or query identifier. Default: scans for SQL files.

### Options

- `--dialect <type>`: SQL dialect - `postgresql`, `mysql`, `sqlite`, `sqlserver`, `oracle`. Auto-detected by default.
- `--aggressive`: Enable more aggressive optimizations (may change query semantics). Default: false
- `--safe-only`: Apply only safe, semantic-preserving optimizations. Default: true
- `--explain`: Generate and analyze EXPLAIN/EXPLAIN ANALYZE output. Default: true
- `--format <type>`: Output format - `text`, `json`, `markdown`. Default: markdown
- `--context <file>`: Provide schema/context file for better analysis
- `-y, --yes`: Apply optimizations without confirmation

## Optimization Categories

### Query Structure Optimizations
- Eliminate unnecessary subqueries
- Convert correlated subqueries to JOINs
- Optimize JOIN order and types
- Remove redundant conditions
- Simplify complex expressions

### Indexing Optimizations
- Suggest missing indexes
- Identify unused indexes
- Recommend composite indexes
- Optimize index column order
- Suggest partial/filtered indexes

### Execution Plan Optimizations
- Reduce full table scans
- Optimize JOIN strategies
- Minimize sorting operations
- Reduce network round-trips
- Batch operations

### Data Access Optimizations
- Use appropriate JOIN types (INNER, LEFT, LATERAL)
- Implement pagination efficiently
- Replace OR with UNION when appropriate
- Use EXISTS instead of IN for subqueries
- Optimize LIKE/ILIKE patterns

## Examples

**Optimize a query from a file:**
```
/optimize-sql ./queries/user-report.sql
```

**Optimize with specific dialect:**
```
/optimize-sql "./sql/analytics.sql" --dialect postgresql
```

**Aggressive optimization (may change semantics):**
```
/optimize-sql "./sql/complex-query.sql" --aggressive
```

**With schema context:**
```
/optimize-sql "./sql/query.sql" --context ./schema.sql
```

**Provide raw SQL:**
```
/optimize-sql "SELECT * FROM users WHERE email LIKE '%@example.com'"
```

**Output as JSON:**
```
/optimize-sql "./sql/query.sql" --format json
```

## Analysis Report

For each optimization, you'll see:

### Original Query
The query as provided, with line numbers

### Execution Plan Analysis
- Query execution time (if EXPLAIN available)
- Table scan types (Seq Scan, Index Scan, etc.)
- Join methods used
- Sorting and aggregation operations
- Estimated vs actual row counts

### Issues Found
- Performance bottlenecks (high cost operations)
- Missing indexes
- Inefficient patterns
- N+1 query problems
- Redundant computations

### Optimized Query
Refactored query with improvements applied

### Optimization Suggestions
List of specific optimizations with:
- **Type**: Category of optimization
- **Impact**: Expected performance improvement (High/Medium/Low)
- **Description**: What was changed and why
- **Risk level**: Safe/Aggressive (may change semantics)

### Index Recommendations
Suggested indexes to create:
- Index definition (CREATE INDEX statement)
- Expected benefit
- Estimated size impact
- Trade-offs (write performance, storage)

## Common Optimizations

### Subquery to JOIN
```sql
-- Before
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE active = true)

-- After
SELECT DISTINCT orders.*
FROM orders
INNER JOIN users ON orders.user_id = users.id
WHERE users.active = true
```

### EXISTS instead of IN
```sql
-- Before
SELECT * FROM orders o
WHERE user_id IN (SELECT id FROM users WHERE region = 'US')

-- After
SELECT * FROM orders o
WHERE EXISTS (SELECT 1 FROM users WHERE id = o.user_id AND region = 'US')
```

### CTE for Readability and Performance
```sql
-- Before
SELECT *
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.total > (
    SELECT AVG(total)
    FROM orders
    WHERE created_at > NOW() - INTERVAL '30 days'
)

-- After
WITH recent_avg AS (
    SELECT AVG(total) as avg_total
    FROM orders
    WHERE created_at > NOW() - INTERVAL '30 days'
)
SELECT o.*, u.*
FROM orders o
JOIN users u ON o.user_id = u.id
CROSS JOIN recent_avg ra
WHERE o.total > ra.avg_total
```

### Optimize LIKE Queries
```sql
-- Before (leading wildcard - no index usage)
SELECT * FROM users WHERE email LIKE '%@gmail.com'

-- After (uses index)
SELECT * FROM users WHERE email LIKE 'user%@gmail.com'
-- Or use full-text search for pattern matching
SELECT * FROM users WHERE to_tsvector(email) @@ to_tsquery('@gmail.com')
```

## Safety Features

- **Semantic preservation**: Safe-only mode guarantees same results
- **Explain verification**: Compares execution plans before/after
- **Rollback support**: Original query always preserved
- **Dry-run mode**: Review suggestions before applying
- **Test case generation**: Creates test queries to verify correctness

## Best Practices

1. **Always review** execution plans (EXPLAIN ANALYZE)
2. **Test with real data** - performance differs with data volume
3. **Measure before/after** - use actual timing, not just estimates
4. **Consider write overhead** - indexes improve reads but slow writes
5. **Update statistics** - ensure table statistics are current
6. **Monitor in production** - real-world performance matters most

## Database-Specific Notes

### PostgreSQL
- Use `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` for detailed plans
- Consider `VACUUM ANALYZE` before optimizing
- Leverage partial indexes and expression indexes
- Use `pg_stat_statements` for query performance tracking

### MySQL
- Use `EXPLAIN FORMAT=JSON` for detailed plans
- Update table statistics with `ANALYZE TABLE`
- Consider covering indexes for frequent queries
- Use `SHOW PROFILE` for detailed execution analysis

### SQLite
- Use `EXPLAIN QUERY PLAN` for analysis
- Consider `ANALYZE` command for statistics
- Optimize WITHOUT ROWID tables for large datasets
- Use appropriate page sizes

## See Also

- `/analyze-query` - Deep query analysis
- `/explain-plan` - View execution plans
- `/suggest-indexes` - Index recommendations
- `/refactor-query` - Query refactoring
