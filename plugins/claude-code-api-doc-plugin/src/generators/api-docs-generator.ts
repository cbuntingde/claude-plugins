/**
 * Static API Documentation Site Generator
 * Generates static HTML documentation from OpenAPI/Swagger specifications
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import MarkdownIt from 'markdown-it';
import Handlebars from 'handlebars';
import type { OpenAPISpec, DocumentationConfig, GeneratorResult } from '../types.js';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

export async function generateAPIDocs(
  openApiSpecPath: string,
  config: DocumentationConfig
): Promise<GeneratorResult> {
  const filesGenerated: string[] = [];
  const warnings: string[] = [];

  try {
    // Parse OpenAPI spec
    const spec = await parseOpenAPISpec(openApiSpecPath);

    // Create output directory
    await fs.mkdir(config.outputPath, { recursive: true });

    // Generate HTML pages
    const pages = await generateDocumentationPages(spec, config);

    // Write each page
    for (const page of pages) {
      const pagePath = path.join(config.outputPath, page.filename);
      await fs.writeFile(pagePath, page.content, 'utf-8');
      filesGenerated.push(pagePath);
    }

    // Copy assets (CSS, JS, images)
    await copyAssets(config.outputPath, filesGenerated);

    // Generate index
    const indexPath = path.join(config.outputPath, 'index.html');
    await fs.writeFile(indexPath, pages[0].content, 'utf-8');
    if (!filesGenerated.includes(indexPath)) {
      filesGenerated.push(indexPath);
    }

    return {
      success: true,
      outputPath: config.outputPath,
      filesGenerated,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      success: false,
      outputPath: config.outputPath,
      filesGenerated,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

async function parseOpenAPISpec(specPath: string): Promise<OpenAPISpec> {
  const content = await fs.readFile(specPath, 'utf-8');
  const ext = path.extname(specPath).toLowerCase();

  if (ext === '.yaml' || ext === '.yml') {
    return YAML.parse(content) as OpenAPISpec;
  } else if (ext === '.json') {
    return JSON.parse(content) as OpenAPISpec;
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .json, .yaml, or .yml`);
  }
}

interface DocumentationPage {
  filename: string;
  title: string;
  content: string;
}

async function generateDocumentationPages(
  spec: OpenAPISpec,
  config: DocumentationConfig
): Promise<DocumentationPage[]> {
  const pages: DocumentationPage[] = [];

  // Main index page
  pages.push({
    filename: 'index.html',
    title: spec.info.title,
    content: generateIndexPage(spec, config)
  });

  // Generate pages for each tag/category
  const tags = spec.tags || [];
  for (const tag of tags) {
    const tagOperations = getOperationsByTag(spec, tag.name);
    if (tagOperations.length > 0) {
      pages.push({
        filename: `${slugify(tag.name)}.html`,
        title: `${tag.name} - ${spec.info.title}`,
        content: generateTagPage(spec, tag.name, tagOperations, config)
      });
    }
  }

  // Generate pages for untagged operations
  const untaggedOperations = getUntaggedOperations(spec);
  if (untaggedOperations.length > 0) {
    pages.push({
      filename: 'other.html',
      title: `Other - ${spec.info.title}`,
      content: generateTagPage(spec, 'Other', untaggedOperations, config)
    });
  }

  return pages;
}

function generateIndexPage(spec: OpenAPISpec, config: DocumentationConfig): string {
  const template = Handlebars.compile(INDEX_TEMPLATE);
  return template({
    siteName: config.siteName,
    title: spec.info.title,
    version: spec.info.version,
    description: spec.info.description ? md.render(spec.info.description) : '',
    baseUrl: spec.servers?.[0]?.url || '',
    contact: spec.info.contact,
    license: spec.info.license,
    tags: spec.tags || [],
    paths: Object.keys(spec.paths),
    logoUrl: config.logoUrl,
    theme: config.theme || 'light',
    colors: config.colors
  });
}

function generateTagPage(
  spec: OpenAPISpec,
  tagName: string,
  operations: Array<{
    path: string;
    method: string;
    operation: any;
  }>,
  config: DocumentationConfig
): string {
  const template = Handlebars.compile(TAG_PAGE_TEMPLATE);

  const processedOperations = operations.map(({ path, method, operation }) => ({
    path,
    method: method.toUpperCase(),
    summary: operation.summary || operation.operationId || `${method} ${path}`,
    description: operation.description ? md.render(operation.description) : '',
    parameters: operation.parameters || [],
    requestBody: operation.requestBody,
    responses: operation.responses,
    operationId: operation.operationId
  }));

  return template({
    siteName: config.siteName,
    title: spec.info.title,
    tag: tagName,
    operations: processedOperations,
    theme: config.theme || 'light',
    colors: config.colors
  });
}

function getOperationsByTag(
  spec: OpenAPISpec,
  tagName: string
): Array<{ path: string; method: string; operation: any }> {
  const operations: Array<{ path: string; method: string; operation: any }> = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === 'get' || method === 'post' || method === 'put' ||
          method === 'delete' || method === 'patch') {
        const op = operation as any;
        if (op.tags?.includes(tagName)) {
          operations.push({ path, method, operation: op });
        }
      }
    }
  }

  return operations;
}

function getUntaggedOperations(
  spec: OpenAPISpec
): Array<{ path: string; method: string; operation: any }> {
  const operations: Array<{ path: string; method: string; operation: any }> = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === 'get' || method === 'post' || method === 'put' ||
          method === 'delete' || method === 'patch') {
        const op = operation as any;
        if (!op.tags || op.tags.length === 0) {
          operations.push({ path, method, operation: op });
        }
      }
    }
  }

  return operations;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function copyAssets(outputPath: string, filesGenerated: string[]): Promise<void> {
  const assetsPath = path.join(outputPath, 'assets');
  await fs.mkdir(assetsPath, { recursive: true });

  // Write CSS
  const cssPath = path.join(assetsPath, 'styles.css');
  await fs.writeFile(cssPath, STYLES_CSS, 'utf-8');
  filesGenerated.push(cssPath);

  // Write JS
  const jsPath = path.join(assetsPath, 'main.js');
  await fs.writeFile(jsPath, MAIN_JS, 'utf-8');
  filesGenerated.push(jsPath);
}

// HTML Templates
const INDEX_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" data-theme="{{theme}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - {{siteName}}</title>
  <link rel="stylesheet" href="assets/styles.css">
  {{#if logoUrl}}
  <link rel="icon" href="{{logoUrl}}">
  {{/if}}
</head>
<body>
  <header class="header">
    <div class="container">
      {{#if logoUrl}}
      <img src="{{logoUrl}}" alt="{{siteName}}" class="logo">
      {{/if}}
      <h1>{{title}}</h1>
      <p class="version">v{{version}}</p>
    </div>
  </header>

  <nav class="nav">
    <div class="container">
      <ul>
        <li><a href="index.html">Overview</a></li>
        {{#each tags}}
        <li><a href="{{slugify this.name}}.html">{{this.name}}</a></li>
        {{/each}}
      </ul>
    </div>
  </nav>

  <main class="main">
    <div class="container">
      <section class="description">
        {{{description}}}
      </section>

      {{#if contact}}
      <section class="contact">
        <h2>Contact</h2>
        <p>{{contact.name}}{{#if contact.email}} ({{contact.email}}){{/if}}</p>
      </section>
      {{/if}}

      {{#if license}}
      <section class="license">
        <h2>License</h2>
        <p>{{license.name}}</p>
      </section>
      {{/if}}

      <section class="endpoints">
        <h2>API Endpoints</h2>
        {{#each tags}}
        <h3>{{this.name}}</h3>
        <p>{{this.description}}</p>
        {{/each}}
      </section>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <p>Generated by API Documentation Portal Generator</p>
    </div>
  </footer>

  <script src="assets/main.js"></script>
</body>
</html>
`;

const TAG_PAGE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" data-theme="{{theme}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - {{tag}}</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>{{tag}}</h1>
    </div>
  </header>

  <nav class="nav">
    <div class="container">
      <ul>
        <li><a href="index.html">← Back to Overview</a></li>
      </ul>
    </div>
  </nav>

  <main class="main">
    <div class="container">
      {{#each operations}}
      <section class="endpoint {{method}}">
        <h2 class="method {{method}}">{{method}} {{path}}</h2>
        <h3>{{summary}}</h3>
        {{{description}}}

        {{#if parameters}}
        <h4>Parameters</h4>
        <table class="parameters">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>In</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {{#each parameters}}
            <tr>
              <td><code>{{name}}</code></td>
              <td><code>{{lookup this.schema "type"}}</code></td>
              <td>{{in}}</td>
              <td>{{#if required}}Yes{{else}}No{{/if}}</td>
              <td>{{description}}</td>
            </tr>
          {{/each}}
          </tbody>
        </table>
        {{/if}}

        {{#if requestBody}}
        <h4>Request Body</h4>
        <p>{{requestBody.description}}</p>
        {{/if}}

        {{#if responses}}
        <h4>Responses</h4>
        {{#each responses}}
        <div class="response">
          <h5>{{@key}} - {{this.description}}</h5>
        </div>
        {{/each}}
        {{/if}}
      </section>
      {{/each}}
    </div>
  </main>

  <script src="assets/main.js"></script>
</body>
</html>
`;

const STYLES_CSS = `
:root {
  --color-primary: #0066cc;
  --color-secondary: #6c757d;
  --color-bg: #ffffff;
  --color-text: #333333;
  --color-border: #dee2e6;
  --color-code-bg: #f5f5f5;
  --spacing-unit: 1rem;
}

[data-theme="dark"] {
  --color-primary: #4d9fff;
  --color-bg: #1a1a1a;
  --color-text: #e0e0e0;
  --color-border: #444;
  --color-code-bg: #2d2d2d;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-unit);
}

.header {
  background: var(--color-primary);
  color: white;
  padding: 2rem 0;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.version {
  font-size: 1rem;
  opacity: 0.9;
}

.nav {
  background: var(--color-code-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
}

.nav ul {
  list-style: none;
  display: flex;
  gap: 2rem;
}

.nav a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.nav a:hover {
  text-decoration: underline;
}

.main {
  padding: 2rem 0;
  min-height: calc(100vh - 300px);
}

.endpoint {
  background: var(--color-code-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.method {
  font-family: monospace;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.method.GET { color: #28a745; }
.method.POST { color: #007bff; }
.method.PUT { color: #ffc107; }
.method.DELETE { color: #dc3545; }
.method.PATCH { color: #17a2b8; }

.parameters {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.parameters th,
.parameters td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.parameters th {
  background: var(--color-bg);
  font-weight: 600;
}

code {
  background: var(--color-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.footer {
  background: var(--color-code-bg);
  border-top: 1px solid var(--color-border);
  padding: 2rem 0;
  text-align: center;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.8rem;
  }

  .nav ul {
    flex-direction: column;
    gap: 1rem;
  }

  .endpoint {
    padding: 1rem;
  }
}
`;

const MAIN_JS = `
// Theme toggle
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

// Initialize
loadTheme();
`;
