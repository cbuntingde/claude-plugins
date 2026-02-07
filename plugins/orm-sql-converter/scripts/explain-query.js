#!/usr/bin/env node

/**
 * Query Explanation Script
 *
 * Usage: node scripts/explain-query.js <type> <query>
 *
 * Examples:
 *   node scripts/explain-query.js sql "SELECT * FROM users WHERE age > 18"
 *   node scripts/explain-query.js sqlalchemy "session.query(User).filter(User.age > 18)"
 */

const queryTypes = ['sql', 'sqlalchemy', 'django', 'entity-framework', 'typeorm', 'sequelize', 'prisma', 'hibernate'];

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/explain-query.js <type> <query>');
    console.error('\nSupported query types:');
    queryTypes.forEach(t => console.error(`  - ${t}`));
    process.exit(1);
  }

  return {
    type: args[0],
    query: args.slice(1).join(' ')
  };
}

function validateType(type) {
  const normalized = type.toLowerCase().replace(/[- ]/g, '');
  const isValid = queryTypes.some(t => t.toLowerCase().replace(/[- ]/g, '') === normalized);

  if (!isValid) {
    console.error(`Error: Unknown query type "${type}"`);
    console.error('Supported types:', queryTypes.join(', '));
    process.exit(1);
  }

  return type;
}

function explainSqlQuery(query) {
  const result = {
    steps: [
      'Parse the SQL query structure',
      'Identify tables and columns involved',
      'Analyze JOIN conditions and their efficiency',
      'Evaluate WHERE clause for index utilization',
      'Review ORDER BY and LIMIT for optimization opportunities'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (query.match(/SELECT\s+\*/i)) {
    result.warnings.push('Using SELECT * retrieves all columns, even unused ones');
    result.recommendations.push('Specify only required columns to reduce I/O and memory usage');
  }

  if (query.match(/LEFT\s+JOIN|RIGHT\s+JOIN/i)) {
    result.warnings.push('OUTER JOINs can be expensive on large datasets');
    result.recommendations.push('Verify if INNER JOIN produces equivalent results');
  }

  if (query.match(/LIKE\s+['"]%/i)) {
    result.warnings.push('Leading wildcard in LIKE prevents index usage');
    result.recommendations.push('Consider full-text search or reverse wildcard pattern');
  }

  if (query.match(/OR\s+/i) && !query.match(/\(/i)) {
    result.warnings.push('Multiple OR conditions may bypass index usage');
    result.recommendations.push('Consider UNION ALL for better index utilization');
  }

  if (query.match(/NOT\s+(IN|EXISTS|LIKE)/i)) {
    result.warnings.push('NOT operators can be slower than positive conditions');
    result.recommendations.push('Consider rewriting with positive conditions where possible');
  }

  if (query.match(/COUNT\(\*\)/i)) {
    result.warnings.push('COUNT(*) scans entire result set');
    result.recommendations.push('For large tables, consider maintaining a count table or cache');
  }

  if (query.match(/ORDER\s+BY\s+RAND/i)) {
    result.warnings.push('ORDER BY RAND() is extremely expensive on large datasets');
    result.recommendations.push('Consider application-side randomization or alternative approaches');
  }

  return result;
}

function explainSqlAlchemyQuery(query) {
  const result = {
    steps: [
      'Parse SQLAlchemy query builder chain',
      'Identify Query object and its constituent parts',
      'Analyze filter conditions and their SQL translation',
      'Review eager loading configuration',
      'Check for potential N+1 query problems'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (query.match(/N\+1|n\+1/i) || query.match(/for\s+\w+\s+in/i)) {
    result.warnings.push('Potential N+1 query pattern detected');
    result.recommendations.push('Use .select_related() for ForeignKey joins');
    result.recommendations.push('Use .prefetch_related() for reverse ForeignKey and ManyToMany');
  }

  if (query.match(/\.all\(\)/) && !query.match(/\.limit|\.first|\.one/i)) {
    result.warnings.push('.all() loads entire queryset into memory');
    result.recommendations.push('For large datasets, consider .yield_per() for streaming');
    result.recommendations.push('Use .limit() to restrict result size');
  }

  if (query.match(/\.filter\s*\([^)]*\)\s*\.\s*filter/i)) {
    result.warnings.push('Chained filters create separate conditions');
    result.recommendations.push('Consider combining conditions for better readability');
  }

  if (query.match(/session\.query/i) && query.match(/\.count\(\)/i)) {
    result.warnings.push('COUNT queries can be expensive on large tables');
    result.recommendations.push('Consider caching count results if they change infrequently');
  }

  return result;
}

function explainDjangoQuery(query) {
  const result = {
    steps: [
      'Parse Django ORM QuerySet operations',
      'Identify model references and field lookups',
      'Analyze filter conditions and their SQL equivalents',
      'Review prefetch/select_related for relation handling',
      'Check database query count for N+1 patterns'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (!query.match(/select_related|prefetch_related/i)) {
    result.warnings.push('Foreign key or many-to-many traversals will cause N+1 queries');
    result.recommendations.push('Use select_related() for ForeignKey relations (single object)');
    result.recommendations.push('Use prefetch_related() for reverse FK and ManyToMany relations');
  }

  if (query.match(/\[\d+\]/)) {
    result.warnings.push('Direct index access on queryset evaluates the entire queryset');
    result.recommendations.push('Use .first() for single item retrieval');
    result.recommendations.push('Use queryset[index] only after evaluation');
  }

  if (query.match(/\.count\(\)/i)) {
    result.warnings.push('COUNT() with filter may trigger full table scan');
    result.recommendations.push('Use .filter().count() pattern');
  }

  if (query.match(/\.values_list\(.*,\s*flat\s*=\s*True/i)) {
    result.warnings.push('flat=True with single field returns list, not queryset');
    result.recommendations.push('Be aware this evaluates the entire queryset');
  }

  return result;
}

function explainEntityFrameworkQuery(query) {
  const result = {
    steps: [
      'Parse LINQ query or method chain',
      'Identify IQueryable operations and their evaluation',
      'Analyze Where, Select, OrderBy transformations',
      'Review Include statements for eager loading',
      'Check for premature query execution'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (query.match(/\.ToList\(\)|\.Count\(\)|\.First\(\)/i)) {
    result.steps.push('Query execution triggered at this point');
  }

  if (query.match(/Include\s*\(/i) && !query.match(/ThenInclude/i)) {
    result.recommendations.push('For multi-level includes, use ThenInclude() for proper eager loading');
  }

  if (query.match(/\.AsNoTracking\(\)/i)) {
    result.recommendations.push('AsNoTracking() improves performance for read-only scenarios');
  }

  return result;
}

function explainTypeORMQuery(query) {
  const result = {
    steps: [
      'Parse TypeORM query builder or repository calls',
      'Analyze where, orderBy, and relations configurations',
      'Review join strategies (innerJoin vs leftJoin)',
      'Check pagination implementation',
      'Verify transaction handling if applicable'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (query.match(/leftJoin/i) && !query.match(/innerJoin/i)) {
    result.recommendations.push('Consider if leftJoin is necessary or if innerJoin is more appropriate');
  }

  if (query.match(/\.getMany\(\)/i) && !query.match(/\.take|\.skip/i)) {
    result.recommendations.push('Consider adding pagination limits for large datasets');
  }

  return result;
}

function explainSequelizeQuery(query) {
  const result = {
    steps: [
      'Parse Sequelize model query options',
      'Analyze where clause structure',
      'Review include configuration for associations',
      'Check pagination and ordering options',
      'Verify raw query handling if applicable'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (query.match(/raw:\s*true/i)) {
    result.warnings.push('Raw queries bypass Sequelize model validation');
    result.recommendations.push('Ensure input is validated before raw queries');
  }

  if (query.match(/where:\s*\{\s*\}/i)) {
    result.recommendations.push('Empty where clause retrieves all records');
    result.recommendations.push('Consider adding limits for large tables');
  }

  return result;
}

function explainPrismaQuery(query) {
  const result = {
    steps: [
      'Parse Prisma client query chain',
      'Analyze where, select, and include options',
      'Review relation loading strategies',
      'Check cursor-based pagination implementation',
      'Verify distinct and aggregation usage'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (query.match(/include:\s*\{/i)) {
    result.warnings.push('Including all relations can cause large data transfers');
    result.recommendations.push('Use selective inclusion with specific nested fields');
    result.recommendations.push('Consider using findMany with selective selects instead');
  }

  if (query.match(/\.count\(\)/i)) {
    result.recommendations.push('count() is a separate query; consider if it can be combined');
  }

  return result;
}

function explainHibernateQuery(query) {
  const result = {
    steps: [
      'Parse HQL or Criteria API query',
      'Identify entity and property names',
      'Analyze WHERE clause parameters and types',
      'Review fetch strategies and lazy loading',
      'Check for potential N+1 issues in collections'
    ],
    warnings: [],
    recommendations: [],
    complexity: 'O(n log n)'
  };

  if (query.match(/fetch\s*=\s*['"]?lazy['"]?/i)) {
    result.recommendations.push('Lazy loading may cause N+1 queries');
    result.recommendations.push('Consider EAGER fetching for batch operations');
  }

  if (query.match(/\?.+(\?.+){2,}/i)) {
    result.recommendations.push('Multiple positional parameters can be error-prone');
    result.recommendations.push('Consider named parameters for better maintainability');
  }

  return result;
}

function explainQuery(type, query) {
  const normalized = type.toLowerCase().replace(/[- ]/g, '');

  switch (normalized) {
    case 'sql':
      return explainSqlQuery(query);
    case 'sqlalchemy':
      return explainSqlAlchemyQuery(query);
    case 'django':
      return explainDjangoQuery(query);
    case 'entityframework':
      return explainEntityFrameworkQuery(query);
    case 'typeorm':
      return explainTypeORMQuery(query);
    case 'sequelize':
      return explainSequelizeQuery(query);
    case 'prisma':
      return explainPrismaQuery(query);
    case 'hibernate':
      return explainHibernateQuery(query);
    default:
      return { error: `Unknown query type: ${type}` };
  }
}

function formatExplanation(result) {
  let output = '';

  output += 'Query Analysis\n';
  output += '==============\n\n';

  output += 'Execution Steps:\n';
  result.steps.forEach((step, i) => {
    output += `  ${i + 1}. ${step}\n`;
  });

  if (result.warnings && result.warnings.length > 0) {
    output += '\nWarnings:\n';
    result.warnings.forEach(w => {
      output += `  ! ${w}\n`;
    });
  }

  if (result.recommendations && result.recommendations.length > 0) {
    output += '\nRecommendations:\n';
    result.recommendations.forEach((rec, i) => {
      output += `  ${i + 1}. ${rec}\n`;
    });
  }

  if (result.complexity) {
    output += `\nEstimated Complexity: ${result.complexity}\n`;
  }

  if (result.error) {
    output += `\nError: ${result.error}\n`;
  }

  return output;
}

function main() {
  const args = parseArgs();
  const type = validateType(args.type);
  const query = args.query;

  console.log(`Analyzing ${type} query...`);
  console.log(`Query: ${query}\n`);

  const result = explainQuery(type, query);
  console.log(formatExplanation(result));
}

main();