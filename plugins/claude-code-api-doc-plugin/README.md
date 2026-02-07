# API Documentation Portal Generator Plugin

A comprehensive Claude Code plugin for generating API documentation portals with static sites, interactive explorers, code examples, SDK documentation, and changelogs.

## Features

- **Static Documentation Sites** - Generate beautiful HTML documentation from OpenAPI/Swagger specs
- **Interactive API Explorers** - Create Swagger UI-like interactive documentation with "Try it out" functionality
- **Code Examples** - Generate code examples in multiple programming languages
- **SDK Documentation** - Automatically generate documentation from SDK source code
- **Changelogs & Migration Guides** - Generate changelogs from git history and create migration guides

## Installation

```bash
npm install claude-code-api-doc-plugin
```

## Usage with Claude Code

This plugin integrates with Claude Code and provides the following tools:

### Generate API Documentation

Generate static HTML documentation from an OpenAPI/Swagger specification:

```typescript
import { generateAPIDocs } from 'claude-code-api-doc-plugin';

await generateAPIDocs(
  './path/to/openapi.yaml',
  {
    outputPath: './docs',
    siteName: 'My API Documentation',
    theme: 'light',
    includeToc: true,
    includeSearch: true
  }
);
```

### Create Interactive API Explorer

Generate an interactive API explorer with "Try it out" functionality:

```typescript
import { createAPIExplorer } from 'claude-code-api-doc-plugin';

await createAPIExplorer(
  './path/to/openapi.yaml',
  './explorer',
  {
    theme: 'dark',
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 1
  }
);
```

### Generate Code Examples

Generate code examples in multiple programming languages:

```typescript
import { generateCodeExamples } from 'claude-code-api-doc-plugin';

await generateCodeExamples(
  './path/to/openapi.yaml',
  './examples',
  ['javascript', 'python', 'java', 'curl']
);
```

### Generate SDK Documentation

Automatically generate documentation from SDK source code:

```typescript
import { generateSDKDocs } from 'claude-code-api-doc-plugin';

await generateSDKDocs({
  sdkPath: './path/to/sdk',
  language: 'typescript',
  outputPath: './sdk-docs',
  includeExamples: true
});
```

### Generate Changelog

Generate changelog and migration guides from git history:

```typescript
import { generateChangelog } from 'claude-code-api-doc-plugin';

await generateChangelog(
  {
    outputPath: './changelogs',
    format: 'markdown',
    includeMigrationGuides: true
  },
  true // use git history
);
```

## Configuration Options

### DocumentationConfig

```typescript
interface DocumentationConfig {
  outputPath: string;           // Output directory for generated documentation
  siteName: string;             // Name of the documentation site
  siteUrl?: string;             // Base URL of the site
  logoUrl?: string;             // URL to logo image
  faviconUrl?: string;          // URL to favicon
  theme?: 'light' | 'dark';     // Documentation theme
  colors?: {
    primary?: string;           // Primary color
    secondary?: string;         // Secondary color
  };
  includeToc?: boolean;         // Include table of contents
  includeSearch?: boolean;      // Include search functionality
  languages?: string[];         // Supported languages for code examples
  githubUrl?: string;           // GitHub repository URL
}
```

### APIExplorerOptions

```typescript
interface APIExplorerOptions {
  theme?: 'light' | 'dark';           // Explorer theme
  tryItOutEnabled?: boolean;          // Enable "Try it out" functionality
  defaultModelsExpandDepth?: number;  // Default expand depth for models
}
```

### SDKDocumentationConfig

```typescript
interface SDKDocumentationConfig {
  sdkPath: string;            // Path to SDK source code
  language: string;           // Programming language (typescript, python, java, etc.)
  outputPath: string;         // Output directory for documentation
  framework?: string;         // Framework name (optional)
  includeExamples?: boolean;  // Include code examples
}
```

### ChangelogConfig

```typescript
interface ChangelogConfig {
  outputPath: string;                // Output directory for changelog
  versionsPath?: string;             // Path to existing changelog
  format?: 'markdown' | 'html';      // Output format
  includeMigrationGuides?: boolean;  // Generate migration guides
}
```

## Supported Languages

### Code Examples
- JavaScript
- TypeScript
- Python
- Java
- C# (.NET)
- PHP
- Ruby
- Go
- cURL
- Node.js

### SDK Documentation
- TypeScript / JavaScript
- Python
- Java
- Go
- C# (.NET)
- PHP
- Ruby

## OpenAPI Support

This plugin supports both OpenAPI 3.x and Swagger 2.0 specifications in:
- JSON (.json)
- YAML (.yaml, .yml)

## Examples

See the `examples/` directory for complete examples:

- `examples/basic-docs/` - Basic documentation generation
- `examples/interactive-explorer/` - Interactive API explorer
- `examples/multi-language/` - Multi-language code examples
- `examples/sdk-documentation/` - SDK documentation generation
- `examples/changelog/` - Changelog generation

## Output Structure

### Static Documentation Site

```
docs/
├── index.html
├── users.html
├── products.html
└── assets/
    ├── styles.css
    └── main.js
```

### Code Examples

```
examples/
├── CODE_EXAMPLES.md
├── javascript_examples.md
├── python_examples.md
├── java_examples.md
└── examples.json
```

### SDK Documentation

```
sdk-docs/
├── index.html
├── apiclient.html
├── models.html
└── sdk-docs.css
```

## Plugin Tools

When installed in Claude Code, this plugin provides the following tools:

### `generate_api_docs`
Generate static API documentation site from OpenAPI/Swagger spec

### `create_api_explorer`
Create interactive API explorer UI

### `generate_code_examples`
Generate code examples in multiple languages

### `generate_sdk_docs`
Generate SDK documentation from code

### `generate_changelog`
Generate changelog and migration guides

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Test

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues, questions, or contributions, please visit the GitHub repository.

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/claude-code-api-doc-plugin
