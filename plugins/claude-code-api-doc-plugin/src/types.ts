/**
 * Type definitions for API Documentation Portal Generator Plugin
 */

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}

export interface PathItem {
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
}

export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: Array<Record<string, string[]>>;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema: unknown;
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, MediaType>;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

export interface MediaType {
  schema?: unknown;
  example?: unknown;
  examples?: Record<string, unknown>;
}

export interface CodeExample {
  language: string;
  code: string;
  description?: string;
}

export interface DocumentationConfig {
  outputPath: string;
  siteName: string;
  siteUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  colors?: {
    primary?: string;
    secondary?: string;
  };
  includeToc?: boolean;
  includeSearch?: boolean;
  languages?: string[];
  githubUrl?: string;
}

export interface SDKDocumentationConfig {
  sdkPath: string;
  language: string;
  outputPath: string;
  framework?: string;
  includeExamples?: boolean;
}

export interface ChangelogConfig {
  outputPath: string;
  versionsPath?: string;
  format?: 'markdown' | 'html';
  includeMigrationGuides?: boolean;
}

export interface GeneratorResult {
  success: boolean;
  outputPath: string;
  filesGenerated: string[];
  warnings?: string[];
  errors?: string[];
}
