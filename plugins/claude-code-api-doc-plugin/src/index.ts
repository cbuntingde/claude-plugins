/**
 * API Documentation Portal Generator Plugin for Claude Code
 *
 * This plugin provides comprehensive tools for generating API documentation including:
 * - Static documentation sites from OpenAPI/Swagger specs
 * - Interactive API explorers
 * - Code examples in multiple languages
 * - SDK documentation
 * - Changelogs and migration guides
 */

import { generateAPIDocs } from './generators/api-docs-generator.js';
import { createAPIExplorer } from './generators/api-explorer-generator.js';
import { generateCodeExamples } from './generators/code-example-generator.js';
import { generateSDKDocs } from './generators/sdk-doc-generator.js';
import { generateChangelog } from './generators/changelog-generator.js';

import type {
  DocumentationConfig,
  SDKDocumentationConfig,
  ChangelogConfig,
  GeneratorResult
} from './types.js';

export interface API DocumentationPlugin {
  /**
   * Generate static API documentation site from OpenAPI/Swagger specification
   *
   * @param openApiSpecPath - Path to OpenAPI/Swagger YAML or JSON file
   * @param config - Documentation generation configuration
   * @returns Generator result with output path and generated files
   */
  generateAPIDocs(
    openApiSpecPath: string,
    config: DocumentationConfig
  ): Promise<GeneratorResult>;

  /**
   * Create interactive API explorer UI (similar to Swagger UI)
   *
   * @param openApiSpecPath - Path to OpenAPI/Swagger YAML or JSON file
   * @param outputPath - Output directory for the explorer
   * @param options - Optional configuration for the explorer
   * @returns Generator result with output path and generated files
   */
  createAPIExplorer(
    openApiSpecPath: string,
    outputPath: string,
    options?: {
      theme?: 'light' | 'dark';
      tryItOutEnabled?: boolean;
      defaultModelsExpandDepth?: number;
    }
  ): Promise<GeneratorResult>;

  /**
   * Generate code examples in multiple languages for API endpoints
   *
   * @param openApiSpecPath - Path to OpenAPI/Swagger YAML or JSON file
   * @param outputPath - Output directory for code examples
   * @param languages - Array of languages to generate examples for
   * @returns Generator result with output path and generated files
   */
  generateCodeExamples(
    openApiSpecPath: string,
    outputPath: string,
    languages?: string[]
  ): Promise<GeneratorResult>;

  /**
   * Generate SDK documentation from source code
   *
   * @param config - SDK documentation configuration
   * @returns Generator result with output path and generated files
   */
  generateSDKDocs(
    config: SDKDocumentationConfig
  ): Promise<GeneratorResult>;

  /**
   * Generate changelog and migration guides
   *
   * @param config - Changelog generation configuration
   * @param gitHistory - Optional git history for automatic changelog generation
   * @returns Generator result with output path and generated files
   */
  generateChangelog(
    config: ChangelogConfig,
    gitHistory?: boolean
  ): Promise<GeneratorResult>;
}

/**
 * Plugin instance with all documentation generation tools
 */
export const apiDocumentationPlugin: API DocumentationPlugin = {
  generateAPIDocs,
  createAPIExplorer,
  generateCodeExamples,
  generateSDKDocs,
  generateChangelog
};

// Export types and generators for direct use
export * from './types.js';
export { generateAPIDocs } from './generators/api-docs-generator.js';
export { createAPIExplorer } from './generators/api-explorer-generator.js';
export { generateCodeExamples } from './generators/code-example-generator.js';
export { generateSDKDocs } from './generators/sdk-doc-generator.js';
export { generateChangelog } from './generators/changelog-generator.js';

// Plugin metadata
export const pluginInfo = {
  name: 'API Documentation Portal Generator',
  version: '1.0.0',
  description: 'Generate comprehensive API documentation sites with interactive explorers, code examples, SDK docs, and changelogs',
  capabilities: [
    'static_site_generation',
    'interactive_api_explorer',
    'code_example_generation',
    'sdk_documentation',
    'changelog_generation'
  ],
  tools: [
    {
      name: 'generate_api_docs',
      description: 'Generate static API documentation site from OpenAPI/Swagger spec'
    },
    {
      name: 'create_api_explorer',
      description: 'Create interactive API explorer UI'
    },
    {
      name: 'generate_code_examples',
      description: 'Generate code examples in multiple languages'
    },
    {
      name: 'generate_sdk_docs',
      description: 'Generate SDK documentation from code'
    },
    {
      name: 'generate_changelog',
      description: 'Generate changelog and migration guides'
    }
  ]
};

export default apiDocumentationPlugin;
