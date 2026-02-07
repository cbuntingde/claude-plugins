#!/usr/bin/env node
/**
 * explain-plan.js - Generates and analyzes database execution plans
 *
 * This script generates execution plan analysis for SQL queries,
 * providing detailed information about query performance characteristics.
 */

const fs = require('fs');

/**
 * Parses EXPLAIN output into structured data
 * @param {string} planText - Raw EXPLAIN output
 * @param {string} dialect - Database dialect
 * @returns {Object} Parsed execution plan
 */
function parseExplainPlan(planText, dialect = 'postgresql') {
  const lines = planText.split('\n').filter(l => l.trim());
  const plan = {
    operations: [],
    totalCost: { estimated: null, actual: null },
    executionTime: null
  };

  // Parse PostgreSQL EXPLAIN output
  if (dialect === 'postgresql') {
    let currentOp = null;
    let currentIndent = 0;

    lines.forEach(line => {
      const indentMatch = line.match(/^(\s+)/);
      const indent = indentMatch ? indentMatch[1].length : 0;
      const trimmed = line.trim();

      // Check for cost range (e.g., "Seq Scan on users (cost=0.00..15.25 rows=1000 width=84)")
      const costMatch = trimmed.match(/\(cost=([\d.]+)\.\.([\d.]+)\s.*rows=(\d+)\swidth=(\d+)\)/);
      const actualTimeMatch = trimmed.match(/\(actual\s+time=([\d.]+)..([\d.]+)\s+rows=(\d+)\s+loops=(\d+)\)/i);

      if (costMatch || actualTimeMatch) {
        if (currentOp) {
          currentOp.cost = {
            start: costMatch ? parseFloat(costMatch[1]) : null,
            end: costMatch ? parseFloat(costMatch[2]) : null,
            rows: costMatch ? parseInt(costMatch[3]) : null,
            width: costMatch ? parseInt(costMatch[4]) : null
          };
          currentOp.actual = actualTimeMatch ? {
            start: parseFloat(actualTimeMatch[1]),
            end: parseFloat(actualTimeMatch[2]),
            rows: parseInt(actualTimeMatch[3]),
            loops: parseInt(actualTimeMatch[4])
          } : null;
        }
      }

      // Parse operation type
      const seqScanMatch = trimmed.match(/^->\s+Seq\s+Scan\s+on\s+(\w+)/i);
      const indexScanMatch = trimmed.match(/^->\s+(Index\s+\w+|Bitmap\s+\w+)\s+Scan\s+on\s+(\w+)/i);
      const nestedLoopMatch = trimmed.match(/^->\s+Nested\s+Loop/i);
      const hashJoinMatch = trimmed.match(/^->\s+Hash\s+Join/i);
      const mergeJoinMatch = trimmed.match(/^->\s+Merge\s+Join/i);
      const hashMatch = trimmed.match(/^->\s+Hash\b/i);
      const sortMatch = trimmed.match(/^->\s+Sort\b/i);
      const aggregateMatch = trimmed.match(/^->\s+(Hash\s+)?Aggregate/i);
      const limitMatch = trimmed.match(/^->\s+Limit/i);
      const appendMatch = trimmed.match(/^->\s+Append/i);
      const functionScanMatch = trimmed.match(/^->\s+Function\s+Scan/i);
      const cteScanMatch = trimmed.match(/^->\s+CTE\s+Scan\s+on\s+(\w+)/i);

      let opType = null;
      let table = null;

      if (seqScanMatch) {
        opType = 'SEQ_SCAN';
        table = seqScanMatch[1];
      } else if (indexScanMatch) {
        opType = 'INDEX_SCAN';
        table = indexScanMatch[2];
      } else if (nestedLoopMatch) {
        opType = 'NESTED_LOOP';
      } else if (hashJoinMatch) {
        opType = 'HASH_JOIN';
      } else if (mergeJoinMatch) {
        opType = 'MERGE_JOIN';
      } else if (hashMatch) {
        opType = 'HASH';
      } else if (sortMatch) {
        opType = 'SORT';
      } else if (aggregateMatch) {
        opType = 'AGGREGATE';
      } else if (limitMatch) {
        opType = 'LIMIT';
      } else if (appendMatch) {
        opType = 'APPEND';
      } else if (functionScanMatch) {
        opType = 'FUNCTION_SCAN';
      } else if (cteScanMatch) {
        opType = 'CTE_SCAN';
        table = cteScanMatch[1];
      }

      if (opType) {
        if (currentOp && indent > currentIndent) {
          // Child operation
          currentOp.children = currentOp.children || [];
          currentOp.children.push(currentOp);
        } else if (currentOp && indent === currentIndent) {
          plan.operations.push(currentOp);
        } else if (currentOp && indent < currentIndent) {
          while (currentOp && indent < currentIndent) {
            plan.operations.push(currentOp);
            currentOp = plan.operations.pop();
            currentIndent -= 2;
          }
        }

        if (opType !== 'HASH' || indent === 0) {
          currentOp = { type: opType, table, indent, children: [] };
          currentIndent = indent;
        }
      }
    });

    if (currentOp) {
      plan.operations.push(currentOp);
    }
  }

  // Parse MySQL EXPLAIN output
  if (dialect === 'mysql') {
    const headers = lines[0].toLowerCase().split('\t');
    const data = lines.slice(1);

    plan.rows = data.map(row => {
      const values = row.split('\t');
      const rowData = {};
      headers.forEach((header, i) => {
        rowData[header.trim()] = values[i]?.trim();
      });
      return rowData;
    });
  }

  return plan;
}

/**
 * Analyzes an execution plan for performance issues
 * @param {Object} plan - Parsed execution plan
 * @returns {Object} Performance analysis
 */
function analyzeExecutionPlan(plan) {
  const issues = [];
  const suggestions = [];

  if (!plan.operations || plan.operations.length === 0) {
    return { issues, suggestions, summary: 'No operations found in plan' };
  }

  // Check for sequential scans on large tables
  plan.operations.forEach(op => {
    if (op.type === 'SEQ_SCAN') {
      issues.push({
        type: 'SEQ_SCAN',
        severity: op.cost?.rows > 10000 ? 'high' : 'medium',
        message: `Sequential scan detected on ${op.table || 'table'}`,
        recommendation: 'Consider adding an index or rewriting the query to use existing indexes'
      });

      if (op.cost?.rows > 10000) {
        suggestions.push(`Table ${op.table} has ~${op.cost.rows.toLocaleString()} rows - a full table scan is expensive. Evaluate index usage.`);
      }
    }

    if (op.type === 'SORT' && op.cost?.rows > 1000) {
      issues.push({
        type: 'EXPENSIVE_SORT',
        severity: 'medium',
        message: `Sorting ${op.cost.rows.toLocaleString()} rows`,
        recommendation: 'Consider adding an index on the ORDER BY columns to avoid in-memory sorting'
      });
    }

    if (op.type === 'NESTED_LOOP' && op.cost?.rows > 1000) {
      issues.push({
        type: 'EXPENSIVE_NESTED_LOOP',
        severity: 'medium',
        message: 'Nested loop join may be inefficient for large datasets',
        recommendation: 'Consider using hash join or merge join for large tables'
      });
    }

    if (op.type === 'HASH_JOIN' && op.cost?.end > 10000) {
      issues.push({
        type: 'EXPENSIVE_HASH_JOIN',
        severity: 'low',
        message: 'Hash join may use significant memory',
        recommendation: 'Ensure work_mem is appropriately sized for hash operations'
      });
    }
  });

  // Check for missing index recommendations
  const seqScans = plan.operations.filter(op => op.type === 'SEQ_SCAN');
  if (seqScans.length > 0) {
    issues.push({
      type: 'INDEX_OPPORTUNITY',
      severity: 'info',
      message: `${seqScans.length} sequential scan(s) detected`,
      recommendation: 'Review WHERE clause columns and consider adding indexes'
    });
  }

  return {
    issues,
    suggestions,
    summary: {
      totalOperations: plan.operations.length,
      hasSeqScan: seqScans.length > 0,
      estimatedTotalCost: plan.totalCost?.estimated
    }
  };
}

/**
 * Generates a human-readable plan report
 * @param {Object} plan - Parsed execution plan
 * @param {Object} analysis - Plan analysis
 * @returns {string} Formatted report
 */
function generatePlanReport(plan, analysis) {
  let report = '# Execution Plan Analysis\n\n';

  if (plan.operations) {
    report += '## Plan Operations\n\n';
    report += '| Operation | Table | Estimated Cost | Actual Rows |\n';
    report += '|-----------|-------|----------------|-------------|\n';

    plan.operations.forEach(op => {
      const indent = '  '.repeat(op.indent / 2 || 0);
      const cost = op.cost ? `${op.cost.start?.toFixed(2) || '?'}..${op.cost.end?.toFixed(2) || '?'}` : 'N/A';
      const rows = op.cost?.rows?.toLocaleString() || op.actual?.rows?.toLocaleString() || '?';
      report += `| ${indent}${op.type} | ${op.table || '-'} | ${cost} | ${rows} |\n`;
    });
    report += '\n';
  }

  if (analysis.issues && analysis.issues.length > 0) {
    report += '## Performance Observations\n\n';
    analysis.issues.forEach((issue, index) => {
      const icon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      report += `${icon} **${issue.type}** (${issue.severity.toUpperCase()})\n`;
      report += `- ${issue.message}\n`;
      if (issue.recommendation) {
        report += `- Recommendation: ${issue.recommendation}\n`;
      }
      report += '\n';
    });
  }

  if (analysis.suggestions && analysis.suggestions.length > 0) {
    report += '## Suggestions\n\n';
    analysis.suggestions.forEach((suggestion, index) => {
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
    console.error('Usage: node explain-plan.js <query.sql> [--dialect postgres|mysql|sqlite|mssql]');
    console.error('       node explain-plan.js <plan-output.txt> [--dialect postgres]');
    process.exit(1);
  }

  const options = {
    dialect: 'postgresql',
    analyze: false,
    buffers: false,
    compare: null
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dialect' && i < args.length - 1) {
      options.dialect = args[++i];
    } else if (args[i] === '--analyze') {
      options.analyze = true;
    } else if (args[i] === '--buffers') {
      options.buffers = true;
    } else if (args[i] === '--compare' && i < args.length - 1) {
      options.compare = args[++i];
    }
  }

  // Read plan from file or stdin
  let planText = '';
  if (fs.existsSync(args[0])) {
    planText = fs.readFileSync(args[0], 'utf8');
  } else {
    process.stdin.setEncoding('utf8');
    planText = fs.readFileSync(0, 'utf8');
  }

  const plan = parseExplainPlan(planText, options.dialect);
  const analysis = analyzeExecutionPlan(plan);
  console.log(generatePlanReport(plan, analysis));
}

// Export for use as module
module.exports = {
  parseExplainPlan,
  analyzeExecutionPlan,
  generatePlanReport
};

// Run if called directly
if (require.main === module) {
  main();
}