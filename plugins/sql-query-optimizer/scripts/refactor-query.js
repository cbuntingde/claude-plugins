#!/usr/bin/env node
/**
 * refactor-query.js - Refactors SQL queries for better structure and maintainability
 *
 * This script refactors SQL queries to improve:
 * - Readability (formatting, aliases)
 * - Maintainability (CTEs, subquery organization)
 * - Modern SQL features (CTEs, window functions)
 * - Style consistency
 */

const fs = require('fs');

/**
 * Style configurations for different SQL style guides
 */
const STYLES = {
  standard: {
    keywordCase: 'upper',
    identifierCase: 'lower',
    indent: '  ',
    lineWidth: 80
  },
  google: {
    keywordCase: 'upper',
    identifierCase: 'lower',
    indent: '  ',
    lineWidth: 80
  },
  github: {
    keywordCase: 'lower',
    identifierCase: 'lower',
    indent: '  ',
    lineWidth: 120
  }
};

/**
 * Refactors a SQL query for better structure
 * @param {string} query - The SQL query to refactor
 * @param {Object} options - Refactoring options
 * @returns {Object} Refactoring results
 */
function refactorQuery(query, options = {}) {
  const changes = [];
  const style = STYLES[options.style] || STYLES.standard;
  let refactoredQuery = query;

  // Refactoring: Convert subqueries to CTEs
  const subqueryMatch = query.match(
    /\(\s*SELECT\s+([^)]+)\s+FROM\s+(\w+)\s+WHERE\s+([^)]+)\s*\)/
  );

  if (subqueryMatch && options.ctes) {
    changes.push({
      type: 'SUBQUERY_TO_CTE',
      description: 'Convert subquery to Common Table Expression (CTE)',
      before: subqueryMatch[0],
      after: 'WITH cte_name AS (SELECT ' + subqueryMatch[1] + ' FROM ' + subqueryMatch[2] + ' WHERE ' + subqueryMatch[3] + ') ...',
      reason: 'CTEs improve readability and allow for better optimization'
    });
  }

  // Refactoring: Add proper table aliases
  if (/\bFROM\s+\w+\s+(?!WHERE|ORDER|GROUP|LIMIT|JOIN|INNER|LEFT|RIGHT|OUTER)/i.test(query) &&
      /\bJOIN\s+\w+/i.test(query)) {
    const fromMatch = query.match(/\bFROM\s+(\w+)\b/i);
    const joinMatch = query.match(/\bJOIN\s+(\w+)\b/i);

    if (fromMatch && joinMatch) {
      const table1 = fromMatch[1].toLowerCase();
      const table2 = joinMatch[1].toLowerCase();

      changes.push({
        type: 'ADD_TABLE_ALIASES',
        description: 'Add explicit table aliases',
        before: query,
        after: query
          .replace(new RegExp('\\bFROM\\s+' + table1 + '\\b', 'gi'), `FROM ${table1} AS ${table1[0]}`)
          .replace(new RegExp('\\bJOIN\\s+' + table2 + '\\b', 'gi'), `JOIN ${table2} AS ${table2[0]}`),
        reason: 'Explicit aliases make queries more readable and prevent column ambiguity'
      });
    }
  }

  // Refactoring: Modernize syntax for PostgreSQL
  if (options.modernize) {
    // Replace old JOIN syntax with explicit JOIN keywords
    if (/WHERE\s+\w+\.\w+\s*=\s*\w+\.\w+/i.test(query) && !/\bJOIN\b/i.test(query)) {
      changes.push({
        type: 'EXPLICIT_JOIN_SYNTAX',
        description: 'Replace comma-style joins with explicit JOIN syntax',
        before: 'FROM table1, table2 WHERE table1.id = table2.table1_id',
        after: 'FROM table1 JOIN table2 ON table1.id = table2.table1_id',
        reason: 'Explicit JOIN syntax is more readable and less error-prone'
      });
    }

    // Replace deprecated LIMIT n,n with LIMIT n OFFSET m
    if (/\bLIMIT\s+\d+\s*,\s*\d+/i.test(query)) {
      const limitMatch = query.match(/\bLIMIT\s+(\d+)\s*,\s*(\d+)/i);
      if (limitMatch) {
        changes.push({
          type: 'MODERNIZE_LIMIT',
          description: 'Replace MySQL-style LIMIT offset, count with LIMIT count OFFSET offset',
          before: `LIMIT ${limitMatch[1]}, ${limitMatch[2]}`,
          after: `LIMIT ${limitMatch[2]} OFFSET ${limitMatch[1]}`,
          reason: 'LIMIT count OFFSET offset is more explicit and portable'
        });
      }
    }
  }

  // Refactoring: Format query with proper indentation
  if (options.format) {
    const formatted = formatQuery(query, style);
    if (formatted !== query) {
      changes.push({
        type: 'FORMAT_QUERY',
        description: 'Format query with consistent indentation',
        before: query,
        after: formatted,
        reason: 'Consistent formatting improves readability and maintainability'
      });
      refactoredQuery = formatted;
    }
  }

  // Refactoring: Organize ORDER BY and GROUP BY
  if (/\bORDER\s+BY\b/i.test(query) && /\bGROUP\s+BY\b/i.test(query)) {
    const orderByMatch = query.match(/ORDER\s+BY\s+([^LIMIT]+)/i);
    const groupByMatch = query.match(/GROUP\s+BY\s+([^ORDER]+)/i);

    if (orderByMatch && groupByMatch) {
      changes.push({
        type: 'GROUP_ORDER_POSITION',
        description: 'Move GROUP BY before ORDER BY',
        before: 'ORDER BY ... GROUP BY ...',
        after: 'GROUP BY ... ORDER BY ...',
        reason: 'GROUP BY should come before ORDER BY for logical query structure'
      });
    }
  }

  // Refactoring: Consolidate WHERE conditions
  if (/\bAND\b/i.test(query) && !/\bOR\b/i.test(query)) {
    const whereMatch = query.match(/\bWHERE\s+([^GROUP]+)/i);
    if (whereMatch && whereMatch[1].split(/\bAND\b/i).length > 3) {
      changes.push({
        type: 'CONSOLIDATE_WHERE',
        description: 'Consider consolidating WHERE conditions',
        before: query,
        after: '-- Consider breaking complex WHERE into separate CTE or factoring conditions',
        reason: 'Very long WHERE clauses may indicate the need for query restructuring'
      });
    }
  }

  // Refactoring: Add comments for complex expressions
  if (/\bCASE\b/i.test(query) || /\bCOALESCE\b/i.test(query) || /\bNULLIF\b/i.test(query)) {
    changes.push({
      type: 'ADD_EXPRESSION_COMMENTS',
      description: 'Add comments to explain complex expressions',
      before: 'SELECT CASE WHEN ...',
      after: '-- CASE expression for handling specific conditions\nSELECT CASE WHEN ...',
      reason: 'Comments help maintainers understand complex logic'
    });
  }

  // Refactoring: Standardize keyword case
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT',
    'INNER', 'OUTER', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
    'UNION', 'INSERT', 'UPDATE', 'DELETE', 'VALUES', 'SET', 'INTO', 'CREATE',
    'TABLE', 'INDEX', 'ALTER', 'DROP', 'AS', 'DISTINCT', 'NULL', 'IS', 'NOT',
    'BETWEEN', 'LIKE', 'IN', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];

  let standardized = query;
  keywords.forEach(keyword => {
    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
    standardized = standardized.replace(regex, style.keywordCase === 'upper' ? keyword.toUpperCase() : keyword.toLowerCase());
  });

  if (standardized !== query) {
    changes.push({
      type: 'STANDARDIZE_KEYWORDS',
      description: 'Standardize keyword case',
      before: query,
      after: standardized,
      reason: 'Consistent keyword case improves readability'
    });
    refactoredQuery = standardized;
  }

  return {
    originalQuery: query,
    refactoredQuery,
    changes,
    style: options.style || 'standard',
    refactoredAt: new Date().toISOString()
  };
}

/**
 * Formats a SQL query with proper indentation
 * @param {string} query - Raw SQL query
 * @param {Object} style - Style configuration
 * @returns {string} Formatted query
 */
function formatQuery(query, style) {
  let formatted = query.trim();

  // Normalize whitespace
  formatted = formatted.replace(/\s+/g, ' ');

  // Add line breaks after major keywords
  const breakKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'INNER JOIN', 'OUTER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION', 'LIMIT',
    'AND', 'OR'];

  breakKeywords.forEach(keyword => {
    const regex = new RegExp('\\s+' + keyword + '\\s+', 'gi');
    formatted = formatted.replace(regex, '\n' + keyword + ' ');
  });

  // Add indentation
  const lines = formatted.split('\n');
  let indented = '';
  let indentLevel = 0;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Decrease indent for closing parentheses or clauses
    if (trimmed.startsWith(')') || trimmed.match(/^(AND|OR|LIMIT|OFFSET)\b/i)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    indented += style.indent.repeat(indentLevel) + trimmed + '\n';

    // Increase indent after opening keywords
    if (trimmed.match(/\b(SELECT|FROM|WHERE|JOIN|GROUP|ORDER|HAVING|CASE)\b/i) &&
        !trimmed.match(/\b(AND|OR|LIMIT|OFFSET)\b/i)) {
      indentLevel++;
    }

    // Handle ON clause
    if (trimmed.startsWith('ON ')) {
      indented += style.indent.repeat(indentLevel) + line.trim() + '\n';
    }
  });

  return indented.trim();
}

/**
 * Generates a refactoring report
 * @param {Object} results - Refactoring results
 * @returns {string} Formatted report
 */
function generateRefactorReport(results) {
  let report = '# SQL Refactoring Report\n\n';
  report += `**Style:** ${results.style}\n`;
  report += `**Refactored:** ${results.refactoredAt}\n\n`;

  report += '## Original Query\n\n';
  report += '```sql\n';
  report += results.originalQuery;
  report += '\n```\n\n';

  if (results.changes.length > 0) {
    report += '## Refactoring Changes\n\n';
    report += '| # | Type | Description | Reason |\n';
    report += '|---|------|-------------|--------|\n';

    results.changes.forEach((change, index) => {
      report += `| ${index + 1} | ${change.type} | ${change.description} | ${change.reason} |\n`;
    });
    report += '\n';
  }

  report += '## Refactored Query\n\n';
  report += '```sql\n';
  report += results.refactoredQuery;
  report += '\n```\n\n';

  return report;
}

/**
 * Main CLI execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node refactor-query.js <query.sql> [--ctes] [--modernize] [--format] [--style standard|google|github]');
    console.error('       echo "SELECT * FROM users" | node refactor-query.js --format --style google');
    process.exit(1);
  }

  const options = {
    ctes: false,
    modernize: false,
    format: false,
    style: 'standard'
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctes') {
      options.ctes = true;
    } else if (args[i] === '--modernize') {
      options.modernize = true;
    } else if (args[i] === '--format') {
      options.format = true;
    } else if (args[i] === '--style' && i < args.length - 1) {
      const validStyles = ['standard', 'google', 'github'];
      if (validStyles.includes(args[i + 1])) {
        options.style = args[++i];
      }
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

  const results = refactorQuery(query, options);
  console.log(generateRefactorReport(results));
}

// Export for use as module
module.exports = {
  refactorQuery,
  generateRefactorReport,
  STYLES
};

// Run if called directly
if (require.main === module) {
  main();
}