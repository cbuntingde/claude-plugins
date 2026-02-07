#!/usr/bin/env node

/**
 * Claude Code CRUD Generator Plugin
 * Generates CRUD operations from database schemas
 */

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');

// Schema parsers
const { parseSQLSchema, parsePrismaSchema, parseMongooseSchema } = require('./lib/parsers');

// Generators
const { generateExpressCRUD } = require('./lib/generators/express');
const { generateFastAPICRUD } = require('./lib/generators/fastapi');
const { generateDjangoCRUD } = require('./lib/generators/django');
const { generateSpringBootCRUD } = require('./lib/generators/spring-boot');

program
  .name('crud-generator')
  .description('Generate CRUD operations from database schemas')
  .version('1.0.0');

/**
 * Main command to generate CRUD from schema
 */
program
  .command('generate')
  .description('Generate CRUD operations from a database schema')
  .option('-s, --schema <path>', 'Path to schema file')
  .option('-f, --framework <framework>', 'Target framework (express, fastapi, django, spring-boot)')
  .option('-l, --language <language>', 'Programming language (typescript, python, java)')
  .option('-o, --output <dir>', 'Output directory', './output')
  .action(async (options) => {
    try {
      await generateCRUD(options);
    } catch (error) {
      console.error(chalk.red('Error generating CRUD:'), error.message);
      process.exit(1);
    }
  });

/**
 * Parse and display schema information
 */
program
  .command('parse')
  .description('Parse and display database schema information')
  .option('-s, --schema <path>', 'Path to schema file')
  .action(async (options) => {
    try {
      await parseSchema(options);
    } catch (error) {
      console.error(chalk.red('Error parsing schema:'), error.message);
      process.exit(1);
    }
  });

/**
 * Generate custom template
 */
program
  .command('template')
  .description('Generate a custom CRUD template')
  .option('-t, --type <type>', 'Template type (controller, service, model, repository)')
  .option('-f, --framework <framework>', 'Target framework')
  .action(async (options) => {
    try {
      await generateTemplate(options);
    } catch (error) {
      console.error(chalk.red('Error generating template:'), error.message);
      process.exit(1);
    }
  });

/**
 * Main CRUD generation function
 */
async function generateCRUD(options) {
  console.log(chalk.blue.bold('\n🚀 Claude Code CRUD Generator\n'));

  // Prompt for missing options
  const answers = await promptForOptions(options);

  // Read and parse schema
  console.log(chalk.yellow('📖 Reading schema file...'));
  const schemaContent = await fs.readFile(answers.schema, 'utf-8');

  console.log(chalk.yellow('🔍 Parsing schema...'));
  const schema = await parseSchemaFile(answers.schema, schemaContent);

  console.log(chalk.green(`✅ Found ${schema.tables.length} tables/collections:\n`));
  schema.tables.forEach(table => {
    console.log(chalk.gray(`   • ${table.name} (${table.columns.length} fields)`));
  });

  // Generate CRUD operations
  console.log(chalk.yellow('\n🛠️  Generating CRUD operations...'));
  const generator = getGenerator(answers.framework);

  const output = await generator(schema, {
    language: answers.language,
    outputDir: answers.output
  });

  // Write generated files
  console.log(chalk.yellow('📝 Writing files...'));
  await writeGeneratedFiles(output, answers.output);

  console.log(chalk.green.bold('\n✨ CRUD operations generated successfully!\n'));
  console.log(chalk.gray(`Output directory: ${path.resolve(answers.output)}`));
}

/**
 * Parse and display schema information
 */
async function parseSchema(options) {
  console.log(chalk.blue.bold('\n📊 Schema Parser\n'));

  const answers = await promptForOptions(options);
  const schemaContent = await fs.readFile(answers.schema, 'utf-8');
  const schema = await parseSchemaFile(answers.schema, schemaContent);

  console.log(chalk.green.bold(`\nSchema: ${schema.name}\n`));
  console.log(chalk.gray('═'.repeat(80)));

  schema.tables.forEach(table => {
    console.log(chalk.cyan.bold(`\n📋 Table: ${table.name}`));
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.white('Field Name'.padEnd(25)) + chalk.white('Type'.padEnd(20)) + chalk.white('Constraints'));
    console.log(chalk.gray('─'.repeat(80)));

    table.columns.forEach(col => {
      const constraints = [];
      if (col.primaryKey) constraints.push('PK');
      if (col.foreignKey) constraints.push(`FK → ${col.foreignKey}`);
      if (col.required) constraints.push('NOT NULL');
      if (col.unique) constraints.push('UNIQUE');

      console.log(
        chalk.white(col.name.padEnd(25)) +
        chalk.yellow(col.type.padEnd(20)) +
        chalk.gray(constraints.join(', ') || '-')
      );
    });
  });

  console.log(chalk.gray('\n═'.repeat(80) + '\n'));
}

/**
 * Generate custom template
 */
async function generateTemplate(options) {
  console.log(chalk.blue.bold('\n📝 Template Generator\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'What type of template do you need?',
      choices: ['controller', 'service', 'model', 'repository', 'routes', 'all'],
      default: options.type || 'all'
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Which framework?',
      choices: ['express', 'fastapi', 'django', 'spring-boot'],
      default: options.framework || 'express'
    }
  ]);

  console.log(chalk.yellow(`🛠️  Generating ${answers.type} template for ${answers.framework}...`));

  const generator = getGenerator(answers.framework);
  const template = generator.getTemplate(answers.type);

  console.log(chalk.green.bold('\n✨ Template generated:\n'));
  console.log(template);
}

/**
 * Helper functions
 */
async function promptForOptions(options) {
  const questions = [];

  if (!options.schema) {
    questions.push({
      type: 'input',
      name: 'schema',
      message: 'Path to schema file:',
      validate: input => input.length > 0 || 'Schema file path is required'
    });
  }

  if (!options.framework) {
    questions.push({
      type: 'list',
      name: 'framework',
      message: 'Select framework:',
      choices: ['express', 'fastapi', 'django', 'spring-boot']
    });
  }

  if (!options.language) {
    questions.push({
      type: 'list',
      name: 'language',
      message: 'Select language:',
      choices: ['typescript', 'python', 'java']
    });
  }

  const answers = await inquirer.prompt(questions);
  return { ...options, ...answers };
}

async function parseSchemaFile(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.sql':
      return parseSQLSchema(content);
    case '.prisma':
      return parsePrismaSchema(content);
    case '.js':
      if (content.includes('mongoose')) {
        return parseMongooseSchema(content);
      }
      throw new Error('Unknown schema format');
    default:
      throw new Error(`Unsupported schema file type: ${ext}`);
  }
}

function getGenerator(framework) {
  const generators = {
    express: generateExpressCRUD,
    fastapi: generateFastAPICRUD,
    django: generateDjangoCRUD,
    'spring-boot': generateSpringBootCRUD
  };

  const generator = generators[framework];
  if (!generator) {
    throw new Error(`Unsupported framework: ${framework}`);
  }

  return generator;
}

async function writeGeneratedFiles(output, outputDir) {
  // SECURITY: Validate output directory to prevent path traversal
  const resolvedOutputDir = path.resolve(outputDir);

  // Get current working directory and home directory as allowed roots
  const cwd = path.resolve(process.cwd());
  const homeDir = path.resolve(require('os').homedir());

  // Check if outputDir is within allowed directories
  try {
    resolvedOutputDir.relativeTo(cwd);
  } catch (ValueError) {
    try {
      resolvedOutputDir.relativeTo(homeDir);
    } catch (ValueError) {
      if (path.isAbsolute(outputDir)) {
        throw new Error('Output directory must be within current project or home directory');
      }
    }
  }

  await fs.mkdir(outputDir, { recursive: true });

  for (const file of output.files) {
    // SECURITY: Validate file path to prevent path traversal
    const filePath = path.join(outputDir, file.path);

    // Resolve and validate the full path
    const resolvedFilePath = path.resolve(filePath);

    // Ensure the resolved path is still within outputDir
    try {
      resolvedFilePath.relativeTo(resolvedOutputDir);
    } catch (ValueError) {
      throw new Error(`Invalid file path: ${file.path} would escape output directory`);
    }

    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, file.content, 'utf-8');

    console.log(chalk.green(`   ✓ ${file.path}`));
  }
}

program.parse();
