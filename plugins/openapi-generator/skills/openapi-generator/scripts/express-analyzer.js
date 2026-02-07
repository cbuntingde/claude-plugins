#!/usr/bin/env node

/**
 * Express.js API Analyzer
 * Analyzes Express.js code to extract API endpoints for OpenAPI generation
 *
 * Usage: node express-analyzer.js <directory>
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class ExpressAnalyzer {
  constructor() {
    this.endpoints = [];
    this.schemas = {};
    this.securitySchemes = {};
  }

  analyze(directory) {
    const jsFiles = this.findFiles(directory, ['.js', '.ts']);

    for (const file of jsFiles) {
      this.analyzeFile(file);
    }

    return {
      endpoints: this.endpoints,
      schemas: this.schemas,
      securitySchemes: this.securitySchemes
    };
  }

  findFiles(dir, extensions) {
    const files = [];

    const traverseDir = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and common ignore directories
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            traverseDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    traverseDir(dir);
    return files;
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'decorators-legacy']
      });

      traverse(ast, {
        // Express app.METHOD() patterns
        CallExpression: (path) => {
          this.analyzeCallExpression(path, filePath, content);
        },

        // Router definitions
        VariableDeclarator: (path) => {
          this.analyzeVariableDeclarator(path, filePath);
        }
      });
    } catch (error) {
      // Skip files that can't be parsed
      console.warn(`Warning: Could not parse ${filePath}: ${error.message}`);
    }
  }

  analyzeCallExpression(path, filePath, content) {
    const callee = path.node.callee;

    // Check for app.get/post/put/delete/etc(pattern)
    if (
      callee.type === 'MemberExpression' &&
      callee.property &&
      ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'all'].includes(callee.property.name)
    ) {
      const args = path.node.arguments;
      if (args.length >= 2) {
        const routePath = this.extractString(args[0]);
        const method = callee.property.name.toUpperCase();

        this.endpoints.push({
          method,
          path: routePath,
          file: filePath,
          line: path.node.loc?.start.line,
          handler: this.getHandlerName(args[1]),
          description: this.extractJSDoc(content, path.node.loc?.start.line)
        });
      }
    }

    // Check for router.METHOD() patterns
    if (
      callee.type === 'MemberExpression' &&
      callee.object &&
      callee.object.type === 'Identifier' &&
      callee.object.name === 'router' &&
      ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'all'].includes(callee.property.name)
    ) {
      const args = path.node.arguments;
      if (args.length >= 2) {
        const routePath = this.extractString(args[0]);
        const method = callee.property.name.toUpperCase();

        this.endpoints.push({
          method,
          path: routePath,
          file: filePath,
          line: path.node.loc?.start.line,
          handler: this.getHandlerName(args[1]),
          description: this.extractJSDoc(content, path.node.loc?.start.line)
        });
      }
    }
  }

  analyzeVariableDeclarator(path, filePath) {
    // Look for router = express.Router()
    if (
      path.node.init &&
      path.node.init.type === 'CallExpression' &&
      path.node.init.callee.type === 'MemberExpression' &&
      path.node.init.callee.property.name === 'Router'
    ) {
      // Found router initialization
    }
  }

  extractString(node) {
    if (node.type === 'StringLiteral') {
      return node.value;
    }
    if (node.type === 'TemplateLiteral') {
      return node.quasis.map(q => q.value.cooked).join('');
    }
    return null;
  }

  getHandlerName(node) {
    if (node.type === 'Identifier') {
      return node.name;
    }
    if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      return '<anonymous>';
    }
    return null;
  }

  extractJSDoc(content, line) {
    if (!line) return null;

    const lines = content.split('\n');
    let comment = '';
    let currentLine = line - 2;

    // Look backwards for JSDoc comments
    while (currentLine >= 0) {
      const trimmed = lines[currentLine].trim();
      if (trimmed.startsWith('//')) {
        comment = trimmed.substring(2).trim() + '\n' + comment;
        currentLine--;
      } else if (trimmed.startsWith('/**')) {
        // Multi-line JSDoc
        while (currentLine >= 0 && !trimmed.includes('*/')) {
          comment = lines[currentLine].trim() + '\n' + comment;
          currentLine--;
        }
        break;
      } else if (trimmed === '') {
        currentLine--;
      } else {
        break;
      }
    }

    return comment.trim() || null;
  }

  generateOpenAPI(info) {
    const paths = {};

    for (const endpoint of this.endpoints) {
      const pathKey = endpoint.path;
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }

      paths[pathKey][endpoint.method.toLowerCase()] = {
        summary: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        description: endpoint.description || '',
        operationId: this.generateOperationId(endpoint),
        responses: this.generateResponses(endpoint),
        parameters: this.generateParameters(endpoint)
      };
    }

    return {
      openapi: '3.0.0',
      info: info || {
        title: 'API',
        version: '1.0.0',
        description: 'Generated from Express.js code'
      },
      paths,
      components: {
        schemas: this.schemas,
        securitySchemes: this.securitySchemes
      }
    };
  }

  generateOperationId(endpoint) {
    const sanitizedPath = endpoint.path.replace(/[^a-zA-Z0-9]/g, '-');
    return `${endpoint.method.toLowerCase()}${sanitizedPath}`;
  }

  generateResponses(endpoint) {
    return {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object'
            }
          }
        }
      },
      '400': {
        description: 'Bad request'
      },
      '500': {
        description: 'Internal server error'
      }
    };
  }

  generateParameters(endpoint) {
    const params = [];
    const pathParams = endpoint.path.match(/:([^\/]+)/g);

    if (pathParams) {
      for (const param of pathParams) {
        const name = param.substring(1);
        params.push({
          name,
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        });
      }
    }

    return params;
  }
}

// CLI interface
if (require.main === module) {
  const directory = process.argv[2] || '.';
  const analyzer = new ExpressAnalyzer();
  const result = analyzer.analyze(directory);

  console.log(JSON.stringify(analyzer.generateOpenAPI(), null, 2));
}

module.exports = ExpressAnalyzer;
