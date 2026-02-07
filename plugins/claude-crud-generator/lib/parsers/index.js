/**
 * Schema Parsers
 * Parse various database schema formats into a common structure
 */

/**
 * Parse SQL schema files (CREATE TABLE statements)
 */
function parseSQLSchema(content) {
  const tables = [];
  const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const tableDef = match[2];

    const columns = [];
    const lines = tableDef.split(',').map(line => line.trim());

    for (const line of lines) {
      const colMatch = line.match(/^(\w+)\s+(\w+)(\([^)]+\))?\s*(.*)$/);
      if (colMatch) {
        const [, name, type, size, constraints] = colMatch;

        columns.push({
          name,
          type: type + (size || ''),
          primaryKey: constraints?.toUpperCase().includes('PRIMARY KEY'),
          foreignKey: extractForeignKey(constraints),
          required: constraints?.toUpperCase().includes('NOT NULL'),
          unique: constraints?.toUpperCase().includes('UNIQUE'),
          autoIncrement: constraints?.toUpperCase().includes('AUTO_INCREMENT')
        });
      }
    }

    tables.push({ name: tableName, columns });
  }

  return { name: 'SQL Schema', tables };
}

/**
 * Parse Prisma schema files
 */
function parsePrismaSchema(content) {
  const tables = [];
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const modelDef = match[2];

    const columns = [];
    const lines = modelDef.split('\n').map(line => line.trim()).filter(Boolean);

    for (const line of lines) {
      const fieldMatch = line.match(/^(\w+)\s+(\w+)(\([^)]+\))?\s*(.*)$/);
      if (fieldMatch) {
        const [, name, type, size, attributes] = fieldMatch;

        columns.push({
          name,
          type: type + (size || ''),
          primaryKey: attributes?.includes('@id'),
          foreignKey: extractPrismaRelation(attributes),
          required: attributes?.includes('@default'),
          unique: attributes?.includes('@unique'),
          autoIncrement: attributes?.includes('@autoincrement')
        });
      }
    }

    tables.push({ name: modelName, columns });
  }

  return { name: 'Prisma Schema', tables };
}

/**
 * Parse Mongoose schema files
 */
function parseMongooseSchema(content) {
  const tables = [];
  const schemaRegex = /new\s+Schema\s*\(\s*\{([\s\S]*?)\}/g;
  const modelMatch = content.match(/mongoose\.model\s*\(\s*['"](\w+)['"]/);

  const modelName = modelMatch ? modelMatch[1] : 'MongooseModel';
  let match;

  while ((match = schemaRegex.exec(content)) !== null) {
    const schemaDef = match[1];

    const columns = [];
    const lines = schemaDef.split('\n').map(line => line.trim()).filter(Boolean);

    for (const line of lines) {
      const fieldMatch = line.match(/^(\w+):\s*\{\s*type:\s*(\w+)/);
      if (fieldMatch) {
        const [, name, type] = fieldMatch;

        columns.push({
          name,
          type: mapMongooseType(type),
          required: line.includes('required'),
          unique: line.includes('unique'),
          primaryKey: name === '_id'
        });
      }
    }

    tables.push({ name: modelName, columns });
  }

  return { name: 'Mongoose Schema', tables };
}

/**
 * Helper: Extract foreign key from SQL constraints
 */
function extractForeignKey(constraints) {
  if (!constraints) return null;

  const fkMatch = constraints.match(/REFERENCES\s+(\w+)\s*\(?(\w+)?\)?/i);
  if (fkMatch) {
    return fkMatch[2] ? `${fkMatch[1]}.${fkMatch[2]}` : fkMatch[1];
  }

  return null;
}

/**
 * Helper: Extract relation from Prisma attributes
 */
function extractPrismaRelation(attributes) {
  if (!attributes) return null;

  const relationMatch = attributes.match(/@relation\s*\(\s*fields:\s*\[(\w+)\]/);
  if (relationMatch) {
    return relationMatch[1];
  }

  return null;
}

/**
 * Helper: Map Mongoose types to common types
 */
function mapMongooseType(type) {
  const typeMap = {
    'String': 'VARCHAR(255)',
    'Number': 'INTEGER',
    'Boolean': 'BOOLEAN',
    'Date': 'TIMESTAMP',
    'Buffer': 'BLOB',
    'ObjectId': 'VARCHAR(24)'
  };

  return typeMap[type] || type;
}

module.exports = {
  parseSQLSchema,
  parsePrismaSchema,
  parseMongooseSchema
};
