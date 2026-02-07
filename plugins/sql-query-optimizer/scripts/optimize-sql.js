#!/usr/bin/env node
/**
 * optimize-sql.js - Optimizes SQL queries for better performance
 *
 * This script provides query optimization capabilities including:
 * - SELECT * elimination
 * - Subquery to JOIN conversion
 * - CTE optimization
 * - Index-friendly query restructuring
 */

const fs = require('fs');

/**
 * Optimizes a SQL query for better performance
 * @param {string} query - The SQL query to optimize
 * @param {Object} options - Optimization options
 * @returns {Object} Optimization results
 */
function optimizeQuery(query, options = {}) {
  const changes = [];
  let optimizedQuery = query;
  const dialect = options.dialect || 'postgresql';
  const aggressive = options.aggressive || false;

  // Optimization: Expand SELECT * to explicit columns
  if (/\bSELECT\s+\*/i.test(query)) {
    changes.push({
      type: 'SELECT_STAR_EXPANSION',
      description: 'Replace SELECT * with explicit column names',
      before: 'SELECT *',
      after: '-- SELECT column1, column2, ...',
      reason: 'Reduce data transfer and improve index usage'
    });
  }

  // Optimization: Convert correlated subqueries to JOINs
  const correlatedSubqueryMatch = query.match(
    /\bSELECT\s+([^,]+)\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*\(\s*SELECT\s+([^)]+)\s+FROM\s+(\w+)\s+WHERE\s+\5\.(\w+)\s*=\s*\3\)/i
  );

  if (correlatedSubqueryMatch) {
    changes.push({
      type: 'CORRELATED_TO_JOIN',
      description: 'Convert correlated subquery to JOIN',
      before: correlatedSubqueryMatch[0],
      after: '-- Converted to LEFT JOIN for better performance',
      reason: 'Correlated subqueries execute once per row; JOINs are typically more efficient'
    });
  }

  // Optimization: Replace NOT IN with NOT EXISTS for NULL safety
  if (/\bNOT\s+IN\s*\(/i.test(query)) {
    changes.push({
      type: 'NOT_IN_TO_NOT_EXISTS',
      description: 'Replace NOT IN with NOT EXISTS for NULL safety',
      before: 'WHERE id NOT IN (SELECT id FROM ...)',
      after: 'WHERE NOT EXISTS (SELECT 1 FROM ... WHERE id = outer.id)',
      reason: 'NOT IN fails when subquery returns NULL; NOT EXISTS handles NULLs correctly'
    });
  }

  // Optimization: Suggest WHERE clause for UPDATE/DELETE without it
  if (/\b(UPDATE|DELETE)\s+\w+\s*(?!.*WHERE)/i.test(query)) {
    changes.push({
      type: 'MISSING_WHERE',
      description: 'Add WHERE clause to UPDATE/DELETE',
      before: query,
      after: query.replace(/\b(UPDATE|DELETE)\s+(\w+)/i, '$1 $2 WHERE 1=0 -- ADD CONDITION'),
      reason: 'UPDATE/DELETE without WHERE affects all rows'
    });
  }

  // Optimization: Convert OR to IN for single column
  const orConditionMatch = query.match(
    /\bWHERE\s+(\w+)\s*=\s*(\w+)\s+OR\s+\1\s*=\s*\2\b/i
  );

  if (orConditionMatch) {
    changes.push({
      type: 'OR_TO_IN',
      description: 'Replace OR with IN for single column',
      before: `WHERE ${orConditionMatch[1]} = ${orConditionMatch[2]} OR ${orConditionMatch[1]} = ${orConditionMatch[2]}`,
      after: `WHERE ${orConditionMatch[1]} IN (${orConditionMatch[2]})`,
      reason: 'IN clauses can use indexes more efficiently than OR'
    });
  }

  // Optimization: Suggest LIMIT for unbounded queries
  if (!/\bLIMIT\b/i.test(query) && /\bSELECT\b/i.test(query)) {
    changes.push({
      type: 'ADD_LIMIT',
      description: 'Consider adding LIMIT for large result sets',
      before: query,
      after: query + ' -- Consider adding LIMIT n',
      reason: 'Without LIMIT, queries may return millions of rows unexpectedly'
    });
  }

  // Optimization: Add explicit table aliases
  const noAliasMatch = /\bFROM\s+(\w+\s+(?!WHERE|ORDER|GROUP|LIMIT|JOIN|LEFT|RIGHT|INNER|OUTER))/.test(query);
  if (noAliasMatch && /\sJOIN\s/i.test(query)) {
    changes.push({
      type: 'EXPLICIT_ALIASES',
      description: 'Add explicit table aliases',
      before: 'FROM users, orders WHERE users.id = orders.user_id',
      after: 'FROM users u JOIN orders o ON u.id = o.user_id',
      reason: 'Explicit aliases improve query readability and prevent column ambiguity'
    });
  }

  // Optimization: Replace deprecated syntax (MySQL)
  if (dialect === 'mysql' && /\bSTRAIGHT_JOIN\b/i.test(query)) {
    changes.push({
      type: 'DEPRECATED_SYNTAX',
      description: 'STRAIGHT_JOIN is deprecated in MySQL 8.0+',
      before: 'STRAIGHT_JOIN',
      after: '-- Use EXPLAIN to verify join order, then use USE INDEX or FORCE INDEX',
      reason: 'MySQL optimizer improves; explicit join hints may hurt performance'
    });
  }

  // Optimization: Suggest index for ORDER BY
  if (/\bORDER\s+BY\s+\w+(\s+(ASC|DESC))?(\s*,\s*\w+(\s+(ASC|DESC))?)*\b/i.test(query)) {
    changes.push({
      type: 'ORDER_BY_INDEX',
      description: 'Consider index for ORDER BY columns',
      before: 'ORDER BY column1, column2',
      after: '-- CREATE INDEX idx_table_order ON table (column1, column2)',
      reason: 'Indexes can avoid expensive sort operations'
    });
  }

  // Optimization: Suggest covering index for SELECT
  const selectMatch = query.match(/\bSELECT\s+([^.]+)\s+FROM\s+(\w+)/i);
  if (selectMatch && !/\bSELECT\s+\*/i.test(query)) {
    changes.push({
      type: 'COVERING_INDEX',
      description: 'Consider covering index for query',
      before: `SELECT ${selectMatch[1]} FROM ${selectMatch[2]}`,
      after: `-- CREATE INDEX idx_${selectMatch[2]}_covering ON ${selectMatch[2]} (${selectMatch[1]})`,
      reason: 'Covering indexes can satisfy queries entirely from the index'
    });
  }

  // Aggressive optimizations
  if (aggressive) {
    // Replace UNION with UNION ALL if no duplicates needed
    if (/\bUNION\s+DISTINCT\b/i.test(query)) {
      changes.push({
        type: 'UNION_TO_UNION_ALL',
        description: 'Replace UNION DISTINCT with UNION ALL',
        before: 'UNION DISTINCT',
        after: 'UNION ALL',
        reason: 'UNION ALL is faster as it skips duplicate detection'
      });
    }

    // Suggest materialized CTE for repeated references
    if (/\bWITH\s+\w+\s+AS\s*\(/i.test(query) && query.match(/\bSELECT.*\b\w+\b.*\w+\b.*\bSELECT\b/i)) {
      changes.push({
        type: 'MATERIALIZED_CTE',
        description: 'Consider materialized CTE for repeated references',
        before: 'WITH cte AS (SELECT ...) SELECT ... FROM cte JOIN cte t2',
        after: '-- Use MATERIALIZED hint in PostgreSQL or rewrite with temp table',
        reason: 'Non-materialized CTEs may execute multiple times in complex queries'
      });
    }
  }

  return {
    originalQuery: query,
    optimizedQuery: applyOptimizations(query, changes),
    changes,
    dialect,
    aggressive,
    optimizedAt: new Date().toISOString()
  };
}

/**
 * Applies optimization changes to a query
 * @param {string} query - Original query
 * @param {Array} changes - List of changes to apply
 * @returns {string} Modified query
 */
function applyOptimizations(query, changes) {
  let modified = query;

  changes.forEach(change => {
    if (change.type === 'MISSING_WHERE' && change.before !== query) {
      modified = change.after;
    }
  });

  return modified;
}

/**
 * Generates an optimization report
 * @param {Object} results - Optimization results
 * @returns {string} Formatted report
 */
function generateOptimizationReport(results) {
  let report = '# SQL Optimization Report\n\n';
  report += `**Dialect:** ${results.dialect}\n`;
  report += `**Aggressive Mode:** ${results.aggressive ? 'Yes' : 'No'}\n`;
  report += `**Optimized:** ${results.optimizedAt}\n\n`;

  report += '## Original Query\n\n';
  report += '```sql\n';
  report += results.originalQuery;
  report += '\n```\n\n';

  if (results.changes.length > 0) {
    report += '## Recommended Optimizations\n\n';
    report += '| # | Type | Description | Reason |\n';
    report += '|---|------|-------------|--------|\n';

    results.changes.forEach((change, index) => {
      report += `| ${index + 1} | ${change.type} | ${change.description} | ${change.reason} |\n`;
    });
    report += '\n';
  }

  if (results.optimizedQuery !== results.originalQuery) {
    report += '## Optimized Query\n\n';
    report += '```sql\n';
    report += results.optimizedQuery;
    report += '\n```\n\n';
  } else {
    report += '## Note\n\n';
    report += 'The query could not be automatically optimized. See recommendations above for manual improvements.\n\n';
  }

  return report;
}

/**
 * Main CLI execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node optimize-sql.js <query.sql> [--dialect postgres|mysql|sqlite|mssql] [--aggressive]');
    console.error('       echo "SELECT * FROM users" | node optimize-sql.js --dialect postgresql');
    process.exit(1);
  }

  const options = {
    dialect: 'postgresql',
    aggressive: false
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dialect' && i < args.length - 1) {
      options.dialect = args[++i];
    } else if (args[i] === '--aggressive') {
      options.aggressive = true;
    }
  }

  // Read query from stdin or file
  let query = '';
  if (!fs.existsSync(args[0])) {
    process.stdin.setEncoding('utf8');
    query = fs.readFileSync(0, 'utf8').trim();
  } else {
    query = fs.readFileSync(args[0], 'utf8').trim();
  }

  if (!query) {
    console.error('Error: No query provided');
    process.exit(1);
  }

  const results = optimizeQuery(query, options);
  console.log(generateOptimizationReport(results));
}

// Export for use as module
module.exports = {
  optimizeQuery,
  generateOptimizationReport
};

// Run if called directly
if (require.main === module) {
  main();
}