---
description: Perform deep analysis of SQL query performance
---

# Analyze Query

Performs comprehensive analysis of SQL queries to identify performance bottlenecks, inefficiencies, and optimization opportunities.

## Usage

```
/analyze-query [query] [options]
```

### Arguments

- `query`: SQL query to analyze. Can be a file path, raw SQL string, or query identifier.

### Options

- `--dialect <type>`: SQL dialect - `postgresql`, `mysql`, `sqlite`, `sqlserver`, `oracle`
- `--schema <file>`: Schema definition file for context
- `--deep`: Perform deep analysis including execution plan simulation
- `--history`: Compare with historical performance data
- `--format <type>`: Output format - `text`, `json`, `html`. Default: text
- `--focus <area>`: Focus area - `structure`, `performance`, `readability`, `all`

## Analysis Categories

### Structural Analysis
- Query complexity metrics
- Nesting depth
- JOIN complexity
- Subquery patterns
- Common table expression usage

### Performance Analysis
- Execution time breakdown
- Resource usage estimation
- Bottleneck identification
- Cost analysis
- Index usage analysis

### Readability Analysis
- Formatting consistency
- Naming conventions
- Comment quality
- Modularity score
- Maintainability index

### Anti-Pattern Detection
- N+1 query patterns
- SELECT * usage
- Implicit conversions
- Function calls in WHERE clauses
- OR conditions that prevent index usage
- Cross-join dangers

## Examples

**Basic analysis:**
```
/analyze-query "./sql/report.sql"
```

**Deep analysis with execution plan:**
```
/analyze-query "./sql/analytics.sql" --deep
```

**Focus on performance:**
```
/analyze-query "./sql/query.sql" --focus performance
```

**With schema context:**
```
/analyze-query "./sql/query.sql" --schema ./schema.sql --deep
```

**Generate HTML report:**
```
/analyze-query "./sql/complex-query.sql" --format html
```

## Analysis Report Structure

### Executive Summary
- Overall query health score (0-100)
- Critical issues count
- Optimization potential
- Estimated improvement potential

### Query Breakdown
- Query type (SELECT, INSERT, UPDATE, DELETE, etc.)
- Table count and relationships
- JOIN count and types
- Subquery count and depth
- Aggregate functions used
- Estimated result set size

### Performance Metrics
- **Estimated execution time**: Based on plan analysis
- **I/O operations**: Expected pages/blocks read
- **CPU cost**: Computational complexity estimate
- **Memory usage**: Sort/hash operation memory requirements
- **Network impact**: Expected data transfer

### Bottleneck Identification
Each bottleneck includes:
- **Location**: Specific clause or operation
- **Severity**: Critical, High, Medium, Low
- **Impact**: Performance cost
- **Recommendation**: How to fix

### Complexity Analysis
- **Cyclomatic complexity**: Number of independent paths
- **Nesting depth**: Maximum level of nesting
- **Join complexity**: Number and type of joins
- **Predicate complexity**: Condition complexity score

### Anti-Patterns Detected
Common anti-patterns and their locations:
- SELECT * in production queries
- Functions on indexed columns in WHERE
- OR conditions on same column
- Implicit type conversions
- Correlated subqueries that could be JOINs
- LIMIT/OFFSET for deep pagination

### Index Usage
- Current indexes used
- Missing index opportunities
- Index efficiency (rows scanned vs returned)
- Index-only scan potential

## Detailed Findings

### Example Finding

**Issue: Function on Indexed Column**
- **Location**: WHERE clause, line 8
- **Severity**: High
- **Impact**: Prevents index use, requires full scan
- **Code**: `WHERE LOWER(email) = 'user@example.com'`
- **Fix**: Create functional index or remove LOWER

```sql
-- Original (index not used)
WHERE LOWER(email) = 'user@example.com'

-- Option 1: Use functional index
CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- Option 2: Change query
WHERE email = 'user@example.com'
```

### Example Finding

**Issue: N+1 Query Pattern**
- **Location**: Application code calling this query
- **Severity**: Critical
- **Impact**: N database round-trips instead of 1
- **Recommendation**: Use JOIN or fetch all IDs first

## Complexity Scoring

### Score Interpretation
- **90-100**: Excellent - Well optimized query
- **75-89**: Good - Minor improvements possible
- **60-74**: Fair - Several optimization opportunities
- **40-59**: Poor - Significant issues found
- **0-39**: Critical - Major rewrite needed

### Score Factors
- Execution plan efficiency (40%)
- Query complexity (20%)
- Anti-pattern presence (20%)
- Index usage (10%)
- Readability (10%)

## Optimization Roadmap

Based on analysis, provides prioritized optimization steps:

### Priority 1: Critical (Fix Immediately)
- Issues causing 10x+ slowdowns
- Missing indexes on filtered columns
- Cartesian products

### Priority 2: High (Fix Soon)
- Inefficient JOIN orders
- Unnecessary subqueries
- Redundant computations

### Priority 3: Medium (Consider)
- Code readability improvements
- Minor performance gains
- Consistency improvements

### Priority 4: Low (Nice to Have)
- Stylistic changes
- Comment additions
- Minor refactoring

## Comparative Analysis

With `--history` flag, compares against:
- Previous query versions
- Baseline performance metrics
- Industry benchmarks for similar queries

Shows:
- Performance regression/improvement
- Plan changes over time
- Data growth impact

## Database-Specific Analysis

### PostgreSQL
- Includes plan node types (Nested Loop, Hash Join, Merge Join)
- Analyzes parallel query potential
- Checks for efficient statistics usage
- Identifies opportunities for parallel workers

### MySQL
- Examines EXPLAIN output in detail
- Checks for filesort and temporary tables
- Analyzes index merge potential
- Identifies optimizer hints opportunities

### SQL Server
- Reviews actual vs estimated plans
- Checks for key lookups
- Analyzes parallelism
- Identifies missing index warnings

## Best Practices

1. **Run ANALYZE first**: Ensure statistics are current
2. **Use real data volumes**: Test with production-like data
3. **Check actual plans**: Estimates can be wrong
4. **Monitor over time**: Performance changes with data growth
5. **Consider the workload**: Optimize for actual usage patterns

## Output Formats

### Text
Human-readable report with sections and formatting

### JSON
Machine-readable format for integration with CI/CD tools

### HTML
Interactive report with:
- Collapsible sections
- Syntax-highlighted SQL
- Visual query plan representation
- Export to PDF functionality

## See Also

- `/optimize-sql` - Apply optimizations
- `/explain-plan` - View execution plans
- `/suggest-indexes` - Get index recommendations
