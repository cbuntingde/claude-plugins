#!/usr/bin/env node

/**
 * ORM to SQL Converter Script
 *
 * Usage: node scripts/orm-to-sql.js <framework> <query>
 *
 * Examples:
 *   node scripts/orm-to-sql.js sqlalchemy "session.query(User).filter(User.age > 18)"
 *   node scripts/orm-to-sql.js django "User.objects.filter(age__gt=18)"
 */

const ormFrameworks = ['sqlalchemy', 'django', 'entity-framework', 'typeorm', 'sequelize', 'prisma', 'hibernate'];

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/orm-to-sql.js <framework> <query>');
    console.error('\nSupported frameworks:');
    ormFrameworks.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  }

  return {
    framework: args[0],
    query: args.slice(1).join(' ')
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

function convertSqlAlchemy(query) {
  let sql = 'SELECT ';

  if (query.includes('func.')) {
    if (query.includes('func.count') || query.includes('Count')) sql += 'COUNT(*)';
    else if (query.includes('func.sum') || query.includes('Sum')) sql += 'SUM(column)';
    else if (query.includes('func.avg') || query.includes('Avg')) sql += 'AVG(column)';
    else sql += '*';
  } else {
    sql += '*';
  }

  sql += ' FROM table_name';

  if (query.includes('.filter') || query.includes('.where')) {
    sql += ' WHERE ';
    if (query.includes('==') || query.includes('===')) sql += 'column = value';
    else if (query.includes('>')) sql += 'column > value';
    else if (query.includes('<')) sql += 'column < value';
    else if (query.includes('!=') || query.includes('!==')) sql += 'column != value';
    else sql += 'condition';
  }

  if (query.includes('.order_by') || query.includes('.orderBy')) {
    const match = query.match(/order_by\s*\(\s*['"]?(\w+)['"]?\s*\)/i) ||
                  query.match(/orderBy\s*\(\s*['"]?(\w+)['"]?\s*\)/i);
    if (match) {
      const col = match[1];
      sql += ` ORDER BY ${col} ASC`;
      if (col.startsWith('-') || col.startsWith('_')) {
        sql = sql.replace(col, col.replace(/^[-_]/, '')) + ' DESC';
      }
    }
  }

  if (query.includes('.limit')) {
    const match = query.match(/\.limit\s*\(\s*(\d+)\s*\)/i);
    if (match) sql += ` LIMIT ${match[1]}`;
  }

  sql += ';';
  return sql;
}

function convertDjango(query) {
  let sql = 'SELECT * FROM table_name';

  if (query.includes('.filter')) {
    sql += ' WHERE ';
    if (query.includes('__gt')) sql += 'column > value';
    else if (query.includes('__lt')) sql += 'column < value';
    else if (query.includes('__gte')) sql += 'column >= value';
    else if (query.includes('__lte')) sql += 'column <= value';
    else if (query.includes('__icontains')) sql += 'column ILIKE %value%';
    else sql += 'condition';
  }

  if (query.includes('.order_by') || query.includes('order_by')) {
    const match = query.match(/order_by\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (match) {
      const orderField = match[1].replace(/^-/, '').replace(/_/g, ' ');
      sql += ` ORDER BY ${orderField}`;
      if (match[1].startsWith('-')) sql += ' DESC';
      else sql += ' ASC';
    }
  }

  if (query.includes('[')) {
    const match = query.match(/\[(\d+)\]/);
    if (match) sql += ` LIMIT ${match[1]}`;
  }

  sql += ';';
  return sql;
}

function convertEntityFramework(query) {
  let sql = 'SELECT ';

  if (query.includes('.Where')) {
    sql += '* FROM TableName WHERE condition';
  } else if (query.includes('.Select')) {
    sql += 'column FROM TableName';
  } else {
    sql += '* FROM TableName';
  }

  if (query.includes('.OrderBy')) {
    sql += ' ORDER BY column';
  }

  if (query.includes('.Take')) {
    const match = query.match(/\.Take\s*\(\s*(\d+)\s*\)/);
    if (match) sql = 'SELECT TOP ' + match[1] + sql.replace(/SELECT \*/, ' FROM TableName');
  }

  sql += ';';
  return sql;
}

function convertTypeORM(query) {
  let sql = 'SELECT * FROM table_name';

  if (query.includes('.where')) {
    sql += ' WHERE column = value';
  }

  if (query.includes('.orderBy')) {
    sql += ' ORDER BY column ASC';
  }

  if (query.includes('.take')) {
    const match = query.match(/\.take\s*\(\s*(\d+)\s*\)/i);
    if (match) sql += ` LIMIT ${match[1]}`;
  }

  if (query.includes('.skip')) {
    const match = query.match(/\.skip\s*\(\s*(\d+)\s*\)/i);
    if (match) sql += ` OFFSET ${match[1]}`;
  }

  sql += ';';
  return sql;
}

function convertSequelize(query) {
  let sql = 'SELECT * FROM table_name';

  if (query.includes('where:')) {
    sql += ' WHERE column = value';
  }

  if (query.includes('order:')) {
    sql += ' ORDER BY column ASC';
  }

  if (query.includes('limit:')) {
    const match = query.match(/limit:\s*(\d+)/i);
    if (match) sql += ` LIMIT ${match[1]}`;
  }

  sql += ';';
  return sql;
}

function convertPrisma(query) {
  let sql = 'SELECT * FROM table_name';

  if (query.includes('where:')) {
    sql += ' WHERE column = value';
  }

  if (query.includes('orderBy:')) {
    sql += ' ORDER BY column ASC';
  }

  if (query.includes('take:')) {
    const match = query.match(/take:\s*(\d+)/i);
    if (match) sql += ` LIMIT ${match[1]}`;
  }

  sql += ';';
  return sql;
}

function convertHibernate(query) {
  let sql = query;

  if (query.match(/\?/)) {
    sql = sql.replace(/\?/g, 'param_value');
  }

  if (!sql.trim().endsWith(';')) {
    sql += ';';
  }

  return sql;
}

function convertOrmToSql(framework, query) {
  const normalized = framework.toLowerCase().replace(/[- ]/g, '');

  switch (normalized) {
    case 'sqlalchemy':
      return convertSqlAlchemy(query);
    case 'django':
      return convertDjango(query);
    case 'entityframework':
      return convertEntityFramework(query);
    case 'typeorm':
      return convertTypeORM(query);
    case 'sequelize':
      return convertSequelize(query);
    case 'prisma':
      return convertPrisma(query);
    case 'hibernate':
      return convertHibernate(query);
    default:
      console.error(`Error: Framework "${framework}" conversion not implemented yet`);
      return '/* Conversion not implemented */';
  }
}

function main() {
  const args = parseArgs();
  const framework = validateFramework(args.framework);
  const query = args.query;

  console.log(`Converting ${framework} query to SQL...`);
  console.log(`Input: ${query}\n`);

  const sql = convertOrmToSql(framework, query);

  console.log('Output SQL:');
  console.log(sql);
}

main();