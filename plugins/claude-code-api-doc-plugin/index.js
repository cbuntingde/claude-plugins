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

import { generateAPIDocs } from './src/generators/api-docs-generator.js';
import { createAPIExplorer } from './src/generators/api-explorer-generator.js';
import { generateCodeExamples } from './src/generators/code-example-generator.js';
import { generateSDKDocs } from './src/generators/sdk-doc-generator.js';
import { generateChangelog } from './src/generators/changelog-generator.js';

import type {
  DocumentationConfig,
  SDKDocumentationConfig,
  ChangelogConfig,
  GeneratorResult
} from './src/types.js';

export interface APIDocumentationPlugin {
  generateAPIDocs(
    openApiSpecPath: string,
    config: DocumentationConfig
  ): Promise<GeneratorResult>;

  createAPIExplorer(
    openApiSpecPath: string,
    outputPath: string,
    options?: {
      theme?: 'light' | 'dark';
      tryItOutEnabled?: boolean;
      defaultModelsExpandDepth?: number;
    }
  ): Promise<GeneratorResult>;

  generateCodeExamples(
    openApiSpecPath: string,
    outputPath: string,
    languages?: string[]
  ): Promise<GeneratorResult>;

  generateSDKDocs(
    config: SDKDocumentationConfig
  ): Promise<GeneratorResult>;

  generateChangelog(
    config: ChangelogConfig,
    gitHistory?: boolean
  ): Promise<GeneratorResult>;
}

export const apiDocumentationPlugin: APIDocumentationPlugin = {
  generateAPIDocs,
  createAPIExplorer,
  generateCodeExamples,
  generateSDKDocs,
  generateChangelog
};

export * from './src/types.js';
export { generateAPIDocs } from './src/generators/api-docs-generator.js';
export { createAPIExplorer } from './src/generators/api-explorer-generator.js';
export { generateCodeExamples } from './src/generators/code-example-generator.js';
export { generateSDKDocs } from './src/generators/sdk-doc-generator.js';
export { generateChangelog } from './src/generators/changelog-generator.js';

export const name = 'claude-code-api-doc-plugin';
export const version = '1.0.0';

export default apiDocumentationPlugin;