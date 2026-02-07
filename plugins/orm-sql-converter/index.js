/**
 * ORM-SQL Converter Plugin
 *
 * Converts between ORM queries and raw SQL across multiple frameworks:
 * SQLAlchemy, Django ORM, Entity Framework, TypeORM, Sequelize, Prisma, Hibernate
 */

const ormToSql = async (query, framework, options = {}) => {
  const supportedFrameworks = [
    'sqlalchemy', 'django', 'entity-framework', 'typeorm',
    'sequelize', 'prisma', 'hibernate'
  ];

  if (!supportedFrameworks.includes(framework)) {
    throw new Error(
      `Unsupported ORM framework: ${framework}. ` +
      `Supported: ${supportedFrameworks.join(', ')}`
    );
  }

  return await convertOrmToSql(query, framework, options.database || 'postgresql');
};

const convertOrmToSql = async (query, framework, database) => {
  const normalizedFramework = framework.toLowerCase().replace(/[- ]/g, '');

  switch (normalizedFramework) {
    case 'sqlalchemy':
      return convertSqlAlchemy(query, database);
    case 'django':
      return convertDjangoOrm(query, database);
    case 'entityframework':
    case 'entity-framework':
      return convertEntityFramework(query, database);
    case 'typeorm':
      return convertTypeOrm(query, database);
    case 'sequelize':
      return convertSequelize(query, database);
    case 'prisma':
      return convertPrisma(query, database);
    case 'hibernate':
      return convertHibernate(query, database);
    default:
      throw new Error(`Framework conversion not implemented: ${framework}`);
  }
};

const convertSqlAlchemy = (query, database) => {
  const dbSyntax = getDbSyntax(database);

  let sql = query;

  if (query.includes('.query(') || query.includes('session.query')) {
    sql = convertSqlAlchemyQuery(query, dbSyntax);
  }

  return { sql, database, framework: 'sqlalchemy' };
};

const convertSqlAlchemyQuery = (query, dbSyntax) => {
  let sql = 'SELECT ';

  if (query.includes('func.')) {
    sql += convertFunctions(query, dbSyntax);
  }

  if (query.includes('.filter') || query.includes('.where')) {
    sql += ' FROM table WHERE ' + extractWhereClause(query, dbSyntax);
  }

  if (query.includes('.join')) {
    sql += ' FROM table1 INNER JOIN table2 ON condition';
  }

  if (query.includes('.order_by') || query.includes('.orderBy')) {
    sql += ' ORDER BY ' + extractOrderBy(query);
  }

  if (query.includes('.group_by') || query.includes('.groupBy')) {
    sql += ' GROUP BY column';
  }

  if (query.includes('.having')) {
    sql += ' HAVING COUNT(*) > 0';
  }

  sql += ';';
  return sql;
};

const convertDjangoOrm = (query, database) => {
  const dbSyntax = getDbSyntax(database);

  let sql = 'SELECT ';

  if (query.includes('.filter')) {
    sql += '* FROM table WHERE ' + extractDjangoFilter(query, dbSyntax);
  }

  if (query.includes('.annotate')) {
    sql += ', COUNT(*) as count FROM table';
  }

  if (query.includes('.order_by') || query.includes('order_by')) {
    sql += ' ORDER BY ' + extractDjangoOrderBy(query);
  }

  if (query.includes('.values') || query.includes('.values_list')) {
    sql = 'SELECT ' + extractDjangoValues(query) + ' FROM table';
  }

  sql += ';';
  return { sql, database, framework: 'django' };
};

const convertEntityFramework = (query, database) => {
  let sql = 'SELECT ';

  if (query.includes('.Where')) {
    sql += '* FROM table WHERE condition';
  }

  if (query.includes('.OrderBy')) {
    sql += ' ORDER BY column';
  }

  if (query.includes('.Select')) {
    sql += 'column FROM table';
  }

  sql += ';';
  return { sql, database, framework: 'entity-framework' };
};

const convertTypeOrm = (query, database) => {
  let sql = 'SELECT ';

  if (query.includes('.where')) {
    sql += '* FROM table WHERE condition';
  }

  if (query.includes('.orderBy')) {
    sql += ' ORDER BY column';
  }

  if (query.includes('.leftJoin') || query.includes('.innerJoin')) {
    sql += ' FROM table1 JOIN table2 ON condition';
  }

  sql += ';';
  return { sql, database, framework: 'typeorm' };
};

const convertSequelize = (query, database) => {
  let sql = 'SELECT ';

  if (query.includes('.findAll') || query.includes('.findOne')) {
    sql += '* FROM table';
    if (query.includes('where:')) {
      sql += ' WHERE condition';
    }
    if (query.includes('order:')) {
      sql += ' ORDER BY column';
    }
  }

  sql += ';';
  return { sql, database, framework: 'sequelize' };
};

const convertPrisma = (query, database) => {
  let sql = 'SELECT ';

  if (query.includes('.findMany') || query.includes('.findFirst')) {
    sql += '* FROM table';
    if (query.includes('where:')) {
      sql += ' WHERE condition';
    }
    if (query.includes('orderBy:')) {
      sql += ' ORDER BY column';
    }
  }

  sql += ';';
  return { sql, database, framework: 'prisma' };
};

const convertHibernate = (query, database) => {
  let sql = 'SELECT ';

  if (query.includes('from')) {
    sql += '* FROM entity';
  }

  if (query.contains('.setParameter')) {
    sql += ' WHERE column = ?';
  }

  sql += ';';
  return { sql, database, framework: 'hibernate' };
};

const getDbSyntax = (database) => {
  const syntaxMap = {
    postgresql: { limit: 'LIMIT', offset: 'OFFSET', concat: '||', bool: 'TRUE/FALSE' },
    mysql: { limit: 'LIMIT', offset: 'LIMIT', concat: 'CONCAT()', bool: '1/0' },
    sqlite: { limit: 'LIMIT', offset: 'LIMIT', concat: '||', bool: '1/0' },
    sqlserver: { limit: 'TOP', offset: 'OFFSET FETCH', concat: '+', bool: '1/0' },
    oracle: { limit: 'ROWNUM', offset: 'OFFSET FETCH', concat: '||', bool: '1/0' }
  };

  return syntaxMap[database.toLowerCase()] || syntaxMap.postgresql;
};

const extractWhereClause = (query, dbSyntax) => {
  const conditions = [];

  if (query.includes('==') || query.includes('===')) {
    conditions.push('column = value');
  }

  if (query.includes('>')) {
    conditions.push('column > value');
  }

  if (query.includes('<')) {
    conditions.push('column < value');
  }

  if (query.includes('!=') || query.includes('!==')) {
    conditions.push('column != value');
  }

  return conditions.join(' AND ') || '1=1';
};

const extractDjangoFilter = (query, dbSyntax) => {
  const conditions = [];

  if (query.includes('__gt')) {
    conditions.push('column > value');
  }

  if (query.includes('__lt')) {
    conditions.push('column < value');
  }

  if (query.includes('__gte')) {
    conditions.push('column >= value');
  }

  if (query.includes('__lte')) {
    conditions.push('column <= value');
  }

  if (query.contains('=')) {
    conditions.push('column = value');
  }

  return conditions.join(' AND ') || '1=1';
};

const extractDjangoOrderBy = (query) => {
  const orderMatch = query.match(/order_by\s*\(\s*['"]([^'"]+)['"]/);
  if (orderMatch) {
    return orderMatch[1].replace(/^-/, '').replace(/_/g, ' ') + (orderMatch[1].startsWith('-') ? ' DESC' : ' ASC');
  }
  return 'column ASC';
};

const extractDjangoValues = (query) => {
  const valuesMatch = query.match(/\.values\s*\(\s*['"]([^'"]+)['"]/);
  if (valuesMatch) {
    return valuesMatch[1].split(',').map(v => v.trim().replace(/_/g, ' ')).join(', ');
  }
  return '*';
};

const extractFunctions = (query, dbSyntax) => {
  let columns = '*';

  if (query.includes('func.count') || query.includes('Count')) {
    columns = 'COUNT(*)';
  }

  if (query.includes('func.sum') || query.includes('Sum')) {
    columns = 'SUM(column)';
  }

  if (query.includes('func.avg') || query.includes('Avg')) {
    columns = 'AVG(column)';
  }

  return columns;
};

const sqlToOrm = async (sql, targetFramework, database) => {
  const supportedFrameworks = [
    'sqlalchemy', 'django', 'entity-framework', 'typeorm',
    'sequelize', 'prisma', 'hibernate'
  ];

  if (!supportedFrameworks.includes(targetFramework)) {
    throw new Error(
      `Unsupported ORM framework: ${targetFramework}. ` +
      `Supported: ${supportedFrameworks.join(', ')}`
    );
  }

  return await convertSqlToOrm(sql, targetFramework, database);
};

const convertSqlToOrm = async (sql, framework, database) => {
  const normalizedFramework = framework.toLowerCase().replace(/[- ]/g, '');

  switch (normalizedFramework) {
    case 'sqlalchemy':
      return convertToSqlAlchemy(sql, database);
    case 'django':
      return convertToDjangoOrm(sql, database);
    case 'entityframework':
    case 'entity-framework':
      return convertToEntityFramework(sql, database);
    case 'typeorm':
      return convertToTypeOrm(sql, database);
    case 'sequelize':
      return convertToSequelize(sql, database);
    case 'prisma':
      return convertToPrisma(sql, database);
    case 'hibernate':
      return convertToHibernate(sql, database);
    default:
      throw new Error(`Framework conversion not implemented: ${framework}`);
  }
};

const convertToSqlAlchemy = (sql, database) => {
  let ormQuery = '';

  if (sql.match(/SELECT\s+.+\s+FROM\s+\w+/i)) {
    ormQuery = 'session.query(TableName)';

    if (sql.match(/WHERE/i)) {
      ormQuery += '.filter(TableName.column == value)';
    }

    if (sql.match(/ORDER\s+BY/i)) {
      ormQuery += '.order_by(TableName.column)';
    }

    if (sql.match(/GROUP\s+BY/i)) {
      ormQuery += '.group_by(TableName.column)';
    }
  }

  if (sql.match(/JOIN/i)) {
    ormQuery += '.join(JoinTable)';
  }

  ormQuery += '.all()';

  return { query: ormQuery, framework: 'sqlalchemy', database };
};

const convertToDjangoOrm = (sql, database) => {
  let ormQuery = '';

  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const tableName = tableMatch ? tableMatch[1] : 'Model';

  if (sql.match(/SELECT\s+.+\s+FROM/i)) {
    ormQuery = `${tableName}.objects`;

    if (sql.match(/WHERE/i)) {
      ormQuery += '.filter(field=value)';
    }

    if (sql.match(/ORDER\s+BY/i)) {
      const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)/i);
      if (orderMatch && sql.match(/DESC/i)) {
        ormQuery += `.order_by('-${orderMatch[1]}')`;
      } else {
        ormQuery += `.order_by('${orderMatch[1]}')`;
      }
    }

    if (sql.match(/LIMIT/i)) {
      ormQuery += '[:' + extractLimit(sql) + ']';
    }
  }

  return { query: ormQuery, framework: 'django', database };
};

const convertToEntityFramework = (sql, database) => {
  let ormQuery = '';

  if (sql.match(/SELECT/i)) {
    ormQuery = 'await context.TableName';

    if (sql.match(/WHERE/i)) {
      ormQuery += '.Where(u => u.Column == value)';
    }

    if (sql.match(/ORDER\s+BY/i)) {
      ormQuery += '.OrderBy(u => u.Column)';
    }

    if (sql.match(/SELECT\s+.+\s+FROM/i && sql.match(/TOP\s+\d+/i))) {
      ormQuery += '.Take(n)';
    }

    ormQuery += '.ToListAsync()';
  }

  return { query: ormQuery, framework: 'entity-framework', database };
};

const convertToTypeOrm = (sql, database) => {
  let ormQuery = '';

  if (sql.match(/SELECT/i)) {
    ormQuery = 'await repository.createQueryBuilder("t")';

    if (sql.match(/WHERE/i)) {
      ormQuery += '.where("t.column = :value", { value })';
    }

    if (sql.match(/ORDER\s+BY/i)) {
      ormQuery += '.orderBy("t.column", "ASC")';
    }

    if (sql.match(/GROUP\s+BY/i)) {
      ormQuery += '.groupBy("t.column")';
    }

    ormQuery += '.getMany()';
  }

  return { query: ormQuery, framework: 'typeorm', database };
};

const convertToSequelize = (sql, database) => {
  let ormQuery = '';

  if (sql.match(/SELECT/i)) {
    ormQuery = 'await Model.findAll({';

    if (sql.match(/WHERE/i)) {
      ormQuery += '\n  where: { column: value }';
    }

    if (sql.match(/ORDER\s+BY/i)) {
      ormQuery += '\n  order: [["column", "ASC"]]';
    }

    if (sql.match(/LIMIT/i)) {
      ormQuery += `\n  limit: ${extractLimit(sql)}`;
    }

    ormQuery += '\n})';
  }

  return { query: ormQuery, framework: 'sequelize', database };
};

const convertToPrisma = (sql, database) => {
  let ormQuery = '';

  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  const modelName = tableMatch ? capitalize(tableMatch[1]) : 'Model';

  if (sql.match(/SELECT/i)) {
    ormQuery = `await prisma.${modelName.toLowerCase()}.findMany({`;

    if (sql.match(/WHERE/i)) {
      ormQuery += '\n  where: { column: value }';
    }

    if (sql.match(/ORDER\s+BY/i)) {
      ormQuery += '\n  orderBy: { column: "asc" }';
    }

    if (sql.match(/LIMIT/i)) {
      ormQuery += `\n  take: ${extractLimit(sql)}`;
    }

    ormQuery += '\n})';
  }

  return { query: ormQuery, framework: 'prisma', database };
};

const convertToHibernate = (sql, database) => {
  let ormQuery = '';

  if (sql.match(/SELECT/i)) {
    ormQuery = 'session.createQuery("' + sql.replace(/"/g, '\\"') + '", Entity.class)';

    if (sql.match(/WHERE/i)) {
      ormQuery += '.setParameter("param", value)';
    }

    ormQuery += '.getResultList()';
  }

  return { query: ormQuery, framework: 'hibernate', database };
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const extractLimit = (sql) => {
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    return limitMatch[1];
  }

  const topMatch = sql.match(/TOP\s+(\d+)/i);
  if (topMatch) {
    return topMatch[1];
  }

  return '10';
};

const explainQuery = async (query, queryType, options = {}) => {
  const explanation = {
    query,
    type: queryType,
    steps: [],
    warnings: [],
    recommendations: []
  };

  const normalizedType = queryType.toLowerCase().replace(/[- ]/g, '');

  switch (normalizedType) {
    case 'sql':
      return explainSqlQuery(query, explanation);
    case 'sqlalchemy':
      return explainSqlAlchemyQuery(query, explanation);
    case 'django':
      return explainDjangoQuery(query, explanation);
    case 'entityframework':
    case 'entity-framework':
      return explainEntityFrameworkQuery(query, explanation);
    case 'typeorm':
      return explainTypeOrmQuery(query, explanation);
    case 'sequelize':
      return explainSequelizeQuery(query, explanation);
    case 'prisma':
      return explainPrismaQuery(query, explanation);
    case 'hibernate':
      return explainHibernateQuery(query, explanation);
    default:
      explanation.error = `Unknown query type: ${queryType}`;
      return explanation;
  }
};

const explainSqlQuery = (query, explanation) => {
  explanation.steps = [
    'Parse the SQL query structure',
    'Identify tables and columns',
    'Analyze join conditions',
    'Evaluate WHERE clause efficiency',
    'Review index usage potential'
  ];

  if (query.match(/SELECT\s+\*/i)) {
    explanation.warnings.push('Using SELECT * may retrieve unnecessary columns');
    explanation.recommendations.push('Specify columns explicitly to reduce data transfer');
  }

  if (query.match(/LEFT\s+JOIN/i) || query.match(/RIGHT\s+JOIN/i)) {
    explanation.warnings.push('Outer joins can be expensive on large datasets');
    explanation.recommendations.push('Consider if INNER JOIN would work');
  }

  if (query.match(/LIKE\s+['"]%/i)) {
    explanation.warnings.push('Leading wildcard in LIKE prevents index usage');
    explanation.recommendations.push('Consider full-text search for pattern matching');
  }

  if (query.match(/OR\s+/i) && !query.match(/\(/i)) {
    explanation.warnings.push('Multiple OR conditions may not use indexes efficiently');
    explanation.recommendations.push('Consider UNION ALL for better index usage');
  }

  return explanation;
};

const explainSqlAlchemyQuery = (query, explanation) => {
  explanation.steps = [
    'Parse SQLAlchemy query builder chain',
    'Identify Query object and columns',
    'Analyze filter/where conditions',
    'Review eager loading options',
    'Check for potential N+1 queries'
  ];

  if (query.match(/N\+1|n\+1|for\s+\w+\s+in/i)) {
    explanation.warnings.push('Potential N+1 query pattern detected');
    explanation.recommendations.push('Use .select_related() or .prefetch_related() for eager loading');
  }

  if (query.match(/\.all\(\)/) && !query.match(/\.limit/)) {
    explanation.warnings.push('Query may load large datasets into memory');
    explanation.recommendations.push('Consider using .yield_per() for streaming large results');
  }

  return explanation;
};

const explainDjangoQuery = (query, explanation) => {
  explanation.steps = [
    'Parse Django ORM query',
    'Identify QuerySet operations',
    'Analyze filter conditions',
    'Review prefetch/select_related usage',
    'Check database hits for N+1 patterns'
  ];

  if (!query.match(/select_related|prefetch_related/i)) {
    explanation.warnings.push('Foreign key or many-to-many lookups may cause N+1 queries');
    explanation.recommendations.push('Use select_related() for ForeignKey, prefetch_related() for ManyToMany');
  }

  if (query.match(/\[\d+\]/)) {
    explanation.warnings.push('Direct index access evaluates the entire queryset');
    explanation.recommendations.push('Use .first() or .nth() for single item retrieval');
  }

  return explanation;
};

const explainEntityFrameworkQuery = (query, explanation) => {
  explanation.steps = [
    'Parse LINQ query or method chain',
    'Identify IQueryable operations',
    'Analyze Where, Select, OrderBy calls',
    'Review Include statements',
    'Check for delayed execution issues'
  ];

  if (query.match(/\.ToList\(\)/) || query.match(/\.Count\(\)/)) {
    explanation.steps.push('Query execution triggered at this point');
  }

  return explanation;
};

const explainTypeOrmQuery = (query, explanation) => {
  explanation.steps = [
    'Parse TypeORM query builder or repository call',
    'Analyze where, orderBy, relations options',
    'Review join strategies (innerJoin vs leftJoin)',
    'Check pagination usage'
  ];

  return explanation;
};

const explainSequelizeQuery = (query, explanation) => {
  explanation.steps = [
    'Parse Sequelize model query',
    'Analyze where clause structure',
    'Review include/join definitions',
    'Check pagination options'
  ];

  return explanation;
};

const explainPrismaQuery = (query, explanation) => {
  explanation.steps = [
    'Parse Prisma client query',
    'Analyze where, select, orderBy clauses',
    'Review include for relations',
    'Check cursor-based pagination'
  ];

  if (query.match(/include:\s*\{/)) {
    explanation.warnings.push('Including relations may cause large data transfers');
    explanation.recommendations.push('Use selective inclusion with specific nested fields');
  }

  return explanation;
};

const explainHibernateQuery = (query, explanation) => {
  explanation.steps = [
    'Parse HQL or Criteria API query',
    'Identify entity and property names',
    'Analyze WHERE clause parameters',
    'Review fetch strategies'
  ];

  return explanation;
};

export default {
  name: 'orm-sql-converter',
  version: '1.0.0',
  commands: {
    'orm-to-sql': async (query, framework, options = {}) => {
      const args = query.split(' ').filter(arg => arg.trim());
      const targetFramework = args[0] || '';
      const ormCode = args.slice(1).join(' ') || query;

      if (!targetFramework) {
        return 'Please provide an ORM framework. Example: /orm-to-sql sqlalchemy [query]';
      }

      const result = await ormToSql(ormCode, targetFramework, options);
      return `**ORM to SQL Conversion**\n\nFramework: ${targetFramework}\nDatabase: ${options.database || 'postgresql'}\n\n\`\`\`sql\n${result.sql}\n\`\`\``;
    },
    'sql-to-orm': async (query, framework, database) => {
      const args = query.split(' ').filter(arg => arg.trim());
      let targetFramework = args[0] || '';
      let targetDatabase = args[1] || 'postgresql';
      const sqlCode = args.slice(2).join(' ') || query;

      if (!targetFramework) {
        return 'Please provide a target framework. Example: /sql-to-orm sqlalchemy postgresql [sql]';
      }

      const result = await sqlToOrm(sqlCode, targetFramework, targetDatabase);
      return `**SQL to ORM Conversion**\n\nSQL: ${sqlCode.substring(0, 100)}...\n\nFramework: ${targetFramework}\nDatabase: ${targetDatabase}\n\n\`\`\`${getLanguageForFramework(targetFramework)}\n${result.query}\n\`\`\``;
    },
    'explain-query': async (query, queryType) => {
      const args = query.split(' ').filter(arg => arg.trim());
      const type = args[0] || 'sql';
      const queryCode = args.slice(1).join(' ') || query;

      if (!queryType) {
        return 'Please provide a query type. Example: /explain-query sql [query]';
      }

      const result = await explainQuery(queryCode, type);
      let output = `**Query Explanation**\n\nType: ${type}\n\n`;

      if (result.steps && result.steps.length > 0) {
        output += '**Execution Steps:**\n' + result.steps.map(s => `- ${s}`).join('\n') + '\n\n';
      }

      if (result.warnings && result.warnings.length > 0) {
        output += '**Warnings:**\n' + result.warnings.map(w => `- ${w}`).join('\n') + '\n\n';
      }

      if (result.recommendations && result.recommendations.length > 0) {
        output += '**Recommendations:**\n' + result.recommendations.map(r => `- ${r}`).join('\n');
      }

      return output;
    }
  }
};

const getLanguageForFramework = (framework) => {
  const normalized = framework.toLowerCase().replace(/[- ]/g, '');

  const languageMap = {
    sqlalchemy: 'python',
    django: 'python',
    entityframework: 'csharp',
    typeorm: 'typescript',
    sequelize: 'javascript',
    prisma: 'typescript',
    hibernate: 'java'
  };

  return languageMap[normalized] || 'text';
};