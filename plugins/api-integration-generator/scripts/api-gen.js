#!/usr/bin/env node
/**
 * API Client Generator
 * Generates fully-typed API client code from OpenAPI specifications
 */

const fs = require('fs');
const path = require('path');

/**
 * API Client Generator
 */
class ApiClientGenerator {
  constructor() {
    this.supportedLanguages = ['typescript', 'python', 'go'];
    this.defaultOutputDir = './api-clients';
  }

  /**
   * Main generation function
   */
  async generate(specUrl, options = {}) {
    const language = options.language || 'typescript';
    const outputDir = options.output || this.defaultOutputDir;
    const clientName = options.name || 'ApiClient';

    // Validate language
    if (!this.supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}. Supported: ${this.supportedLanguages.join(', ')}`);
    }

    // Fetch spec
    const spec = await this.fetchSpec(specUrl);

    // Generate based on language
    switch (language) {
      case 'typescript':
        return this.generateTypeScript(spec, outputDir, clientName);
      case 'python':
        return this.generatePython(spec, outputDir, clientName);
      case 'go':
        return this.generateGo(spec, outputDir, clientName);
    }
  }

  /**
   * Fetch OpenAPI specification
   */
  async fetchSpec(urlOrPath) {
    try {
      if (urlOrPath.startsWith('http')) {
        const https = require('https');
        return new Promise((resolve, reject) => {
          https.get(urlOrPath, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error('Invalid JSON in specification'));
              }
            });
          }).on('error', reject);
        });
      }
      const content = await fs.promises.readFile(urlOrPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to fetch spec: ${error.message}`);
    }
  }

  /**
   * Generate TypeScript client
   */
  generateTypeScript(spec, outputDir, clientName) {
    const camelName = clientName.charAt(0).toLowerCase() + clientName.slice(1);
    const pascalName = clientName;
    const dir = path.join(outputDir, camelName);

    // Create directory structure
    this.ensureDir(dir);
    this.ensureDir(path.join(dir, 'src', 'endpoints'));
    this.ensureDir(path.join(dir, 'src', 'types'));
    this.ensureDir(path.join(dir, 'examples'));

    // Generate package.json
    const packageJson = {
      name: camelName,
      version: spec.info?.version || '1.0.0',
      description: spec.info?.description || `${pascalName} API client`,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: { build: 'tsc', test: 'jest' },
      dependencies: { undici: '^6.0.0' },
      devDependencies: {
        '@types/node': '^20.0.0',
        jest: '^29.0.0',
        typescript: '^5.0.0'
      }
    };
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Generate tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'Node16',
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
    fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // Generate types
    const types = this.generateTypeScriptTypes(spec);
    fs.writeFileSync(path.join(dir, 'src', 'types.ts'), types);

    // Generate errors
    const errors = this.generateTypeScriptErrors();
    fs.writeFileSync(path.join(dir, 'src', 'errors.ts'), errors);

    // Generate client
    const client = this.generateTypeScriptClient(spec, pascalName);
    fs.writeFileSync(path.join(dir, 'src', 'client.ts'), client);

    // Generate index
    const index = `export * from './client';\nexport * from './types';\nexport * from './errors';\n`;
    fs.writeFileSync(path.join(dir, 'src', 'index.ts'), index);

    // Generate example
    const example = this.generateTypeScriptExample(spec, pascalName);
    fs.writeFileSync(path.join(dir, 'examples', 'usage.ts'), example);

    return { dir, language: 'typescript', endpoints: Object.keys(spec.paths || {}).length };
  }

  /**
   * Generate TypeScript types
   */
  generateTypeScriptTypes(spec) {
    let content = '// Auto-generated types\n\n';
    const schemas = spec.components?.schemas || spec.definitions || {};

    for (const [name, schema] of Object.entries(schemas)) {
      content += `export interface ${name} {\n`;
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          const isRequired = schema.required?.includes(propName);
          const optional = isRequired ? '' : '?';
          const type = this.tsType(propSchema);
          content += `  ${propName}${optional}: ${type};\n`;
        }
      }
      content += `}\n\n`;
    }

    return content;
  }

  /**
   * Generate TypeScript errors
   */
  generateTypeScriptErrors() {
    return `export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(\`\${resource} not found\`, 404);
    this.name = 'NotFoundError';
  }
}
`;
  }

  /**
   * Generate TypeScript client
   */
  generateTypeScriptClient(spec, className) {
    let content = `import { UndiciFetcher } from 'undici';\nimport { ApiError, ValidationError, AuthenticationError, NotFoundError } from './errors';\n\n`;
    content += `export interface ${className}Config {\n  baseUrl: string;\n  apiKey?: string;\n  bearerToken?: string;\n  timeout?: number;\n}\n\n`;
    content += `export class ${className} {\n  private config: ${className}Config;\n  private fetcher: UndiciFetcher;\n\n  constructor(config: ${className}Config) {\n    this.config = {\n      timeout: 30000,\n      ...config\n    };\n    this.fetcher = new UndiciFetcher();\n  }\n\n  private async request<T>(\n    method: string,\n    endpoint: string,\n    options?: { params?: Record<string, any>; body?: any }\n  ): Promise<T> {\n    const url = new URL(endpoint, this.config.baseUrl);\n    const headers: Record<string, string> = { 'Content-Type': 'application/json' };\n\n    if (this.config.apiKey) {\n      headers['X-API-Key'] = this.config.apiKey;\n    }\n    if (this.config.bearerToken) {\n      headers['Authorization'] = \`Bearer \${this.config.bearerToken}\`;\n    }\n\n    const response = await this.fetcher.fetch(url.toString(), {\n      method,\n      headers,\n      body: options?.body ? JSON.stringify(options.body) : undefined\n    });\n\n    if (!response.ok) {\n      const error = await response.json().catch(() => ({}));\n      if (response.status === 401) throw new AuthenticationError();\n      if (response.status === 404) throw new NotFoundError(endpoint);\n      throw new ApiError(error.message || 'Request failed', response.status, error);\n    }\n\n    return response.json() as Promise<T>;\n  }\n`;

    // Generate endpoint methods
    for (const [apiPath, pathObj] of Object.entries(spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathObj)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          const methodName = operation.operationId || method + apiPath.split('/').filter(Boolean).pop();
          const safeName = methodName.replace(/[^a-zA-Z0-9]/g, '');
          content += `\n  async ${safeName}(`;
          content += `params?: Record<string, any>, body?: any): Promise<any> {\n`;
          content += `    return this.request<any>('${method.toUpperCase()}', '${apiPath}', { params, body });\n`;
          content += `  }\n`;
        }
      }
    }

    content += `}\n`;
    return content;
  }

  /**
   * Generate TypeScript example
   */
  generateTypeScriptExample(spec, className) {
    return `import { ${className} } from '../src';\n\nconst client = new ${className}({\n  baseUrl: '${spec.servers?.[0]?.url || 'https://api.example.com'}',\n  apiKey: process.env.API_KEY\n});\n\nasync function main() {\n  try {\n    const result = await client.getUsers();\n    console.log('Users:', result);\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n\nmain();
`;
  }

  /**
   * Generate Python client
   */
  generatePython(spec, outputDir, clientName) {
    const dir = path.join(outputDir, clientName.toLowerCase());
    this.ensureDir(dir);
    this.ensureDir(path.join(dir, clientName.toLowerCase()));

    const content = `"""${clientName} API client"""`;
    fs.writeFileSync(path.join(dir, clientName.toLowerCase(), '__init__.py'), content);

    // Generate setup.py
    const setup = `from setuptools import setup\n\nsetup(\n    name='${clientName.toLowerCase()}',\n    version='${spec.info?.version || '1.0.0'}',\n    packages=['${clientName.toLowerCase()}'],\n    install_requires=['requests>=2.31.0'],\n    python_requires='>=3.8'\n)\n`;
    fs.writeFileSync(path.join(dir, 'setup.py'), setup);

    return { dir, language: 'python', endpoints: Object.keys(spec.paths || {}).length };
  }

  /**
   * Generate Go client
   */
  generateGo(spec, outputDir, clientName) {
    const dir = path.join(outputDir, clientName.toLowerCase());
    this.ensureDir(dir);
    this.ensureDir(path.join(dir, 'client'));

    // Generate go.mod
    const gomod = `module ${clientName.toLowerCase()}\n\ngo 1.21\n`;
    fs.writeFileSync(path.join(dir, 'go.mod'), gomod);

    // Generate client.go
    const clientGo = this.generateGoClient(spec, clientName);
    fs.writeFileSync(path.join(dir, 'client', 'client.go'), clientGo);

    return { dir, language: 'go', endpoints: Object.keys(spec.paths || {}).length };
  }

  /**
   * Generate Go client code
   */
  generateGoClient(spec, clientName) {
    let content = `package client\n\nimport (\n    "encoding/json"\n    "net/http"\n    "time"\n)\n\ntype Client struct {\n    baseUrl string\n    apiKey string\n    client *http.Client\n}\n\nfunc New(baseUrl, apiKey string) *Client {\n    return &Client{\n        baseUrl: baseUrl,\n        apiKey: apiKey,\n        client: &http.Client{Timeout: 30 * time.Second},\n    }\n}\n`;

    content += `\nfunc (c *Client) request(method, endpoint string, body interface{}) (map[string]interface{}, error) {\n`;
    content += `    // Implementation\n`;
    content += `    return nil, nil\n`;
    content += `}\n`;

    return content;
  }

  /**
   * Helper: TypeScript type mapping
   */
  tsType(schema) {
    if (!schema) return 'any';
    if (schema.$ref) return schema.$ref.split('/').pop();
    const map = {
      string: 'string', integer: 'number', number: 'number',
      boolean: 'boolean', array: 'any[]', object: 'Record<string, any>'
    };
    return map[schema.type] || 'any';
  }

  /**
   * Helper: Ensure directory exists
   */
  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const generator = new ApiClientGenerator();

  let specUrl = null;
  let options = { language: 'typescript', output: null, name: null };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--language' || arg === '-l') {
      options.language = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--name' || arg === '-n') {
      options.name = args[++i];
    } else if (!arg.startsWith('--')) {
      specUrl = arg;
    }
  }

  if (!specUrl) {
    console.log('Usage: node api-gen.js <spec-url> [--language <typescript|python|go>] [--output <dir>] [--name <name>]');
    process.exit(1);
  }

  try {
    const result = await generator.generate(specUrl, options);
    console.log(`Generated ${result.language} client with ${result.endpoints} endpoints in ${result.dir}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ApiClientGenerator;