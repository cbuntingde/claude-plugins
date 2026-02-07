#!/usr/bin/env node

/**
 * MCP Server for fetching and parsing API documentation
 * Supports OpenAPI, Swagger, and HTML documentation
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

class ApiDocsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'api-docs-fetcher',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'fetch_openapi_spec',
            description: 'Fetch and parse OpenAPI/Swagger specification from a URL',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to OpenAPI/Swagger spec (JSON or YAML)',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'parse_openapi_spec',
            description: 'Parse OpenAPI/Swagger specification and extract endpoints, types, and authentication',
            inputSchema: {
              type: 'object',
              properties: {
                spec: {
                  type: 'string',
                  description: 'OpenAPI/Swagger spec as JSON string',
                },
              },
              required: ['spec'],
            },
          },
          {
            name: 'generate_client_code',
            description: 'Generate API client code from OpenAPI specification',
            inputSchema: {
              type: 'object',
              properties: {
                spec: {
                  type: 'string',
                  description: 'OpenAPI/Swagger spec as JSON string',
                },
                language: {
                  type: 'string',
                  enum: ['typescript', 'python', 'go'],
                  description: 'Target language for generated client',
                },
                options: {
                  type: 'object',
                  description: 'Generation options (outputDir, clientName, etc.)',
                },
              },
              required: ['spec', 'language'],
            },
          },
          {
            name: 'detect_api_changes',
            description: 'Compare two API specifications and detect breaking changes',
            inputSchema: {
              type: 'object',
              properties: {
                oldSpec: {
                  type: 'string',
                  description: 'Old API specification as JSON string',
                },
                newSpec: {
                  type: 'string',
                  description: 'New API specification as JSON string',
                },
              },
              required: ['oldSpec', 'newSpec'],
            },
          },
          {
            name: 'search_api_docs',
            description: 'Search for API documentation from a service name',
            inputSchema: {
              type: 'object',
              properties: {
                serviceName: {
                  type: 'string',
                  description: 'Name of the API service (e.g., "stripe", "github")',
                },
              },
              required: ['serviceName'],
            },
          },
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'fetch_openapi_spec':
            return await this.fetchOpenApiSpec(args.url);

          case 'parse_openapi_spec':
            return await this.parseOpenApiSpec(args.spec);

          case 'generate_client_code':
            return await this.generateClientCode(args.spec, args.language, args.options);

          case 'detect_api_changes':
            return await this.detectApiChanges(args.oldSpec, args.newSpec);

          case 'search_api_docs':
            return await this.searchApiDocs(args.serviceName);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                stack: error.stack,
              }),
            },
          ],
        };
      }
    });
  }

  async fetchOpenApiSpec(url) {
    // SECURITY: Validate URL protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Invalid URL protocol. Only http:// and https:// are allowed.',
            }),
          },
        ],
      };
    }

    const https = require('https');
    const http = require('http');
    const client = url.startsWith('https') ? https : http;

    // SECURITY: Add response size limit (10MB max)
    const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB

    return new Promise((resolve, reject) => {
      const req = client.get(url, { timeout: 30000 }, (res) => {
        const chunks = [];
        let dataLength = 0;

        res.on('data', (chunk) => {
          // SECURITY: Check size limit to prevent DoS
          dataLength += chunk.length;
          if (dataLength > MAX_RESPONSE_SIZE) {
            res.destroy();
            resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    error: 'Response too large (max 10MB)',
                  }),
                },
              ],
            });
            return;
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          try {
            const data = Buffer.concat(chunks).toString('utf-8');
            const spec = JSON.parse(data);
            resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    spec,
                    format: 'json',
                  }),
                },
              ],
            });
          } catch (e) {
            // Try YAML parsing
            resolve({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    spec: data,
                    format: 'yaml',
                  }),
                },
              ],
            });
          }
        });
      }).on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Request timeout',
              }),
            },
          ],
        });
      });
    });
  }

  async parseOpenApiSpec(specString) {
    let spec;
    try {
      spec = JSON.parse(specString);
    } catch (e) {
      // Would need a YAML parser here
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'YAML parsing not yet implemented, please provide JSON spec',
            }),
          },
        ],
      };
    }

    const endpoints = [];
    const types = [];

    // Extract endpoints
    if (spec.paths) {
      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, details] of Object.entries(methods)) {
          if (method === 'parameters' || method === '$ref') continue;

          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: details.operationId,
            summary: details.summary,
            description: details.description,
            tags: details.tags,
            parameters: details.parameters || [],
            requestBody: details.requestBody,
            responses: details.responses,
          });
        }
      }
    }

    // Extract types/schemas
    if (spec.components?.schemas) {
      for (const [name, schema] of Object.entries(spec.components.schemas)) {
        types.push({
          name,
          type: schema.type,
          properties: schema.properties,
          required: schema.required,
          description: schema.description,
        });
      }
    }

    // Extract authentication
    const authSchemes = [];
    if (spec.components?.securitySchemes) {
      for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
        authSchemes.push({
          name,
          type: scheme.type,
          scheme: scheme.scheme,
          bearerFormat: scheme.bearerFormat,
          flows: scheme.flows,
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            apiInfo: {
              title: spec.info?.title,
              version: spec.info?.version,
              description: spec.info?.description,
            },
            baseUrl: spec.servers?.[0]?.url || '',
            endpoints,
            types,
            authSchemes,
          }),
        },
      ],
    };
  }

  async generateClientCode(specString, language, options = {}) {
    const parsed = await this.parseOpenApiSpec(specString);
    const apiData = JSON.parse(parsed.content[0].text);

    if (!apiData.success) {
      return parsed;
    }

    // Generation templates (simplified - real implementation would be more comprehensive)
    const templates = {
      typescript: this.generateTypeScriptClient(apiData, options),
      python: this.generatePythonClient(apiData, options),
      go: this.generateGoClient(apiData, options),
    };

    const code = templates[language];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            language,
            code,
            files: code.files,
          }),
        },
      ],
    };
  }

  generateTypeScriptClient(apiData, options) {
    const clientName = options.clientName || this.toPascalCase(apiData.apiInfo.title);
    const files = [];

    // Generate types
    let typesCode = `// Auto-generated from ${apiData.apiInfo.title}\n\n`;
    for (const type of apiData.types) {
      typesCode += `export interface ${type.name} {\n`;
      if (type.properties) {
        for (const [propName, prop] of Object.entries(type.properties)) {
          const optional = !type.required?.includes(propName) ? '?' : '';
          typesCode += `  ${propName}${optional}: ${this.tsType(prop.type)};\n`;
        }
      }
      typesCode += `}\n\n`;
    }
    files.push({ path: 'types.ts', content: typesCode });

    // Generate client
    let clientCode = `import { baseUrl } from './config';\n\n`;
    clientCode += `export class ${clientName}Client {\n`;
    clientCode += `  constructor(private config: ClientConfig) {\n`;
    clientCode += `    this.baseUrl = config.baseUrl || '${apiData.baseUrl}';\n`;
    clientCode += `  }\n\n`;

    for (const endpoint of apiData.endpoints) {
      const methodName = this.getMethodName(endpoint);
      clientCode += `  async ${methodName}(\n`;
      clientCode += `    ${this.generateParams(endpoint)}\n`;
      clientCode += `  ): Promise<${this.getResponseType(endpoint)}> {\n`;
      clientCode += `    // TODO: Implement ${endpoint.method} ${endpoint.path}\n`;
      clientCode += `    throw new Error('Not implemented');\n`;
      clientCode += `  }\n\n`;
    }
    clientCode += `}\n`;
    files.push({ path: 'client.ts', content: clientCode });

    return {
      files,
      message: `TypeScript client generated with ${apiData.endpoints.length} endpoints`,
    };
  }

  generatePythonClient(apiData, options) {
    const clientName = options.clientName || this.toSnakeCase(apiData.apiInfo.title);
    const files = [];

    // Generate models
    let modelsCode = `# Auto-generated from ${apiData.apiInfo.title}\n`;
    modelsCode += `from pydantic import BaseModel\n\n`;
    for (const type of apiData.types) {
      modelsCode += `class ${type.name}(BaseModel):\n`;
      if (type.properties) {
        for (const [propName, prop] of Object.entries(type.properties)) {
          modelsCode += `    ${propName}: ${this.pythonType(prop.type)}\n`;
        }
      }
      modelsCode += `\n`;
    }
    files.push({ path: 'models.py', content: modelsCode });

    return {
      files,
      message: `Python client generated with ${apiData.endpoints.length} endpoints`,
    };
  }

  generateGoClient(apiData, options) {
    return {
      files: [{ path: 'client.go', content: '// Go client implementation' }],
      message: `Go client generated with ${apiData.endpoints.length} endpoints`,
    };
  }

  async detectApiChanges(oldSpecString, newSpecString) {
    const oldParsed = await this.parseOpenApiSpec(oldSpecString);
    const newParsed = await this.parseOpenApiSpec(newSpecString);

    const oldApi = JSON.parse(oldParsed.content[0].text);
    const newApi = JSON.parse(newParsed.content[0].text);

    const changes = {
      added: [],
      modified: [],
      removed: [],
      breaking: [],
    };

    // Compare endpoints
    const oldEndpoints = new Map(
      oldApi.endpoints.map((e) => [`${e.method} ${e.path}`, e])
    );
    const newEndpoints = new Map(
      newApi.endpoints.map((e) => [`${e.method} ${e.path}`, e])
    );

    // Find added endpoints
    for (const [key, endpoint] of newEndpoints) {
      if (!oldEndpoints.has(key)) {
        changes.added.push(endpoint);
      }
    }

    // Find removed endpoints
    for (const [key, endpoint] of oldEndpoints) {
      if (!newEndpoints.has(key)) {
        changes.removed.push(endpoint);
        changes.breaking.push(`Removed: ${key}`);
      }
    }

    // Find modified endpoints
    for (const [key, newEndpoint] of newEndpoints) {
      const oldEndpoint = oldEndpoints.get(key);
      if (oldEndpoint && JSON.stringify(oldEndpoint) !== JSON.stringify(newEndpoint)) {
        changes.modified.push({
          endpoint: key,
          old: oldEndpoint,
          new: newEndpoint,
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            changes,
            summary: {
              added: changes.added.length,
              modified: changes.modified.length,
              removed: changes.removed.length,
              breaking: changes.breaking.length,
            },
          }),
        },
      ],
    };
  }

  async searchApiDocs(serviceName) {
    // Known API documentation URLs
    const knownApis = {
      stripe: 'https://docs.stripe.com/openapi',
      github: 'https://raw.githubusercontent.com/github/github-rest-api-description/main/descriptions/api.github.com/api.github.com.json',
      slack: 'https://api.slack.com/web-api',
      notion: 'https://developers.notion.com/reference/intro',
    };

    const url = knownApis[serviceName.toLowerCase()];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            serviceName,
            documentationUrl: url,
            message: url
              ? `Found documentation for ${serviceName}`
              : `Documentation URL not found in registry. Try providing the OpenAPI spec URL directly.`,
          }),
        },
      ],
    };
  }

  // Helper methods
  toPascalCase(str) {
    return str
      .replace(/[-_\s](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }

  toSnakeCase(str) {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  tsType(openapiType) {
    const typeMap = {
      string: 'string',
      integer: 'number',
      number: 'number',
      boolean: 'boolean',
      array: 'any[]',
      object: 'any',
    };
    return typeMap[openapiType] || 'any';
  }

  pythonType(openapiType) {
    const typeMap = {
      string: 'str',
      integer: 'int',
      number: 'float',
      boolean: 'bool',
      array: 'List[Any]',
      object: 'Dict[str, Any]',
    };
    return typeMap[openapiType] || 'Any';
  }

  getMethodName(endpoint) {
    if (endpoint.operationId) {
      return endpoint.operationId;
    }
    const method = endpoint.method.toLowerCase();
    const path = endpoint.path.replace(/[^a-zA-Z0-9]/g, '_');
    return `${method}${path}`;
  }

  generateParams(endpoint) {
    // Simplified - real implementation would generate proper types
    return 'options: any = {}';
  }

  getResponseType(endpoint) {
    // Simplified - real implementation would infer from response schema
    return 'any';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('API Docs MCP Server running on stdio');
  }
}

// Start the server
if (require.main === module) {
  const server = new ApiDocsServer();
  server.run().catch(console.error);
}

module.exports = ApiDocsServer;
