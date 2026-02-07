---
description: Refactor SQL queries for better structure and maintainability
---

# Refactor Query

Refactors SQL queries to improve readability, maintainability, and performance while preserving query semantics.

## Usage

```
/refactor-query [query] [options]
```

### Arguments

- `query`: SQL query to refactor. Can be a file path, raw SQL string, or directory.

### Options

- `--dialect <type>`: SQL dialect - `postgresql`, `mysql`, `sqlite`, `sqlserver`, `oracle`
- `--style <guide>`: Style guide to follow - `standard`, `google`, `github`, `custom`
- `--ctes`: Convert subqueries to CTEs (Common Table Expressions)
- `--modernize`: Use modern SQL features (window functions, CTEs, etc.)
- `--format`: Apply consistent formatting
- `--extract`: Extract reusable fragments into CTEs
- `--inline`: Inline simple CTEs (reverse of extract)
- `--simplify`: Simplify complex expressions
- `--safe-only`: Only apply semantic-preserving refactorings. Default: true
- `--interactive`: Prompt before each refactoring
- `--in-place`: Modify files in place (create backup first)
- `--dry-run`: Show changes without applying

## Refactoring Categories

### Structural Refactorings
- Convert correlated subqueries to JOINs
- Convert subqueries to CTEs
- Extract reusable expressions into CTEs
- Inline simple CTEs
- Flatten nested subqueries
- Eliminate redundant subqueries

### Style Refactorings
- Consistent capitalization (keywords, functions, types)
- Indentation standardization
- Line length management
- JOIN syntax standardization
- Parentheses normalization

### Modernization
- Replace old-style joins with explicit JOIN syntax
- Use window functions instead of self-joins
- Use LATERAL joins instead of correlated subqueries
- Use FILTER clause instead of CASE in aggregates
- Use standard SQL functions instead of dialect-specific

### Simplification
- Eliminate redundant conditions
- Simplify boolean expressions
- Remove unnecessary subqueries
- Consolidate multiple similar queries
- Use COALESCE instead of nested CASE

## Examples

**Basic refactoring:**
```
/refactor-query "./sql/legacy-query.sql"
```

**Convert to CTEs:**
```
/refactor-query "./sql/complex-query.sql" --ctes
```

**Apply Google SQL style guide:**
```
/refactor-query "./queries.sql" --style google
```

**Modernize old SQL:**
```
/refactor-query "./legacy/report.sql" --modernize --ctes
```

**Interactive refactoring:**
```
/refactor-query "./sql/" --interactive --in-place
```

**Dry run to preview:**
```
/refactor-query "./sql/query.sql" --dry-run
```

**Extract CTEs:**
```
/refactor-query "./analytics.sql" --extract --modernize
```

## Refactoring Patterns

### Correlated Subquery to JOIN

**Before:**
```sql
SELECT o.*,
       (SELECT name FROM customers WHERE id = o.customer_id) as customer_name
FROM orders o
WHERE o.total > 1000;
```

**After:**
```sql
SELECT o.*,
       c.name as customer_name
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 1000;
```

### Subquery to CTE

**Before:**
```sql
SELECT *
FROM (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    GROUP BY user_id
) frequent_users
WHERE order_count > 10;
```

**After:**
```sql
WITH frequent_users AS (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    GROUP BY user_id
    HAVING COUNT(*) > 10
)
SELECT *
FROM frequent_users;
```

### Extract Reusable CTE

**Before:**
```sql
SELECT
    (SELECT AVG(total) FROM orders WHERE status = 'pending') as avg_pending,
    (SELECT AVG(total) FROM orders WHERE status = 'pending') * 1.1 as projected,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_count;
```

**After:**
```sql
WITH pending_stats AS (
    SELECT
        AVG(total) as avg_total,
        COUNT(*) as count
    FROM orders
    WHERE status = 'pending'
)
SELECT
    avg_total as avg_pending,
    avg_total * 1.1 as projected,
    count as pending_count
FROM pending_stats;
```

### Old-Style Join to Modern JOIN

**Before:**
```sql
SELECT *
FROM orders o, customers c, items i
WHERE o.customer_id = c.id
  AND o.item_id = i.id
  AND o.status = 'pending';
```

**After:**
```sql
SELECT o.*, c.*, i.*
FROM orders o
JOIN customers c ON c.customer_id = c.id
JOIN items i ON o.item_id = i.id
WHERE o.status = 'pending';
```

### Self-Join to Window Function

**Before:**
```sql
SELECT o1.id,
       o1.total,
       (SELECT AVG(o2.total)
        FROM orders o2
        WHERE o2.user_id = o1.user_id) as user_avg
FROM orders o1;
```

**After:**
```sql
SELECT o.id,
       o.total,
       AVG(o.total) OVER (PARTITION BY o.user_id) as user_avg
FROM orders o;
```

### CASE to FILTER (PostgreSQL)

**Before:**
```sql
SELECT
    user_id,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    SUM(total) FILTER (WHERE status = 'completed') as completed_total,
    SUM(total) FILTER (WHERE status = 'pending') as pending_total
FROM orders
GROUP BY user_id;
```

**Wait, that's already FILTER - let me correct this:**

**Before:**
```sql
SELECT
    user_id,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    SUM(CASE WHEN status = 'completed' THEN total END) as completed_total,
    SUM(CASE WHEN status = 'pending' THEN total END) as pending_total
FROM orders
GROUP BY user_id;
```

**After (PostgreSQL):**
```sql
SELECT
    user_id,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    SUM(total) FILTER (WHERE status = 'completed') as completed_total,
    SUM(total) FILTER (WHERE status = 'pending') as pending_total
FROM orders
GROUP BY user_id;
```

### Simplify Nested CASE

**Before:**
```sql
SELECT
    CASE
        WHEN total > 1000 THEN 'high'
        WHEN total > 500 THEN 'medium'
        ELSE 'low'
    END as tier,
    CASE
        WHEN total > 1000 THEN 0.1
        WHEN total > 500 THEN 0.05
        ELSE 0
    END as discount
FROM orders;
```

**After:**
```sql
SELECT
    CASE
        WHEN total > 1000 THEN 'high'
        WHEN total > 500 THEN 'medium'
        ELSE 'low'
    END as tier,
    CASE
        WHEN total > 1000 THEN 0.1
        WHEN total > 500 THEN 0.05
        ELSE 0
    END as discount
FROM orders;
-- Or better, use a lookup table for this
```

### Remove Redundant Conditions

**Before:**
```sql
SELECT *
FROM orders
WHERE status = 'pending'
  AND status IN ('pending', 'processing', 'completed')
  AND total > 0;
```

**After:**
```sql
SELECT *
FROM orders
WHERE status = 'pending'
  AND total > 0;
```

## Style Guide Options

### Standard SQL Style
- Keywords: UPPERCASE
- Identifiers: lowercase_with_underscores
- Indentation: 2 spaces
- Max line length: 80 characters

### Google SQL Style Guide
- Keywords: UPPERCASE
- Identifiers: lowerCamelCase for tables, UPPER_CASE for columns
- Indentation: 2 spaces
- JOINs: All ON clauses aligned
- CTEs: Named with descriptive names

### GitHub SQL Style
- Keywords: uppercase
- Identifiers: snake_case
- Indentation: 2 spaces
- Trailing commas
- Consistent whitespace

### Custom Style
Create `.sql-style.json`:
```json
{
  "keywordCase": "upper",
  "identifierCase": "snake",
  "indentation": 4,
  "maxLineLength": 100,
  "trailingComma": true,
  "alignJoins": true
}
```

## Refactoring Safety

### Safe Refactorings
✓ Preserve query semantics
✓ Produce identical results
✓ No performance regression
✓ Can be applied automatically

### Aggressive Refactorings
⚠ May change query semantics
⚠ May affect performance
⚠ Requires review
⚓ Requires testing

### Semantic Changes
⚠ Alters query behavior
⚠ Different results possible
⚠ Requires explicit approval
⚓ Requires thorough testing

## Refactoring Pipeline

1. **Parse**: Parse SQL into AST (Abstract Syntax Tree)
2. **Analyze**: Identify refactoring opportunities
3. **Transform**: Apply refactorings
4. **Validate**: Ensure SQL is valid
5. **Compare**: Show before/after
6. **Apply**: Write changes (if approved)

## Batch Refactoring

Refactor entire directories:
```
/refactor-query ./sql/ --in-place --style google
```

Creates backup first:
```
./sql/query.sql → ./sql/query.sql.backup
```

## Interactive Mode

Prompts for each refactoring:
```
Refactor: Convert subquery to CTE
File: ./sql/report.sql:42-48
Before:
  SELECT * FROM (SELECT ...) sub
After:
  WITH sub AS (SELECT ...) SELECT * FROM sub
Apply? [y/n/q/a] _
```

Options:
- `y`: Yes, apply this refactoring
- `n`: No, skip this refactoring
- `q`: Quit, no more refactorings
- `a`: Apply all remaining

## Diff Output

Shows unified diff format:
```diff
--- a/sql/query.sql
+++ b/sql/query.sql
@@ -1,6 +1,10 @@
-SELECT * FROM (
-    SELECT user_id, COUNT(*) as cnt
-    FROM orders GROUP BY user_id
-) WHERE cnt > 10;
+WITH order_counts AS (
+    SELECT user_id, COUNT(*) as cnt
+    FROM orders
+    GROUP BY user_id
+    HAVING COUNT(*) > 10
+)
+SELECT * FROM order_counts;
```

## Best Practices

1. **Version control first**: Always have a clean git state
2. **Test thoroughly**: Refactored queries should produce same results
3. **Benchmark performance**: Some refactorings change execution plans
4. **Review with team**: Style choices should be consistent
5. **Document changes**: Explain why refactorings were made
6. **Iterate**: Multiple small refactorings better than one big change

## CI/CD Integration

### Automated Style Enforcement
```yaml
# .github/workflows/sql-style.yml
name: SQL Style Check

on: [pull_request]

jobs:
  style-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Check SQL style
        run: |
          claude refactor-query ./sql/ \
            --style google \
            --dry-run \
            --format json \
            > style-issues.json

      - name: Fail if changes needed
        run: |
          python scripts/check-style.py style-issues.json
```

## See Also

- `/optimize-sql` - Performance-focused optimizations
- `/analyze-query` - Deep query analysis
- `/explain-plan` - Execution plan analysis
