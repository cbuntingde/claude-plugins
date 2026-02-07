#!/usr/bin/env node
/**
 * Migration Generator Plugin
 * Main entry point for Claude Code plugin
 */

const path = require('path');
const fs = require('fs');

/**
 * Plugin metadata
 */
const pluginInfo = {
  name: 'migration-generator',
  version: '1.0.0',
  description: 'Generate database migrations from schema descriptions across multiple frameworks'
};

/**
 * Framework templates for migration generation
 */
const frameworks = {
  django: {
    name: 'Django',
    language: 'Python',
    extension: '.py',
    template: (name, fields) => {
      const className = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const fieldsCode = fields.map(f => {
        if (f.primaryKey) return `('id', models.BigAutoField(auto_created=True, primary_key=True))`;
        if (f.autoNow) return `('${f.name}', models.DateTimeField(auto_now=True))`;
        if (f.autoNowAdd) return `('${f.name}', models.DateTimeField(auto_now_add=True))`;
        if (f.fieldType === 'text' && f.maxLength) return `('${f.name}', models.TextField())`;
        if (f.fieldType === 'string') {
          if (f.unique) return `('${f.name}', models.CharField(max_length=${f.maxLength||150}, unique=True))`;
          return `('${f.name}', models.CharField(max_length=${f.maxLength||150}))`;
        }
        if (f.fieldType === 'email') return `('${f.name}', models.EmailField(max_length=254))`;
        if (f.fieldType === 'integer') return `('${f.name}', models.IntegerField())`;
        if (f.fieldType === 'boolean') return `('${f.name}', models.BooleanField(default=False))`;
        if (f.fieldType === 'datetime') return `('${f.name}', models.DateTimeField())`;
        if (f.fieldType === 'decimal') return `('${f.name}', models.DecimalField(max_digits=${f.maxDigits||10}, decimal_places=${f.decimalPlaces||2}))`;
        if (f.foreignKey) return `('${f.name}', models.ForeignKey('${f.foreignKey}', on_delete=models.CASCADE${f.null ? ', null=True' : ''}))`;
        if (f.oneToOne) return `('${f.name}', models.OneToOneField('${f.foreignKey}', on_delete=models.CASCADE${f.null ? ', null=True' : ''}))`;
        if (f.json) return `('${f.name}', models.JSONField(default=dict))`;
        return `('${f.name}', models.CharField(max_length=150))`;
      }).join(',\n        ');

      return `# ${name} migrations
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='${className}',
            fields=[
        ${fieldsCode}
            ],
        ),
    ]`;
    }
  },
  rails: {
    name: 'Rails',
    language: 'Ruby',
    extension: '.rb',
    template: (name, fields) => {
      const tableName = name.toLowerCase();
      const className = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const timestamp = Date.now().toString().slice(0, 14);

      let columns = fields.filter(f => !f.autoField).map(f => {
        let col = `t.${f.fieldType || 'string'} :${f.name}`;
        if (f.null === false || f.required) col += ', null: false';
        if (f.default !== undefined) col += `, default: ${typeof f.default === 'string' ? `'${f.default}'` : f.default}`;
        if (f.limit) col += `, limit: ${f.limit}`;
        return col;
      }).join('\n      ');

      let foreignKeys = fields.filter(f => f.foreignKey).map(f => {
        return `add_reference :${tableName}, :${f.foreignKey.toLowerCase()}, foreign_key: { to_table: :${f.foreignKey.toLowerCase() + 's'}${f.null ? ', null: true' : ''} }`;
      }).join('\n      ');

      let indexes = fields.filter(f => f.index || f.unique).map(f => {
        if (f.unique) return `add_index :${tableName}, :${f.name}, unique: true`;
        return `add_index :${tableName}, :${f.name}`;
      }).join('\n      ');

      return `# db/migrate/${timestamp}_${name}.rb
class Create${className} < ActiveRecord::Migration[7.1]
  def change
    create_table :${tableName} do t|
      ${columns}
      t.timestamps
    end
    ${foreignKeys}
    ${indexes}
  end
end`;
    }
  },
  prisma: {
    name: 'Prisma',
    language: 'TypeScript',
    extension: '.prisma',
    template: (name, fields) => {
      const className = name.charAt(0).toUpperCase() + name.slice(1);
      const idField = fields.find(f => f.primaryKey);
      const fieldsCode = fields.map(f => {
        if (f.primaryKey) {
          if (f.autoIncrement) return `  id        Int     @id @default(autoincrement())`;
          return `  id        Int     @id`;
        }
        if (f.oneToOne && f.foreignKey) return `  ${f.name}    Int     @unique`;
        if (f.foreignKey) return `  ${f.name}    Int`;
        if (f.fieldType === 'string') {
          let line = `  ${f.name} String?`;
          if (f.unique) line = `  ${f.name} String  @unique`;
          if (f.default) line += ` @default(${f.default})`;
          return line;
        }
        if (f.fieldType === 'text') return `  ${f.name} String?`;
        if (f.fieldType === 'integer') return `  ${f.name} Int`;
        if (f.fieldType === 'boolean') return `  ${f.name} Boolean @default(false)`;
        if (f.fieldType === 'datetime') return `  ${f.name} DateTime @default(now())`;
        if (f.fieldType === 'json') return `  ${f.name} Json?`;
        return `  ${f.name} String`;
      }).join('\n');

      let relations = fields.filter(f => f.foreignKey && !f.oneToOne).map(f => {
        const relatedName = f.relationName || f.foreignKey.toLowerCase() + 's';
        return `  ${f.relatedName || f.foreignKey.toLowerCase() + 's'}    ${f.relatedClass || f.foreignKey.charAt(0).toUpperCase() + f.foreignKey.slice(1)}[]`;
      }).join('\n');

      return `// Prisma schema - ${name}
model ${className} {
${fieldsCode}
${relations}
}`;
    }
  },
  sqlalchemy: {
    name: 'SQLAlchemy',
    language: 'Python',
    extension: '.py',
    template: (name, fields) => {
      const timestamp = Date.now().toString().slice(0, 14);
      let columns = fields.map(f => {
        let col = `sa.Column('${f.name}',`;
        if (f.primaryKey) col += ' sa.Integer(), nullable=False)';
        else if (f.autoField) col += ' sa.BigInteger(), nullable=False)';
        else if (f.fieldType === 'string') col += ` sa.String(${f.maxLength||255})${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'text') col += ` sa.Text()${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'integer') col += ` sa.Integer()${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'bigint') col += ` sa.BigInteger()${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'boolean') col += ` sa.Boolean()${f.default !== undefined ? `, default=${f.default}` : ''}${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'datetime') col += ` sa.DateTime()${f.default ? `, default=${f.default}` : ''})`;
        else if (f.fieldType === 'decimal') col += ` sa.Numeric(precision=${f.maxDigits||10}, scale=${f.decimalPlaces||2})${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'json') col += ` sa.JSON()${f.null ? ', nullable=True' : ''})`;
        else col += ` sa.String(255)${f.null ? '' : ', nullable=False'})`;
        return col;
      }).join(',\n    ');

      let pk = fields.filter(f => f.primaryKey);
      let pks = pk.length > 0 ? pk.map(f => `'${f.name}'`).join(', ') : "'id'";

      let indexes = fields.filter(f => f.index).map(f => {
        if (f.unique) return `op.create_index(op.f('ix_${name}_${f.name}'), '${name}', ['${f.name}'], unique=True)`;
        return `op.create_index(op.f('ix_${name}_${f.name}'), '${name}', ['${f.name}'])`;
      }).join('\n    ');

      return `# alembic/versions/${timestamp}_${name}.py
from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        '${name}',
    ${columns.replace(/^/gm, '    ')},
        sa.PrimaryKeyConstraint(${pks})
    )
    ${indexes}


def downgrade():
    ${indexes ? indexes.replace(/create_index/g, 'drop_index') : 'pass'}
    op.drop_table('${name}')`;
    }
  },
  typeorm: {
    name: 'TypeORM',
    language: 'TypeScript',
    extension: '.ts',
    template: (name, fields) => {
      const className = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const timestamp = Date.now().toString();

      let columns = fields.map(f => {
        if (f.primaryKey) return `  @PrimaryGeneratedColumn()\n  id!: number;`;
        if (f.autoField) return `  @PrimaryGeneratedColumn('uuid')\n  id!: string;`;
        if (f.fieldType === 'string') {
          let line = `  @Column({`;
          if (f.unique) line += ' unique: true';
          if (f.maxLength) line += `, length: ${f.maxLength}`;
          if (f.null) line += ', nullable: true';
          line += ' })\n  ' + f.name + ': string;';
          return line;
        }
        if (f.fieldType === 'text') return `  @Column('text'${f.null ? ', { nullable: true }' : ''})\n  ${f.name}!: string;`;
        if (f.fieldType === 'integer') return `  @Column('integer'${f.null ? ', { nullable: true }' : ''})\n  ${f.name}!: number;`;
        if (f.fieldType === 'boolean') return `  @Column('boolean', { default: false })\n  ${f.name}!: boolean;`;
        if (f.fieldType === 'datetime') return `  @CreateDateColumn()\n  ${f.name}!: Date;`;
        if (f.fieldType === 'decimal') return `  @Column('decimal', { precision: ${f.maxDigits||10}, scale: ${f.decimalPlaces||2}${f.null ? ', nullable: true' : ''} })\n  ${f.name}!: number;`;
        if (f.fieldType === 'json') return `  @Column('json', { nullable: true })\n  ${f.name}!: Record<string, unknown>;`;
        if (f.foreignKey) return `  @ManyToOne(() => ${f.relatedClass || f.foreignKey.charAt(0).toUpperCase() + f.foreignKey.slice(1)}${f.null ? ', { nullable: true }' : ''})\n  @JoinColumn({ name: '${f.name}_id' })\n  ${f.name}!: ${f.relatedClass || f.foreignKey.charAt(0).toUpperCase() + f.foreignKey.slice(1)};`;
        return `  @Column()\n  ${f.name}!: string;`;
      }).join('\n\n');

      let relations = fields.filter(f => f.foreignKey && f.relationType === 'one-to-many').map(f => {
        const relatedName = f.relatedName || f.name + 's';
        return `\n\n  @OneToMany(() => ${f.relatedClass || f.foreignKey.charAt(0).toUpperCase() + f.foreignKey.slice(1)}, ${f.relatedInverse || f.relatedClass?.toLowerCase() + 's' || f.foreignKey.toLowerCase() + 's'})\n  ${relatedName}!: ${f.relatedClass || f.foreignKey.charAt(0).toUpperCase() + f.foreignKey.slice(1)}[];`;
      }).join('');

      return `// src/migrations/${timestamp}-${name}.ts
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ${className}${timestamp} implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "${name}",
                columns: [
                    ${fields.map(f => {
    if (f.primaryKey) return '{ name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" }';
    if (f.autoField) return '{ name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" }';
    if (f.fieldType === 'string') return `{ name: "${f.name}", type: "varchar", length: "${f.maxLength||'255'}"${f.unique ? ', isUnique: true' : ''}${f.null ? ', isNullable: true' : ''} }`;
    if (f.fieldType === 'text') return `{ name: "${f.name}", type: "text"${f.null ? ', isNullable: true' : ''} }`;
    if (f.fieldType === 'integer') return `{ name: "${f.name}", type: "integer"${f.null ? ', isNullable: true' : ''} }`;
    if (f.fieldType === 'boolean') return `{ name: "${f.name}", type: "boolean", default: false }`;
    if (f.fieldType === 'datetime') return `{ name: "${f.name}", type: "timestamp", default: "now()" }`;
    return `{ name: "${f.name}", type: "varchar" }`;
    }).join(',\n                    ')}
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("${name}");
    }

}`;
    }
  },
  knex: {
    name: 'Knex',
    language: 'JavaScript',
    extension: '.js',
    template: (name, fields) => {
      const timestamp = Date.now().toString().slice(0, 14);

      let columns = fields.map(f => {
        if (f.primaryKey) return `      table.increments('id').primary();`;
        let col = `      table.${f.fieldType || 'string'}('${f.name}')`;
        if (f.null === false || f.required) col += '.notNullable()';
        if (f.default !== undefined) col += `.defaultTo(${typeof f.default === 'string' ? `'${f.default}'` : f.default})`;
        if (f.unique) col += '.unique()';
        if (f.index) col += '.index()';
        return col;
      }).join('\n');

      let foreignKeys = fields.filter(f => f.foreignKey).map(f => {
        return `      table.foreign('${f.name}').references('${f.relatedColumn || 'id'}').inTable('${f.relatedTable || f.foreignKey.toLowerCase() + 's'}').onDelete('CASCADE');`;
      }).join('\n');

      return `// migrations/${timestamp}_${name}.js
exports.up = function(knex) {
  return knex.schema.createTable('${name}', function(table) {
${columns}
${foreignKeys}
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('${name}');
};`;
    }
  },
  'ef-core': {
    name: 'EF Core',
    language: 'C#',
    extension: '.cs',
    template: (name, fields) => {
      const className = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const timestamp = Date.now().toString().slice(0, 14);

      let properties = fields.map(f => {
        if (f.primaryKey) return `    [Key]\n    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]\n    public int Id { get; set; }`;
        if (f.fieldType === 'string') {
          let line = `    [MaxLength(${f.maxLength||256})]\n`;
          if (f.unique) line += `    [Index(IsUnique = true)]\n`;
          line += `    public string ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; } = string.Empty;`;
          return line;
        }
        if (f.fieldType === 'text') return `    [Column(TypeName = "TEXT")]\n    public string ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; } = string.Empty;`;
        if (f.fieldType === 'integer') return `    public int ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; }`;
        if (f.fieldType === 'boolean') return `    public bool ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; }`;
        if (f.fieldType === 'datetime') return `    public DateTime ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; }`;
        if (f.fieldType === 'decimal') return `    [Column(TypeName = "decimal(10,2)")]\n    public decimal ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; }`;
        if (f.fieldType === 'json') return `    [Column(TypeName = "json")]\n    public string? ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; }`;
        if (f.foreignKey) {
          const propName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
          const navName = (f.relatedClass || f.foreignKey.charAt(0).toUpperCase() + f.foreignKey.slice(1));
          return `    [ForeignKey("${f.relatedClass || f.foreignKey}")]\n    public int? ${propName}Id { get; set; }\n    public ${navName}? ${navName} { get; set; }`;
        }
        return `    public string ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} { get; set; }`;
      }).join('\n\n');

      return `// Data/Migrations/${timestamp}_Create${className}.cs
using Microsoft.EntityFrameworkCore.Migrations;

public partial class Create${className} : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "${name}",
            columns: table => new
            {
${fields.map(f => {
  if (f.primaryKey) return `                Id = table.Column<int>(type: "INTEGER", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")`;
  if (f.fieldType === 'string') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<string>(type: "TEXT", maxLength: ${f.maxLength||256}${f.default ? `, defaultValue: "${f.default}"` : ''})`;
  if (f.fieldType === 'text') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<string>(type: "TEXT", nullable: true)`;
  if (f.fieldType === 'integer') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<int>(type: "INTEGER", nullable: ${f.null || 'false'})`;
  if (f.fieldType === 'boolean') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<bool>(type: "BOOLEAN", nullable: false, defaultValue: false)`;
  if (f.fieldType === 'datetime') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValue: DateTime.UtcNow)`;
  return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<string>(type: "TEXT", nullable: true)`;
}).join(',\n')}
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_${name}", x => x.Id);
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "${name}");
    }
}`;
    }
  }
};

/**
 * Parse natural language description into structured fields
 */
function parseDescription(description) {
  const fields = [];

  // Common field patterns
  const patterns = [
    { regex: /(\w+)\s+as\s+(\w+Field|CharField|TextField|String|Varchar)/i, type: 'string', mapType: 'string' },
    { regex: /(\w+)\s+(\w+)(?:\s+unique|\s+not\s+null|\s+required)?/i, type: 'field', mapType: 'string' },
    { regex: /(\w+)\s+(integer|int)/i, type: 'integer', mapType: 'integer' },
    { regex: /(\w+)\s+(boolean|bool)/i, type: 'boolean', mapType: 'boolean' },
    { regex: /(\w+)\s+(datetime|timestamp)/i, type: 'datetime', mapType: 'datetime' },
    { regex: /(\w+)\s+(\w+)\s+(primary\s+key|foreign\s+key|references?\s+(\w+))/i, type: 'relation' },
    { regex: /(\w+)\s+(text)/i, type: 'text', mapType: 'text' },
    { regex: /(\w+)\s+(decimal|price|amount)/i, type: 'decimal', mapType: 'decimal' },
    { regex: /(\w+)\s+(json)/i, type: 'json', mapType: 'json' },
    { regex: /(belongs\s+to|references?|foreign\s+key)\s+(\w+)/i, type: 'foreignKey' },
    { regex: /(has\s+one|one-to-one)\s+(\w+)/i, type: 'oneToOne' },
    { regex: /(has\s+many|many-to-many|one-to-many)\s+(\w+)/i, type: 'relation' },
  ];

  // Split by table definitions
  const tables = description.split(/(?:create|add)\s+(?:a\s+)?(?:new\s+)?(?:model|table|entity)\s+(?:named\s+)?(\w+)/i);

  if (tables.length > 1) {
    // Multiple tables
    let currentTable = null;
    for (let i = 1; i < tables.length; i += 2) {
      currentTable = tables[i];
      fields.push({ table: currentTable, name: 'tableName', value: currentTable });
    }
  }

  // Extract field names and types
  const words = description.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,;]/g, '');
    const nextWord = words[i + 1]?.replace(/[.,;]/g, '');
    const nextNextWord = words[i + 2]?.replace(/[.,;]/g, '');

    // Detect foreign key
    if (['references', 'foreign', 'belongs', 'related'].includes(word.toLowerCase()) && nextWord) {
      fields.push({ name: nextWord.toLowerCase() + '_id', type: 'foreignKey', foreignKey: nextWord });
    }

    // Detect primary key
    if (word.toLowerCase() === 'primary' && nextWord?.toLowerCase() === 'key') {
      fields.forEach(f => { if (f.name === 'id') f.primaryKey = true; });
    }

    // Detect unique
    if (word.toLowerCase() === 'unique' && nextWord) {
      const field = fields.find(f => f.name === nextWord.toLowerCase());
      if (field) field.unique = true;
    }

    // Detect not null / required
    if ((word.toLowerCase() === 'not' && nextWord?.toLowerCase() === 'null') ||
        word.toLowerCase() === 'required' || word.toLowerCase() === 'mandatory') {
      const field = fields[fields.length - 1];
      if (field) { field.null = false; field.required = true; }
    }

    // Detect max length
    if ((word.toLowerCase() === 'max_length' || word.toLowerCase() === 'maxlength') && nextWord) {
      const field = fields[fields.length - 1];
      if (field) field.maxLength = parseInt(nextWord);
    }

    // Skip basic words
    if (['a', 'an', 'the', 'with', 'and', 'or', 'to', 'in', 'for', 'of', 'on'].includes(word.toLowerCase())) continue;
    if (['model', 'table', 'entity', 'field', 'column'].includes(word.toLowerCase())) continue;

    // Add field from description
    const name = word.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (name && !['id', 'is', 'has', 'are', 'null', 'default'].includes(name) && !patterns.some(p => p.regex.test(word))) {
      fields.push({ name, type: 'string', fieldType: 'string' });
    }
  }

  return fields;
}

/**
 * Detect framework from description or context
 */
function detectFramework(description, args = {}) {
  const desc = description.toLowerCase();

  if (args.framework) {
    const fw = args.framework.toLowerCase();
    if (['django', 'python'].includes(fw)) return 'django';
    if (['rails', 'ruby'].includes(fw)) return 'rails';
    if (['prisma', 'node', 'typescript'].includes(fw)) return 'prisma';
    if (['sqlalchemy', 'flask', 'fastapi'].includes(fw)) return 'sqlalchemy';
    if (['typeorm'].includes(fw)) return 'typeorm';
    if (['knex', 'javascript', 'js'].includes(fw)) return 'knex';
    if (['ef', 'efcore', 'ef-core', 'c#', 'csharp', 'dotnet'].includes(fw)) return 'ef-core';
  }

  if (desc.includes('django') || desc.includes('python')) return 'django';
  if (desc.includes('rails') || desc.includes('ruby')) return 'rails';
  if (desc.includes('prisma') || desc.includes('nextjs') || desc.includes('node')) return 'prisma';
  if (desc.includes('sqlalchemy') || desc.includes('flask') || desc.includes('fastapi')) return 'sqlalchemy';
  if (desc.includes('typeorm')) return 'typeorm';
  if (desc.includes('knex') || desc.includes('nodejs')) return 'knex';
  if (desc.includes('ef core') || desc.includes('entity framework') || desc.includes('c#')) return 'ef-core';

  return 'django'; // Default
}

/**
 * Generate migration command handler
 */
function generateMigration(params = {}) {
  const framework = detectFramework(params.description || '', params);
  const description = params.description || '';
  const tableName = params.tableName || description.split(/[ ,]+/)[0].toLowerCase();
  const output = params.output || null;

  const fw = frameworks[framework];
  if (!fw) {
    return {
      success: false,
      error: `Unsupported framework: ${framework}`,
      supportedFrameworks: Object.keys(frameworks)
    };
  }

  const fields = parseDescription(description);

  // Generate migration code
  const migrationCode = fw.template(tableName, fields);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Migration Generator - ${fw.name}`);
  console.log(`${'='.repeat(50)}\n`);

  console.log(`Framework: ${fw.name} (${fw.language})`);
  console.log(`Table: ${tableName}`);
  console.log(`Fields detected: ${fields.length}\n`);

  console.log(`${'='.repeat(50)}`);
  console.log('Generated Migration:');
  console.log(`${'='.repeat(50)}\n`);

  console.log(migrationCode);

  return {
    success: true,
    framework,
    tableName,
    language: fw.language,
    extension: fw.extension,
    fields: fields.length,
    migrationCode
  };
}

module.exports = {
  // Plugin metadata
  ...pluginInfo,

  // Command handlers
  generateMigration,

  // Utilities
  frameworks,
  parseDescription,
  detectFramework
};