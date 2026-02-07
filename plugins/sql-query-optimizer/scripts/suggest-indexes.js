#!/usr/bin/env node
/**
 * suggest-indexes.js - Recommends optimal indexes for SQL queries
 *
 * This script analyzes SQL queries and recommends indexes to improve
 * query performance, including:
 * - Single column indexes
 * - Composite indexes
 * - Partial/filtered indexes
 * - Expression/functional indexes
 */

const fs = require('fs');

/**
 * Recommends indexes for a SQL query
 * @param {string} query - The SQL query to analyze
 * @param {Object} options - Analysis options
 * @returns {Object} Index recommendations
 */
function suggestIndexes(query, options = {}) {
  const recommendations = [];
  const dialect = options.dialect || 'postgresql';
  const analyzeWrites = options.analyzeWrites || false;

  // Extract table names from query
  const tables = extractTables(query);
  const whereColumns = extractWhereColumns(query);
  const orderByColumns = extractOrderByColumns(query);
  const joinColumns = extractJoinColumns(query);
  const selectColumns = extractSelectColumns(query);

  // Analyze WHERE clause for potential indexes
  whereColumns.forEach(({ table, column, operator }) => {
    // High priority for equality conditions
    if (operator === '=') {
      recommendations.push({
        table,
        columns: [column],
        priority: 'HIGH',
        reason: `Column '${column}' used in equality condition (WHERE ${column} = ...)`,
        estimatedImprovement: 'High - enables index scan instead of seq scan',
        sql: `CREATE INDEX idx_${table}_${column} ON ${table} (${column});`
      });
    }
    // Medium priority for range conditions
    else if (operator === '>' || operator === '<' || operator === '>=' || operator === '<=') {
      recommendations.push({
        table,
        columns: [column],
        priority: 'MEDIUM',
        reason: `Column '${column}' used in range condition`,
        estimatedImprovement: 'Medium - improves range queries',
        sql: `CREATE INDEX idx_${table}_${column} ON ${table} (${column});`
      });
    }
    // Lower priority for LIKE with prefix
    else if (operator === 'LIKE' && !column.includes('%')) {
      recommendations.push({
        table,
        columns: [column],
        priority: 'LOW',
        reason: `Column '${column}' used in LIKE pattern`,
        estimatedImprovement: 'Medium - only works for prefix patterns',
        sql: `CREATE INDEX idx_${table}_${column} ON ${table} (${column});`
      });
    }
  });

  // Analyze ORDER BY clause
  orderByColumns.forEach(({ table, columns }) => {
    const exists = recommendations.find(r => r.table === table && JSON.stringify(r.columns) === JSON.stringify(columns));

    if (!exists) {
      recommendations.push({
        table,
        columns,
        priority: 'MEDIUM',
        reason: `Columns (${columns.join(', ')}) used in ORDER BY clause`,
        estimatedImprovement: 'High - eliminates sort operation',
        sql: `CREATE INDEX idx_${table}_order ON ${table} (${columns.join(', ')});`
      });
    }
  });

  // Analyze JOIN conditions
  joinColumns.forEach(({ table1, column1, table2, column2 }) => {
    recommendations.push({
      table: table1,
      columns: [column1],
      priority: 'HIGH',
      reason: `Column '${column1}' used in JOIN condition with ${table2}`,
      estimatedImprovement: 'High - enables efficient join execution',
      sql: `CREATE INDEX idx_${table1}_${column1} ON ${table1} (${column1});`
    });

    recommendations.push({
      table: table2,
      columns: [column2],
      priority: 'HIGH',
      reason: `Column '${column2}' used in JOIN condition with ${table1}`,
      estimatedImprovement: 'High - enables efficient join execution',
      sql: `CREATE INDEX idx_${table2}_${column2} ON ${table2} (${column2});`
    });
  });

  // Suggest composite indexes for multi-column queries
  if (whereColumns.length > 1 || (whereColumns.length > 0 && orderByColumns.length > 0)) {
    const compositeColumns = [...new Set([
      ...whereColumns.map(w => ({ table: w.table, column: w.column })),
      ...orderByColumns.map(o => ({ table: o.table, column: o.columns[0] }))
    ])];

    compositeColumns.forEach(({ table, column }) => {
      const tableRecs = recommendations.filter(r => r.table === table && r.columns.length === 1);
      const compositeRec = recommendations.find(r =>
        r.table === table &&
        r.columns.length > 1 &&
        r.columns.includes(column) &&
        r.priority === 'MEDIUM'
      );

      if (tableRecs.length >= 2 && !compositeRec) {
        const columns = tableRecs.map(r => r.columns[0]);
        recommendations.push({
          table,
          columns,
          priority: 'HIGH',
          reason: `Multiple columns (${columns.join(', ')}) queried together - composite index more efficient`,
          estimatedImprovement: 'High - single index scan vs multiple lookups',
          sql: `CREATE INDEX idx_${table}_composite ON ${table} (${columns.join(', ')});`
        });
      }
    });
  }

  // Suggest partial indexes for selective WHERE clauses
  if (/\bWHERE\s+\w+\s*=\s*['"][^'"]+['"]/i.test(query)) {
    const whereMatch = query.match(/\bWHERE\s+(\w+)\s*=\s*(['"])(\w+)\2/i);
    if (whereMatch) {
      recommendations.push({
        table: tables[0] || 'table_name',
        columns: [whereMatch[1]],
        partial: true,
        priority: 'MEDIUM',
        reason: `Partial index for selective value '${whereMatch[3]}'`,
        estimatedImprovement: 'High - smaller index size, faster queries',
        sql: `CREATE INDEX idx_${tables[0] || 'table'}_partial ON ${tables[0] || 'table_name'} (${whereMatch[1]}) WHERE ${whereMatch[1]} = '${whereMatch[3]}';`
      });
    }
  }

  // Suggest expression indexes for functions
  if (/\bLOWER\s*\(\s*(\w+)\s*\)/i.test(query) || /\bUPPER\s*\(\s*(\w+)\s*\)/i.test(query)) {
    const exprMatch = query.match(/\b(LOWER|UPPER)\s*\(\s*(\w+)\s*\)/i);
    if (exprMatch && tables[0]) {
      recommendations.push({
        table: tables[0],
        columns: [`${exprMatch[1].toLowerCase()}(${exprMatch[2]})`],
        expression: true,
        priority: 'MEDIUM',
        reason: `Expression index for case-insensitive search on '${exprMatch[2]}'`,
        estimatedImprovement: 'High - enables index usage for function calls',
        sql: `CREATE INDEX idx_${tables[0]}_${exprMatch[2].toLowerCase()} ON ${tables[0]} (${exprMatch[1].toLowerCase()}(${exprMatch[2]}));`
      });
    }
  }

  // Suggest unique index for UNIQUE constraints
  if (/\bUNIQUE\b/i.test(query)) {
    const uniqueMatch = query.match(/\bUNIQUE\s*\(\s*([^)]+)\s*\)/i);
    if (uniqueMatch && tables[0]) {
      recommendations.push({
        table: tables[0],
        columns: uniqueMatch[1].split(',').map(c => c.trim()),
        unique: true,
        priority: 'HIGH',
        reason: 'Unique constraint enforcement',
        estimatedImprovement: 'N/A - required for constraint',
        sql: `CREATE UNIQUE INDEX uidx_${tables[0]}_unique ON ${tables[0]} (${uniqueMatch[1]});`
      });
    }
  }

  // Remove duplicates and sort by priority
  const uniqueRecs = [];
  const seen = new Set();

  recommendations.forEach(rec => {
    const key = `${rec.table}_${rec.columns.join('_')}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRecs.push(rec);
    }
  });

  const sortedRecs = uniqueRecs.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Add write impact analysis if requested
  let writeImpact = null;
  if (analyzeWrites) {
    writeImpact = {
      insertOverhead: 'Each index adds ~10-20% overhead on INSERT operations',
      updateOverhead: 'UPDATE overhead depends on indexed columns - updating indexed columns adds overhead',
      deleteOverhead: 'Each index adds ~10-20% overhead on DELETE operations',
      storageOverhead: 'Estimate storage based on table size and number of indexes',
      recommendation: 'Balance read performance gains against write performance costs'
    };
  }

  return {
    tables,
    recommendations: sortedRecs,
    writeImpact,
    dialect,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Extract table names from a SQL query
 * @param {string} query - SQL query
 * @returns {Array} List of table names
 */
function extractTables(query) {
  const tables = [];

  // Match FROM clause
  const fromMatch = query.match(/\bFROM\s+(\w+)/gi);
  if (fromMatch) {
    fromMatch.forEach(m => {
      const table = m.replace(/\bFROM\s+/i, '').trim();
      if (!tables.includes(table)) {
        tables.push(table);
      }
    });
  }

  // Match UPDATE clause
  const updateMatch = query.match(/\bUPDATE\s+(\w+)/i);
  if (updateMatch && !tables.includes(updateMatch[1])) {
    tables.push(updateMatch[1]);
  }

  // Match INSERT INTO clause
  const insertMatch = query.match(/\bINSERT\s+INTO\s+(\w+)/i);
  if (insertMatch && !tables.includes(insertMatch[1])) {
    tables.push(insertMatch[1]);
  }

  return tables;
}

/**
 * Extract columns from WHERE clause
 * @param {string} query - SQL query
 * @returns {Array} List of {table, column, operator} objects
 */
function extractWhereColumns(query) {
  const columns = [];

  // Match WHERE conditions
  const whereMatch = query.match(/\bWHERE\s+([^ORDER|GROUP|LIMIT|HAVING]+)/i);
  if (whereMatch) {
    const conditions = whereMatch[1];

    // Match column comparisons
    const operatorRegex = /\(?\s*(\w+(?:\.\w+)?)\s*(=|!=|<>|>|<|>=|<=|LIKE|ILIKE|IN)\s*['"]?([^'",()]+)?['"]?/gi;
    let match;

    while ((match = operatorRegex.exec(conditions)) !== null) {
      const [full, column, operator, value] = match;
      if (column && operator) {
        const parts = column.split('.');
        const table = parts.length > 1 ? parts[0] : tables[0];
        columns.push({ table, column: parts[parts.length - 1], operator: operator.toUpperCase() });
      }
    }
  }

  return columns;
}

/**
 * Extract columns from ORDER BY clause
 * @param {string} query - SQL query
 * @returns {Array} List of {table, columns} objects
 */
function extractOrderByColumns(query) {
  const columns = [];

  const orderByMatch = query.match(/\bORDER\s+BY\s+([^LIMIT|GROUP]+)/i);
  if (orderByMatch) {
    const orderCols = orderByMatch[1].split(',').map(c => {
      return c.trim().replace(/\b(ASC|DESC)\b/gi, '').trim();
    }).filter(c => c);

    const tables = extractTables(query);
    columns.push({ table: tables[0] || 'table', columns: orderCols });
  }

  return columns;
}

/**
 * Extract columns from JOIN conditions
 * @param {string} query - SQL query
 * @returns {Array} List of {table1, column1, table2, column2} objects
 */
function extractJoinColumns(query) {
  const joins = [];

  const joinRegex = /\bJOIN\s+(\w+)\s+ON\s+(\w+(?:\.\w+)?)\s*(=|!=|<>)\s*(\w+(?:\.\w+)?)/gi;
  let match;

  while ((match = joinRegex.exec(query)) !== null) {
    joins.push({
      table1: match[2].split('.')[0],
      column1: match[2].split('.')[1] || match[2],
      table2: match[4].split('.')[0],
      column2: match[4].split('.')[1] || match[4]
    });
  }

  return joins;
}

/**
 * Extract columns from SELECT clause
 * @param {string} query - SQL query
 * @returns {Array} List of column names
 */
function extractSelectColumns(query) {
  const selectMatch = query.match(/\bSELECT\s+(.+?)\s+FROM/i);
  if (selectMatch) {
    return selectMatch[1].split(',').map(c => c.trim().replace(/.*\./, '').trim());
  }
  return [];
}

/**
 * Generates an index recommendation report
 * @param {Object} results - Index analysis results
 * @param {Object} options - Output options
 * @returns {string} Formatted report
 */
function generateIndexReport(results, options = {}) {
  let report = '# Index Recommendations\n\n';
  report += `**Dialect:** ${results.dialect}\n`;
  report += `**Analyzed:** ${results.analyzedAt}\n\n`;

  if (results.tables && results.tables.length > 0) {
    report += `**Tables Detected:** ${results.tables.join(', ')}\n\n`;
  }

  report += '## Recommendations Summary\n\n';
  report += '| Priority | Table | Columns | Reason |\n';
  report += '|----------|-------|---------|--------|\n';

  results.recommendations.forEach(rec => {
    const priorityIcon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
    report += `| ${priorityIcon} ${rec.priority} | ${rec.table} | ${rec.columns.join(', ')} | ${rec.reason} |\n`;
  });
  report += '\n';

  report += '## Recommended Indexes\n\n';
  results.recommendations.forEach((rec, index) => {
    report += `### ${index + 1}. ${rec.table}.${rec.columns.join('_')}\n\n`;
    report += '```sql\n';
    report += rec.sql;
    report += '\n```\n\n';

    report += `**Priority:** ${rec.priority}\n`;
    report += `**Reason:** ${rec.reason}\n`;
    report += `**Estimated Improvement:** ${rec.estimatedImprovement}\n`;

    if (rec.partial) {
      report += '**Type:** Partial (filtered) index\n';
    }
    if (rec.expression) {
      report += '**Type:** Expression (functional) index\n';
    }
    if (rec.unique) {
      report += '**Type:** Unique index\n';
    }
    report += '\n---\n\n';
  });

  if (results.writeImpact) {
    report += '## Write Impact Analysis\n\n';
    report += `**Insert Overhead:** ${results.writeImpact.insertOverhead}\n\n`;
    report += `**Update Overhead:** ${results.writeImpact.updateOverhead}\n\n`;
    report += `**Delete Overhead:** ${results.writeImpact.deleteOverhead}\n\n`;
    report += `**Storage Overhead:** ${results.writeImpact.storageOverhead}\n\n`;
    report += `**Recommendation:** ${results.writeImpact.recommendation}\n\n`;
  }

  return report;
}

/**
 * Generates SQL migration file
 * @param {Object} results - Index analysis results
 * @returns {string} SQL migration
 */
function generateMigrationSQL(results) {
  let sql = '-- Index Migration Script\n';
  sql += `-- Generated: ${results.analyzedAt}\n`;
  sql += `-- Dialect: ${results.dialect}\n\n`;

  sql += '-- Prerequisites:\n';
  sql += '-- 1. Back up your database before applying\n';
  sql += '-- 2. Test indexes on a staging environment\n';
  sql += '-- 3. Apply during low-traffic periods\n\n';

  sql += 'BEGIN;\n\n';

  results.recommendations.forEach(rec => {
    sql += `-- Priority: ${rec.priority}\n`;
    sql += `-- Reason: ${rec.reason}\n`;

    if (rec.partial) {
      sql += `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${rec.table}_partial ON ${rec.table} (${rec.columns[0]}) WHERE ${rec.columns[0]} = 'value';\n\n`;
    } else if (rec.expression) {
      const match = rec.columns[0].match(/^(lower|upper)\((\w+)\)$/i);
      if (match) {
        sql += `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${rec.table}_${match[2].toLowerCase()} ON ${rec.table} (${rec.columns[0]});\n\n`;
      }
    } else if (rec.unique) {
      sql += `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uidx_${rec.table}_${rec.columns.join('_')} ON ${rec.table} (${rec.columns.join(', ')});\n\n`;
    } else {
      sql += `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${rec.table}_${rec.columns.join('_')} ON ${rec.table} (${rec.columns.join(', ')});\n\n`;
    }
  });

  sql += '-- Analyze tables after creating indexes\n';
  results.tables.forEach(table => {
    sql += `ANALYZE ${table};\n`;
  });

  sql += '\nCOMMIT;\n';

  return sql;
}

/**
 * Main CLI execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node suggest-indexes.js <query.sql> [--dialect postgres|mysql|sqlite|mssql] [--analyze-writes] [--format sql] [--output file.sql]');
    console.error('       echo "SELECT * FROM users WHERE status = active" | node suggest-indexes.js --dialect postgresql');
    process.exit(1);
  }

  const options = {
    dialect: 'postgresql',
    analyzeWrites: false,
    format: 'text',
    output: null
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dialect' && i < args.length - 1) {
      options.dialect = args[++i];
    } else if (args[i] === '--analyze-writes') {
      options.analyzeWrites = true;
    } else if (args[i] === '--format' && i < args.length - 1) {
      options.format = args[++i];
    } else if (args[i] === '--output' && i < args.length - 1) {
      options.output = args[++i];
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

  const results = suggestIndexes(query, options);

  if (options.output) {
    const migrationSQL = generateMigrationSQL(results);
    fs.writeFileSync(options.output, migrationSQL);
    console.log(`Migration file written to: ${options.output}`);
  } else if (options.format === 'sql') {
    console.log(generateMigrationSQL(results));
  } else {
    console.log(generateIndexReport(results, options));
  }
}

// Export for use as module
module.exports = {
  suggestIndexes,
  generateIndexReport,
  generateMigrationSQL
};

// Run if called directly
if (require.main === module) {
  main();
}