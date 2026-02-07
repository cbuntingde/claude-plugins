---
description: Suggest optimal indexes for SQL queries
---

# Suggest Indexes

Analyzes SQL queries and database schema to recommend optimal indexes that maximize query performance while minimizing write overhead and storage costs.

## Usage

```
/suggest-indexes [query] [options]
```

### Arguments

- `query`: SQL query to analyze. Can be a file path, raw SQL string, or directory of SQL files.

### Options

- `--schema <file>`: Database schema definition for context
- `--dialect <type>`: SQL dialect - `postgresql`, `mysql`, `sqlite`, `sqlserver`, `oracle`
- `--existing`: Show existing indexes (from schema or connection)
- `--estimate-size`: Estimate index storage requirements
- `--analyze-writes`: Consider write performance impact
- `--priority <level>`: Minimum priority - `critical`, `high`, `medium`, `low`. Default: medium
- `--format <type>`: Output format - `sql`, `json`, `markdown`, `html`
- `--batch <file>`: Batch analyze multiple queries from file

## Index Analysis

### Query Pattern Detection
- WHERE clause predicates
- JOIN conditions
- ORDER BY clauses
- GROUP BY columns
- Window function partitions
- Covering index opportunities

### Index Types Recommended

#### B-tree Indexes
Default index type for:
- Equality and range queries
- ORDER BY optimization
- Multi-column indexes

#### Hash Indexes
For equality-only queries (PostgreSQL):
- Exact match lookups
- Faster than B-tree for equals
- Smaller size

#### GiST/SP-GiST Indexes
For complex data:
- Geometric data
- Full-text search
- Range queries (PostgreSQL)

#### GIN Indexes
For array and composite types:
- Array contains
- JSONB operations
- Full-text search

#### Partial/Filtered Indexes
For selective queries:
- Index only relevant rows
- Smaller size
- Better query performance

#### Expression/Functional Indexes
For computed columns:
- Functions in WHERE clause
- Computed expression results
- Case-insensitive searches

#### Unique Indexes
For data integrity:
- Primary keys
- Unique constraints
- Business rules

## Examples

**Basic index suggestions:**
```
/suggest-indexes "./sql/report.sql"
```

**With schema context:**
```
/suggest-indexes "./sql/analytics.sql" --schema ./schema.sql
```

**Analyze entire directory:**
```
/suggest-indexes ./sql/ --batch
```

**Include write impact analysis:**
```
/suggest-indexes "./sql/query.sql" --analyze-writes --estimate-size
```

**Only critical indexes:**
```
/suggest-indexes "./sql/queries.sql" --priority critical
```

**Output as SQL migration:**
```
/suggest-indexes "./sql/" --format sql --output migrations/add_indexes.sql
```

**MySQL specific:**
```
/suggest-indexes "./queries.sql" --dialect mysql --existing
```

## Analysis Report

### Index Recommendations

Each recommendation includes:

#### Index Definition
```sql
CREATE INDEX idx_users_email_created ON users (email, created_at DESC);
```

#### Priority Level
- **Critical**: No index on selective column - full table scan
- **High**: Significant performance improvement possible
- **Medium**: Moderate improvement or low-impact
- **Low**: Minor improvement or edge case

#### Query Impact
- Queries that will benefit
- Expected performance improvement (% faster)
- Reduction in rows scanned

#### Cost Analysis
- Storage size estimate
- Write performance impact
- Maintenance overhead
- Build time estimate

#### Covering Index Check
Shows if index can cover the query (index-only scan):
```
Covering index opportunity: YES
Include columns: status, total, created_at
```

### Index Priority Matrix

```
HIGH IMPACT, LOW COST    → Recommend immediately
HIGH IMPACT, HIGH COST   → Evaluate trade-offs
LOW IMPACT, LOW COST     → Consider if frequent
LOW IMPACT, HIGH COST    → Generally avoid
```

## Common Index Patterns

### Equality + Range (Most Common)
```sql
-- Query
WHERE status = 'active' AND created_at > '2024-01-01'

-- Recommended index
CREATE INDEX idx_orders_status_created
ON orders (status, created_at);
```

### Covering Index
```sql
-- Query
SELECT user_id, status, total
FROM orders
WHERE created_at > '2024-01-01'
ORDER BY created_at DESC;

-- Recommended covering index (avoids table access)
CREATE INDEX idx_orders_created_covering
ON orders (created_at DESC)
INCLUDE (user_id, status, total);
```

### Partial Index
```sql
-- Query (mostly queries active users)
SELECT * FROM users WHERE active = true AND email = ?;

-- Recommended partial index (smaller, faster)
CREATE INDEX idx_users_active_email
ON users (email)
WHERE active = true;
```

### Expression Index
```sql
-- Query with function
WHERE LOWER(email) = 'user@example.com'

-- Recommended expression index
CREATE INDEX idx_users_email_lower
ON users (LOWER(email));
```

### Composite Index Order
```sql
-- Query
WHERE region = 'US' AND created_at > '2024-01-01'
ORDER BY created_at DESC;

-- Order matters: equality columns first, then range
CREATE INDEX idx_users_region_created
ON users (region, created_at DESC);
```

### Join Index
```sql
-- Query
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.status = 'active';

-- Indexes on both sides
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_users_status_id ON users (status, id);
```

## Index Anti-Patterns

### Avoid: Low-Selectivity Indexes
```sql
-- Bad: Index on gender (only 2-3 values)
CREATE INDEX idx_users_gender ON users (gender);

-- Better: Use partial index or bitmap index
CREATE INDEX idx_users_gender_active
ON users (gender)
WHERE active = true;
```

### Avoid: Redundant Indexes
```sql
-- Bad: Redundant - (a) is prefix of (a,b)
CREATE INDEX idx_a ON table (a);
CREATE INDEX idx_ab ON table (a, b);

-- Good: Just (a,b) covers both
CREATE INDEX idx_ab ON table (a, b);
```

### Avoid: Over-Indexing
Too many indexes slows down:
- INSERT operations (must update all indexes)
- UPDATE operations (if indexed columns change)
- DELETE operations
- Backup/restore operations

## Write Performance Analysis

With `--analyze-writes`, provides:

### Insert Impact
- Additional index maintenance per INSERT
- Estimated slowdown percentage
- Mitigation strategies (batch inserts, drop indexes before bulk load)

### Update Impact
- Which UPDATEs are affected
- Index column modification detection
- HOT (Heap Only Tuple) opportunity analysis (PostgreSQL)

### Delete Impact
- Index cleanup cost
- Bloat potential
- VACUUM frequency recommendations

## Multi-Query Optimization

Analyzing multiple queries finds:

### Shared Indexes
Indexes that benefit multiple queries:
```
Index: orders (status, created_at)
Benefits queries:
  - ./reports/daily-sales.sql (45% improvement)
  - ./api/pending-orders.sql (60% improvement)
  - ./analytics/user-orders.sql (30% improvement)
Priority: HIGH (multiple beneficiaries)
```

### Conflicting Recommendations
When different queries need different index orders:
```
Query A prefers: (user_id, created_at)
Query B prefers: (created_at, user_id)

Recommendation: Create two indexes or choose based on frequency
- Query A runs: 1000/hour
- Query B runs: 100/hour
- Choose (user_id, created_at) for Query A
```

## Index Maintenance

### Bloat Detection
Flags indexes needing maintenance:
```
Index idx_orders_created is bloated:
  - Actual size: 250 MB
  - Optimal size: 180 MB
  - Bloat: 28%
  - Recommendation: REINDEX
```

### Unused Indexes
Identifies indexes not being used:
```
Index idx_users_region never used:
  - Size: 50 MB
  - Write impact: 5% slowdown on INSERT
  - Recommendation: DROP INDEX
```

## Database-Specific Features

### PostgreSQL
- INCLUDE columns for covering indexes
- Partial indexes (WHERE clause)
- Expression indexes (functions)
- CONCURRENTLY option for online index creation
- GiST, GIN, SP-GiST index types
- BRIN indexes for time-series data

### MySQL
- Composite indexes with prefix
- Invisible indexes for testing
- Functional indexes (MySQL 8.0+)
- Descending indexes (MySQL 8.0+)
- FULLTEXT indexes for text search

### SQL Server
- Filtered indexes (partial indexes)
- Included columns (covering indexes)
- Columnstore indexes for analytics
- Compressed indexes
- Online index rebuild

### SQLite
- Partial indexes (WHERE clause)
- Expression indexes
- WITHOUT ROWID tables
- Covering indexes automatic

## Migration Generation

### SQL Output Format
Generates ready-to-run migration:

```sql
-- ============================================
-- Index Recommendations
-- Generated: 2024-01-17 10:30:00
-- Database: PostgreSQL 15
-- ============================================

-- Priority: CRITICAL
-- Query: ./reports/slow-query.sql
-- Expected improvement: 95% reduction in execution time
CREATE INDEX CONCURRENTLY idx_orders_status_created
ON orders (status, created_at DESC)
WHERE status IN ('pending', 'processing');

-- Priority: HIGH
-- Query: ./api/user-search.sql
-- Expected improvement: 80% reduction
CREATE INDEX CONCURRENTLY idx_users_email_lower
ON users (LOWER(email));

-- Drop unused indexes
-- Last used: Never
-- Size: 50 MB
DROP INDEX CONCURRENTLY IF EXISTS idx_users_region;
```

## Best Practices

1. **Index selective columns**: High cardinality columns first
2. **Use equality before range**: In composite indexes
3. **Consider covering indexes**: For frequent queries
4. **Monitor index usage**: Drop unused indexes
5. **Rebuild periodically**: To reduce bloat
6. **Test in production-like environment**: Real data volume matters

## CI/CD Integration

### Automated Index Review
```yaml
# .github/workflows/index-review.yml
name: Index Review

on: [pull_request]

jobs:
  index-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Check for missing indexes
        run: |
          claude suggest-indexes ./sql/ \
            --schema ./schema.sql \
            --format json \
            --priority critical \
            > recommendations.json

      - name: Comment on PR
        run: |
          python scripts/post-index-comments.py recommendations.json
```

## See Also

- `/explain-plan` - View execution plans to understand index usage
- `/analyze-query` - Comprehensive query analysis
- `/optimize-sql` - Apply query optimizations
