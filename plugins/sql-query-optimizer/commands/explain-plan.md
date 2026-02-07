---
description: Generate and analyze SQL execution plans
---

# Explain Plan

Generates and analyzes database execution plans (EXPLAIN/EXPLAIN ANALYZE) to understand how queries are executed and identify performance bottlenecks.

## Usage

```
/explain-plan [query] [options]
```

### Arguments

- `query`: SQL query to explain. Can be a file path, raw SQL string, or query identifier.

### Options

- `--dialect <type>`: SQL dialect - `postgresql`, `mysql`, `sqlite`, `sqlserver`, `oracle`
- `--analyze`: Execute the query and show actual execution times (EXPLAIN ANALYZE)
- `--buffers`: Include buffer statistics (PostgreSQL)
- `--verbose`: Show detailed plan information
- `--format <type>`: Output format - `text`, `json`, `graphviz`, `html`
- `--compare <plan>`: Compare with another execution plan
- `--save <file>`: Save execution plan to file

## Execution Plan Analysis

### Key Metrics Analyzed

#### Cost Estimates
- **Total cost**: Query optimizer's cost estimate
- **Startup cost**: Cost before returning first row
- **Per-operation cost**: Cost of each plan node
- **Cost units**: Database-specific (disk page reads, etc.)

#### Row Estimates
- **Planned rows**: Estimated rows to process
- **Actual rows** (with ANALYZE): Actual rows processed
- **Row misestimation**: Difference between planned vs actual
- **Impact**: Affects join strategy choices

#### Time Metrics
- **Planning time**: Time to generate plan
- **Execution time**: Time to execute query
- **Per-node timing**: Time spent in each operation (with ANALYZE)

#### I/O Metrics
- **Buffer hits**: Blocks found in cache
- **Buffer reads**: Blocks read from disk
- **Temp writes**: Temporary blocks written
- **Local reads** vs **Shared reads**: Memory vs disk access

## Plan Node Types

### Scan Operations
- **Seq Scan**: Sequential table scan (usually bad for large tables)
- **Index Scan**: Scan using index (good for selective queries)
- **Index Only Scan**: Index-only scan (best - no table access)
- **Bitmap Scan**: Bitmap index scan (good for OR conditions)
- **Parallel Seq Scan**: Parallel sequential scan

### Join Operations
- **Nested Loop**: Good for small tables with indexed joins
- **Hash Join**: Good for large, unsorted datasets
- **Merge Join**: Good for large, sorted datasets
- **Hash Left/Right Join**: Specific join types

### Other Operations
- **Sort**: Explicit sorting operation
- **Aggregate**: Grouping and aggregation
- **Hash Aggregate**: Hash-based aggregation
- **Limit**: Limit/offset operation
- **Gather/Gather Merge**: Parallel execution nodes
- **CTE Scan**: Common table expression scan
- **Subquery Scan**: Subquery execution

## Examples

**Basic execution plan:**
```
/explain-plan "SELECT * FROM users WHERE email = 'test@example.com'"
```

**Execute and show actual performance:**
```
/explain-plan "SELECT * FROM orders o JOIN users u ON o.user_id = u.id" --analyze
```

**With buffer statistics (PostgreSQL):**
```
/explain-plan "./sql/report.sql" --analyze --buffers
```

**Compare two plans:**
```
/explain-plan "./query-v1.sql" --compare ./query-v2-explain.json
```

**Generate visual graph:**
```
/explain-plan "./sql/complex-query.sql" --format graphviz --save plan.dot
```

**Verbose detailed output:**
```
/explain-plan "./sql/analytics.sql" --analyze --verbose
```

## Interpreting Execution Plans

### Good Signs
✓ Index Only Scans
✓ Low cost per operation
✓ High hit rate in cache
✓ Parallel workers being used
✓ Efficient join types for data size

### Bad Signs
✗ Seq Scan on large tables
✗ High cost operations (millions)
✗ Low buffer hit rate
✗ Sort operations on large datasets
✗ Re-scans of CTEs (multiple CTE scans)
✗ Filter on large result sets

## Common Performance Issues

### Issue: Sequential Scan on Large Table
```
Seq Scan on orders  (cost=0.00..123456.78 rows=1000000 width=100)
  Filter: (status = 'pending')
```
**Problem**: Scanning entire table when only a few rows match
**Solution**: Add index on `orders(status)`

### Issue: Nested Loop with Many Rows
```
Nested Loop  (cost=0.42..876543.21 rows=100000 width=200)
  ->  Seq Scan on users
  ->  Index Scan using orders_user_id on orders
```
**Problem**: Nested loop repeated many times
**Solution**: Use Hash Join instead

### Issue: Repeated CTE Scans
```
CTE Scan on active_users
->  HashAggregate
    ->  Seq Scan on users
->  CTE Scan on active_users  (scanned multiple times)
```
**Problem**: CTE materialized and scanned multiple times
**Solution**: Use LATERAL JOIN or refactor query

### Issue: Sort on Large Dataset
```
Sort  (cost=12345.67..12399.99 rows=21729 width=200)
  Sort Key: orders.created_at DESC
```
**Problem**: Expensive sort operation
**Solution**: Create index on sort column

## Plan Comparison

With `--compare`, highlights:
- Cost differences
- Plan structure changes
- New operations added/removed
- Estimated vs actual row differences

Useful for:
- Regression testing
- Index impact validation
- Query refactor verification
- A/B testing queries

## Database-Specific Syntax

### PostgreSQL
```sql
EXPLAIN [ ( ANALYZE [ BOOLEAN ] ) [ VERBOSE [ BOOLEAN ] ] [ BUFFERS [ BOOLEAN ] ] [ SERIALIZE [ BOOLEAN ] ] [ COSTS [ BOOLEAN ] ] [ SETTINGS [ BOOLEAN ] ] [ TIMING [ BOOLEAN ] ] [ SUMMARY [ BOOLEAN ] ] [ MEMORY [ BOOLEAN ] ] [ FORMAT { TEXT | XML | JSON | YAML } ] ] statement
```

Recommended:
```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SERIALIZE, COSTS, SETTINGS, TIMING, SUMMARY, MEMORY)
```

### MySQL
```sql
EXPLAIN [ FORMAT = TRADITIONAL | JSON | TREE ] statement
```

For actual execution times:
```sql
-- MySQL 8.0.18+
EXPLAIN ANALYZE statement

-- Older versions
SET profiling = 1;
statement;
SHOW PROFILE;
```

### SQLite
```sql
EXPLAIN QUERY PLAN statement
EXPLAIN statement  -- Low-level bytecode
```

### SQL Server
```sql
SET SHOWPLAN_TEXT ON;
GO
statement;
GO

-- Or use
SET SHOWPLAN_XML ON;
-- Or use
SET STATISTICS PROFILE ON;
SET STATISTICS TIME ON;
SET STATISTICS IO ON;
```

## Visual Output

### GraphViz Format
Generates DOT format for visualization:
```
/explain-plan "SELECT * FROM users" --format graphviz --save plan.dot
```

Render with:
```bash
dot -Tpng plan.dot -o plan.png
```

### HTML Format
Interactive HTML with:
- Expandable nodes
- Color-coded by cost
- Tooltips with details
- Search functionality
- Export to PNG/PDF

## Performance Indicators

### High Cost Warning
Operations with cost > 10,000 flagged as high cost

### Row Misestimation
Planned vs actual ratio > 10x flagged
- Indication of outdated statistics
- Suggests running ANALYZE

### Buffer Miss Rate
High disk reads vs cache hits
- Suggests memory pressure
- May need larger shared_buffers

### Planning Time
Long planning time > 100ms
- Consider using prepared statements
- Simplify complex queries

## Best Practices

1. **Always use ANALYZE in testing**: Estimates can be very wrong
2. **Check row estimates**: Misestimation leads to bad plans
3. **Look at actual times**: Cost is just an estimate
4. **Compare before/after**: Validate optimization impact
5. **Consider data volume**: Plans change with data size
6. **Monitor production**: Real-world data differs from test data

## Automation

### CI/CD Integration
```yaml
# GitHub Actions
- name: Check query performance
  run: |
    claude explain-plan ./sql/query.sql --analyze --format json > plan.json
    python scripts/check-plan-cost.py plan.json --max-cost 10000
```

### Regression Detection
```bash
# Save baseline plan
claude explain-plan query.sql --analyze --save baseline-plan.json

# Compare in CI
claude explain-plan query.sql --analyze --compare baseline-plan.json
```

## See Also

- `/analyze-query` - Comprehensive query analysis
- `/optimize-sql` - Apply query optimizations
- `/suggest-indexes` - Get index recommendations based on plans
