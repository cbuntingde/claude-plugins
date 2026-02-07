#!/usr/bin/env node
/**
 * analyze-query.js - Analyzes SQL queries for performance issues
 *
 * This script provides comprehensive analysis of SQL query performance,
 * identifying bottlenecks, anti-patterns, and optimization opportunities.
 */

const fs = require('fs');
const path = require('path');

/**
 * Analyzes a SQL query for performance issues
 * @param {string} query - The SQL query to analyze
 * @param {Object} options - Analysis options
 * @returns {Object} Analysis results
 */
function analyzeQuery(query, options = {}) {
  const issues = [];
  const suggestions = [];
  const dialect = options.dialect || 'postgresql';

  // Check for SELECT *
  if (/\bSELECT\s+\*/i.test(query)) {
    issues.push({
      type: 'SELECT_STAR',
      severity: 'warning',
      message: 'Avoid SELECT * - specify column names explicitly',
      line: query.match(/\bSELECT\s+\*/i)?.index || 0
    });
    suggestions.push('Replace SELECT * with specific column names to reduce data transfer and improve performance');
  }

  // Check for functions on indexed columns
  const functionPatterns = [
    /\bLOWER\s*\(/i,
    /\bUPPER\s*\(/i,
    /\bTRIM\s*\(/i,
    /\bDATE\s*\(/i,
    /\bEXTRACT\s*\(/i,
    /\bCAST\s*\(/i,
    /\bCONVERT\s*\(/i
  ];

  functionPatterns.forEach(pattern => {
    if (pattern.test(query)) {
      issues.push({
        type: 'FUNCTION_ON_COLUMN',
        severity: 'warning',
        message: 'Functions on columns may prevent index usage',
        line: query.search(pattern)
      });
      suggestions.push('Consider using expression indexes or rewriting the query to use indexed columns directly');
    }
  });

  // Check for OR conditions
  if (/\bWHERE\s+[^=]+\s+OR\s+/i.test(query)) {
    issues.push({
      type: 'OR_CONDITIONS',
      severity: 'medium',
      message: 'OR conditions may prevent index usage',
      line: query.match(/\bOR\s+/i)?.index || 0
    });
    suggestions.push('Consider using UNION ALL instead of OR, or use IN clause for multiple values');
  }

  // Check for LIKE with leading wildcard
  if (/\bLIKE\s+['"]%[^'"]+['"]/i.test(query) || /\bILIKE\s+['"]%[^'"]+['"]/i.test(query)) {
    issues.push({
      type: 'LIKE_LEADING_WILDCARD',
      severity: 'high',
      message: 'LIKE with leading wildcard cannot use indexes efficiently',
      line: query.match(/%[^%]+['"]/i)?.index || 0
    });
    suggestions.push('Consider using full-text search or Trigram indexes for pattern matching with wildcards');
  }

  // Check for correlated subqueries
  if (/\bSELECT\s+.*FROM.*WHERE.*SELECT/i.test(query) && /\.\s*\w+\s*=/i.test(query)) {
    issues.push({
      type: 'CORRELATED_SUBQUERY',
      severity: 'medium',
      message: 'Correlated subqueries can be slow - consider JOINs instead',
      line: query.match(/\.\s*\w+\s*=/i)?.index || 0
    });
    suggestions.push('Rewrite correlated subqueries as JOINs or CTEs for better performance');
  }

  // Check for N+1 patterns (multiple independent queries)
  const selectCount = (query.match(/\bSELECT\b/gi) || []).length;
  const fromCount = (query.match(/\bFROM\b/gi) || []).length;
  if (selectCount > 1 && fromCount > 1 && !/\bJOIN\b/i.test(query)) {
    issues.push({
      type: 'POTENTIAL_N_PLUS_ONE',
      severity: 'medium',
      message: 'Multiple SELECT statements without JOINs may indicate N+1 pattern',
      line: 0
    });
    suggestions.push('Combine multiple queries using JOINs or batch the operations');
  }

  // Check for DISTINCT with JOIN
  if (/\bSELECT\s+DISTINCT\b/i.test(query) && /\bJOIN\b/i.test(query)) {
    issues.push({
      type: 'DISTINCT_WITH_JOIN',
      severity: 'low',
      message: 'DISTINCT with JOINs may indicate data modeling issues or missing relationships',
      line: query.match(/\bDISTINCT\b/i)?.index || 0
    });
    suggestions.push('Review if proper foreign key relationships exist to avoid duplicate rows');
  }

  // Check for ORDER BY RANDOM
  if (/\bORDER\s+BY\s+RANDOM\b/i.test(query)) {
    issues.push({
      type: 'ORDER_BY_RANDOM',
      severity: 'high',
      message: 'ORDER BY RANDOM is extremely expensive on large tables',
      line: query.match(/RANDOM/i)?.index || 0
    });
    suggestions.push('Use TABLESAMPLE or application-side randomization for better performance');
  }

  // Check for LIMIT without ORDER BY
  if (/\bLIMIT\s+\d+/i.test(query) && !/\bORDER\s+BY\b/i.test(query)) {
    issues.push({
      type: 'LIMIT_WITHOUT_ORDER',
      severity: 'low',
      message: 'LIMIT without ORDER BY produces non-deterministic results',
      line: query.match(/LIMIT/i)?.index || 0
    });
    suggestions.push('Add ORDER BY to ensure consistent result ordering');
  }

  // Check for NOT IN with NULL
  if (/\bNOT\s+IN\s*\(/i.test(query)) {
    issues.push({
      type: 'NOT_IN_WITH_NULL',
      severity: 'high',
      message: 'NOT IN with subquery may behave unexpectedly if NULL values exist',
      line: query.match(/NOT\s+IN/i)?.index || 0
    });
    suggestions.push('Use NOT EXISTS or LEFT JOIN / IS NULL instead of NOT IN');
  }

  // Check for implicit type conversion
  if (/=\s*['"]\d+['"]/i.test(query) && /\bWHERE\b/i.test(query)) {
    issues.push({
      type: 'IMPLICIT_TYPE_CONVERSION',
      severity: 'medium',
      message: 'String comparison with numbers may cause implicit type conversion',
      line: query.match(/=\s*['"]\d+['"]/i)?.index || 0
    });
    suggestions.push('Use proper data types in comparisons (numbers without quotes)');
  }

  return {
    issues,
    suggestions,
    summary: {
      totalIssues: issues.length,
      highSeverity: issues.filter(i => i.severity === 'high').length,
      mediumSeverity: issues.filter(i => i.severity === 'medium').length,
      lowSeverity: issues.filter(i => i.severity === 'low').length
    },
    dialect,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Generates a human-readable report from analysis results
 * @param {Object} results - Analysis results
 * @returns {string} Formatted report
 */
function generateReport(results) {
  let report = '# Query Analysis Report\n\n';
  report += `**Dialect:** ${results.dialect}\n`;
  report += `**Analyzed:** ${results.analyzedAt}\n\n`;

  report += '## Summary\n\n';
  report += `| Metric | Count |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Issues | ${results.summary.totalIssues} |\n`;
  report += `| High Severity | ${results.summary.highSeverity} |\n`;
  report += `| Medium Severity | ${results.summary.mediumSeverity} |\n`;
  report += `| Low Severity | ${results.summary.lowSeverity} |\n\n`;

  if (results.issues.length > 0) {
    report += '## Issues Found\n\n';
    results.issues.forEach((issue, index) => {
      report += `### ${index + 1}. ${issue.type} (${issue.severity.toUpperCase()})\n`;
      report += `- **Message:** ${issue.message}\n`;
      if (issue.line > 0) {
        report += `- **Location:** Line ~${issue.line}\n`;
      }
      report += '\n';
    });
  }

  if (results.suggestions.length > 0) {
    report += '## Suggestions\n\n';
    results.suggestions.forEach((suggestion, index) => {
      report += `${index + 1}. ${suggestion}\n\n`;
    });
  }

  return report;
}

/**
 * Main CLI execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node analyze-query.js <query-file.sql> [--dialect postgres|mysql|sqlite|mssql|oracle]');
    console.error('       echo "SELECT * FROM users" | node analyze-query.js --dialect postgres');
    process.exit(1);
  }

  const options = {
    dialect: 'postgresql'
  };

  // Parse arguments
  if (args.includes('--dialect')) {
    const dialectIndex = args.indexOf('--dialect');
    if (dialectIndex < args.length - 1) {
      options.dialect = args[dialectIndex + 1];
    }
  }

  // Read query from stdin or file
  let query = '';
  if (!fs.existsSync(args[0])) {
    // stdin mode
    process.stdin.setEncoding('utf8');
    query = fs.readFileSync(0, 'utf8').trim();
  } else {
    query = fs.readFileSync(args[0], 'utf8').trim();
  }

  if (!query) {
    console.error('Error: No query provided');
    process.exit(1);
  }

  const results = analyzeQuery(query, options);
  console.log(generateReport(results));
}

// Export for use as module
module.exports = {
  analyzeQuery,
  generateReport
};

// Run if called directly
if (require.main === module) {
  main();
}