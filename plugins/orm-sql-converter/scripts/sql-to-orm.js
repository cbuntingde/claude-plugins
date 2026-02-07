#!/usr/bin/env node

/**
 * SQL to ORM Converter Script
 *
 * Usage: node scripts/sql-to-orm.js <framework> <database> <sql>
 *
 * Examples:
 *   node scripts/sql-to-orm.js sqlalchemy postgresql "SELECT * FROM users WHERE age > 18"
 *   node scripts/sql-to-orm.js django mysql "SELECT * FROM products WHERE price > 100"
 */

const ormFrameworks = ['sqlalchemy', 'django', 'entity-framework', 'typeorm', 'sequelize', 'prisma', 'hibernate'];
const databases = ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'oracle'];

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: node scripts/sql-to-orm.js <framework> <database> <sql>');
    console.error('\nSupported frameworks:');
    ormFrameworks.forEach(f => console.error(`  - ${f}`));
    console.error('\nSupported databases:');
    databases.forEach(d => console.error(`  - ${d}`));
    process.exit(1);
  }

  return {
    framework: args[0],
    database: args[1],
    sql: args.slice(2).join(' ')
  };
}

function validateFramework(framework) {
  const normalized = framework.toLowerCase().replace(/[- ]/g, '');
  const isValid = ormFrameworks.some(f => f.toLowerCase().replace(/[- ]/g, '') === normalized);

  if (!isValid) {
    console.error(`Error: Unknown framework "${framework}"`);
    console.error('Supported frameworks:', ormFrameworks.join(', '));
    process.exit(1);
  }

  return framework;
}

function validateDatabase(database) {
  const normalized = database.toLowerCase().replace(/[- ]/g, '');
  const isValid = databases.some(d => d.toLowerCase().replace(/[- ]/g, '') === normalized);

  if (!isValid) {
    console.error(`Error: Unknown database "${database}"`);
    console.error('Supported databases:', databases.join(', '));
    process.exit(1);
  }

  return database;
}

function extractTableName(sql) {
  const fromMatch = sql.match(/FROM\s+(\w+)/i);
  if (fromMatch) return fromMatch[1];
  return 'TableName';
}

function extractColumns(sql) {
  if (sql.match(/SELECT\s+\*/i)) return '*';

  const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
  if (selectMatch) {
    return selectMatch[1].split(',').map(c => c.trim().split(' ').pop()).join(', ');
  }
  return 'column';
}

function extractWhereClause(sql) {
  if (!sql.match(/WHERE/i)) return '';

  const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|LEFT|RIGHT|INNER|OUTER|;|$)/i);
  if (whereMatch) return whereMatch[1].trim();

  const whereIndex = sql.indexOf('WHERE');
  const rest = sql.substring(whereIndex + 5);
  const semicolonIndex = rest.indexOf(';');
  if (semicolonIndex > 0) return rest.substring(0, semicolonIndex).trim();
  return rest.trim();
}

function extractOrderBy(sql) {
  const match = sql.match(/ORDER\s+BY\s+(.+?)(?:LIMIT|GROUP|;|$)/i);
  if (match) {
    const order = match[1].trim();
    if (order.match(/DESC/i)) {
      return '-' + order.replace(/DESC/i, '').trim().replace(/ /g, '_');
    }
    return order.replace(/ /g, '_');
  }
  return '';
}

function extractLimit(sql) {
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) return parseInt(limitMatch[1], 10);

  const topMatch = sql.match(/TOP\s+(\d+)/i);
  if (topMatch) return parseInt(topMatch[1], 10);

  return null;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function convertToSqlAlchemy(sql, database) {
  const tableName = extractTableName(sql);
  const tableVar = toCamelCase(tableName);
  let orm = `session.query(${capitalize(tableVar)})`;

  if (sql.match(/WHERE/i)) {
    orm += `\n    .filter(${capitalize(tableVar)}.column == value)`;
  }

  if (sql.match(/ORDER\s+BY/i)) {
    const orderBy = extractOrderBy(sql);
    if (orderBy) {
      orm += `\n    .order_by(${capitalize(tableVar)}.${orderBy.replace(/-/g, '')})`;
    }
  }

  if (sql.match(/GROUP\s+BY/i)) {
    orm += `\n    .group_by(${capitalize(tableVar)}.column)`;
  }

  if (sql.match(/JOIN/i)) {
    orm += `\n    .join(JoinTable)`;
  }

  orm += '\n    .all()';

  return orm;
}

function convertToDjango(sql, database) {
  const tableName = extractTableName(sql);
  const modelName = capitalize(tableName);
  let orm = `${modelName}.objects`;

  if (sql.match(/WHERE/i)) {
    orm += '\n    .filter(column=value)';
  }

  if (sql.match(/ORDER\s+BY/i)) {
    const orderBy = extractOrderBy(sql);
    if (orderBy) {
      orm += `\n    .order_by('${orderBy}')`;
    }
  }

  if (sql.match(/LIMIT/i)) {
    const limit = extractLimit(sql);
    if (limit) {
      orm += `[${limit}]`;
    }
  }

  return orm;
}

function convertToEntityFramework(sql, database) {
  const tableName = extractTableName(sql);
  let orm = `await context.${capitalize(tableName)}s`;

  if (sql.match(/WHERE/i)) {
    orm += '\n    .Where(u => u.Column == value)';
  }

  if (sql.match(/ORDER\s+BY/i)) {
    orm += '\n    .OrderBy(u => u.Column)';
  }

  if (sql.match(/SELECT\s+.+\s+FROM/i && sql.match(/TOP\s+\d+/i))) {
    const limit = extractLimit(sql);
    if (limit) {
      orm = orm.replace('context', `context.${capitalize(tableName)}s.Take(${limit})`);
    }
  }

  orm += '\n    .ToListAsync()';

  return orm;
}

function convertToTypeORM(sql, database) {
  const tableName = extractTableName(sql);
  let orm = `await repository.createQueryBuilder("${tableName.charAt(0)}")`;

  if (sql.match(/WHERE/i)) {
    orm += '\n    .where("${tableName}.column = :value", { value })';
  }

  if (sql.match(/ORDER\s+BY/i)) {
    orm += '\n    .orderBy("${tableName}.column", "ASC")';
  }

  if (sql.match(/GROUP\s+BY/i)) {
    orm += '\n    .groupBy("${tableName}.column")';
  }

  if (sql.match(/JOIN/i)) {
    orm += '\n    .innerJoin("${tableName}.relation", "relation")';
  }

  if (sql.match(/LIMIT/i)) {
    const limit = extractLimit(sql);
    if (limit) {
      orm += `\n    .take(${limit})`;
    }
  }

  orm += '\n    .getMany()';

  return orm;
}

function convertToSequelize(sql, database) {
  const tableName = extractTableName(sql);
  let orm = `await ${toCamelCase(tableName)}.findAll({\n  where: {`;

  if (sql.match(/WHERE/i)) {
    orm += '\n    column: value';
  }

  orm += '\n  },';

  if (sql.match(/ORDER\s+BY/i)) {
    const orderBy = extractOrderBy(sql);
    orm += '\n  order: [["column", "ASC"]],\n  ';
  }

  if (sql.match(/LIMIT/i)) {
    const limit = extractLimit(sql);
    if (limit) {
      orm += `\n  limit: ${limit},\n  `;
    }
  }

  orm += '})';

  return orm;
}

function convertToPrisma(sql, database) {
  const tableName = extractTableName(sql);
  let orm = `await prisma.${tableName.toLowerCase()}.findMany({\n  where: {`;

  if (sql.match(/WHERE/i)) {
    orm += '\n    column: value';
  }

  orm += '\n  },';

  if (sql.match(/ORDER\s+BY/i)) {
    orm += '\n  orderBy: { column: "asc" },\n  ';
  }

  if (sql.match(/LIMIT/i)) {
    const limit = extractLimit(sql);
    if (limit) {
      orm += `\n  take: ${limit},\n  `;
    }
  }

  orm += '})';

  return orm;
}

function convertToHibernate(sql, database) {
  const escapedSql = sql.replace(/"/g, '\\"').replace(/\n/g, ' ');

  let orm = `session.createQuery("${escapedSql}", ${capitalize(extractTableName(sql))}.class)`;

  if (sql.match(/WHERE/i)) {
    orm += '\n    .setParameter("param", value)';
  }

  orm += '\n    .getResultList()';

  return orm;
}

function convertSqlToOrm(framework, database, sql) {
  const normalized = framework.toLowerCase().replace(/[- ]/g, '');

  switch (normalized) {
    case 'sqlalchemy':
      return convertToSqlAlchemy(sql, database);
    case 'django':
      return convertToDjango(sql, database);
    case 'entityframework':
      return convertToEntityFramework(sql, database);
    case 'typeorm':
      return convertToTypeORM(sql, database);
    case 'sequelize':
      return convertToSequelize(sql, database);
    case 'prisma':
      return convertToPrisma(sql, database);
    case 'hibernate':
      return convertToHibernate(sql, database);
    default:
      console.error(`Error: Framework "${framework}" conversion not implemented yet`);
      return '/* Conversion not implemented */';
  }
}

function main() {
  const args = parseArgs();
  const framework = validateFramework(args.framework);
  const database = validateDatabase(args.database);
  const sql = args.sql;

  console.log(`Converting SQL to ${framework} (${database})...`);
  console.log(`Input SQL: ${sql}\n`);

  const orm = convertSqlToOrm(framework, database, sql);

  const lang = {
    sqlalchemy: 'python',
    django: 'python',
    entityframework: 'csharp',
    typeorm: 'typescript',
    sequelize: 'javascript',
    prisma: 'typescript',
    hibernate: 'java'
  }[framework.toLowerCase().replace(/[- ]/g, '')] || 'text';

  console.log(`Output ${framework}:`);
  console.log(`\`\`\`${lang}`);
  console.log(orm);
  console.log('```');
}

main();