---
description: Automatically detect SQL optimization opportunities while coding
---

# Query Optimization Detector Skill

Automatically detects SQL query optimization opportunities, anti-patterns, and performance issues as you write code.

## Triggering Events

This skill automatically activates when:

1. **SQL Files are Modified**
   - Any `.sql` file is saved or edited
   - SQL files are created in the project

2. **SQL in Application Code**
   - Raw SQL strings in Python, JavaScript, Go, Java, etc.
   - ORM query generation code
   - Database migration files

3. **Keyword Triggers**
   - "SELECT", "INSERT", "UPDATE", "DELETE" in code context
   - Query-related discussions with Claude
   - Performance issue mentions

## Detection Patterns

### Performance Anti-Patterns

#### 1. SELECT * Detection
```
Issue: SELECT * in production query
File: queries/get-user-orders.sql:5
Severity: Medium
Impact:
  - Returns unnecessary columns
  - Increases network transfer
  - Prevents index-only scans
  - Breaks on schema changes

Suggestion: List specific columns needed
```

#### 2. N+1 Query Pattern
```
Issue: Potential N+1 query pattern detected
File: api/users.py:42
Severity: Critical
Pattern: Query inside loop
Impact: N database round-trips instead of 1

Code:
  for user in users:
      orders = db.execute(
          "SELECT * FROM orders WHERE user_id = ?",
          (user.id,)
      )

Solution: Use single query with JOIN or batch fetching
```

#### 3. Missing WHERE Clause
```
Issue: Query without WHERE clause on large table
File: reports/daily-sales.sql:3
Severity: High
Table: orders (1M+ rows estimated)
Impact: Full table scan, returns all rows

Suggestion: Add WHERE clause to filter data
```

#### 4. Function on Indexed Column
```
Issue: Function call on indexed column in WHERE
File: queries/user-search.sql:8
Severity: High
Query: WHERE LOWER(email) = 'user@example.com'
Impact: Index cannot be used, full scan required

Solutions:
  1. Create functional index
  2. Change query to exact match
  3. Use full-text search
```

#### 5. OR Conditions on Same Column
```
Issue: Multiple OR conditions on same column
File: queries/order-filter.sql:12
Severity: Medium
Query: WHERE status = 'pending' OR status = 'processing'
Impact: Inefficient index usage

Solution: WHERE status IN ('pending', 'processing')
```

### Index Opportunities

#### Missing Index Detection
```
Recommendation: Create index for query performance
File: queries/active-users.sql
Priority: High
Query: SELECT * FROM users WHERE status = 'active' AND created_at > '2024-01-01'

Suggested Index:
  CREATE INDEX idx_users_status_created
  ON users (status, created_at);

Expected Improvement: 95% reduction in execution time
```

#### Composite Index Suggestion
```
Recommendation: Composite index for JOIN + WHERE
File: analytics/user-orders.sql:5
Priority: High
Query:
  SELECT * FROM orders o
  JOIN users u ON o.user_id = u.id
  WHERE u.status = 'active'

Suggested Indexes:
  -- On orders table for join
  CREATE INDEX idx_orders_user_id ON orders (user_id);

  -- On users table for WHERE + join
  CREATE INDEX idx_users_status_id ON users (status, id);

Expected Improvement: 80% reduction
```

#### Covering Index Opportunity
```
Recommendation: Covering index for index-only scan
File: api/user-list.sql
Priority: Medium
Query: SELECT id, email, name FROM users WHERE active = true

Suggested Index:
  CREATE INDEX idx_users_active_covering
  ON users (active) INCLUDE (id, email, name);

Benefit: Index-only scan, no table access needed
```

### Query Structure Issues

#### Correlated Subquery
```
Issue: Correlated subquery may execute N times
File: reports/slow-report.sql:15
Severity: High
Pattern: Subquery referencing outer query

Code:
  SELECT o.*,
         (SELECT COUNT(*) FROM order_items
          WHERE order_id = o.id) as item_count
  FROM orders o

Solution: Use JOIN or LATERAL
```

#### DISTINCT Used Unnecessarily
```
Issue: DISTINCT with guaranteed unique rows
File: queries/user-orders.sql:20
Severity: Low
Issue: DISTINCT on primary key (already unique)

Code:
  SELECT DISTINCT o.id, o.total, ...
  FROM orders o JOIN ...

Suggestion: Remove DISTINCT (unnecessary overhead)
```

#### ORDER BY + LIMIT/OFFSET
```
Issue: Deep pagination pattern
File: api/pagination.py:45
Severity: Medium
Pattern: LIMIT 20 OFFSET 10000+

Impact: Performance degrades with offset
Better: Keyset pagination with cursor
```

### Database-Specific Patterns

#### PostgreSQL
```
Issue: Unnecessary CTE materialization
File: analytics/report.sql:10
Severity: Low
Hint: CTE scanned only once, use NOT MATERIALIZED

Solution:
  WITH data AS NOT MATERIALIZED (
    SELECT ...
  )
```

#### MySQL
```
Issue: GROUP BY with non-aggregated columns
File: reports/summary.sql:25
Severity: Medium
Warning: Relies on MySQL's loose GROUP BY
Better: Use ANY_VALUE() or proper aggregation
```

#### SQL Server
```
Issue: NOLOCK hint usage
File: queries/dirty-read.sql:5
Severity: High
Warning: Reads uncommitted data (dirty reads, phantom reads)
Better: Use snapshot isolation or READ COMMITTED
```

## Real-Time Feedback

### Code Annotations
As you type, the skill provides inline suggestions:

```sql
-- ⚠️  Consider adding index on (status, created_at)
SELECT * FROM orders
WHERE status = 'pending'
  AND created_at > '2024-01-01'

-- ✓  Good: Uses index efficiently
SELECT * FROM orders
WHERE id = ?  -- Primary key lookup

-- ⚠️  Anti-pattern: Leading wildcard
SELECT * FROM users WHERE email LIKE '%@example.com'
-- Better: email LIKE 'user%@example.com' or full-text search
```

### Summary Report
After analyzing codebase:

```
SQL Query Health Summary

Files Analyzed: 45
Queries Found: 127

Critical Issues: 3
  - N+1 pattern: api/users.py:42
  - Missing index: reports/daily.sql:5
  - Full table scan: analytics/stats.sql:15

High Priority: 12
  - Function on indexed column: 5 occurrences
  - SELECT * in production: 4 occurrences
  - Missing WHERE clause: 3 occurrences

Medium Priority: 18
  - OR conditions: 6 occurrences
  - Unnecessary DISTINCT: 4 occurrences
  - Subquery optimization: 8 occurrences

Recommended Actions:
  1. Fix N+1 queries (critical performance impact)
  2. Create 5 high-priority indexes
  3. Refactor 3 correlated subqueries
  4. Replace SELECT * with specific columns

Estimated Performance Improvement: 80% reduction in query times
```

## Configuration

### Settings in `.claude/settings.json`
```json
{
  "queryOptimization": {
    "enabled": true,
    "severity": "medium",
    "dialect": "postgresql",
    "autoFix": false,
    "ignorePatterns": [
      "migrations/**",
      "**/*.test.sql",
      "node_modules/**"
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

## Integration with Commands

Automatically suggests relevant commands:

```
Issue detected: Missing index on orders (status, created_at)

Run: /suggest-indexes ./queries/active-orders.sql

This will:
  - Analyze all queries in the file
  - Generate CREATE INDEX statements
  - Prioritize by impact
```

## Best Practices Promoted

### 1. Explicit Column Lists
- Avoid SELECT *
- List only columns needed
- Enables index-only scans

### 2. Proper Indexes
- Index columns in WHERE clauses
- Use composite indexes for multiple conditions
- Consider covering indexes for frequent queries

### 3. Efficient Joins
- JOIN on indexed columns
- Use appropriate JOIN types
- Consider join order for performance

### 4. Query Design
- Filter early (WHERE before JOIN)
- Avoid unnecessary subqueries
- Use CTEs for readability
- Leverage modern SQL features

### 5. Pagination
- Use keyset pagination for large offsets
- Avoid ORDER BY + LIMIT/OFFSET for deep pagination
- Consider cursor-based approaches

## Suppressing Warnings

When a warning is not applicable:

```sql
-- sql-optimizer-disable-next-line select-star
SELECT * FROM temp_table;  -- Actually need all columns

-- Or disable for entire block
/* sql-optimizer-disable: function-on-indexed */
SELECT * FROM logs WHERE LOWER(message) LIKE '%error%';
```

## Performance Metrics

Tracks improvements over time:

```
Query Health Trend

Last 30 days:
  - Critical issues: 5 → 2 (60% reduction)
  - High priority: 15 → 8 (47% reduction)
  - Overall score: 65 → 82 (26% improvement)

Most Improved Files:
  - api/users.py: 12 issues → 2 issues
  - reports/daily.sql: 8 issues → 1 issue

Needs Attention:
  - analytics/stats.sql (new file, 5 issues)
```

## Team Collaboration

### Shared Rules
Commit `.claude/settings.json` for team-wide settings

### Issue Tracking
Export issues to JSON for ticket creation:
```bash
claude analyze-queries --format json > sql-issues.json
```

### Code Review Integration
Comments on PRs with SQL changes:
```
SQL Query Optimization Review

Changes in api/users.py:
  ⚠️  Potential N+1 query pattern detected at line 42
  💡 Suggestion: Use batch fetching or JOIN

Consider running: /optimize-sql api/users.py
```
