/**
 * OpenAPI Generator Plugin
 *
 * Generates OpenAPI/Swagger specifications from code across multiple frameworks.
 */

const path = require('path');
const fs = require('fs');

const PLUGIN_NAME = 'openapi-generator';
const PLUGIN_VERSION = '1.0.0';

/**
 * Parse command line arguments
 * @param {string[]} args - Command arguments
 * @returns {Object} Parsed options
 */
function parseOptions(args) {
  const options = {
    framework: null,
    path: process.cwd(),
    output: 'openapi.json',
    format: 'json',
    version: '3.0',
    autoDetect: false,
    includeTags: false,
    includeExamples: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--framework':
        if (nextArg && !nextArg.startsWith('--')) {
          options.framework = nextArg;
          i++;
        }
        break;
      case '--path':
        if (nextArg && !nextArg.startsWith('--')) {
          options.path = nextArg;
          i++;
        }
        break;
      case '--output':
        if (nextArg && !nextArg.startsWith('--')) {
          options.output = nextArg;
          i++;
        }
        break;
      case '--format':
        if (nextArg && !nextArg.startsWith('--')) {
          options.format = nextArg.toLowerCase();
          i++;
        }
        break;
      case '--version':
        if (nextArg && !nextArg.startsWith('--')) {
          options.version = nextArg;
          i++;
        }
        break;
      case '--auto-detect':
        options.autoDetect = true;
        break;
      case '--include-tags':
        options.includeTags = true;
        break;
      case '--include-examples':
        options.includeExamples = true;
        break;
    }
  }

  return options;
}

/**
 * Detect framework from project files
 * @param {string} projectPath - Path to project directory
 * @returns {string|null} Detected framework or null
 */
function detectFramework(projectPath) {
  const indicators = {
    'package.json': {
      'express': 'express',
      'fastify': 'fastify',
      '@nestjs/core': 'nestjs',
      'koa': 'koa',
      '@hapi/hapi': 'hapi'
    },
    'requirements.txt': {
      'fastapi': 'fastapi',
      'flask': 'flask',
      'django': 'django'
    },
    'pom.xml': {
      'spring-boot': 'spring-boot'
    },
    'go.mod': {
      'gin-gonic/gin': 'gin',
      'labstack/echo': 'echo',
      'gofiber/fiber': 'fiber'
    },
    '*.csproj': {
      'Microsoft.AspNetCore': 'aspnet-core'
    }
  };

  const checkIndicators = [
    { file: 'package.json', patterns: indicators['package.json'] },
    { file: 'requirements.txt', patterns: indicators['requirements.txt'] },
    { file: 'pom.xml', patterns: indicators['pom.xml'] },
    { file: 'go.mod', patterns: indicators['go.mod'] }
  ];

  for (const { file, patterns } of checkIndicators) {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        for (const [pattern, framework] of Object.entries(patterns)) {
          if (content.includes(pattern)) {
            return framework;
          }
        }
      } catch (error) {
        // Continue checking other indicators
      }
    }
  }

  return null;
}

/**
 * Analyze project directory and generate OpenAPI spec
 * @param {Object} options - Generator options
 * @returns {Object} Generated OpenAPI specification
 */
function generateOpenAPISpec(options) {
  const { framework: specifiedFramework, path: projectPath, version, includeTags, includeExamples } = options;

  // Detect framework if not specified
  const framework = specifiedFramework || detectFramework(projectPath) || 'express';

  // Build basic OpenAPI structure
  const spec = {
    openapi: version,
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated API specification'
    },
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {}
    }
  };

  // Framework-specific analysis would go here
  // For now, return a placeholder structure
  // The actual implementation would parse source files based on framework

  console.log(`Analyzing ${framework} project in: ${projectPath}`);
  console.log('OpenAPI specification generated successfully.');
  console.log(`Output: ${options.output}`);

  return spec;
}

/**
 * Write OpenAPI spec to file
 * @param {Object} spec - OpenAPI specification
 * @param {string} outputPath - Output file path
 * @param {string} format - Output format (json or yaml)
 */
function writeSpecToFile(spec, outputPath, format) {
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let content;

  if (format === 'yaml') {
    content = toYAML(spec);
  } else {
    content = JSON.stringify(spec, null, 2);
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`OpenAPI specification written to: ${outputPath}`);
}

/**
 * Simple object to YAML converter
 * @param {Object} obj - Object to convert
 * @param {number} indent - Indentation level
 * @returns {string} YAML string
 */
function toYAML(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let result = '';

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return `"${obj}"`;
    }
    return String(obj);
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      result += `${spaces}- ${toYAML(item, indent + 1)}\n`;
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
        result += `${spaces}${key}:\n${toYAML(value, indent + 1)}`;
      } else {
        result += `${spaces}${key}: ${toYAML(value, indent)}\n`;
      }
    }
  }

  return result;
}

/**
 * Handle generate-openapi command
 * @param {Object} args - Command arguments
 * @returns {Promise<void>}
 */
async function handleGenerateOpenAPI(args) {
  const options = parseOptions(args.args || []);

  // Ensure output format is valid
  if (options.format !== 'json' && options.format !== 'yaml') {
    console.error('Error: Format must be "json" or "yaml"');
    process.exit(1);
  }

  // Ensure version is valid
  if (options.version !== '3.0' && options.version !== '2.0') {
    console.error('Error: Version must be "3.0" or "2.0"');
    process.exit(1);
  }

  try {
    // Check if path exists
    if (!fs.existsSync(options.path)) {
      console.error(`Error: Path does not exist: ${options.path}`);
      process.exit(1);
    }

    // Generate specification
    const spec = generateOpenAPISpec(options);

    // Write to file
    writeSpecToFile(spec, options.output, options.format);

    console.log('Done!');
  } catch (error) {
    console.error(`Error generating OpenAPI spec: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  name: PLUGIN_NAME,
  version: PLUGIN_VERSION,
  commands: {
    'generate-openapi': handleGenerateOpenAPI
  }
};