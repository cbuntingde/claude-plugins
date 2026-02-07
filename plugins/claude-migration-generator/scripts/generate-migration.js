#!/usr/bin/env node
/**
 * Generate Migration Command Script
 * Standalone script for the /generate-migration slash command
 */

const path = require('path');
const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Framework templates
const frameworks = {
  django: {
    name: 'Django',
    language: 'Python',
    extension: '.py',
    defaultPath: 'app/migrations/',
    template: (name, fields) => {
      const className = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const fieldsCode = fields.map(f => {
        if (f.primaryKey) return `('id', models.BigAutoField(auto_created=True, primary_key=True))`;
        if (f.autoNow) return `('${f.name}', models.DateTimeField(auto_now=True))`;
        if (f.autoNowAdd) return `('${f.name}', models.DateTimeField(auto_now_add=True))`;
        if (f.fieldType === 'text') return `('${f.name}', models.TextField())`;
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
    defaultPath: 'db/migrate/',
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
    defaultPath: 'prisma/migrations/',
    template: (name, fields) => {
      const className = name.charAt(0).toUpperCase() + name.slice(1);
      const fieldsCode = fields.map(f => {
        if (f.primaryKey) return `  id        Int     @id @default(autoincrement())`;
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

      return `// Prisma schema - ${name}
model ${className} {
${fieldsCode}
}`;
    }
  },
  sqlalchemy: {
    name: 'SQLAlchemy',
    language: 'Python',
    extension: '.py',
    defaultPath: 'alembic/versions/',
    template: (name, fields) => {
      const timestamp = Date.now().toString().slice(0, 14);
      let columns = fields.map(f => {
        let col = `sa.Column('${f.name}',`;
        if (f.primaryKey) col += ' sa.Integer(), nullable=False)';
        else if (f.autoField) col += ' sa.BigInteger(), nullable=False)';
        else if (f.fieldType === 'string') col += ` sa.String(${f.maxLength||255})${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'text') col += ` sa.Text()${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'integer') col += ` sa.Integer()${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'boolean') col += ` sa.Boolean()${f.default !== undefined ? `, default=${f.default}` : ''}${f.null ? '' : ', nullable=False'})`;
        else if (f.fieldType === 'datetime') col += ` sa.DateTime()${f.default ? `, default=${f.default}` : ''})`;
        else if (f.fieldType === 'decimal') col += ` sa.Numeric(precision=${f.maxDigits||10}, scale=${f.decimalPlaces||2})${f.null ? '' : ', nullable=False'})`;
        else col += ` sa.String(255)${f.null ? '' : ', nullable=False'})`;
        return col;
      }).join(',\n    ');

      let pk = fields.filter(f => f.primaryKey);
      let pks = pk.length > 0 ? pk.map(f => `'${f.name}'`).join(', ') : "'id'";

      return `# alembic/versions/${timestamp}_${name}.py
from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        '${name}',
    ${columns.replace(/^/gm, '    ')},
        sa.PrimaryKeyConstraint(${pks})
    )


def downgrade():
    op.drop_table('${name}')`;
    }
  },
  typeorm: {
    name: 'TypeORM',
    language: 'TypeScript',
    extension: '.ts',
    defaultPath: 'src/migrations/',
    template: (name, fields) => {
      const className = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const timestamp = Date.now().toString();

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
    if (f.fieldType === 'string') return `{ name: "${f.name}", type: "varchar", length: "${f.maxLength||'255'}"${f.unique ? ', isUnique: true' : ''} }`;
    if (f.fieldType === 'text') return `{ name: "${f.name}", type: "text" }`;
    if (f.fieldType === 'integer') return `{ name: "${f.name}", type: "integer" }`;
    if (f.fieldType === 'boolean') return `{ name: "${f.name}", type: "boolean", default: false }`;
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
    defaultPath: 'migrations/',
    template: (name, fields) => {
      const timestamp = Date.now().toString().slice(0, 14);

      let columns = fields.map(f => {
        if (f.primaryKey) return `      table.increments('id').primary();`;
        let col = `      table.${f.fieldType || 'string'}('${f.name}')`;
        if (f.null === false || f.required) col += '.notNullable()';
        if (f.default !== undefined) col += `.defaultTo(${typeof f.default === 'string' ? `'${f.default}'` : f.default})`;
        if (f.unique) col += '.unique()';
        return col;
      }).join('\n');

      return `// migrations/${timestamp}_${name}.js
exports.up = function(knex) {
  return knex.schema.createTable('${name}', function(table) {
${columns}
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
    defaultPath: 'Data/Migrations/',
    template: (name, fields) => {
      const className = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const timestamp = Date.now().toString().slice(0, 14);

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
  if (f.fieldType === 'string') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<string>(type: "TEXT", maxLength: ${f.maxLength||256}${f.default ? `, defaultValue: "${f.default}"` : ''})`;
  if (f.fieldType === 'integer') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<int>(type: "INTEGER", nullable: false)`;
  if (f.fieldType === 'boolean') return `                ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} = table.Column<bool>(type: "BOOLEAN", nullable: false, defaultValue: false)`;
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
  const fields = [{ name: 'id', type: 'integer', fieldType: 'integer', primaryKey: true, autoField: true }];

  const words = description.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,;()]/g, '');
    const nextWord = words[i + 1]?.replace(/[.,;]/g, '');
    const nextNextWord = words[i + 2]?.replace(/[.,;]/g, '');

    // Detect email
    if (word.toLowerCase() === 'email') {
      fields.push({ name: 'email', type: 'string', fieldType: 'email' });
      continue;
    }

    // Detect password
    if (word.toLowerCase() === 'password') {
      fields.push({ name: 'password', type: 'string', fieldType: 'string', maxLength: 256 });
      continue;
    }

    // Detect boolean
    if (word.toLowerCase() === 'boolean' || word.toLowerCase() === 'bool' || word.toLowerCase() === 'is_active' || word.toLowerCase() === 'published' || word.toLowerCase() === 'active') {
      const name = word.toLowerCase().replace(/^(is_|has_)/, '');
      fields.push({ name, type: 'boolean', fieldType: 'boolean' });
      continue;
    }

    // Detect timestamps
    if (word.toLowerCase() === 'created_at' || word.toLowerCase() === 'updated_at' || word.toLowerCase() === 'timestamp') {
      const name = word.toLowerCase();
      fields.push({ name, type: 'datetime', fieldType: 'datetime' });
      continue;
    }

    // Detect foreign key
    if (['references', 'foreign', 'belongs', 'related'].includes(word.toLowerCase()) && nextWord) {
      const name = nextWord.toLowerCase() + '_id';
      fields.push({ name, type: 'foreignKey', fieldType: 'integer', foreignKey: nextWord });
      continue;
    }

    // Detect unique
    if (word.toLowerCase() === 'unique' && nextWord) {
      const field = fields.find(f => f.name === nextWord.toLowerCase());
      if (field) field.unique = true;
      continue;
    }

    // Skip basic words
    if (['a', 'an', 'the', 'with', 'and', 'or', 'to', 'in', 'for', 'of', 'on'].includes(word.toLowerCase())) continue;
    if (['model', 'table', 'entity', 'field', 'column'].includes(word.toLowerCase())) continue;

    // Detect field name (alphanumeric)
    if (/^[a-z][a-z0-9_]*$/.test(word) &&
        !['id', 'null', 'default', 'primary', 'key', 'auto', 'now', 'add', 'create'].includes(word) &&
        fields.every(f => f.name !== word)) {
      // Determine type based on context
      let fieldType = 'string';
      if (nextWord && ['integer', 'int', 'number'].includes(nextWord.toLowerCase())) {
        fieldType = 'integer';
      } else if (nextWord && ['text', 'description', 'content', 'body'].includes(nextWord.toLowerCase())) {
        fieldType = 'text';
      } else if (nextWord && ['decimal', 'price', 'amount', 'cost'].includes(nextWord.toLowerCase())) {
        fieldType = 'decimal';
      }

      if (nextWord && ['decimal', 'price', 'amount'].includes(nextWord.toLowerCase())) {
        fields.push({ name: word, type: 'decimal', fieldType: 'decimal', maxDigits: 10, decimalPlaces: 2 });
      } else if (fieldType !== 'string' || !nextWord || !['as', 'as'].includes(nextWord)) {
        fields.push({ name: word, type: fieldType, fieldType });
      }
    }
  }

  return fields;
}

/**
 * Detect framework from description or arguments
 */
function detectFramework(description, args = []) {
  const desc = description.toLowerCase();
  const frameworkArg = args.find(a => !a.startsWith('--') && !a.startsWith('-'));

  if (frameworkArg) {
    const fw = frameworkArg.toLowerCase();
    if (['django', 'python'].includes(fw)) return 'django';
    if (['rails', 'ruby'].includes(fw)) return 'rails';
    if (['prisma', 'node', 'typescript'].includes(fw)) return 'prisma';
    if (['sqlalchemy', 'flask', 'fastapi'].includes(fw)) return 'sqlalchemy';
    if (['typeorm'].includes(fw)) return 'typeorm';
    if (['knex', 'javascript', 'js'].includes(fw)) return 'knex';
    if (['ef', 'efcore', 'ef-core', 'c#', 'csharp'].includes(fw)) return 'ef-core';
  }

  if (desc.includes('django') || desc.includes('python')) return 'django';
  if (desc.includes('rails') || desc.includes('ruby')) return 'rails';
  if (desc.includes('prisma') || desc.includes('node')) return 'prisma';
  if (desc.includes('sqlalchemy') || desc.includes('flask') || desc.includes('fastapi')) return 'sqlalchemy';
  if (desc.includes('typeorm')) return 'typeorm';
  if (desc.includes('knex') || desc.includes('javascript')) return 'knex';
  if (desc.includes('ef core') || desc.includes('entity framework') || desc.includes('c#')) return 'ef-core';

  return 'django'; // Default
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
${colors.bright}Migration Generator${colors.reset}

Usage:
  node scripts/generate-migration.js <framework> "<description>" [options]

Options:
  --output <directory>   Output directory for migration file
  --save                 Save to file instead of printing

Examples:
  node scripts/generate-migration.js django "Create User model with email and username"
  node scripts/generate-migration.js rails "Create posts table with title and content"
  node scripts/generate-migration.js prisma "Add Profile model with bio and avatarUrl"
  node scripts/generate-migration.js sqlalchemy "Create products with name and price"

Supported Frameworks:
  django, rails, prisma, sqlalchemy, typeorm, knex, ef-core
`);
    return 0;
  }

  // Extract framework and description
  let framework = null;
  let description = '';
  let outputDir = null;
  let saveToFile = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output') {
      outputDir = args[++i];
    } else if (arg === '--save') {
      saveToFile = true;
    } else if (!arg.startsWith('--') && !framework) {
      framework = arg;
      description = args.slice(i + 1).join(' ').replace(/^["']|["']$/g, '');
      break;
    }
  }

  if (!framework || !description) {
    console.log(`${colors.red}Error: Framework and description are required${colors.reset}`);
    console.log(`Run with --help for usage information`);
    return 1;
  }

  const fw = frameworks[framework.toLowerCase()];
  if (!fw) {
    console.log(`${colors.red}Error: Unknown framework: ${framework}${colors.reset}`);
    console.log(`Supported frameworks: ${Object.keys(frameworks).join(', ')}`);
    return 1;
  }

  const fields = parseDescription(description);
  const tableName = description.split(/[ ,]+/)[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'new_table';

  const migrationCode = fw.template(tableName, fields);

  console.log(`\n${colors.cyan}${colors.bright}Migration Generator${colors.reset}`);
  console.log(`${colors.blue}Framework:${colors.reset} ${fw.name} (${fw.language})`);
  console.log(`${colors.blue}Table:${colors.reset} ${tableName}`);
  console.log(`${colors.blue}Fields:${colors.reset} ${fields.length}\n`);

  console.log(`${'='.repeat(50)}`);
  console.log(`${colors.bright}Generated Migration:${colors.reset}`);
  console.log(`${'='.repeat(50)}\n`);
  console.log(migrationCode);

  if (saveToFile || outputDir) {
    const defaultPath = fw.defaultPath;
    const outputPath = outputDir || defaultPath;

    try {
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const filename = `${outputPath}${tableName}${fw.extension}`;
      fs.writeFileSync(filename, migrationCode);
      console.log(`\n${colors.green}${colors.bright}Saved to: ${filename}${colors.reset}`);
    } catch (err) {
      console.log(`\n${colors.yellow}Warning: Could not save file: ${err.message}${colors.reset}`);
    }
  }

  return 0;
}

process.exit(main());