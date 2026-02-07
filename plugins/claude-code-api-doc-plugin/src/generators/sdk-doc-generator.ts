/**
 * SDK Documentation Generator
 * Generates documentation for SDKs from source code
 */

import fs from 'fs/promises';
import path from 'path';
import type { SDKDocumentationConfig, GeneratorResult } from '../types.js';

export async function generateSDKDocs(
  config: SDKDocumentationConfig
): Promise<GeneratorResult> {
  const filesGenerated: string[] = [];
  const warnings: string[] = [];

  try {
    // Create output directory
    await fs.mkdir(config.outputPath, { recursive: true });

    // Parse SDK source code
    const sdkStructure = await parseSDKStructure(config.sdkPath, config.language);

    // Generate documentation pages
    const pages = await generateDocumentationPages(sdkStructure, config);

    // Write each page
    for (const page of pages) {
      const pagePath = path.join(config.outputPath, page.filename);
      await fs.writeFile(pagePath, page.content, 'utf-8');
      filesGenerated.push(pagePath);
    }

    // Generate index
    const indexPath = path.join(config.outputPath, 'index.html');
    await fs.writeFile(indexPath, generateIndexPage(sdkStructure, config), 'utf-8');
    filesGenerated.push(indexPath);

    // Generate styles
    const cssPath = path.join(config.outputPath, 'sdk-docs.css');
    await fs.writeFile(cssPath, SDK_DOCS_CSS, 'utf-8');
    filesGenerated.push(cssPath);

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

interface SDKStructure {
  name: string;
  version: string;
  description: string;
  language: string;
  modules: SDKModule[];
  classes: SDKClass[];
  functions: SDKFunction[];
  interfaces?: SDKInterface[];
}

interface SDKModule {
  name: string;
  description: string;
  filePath: string;
  exports: string[];
}

interface SDKClass {
  name: string;
  description: string;
  filePath: string;
  extends?: string;
  implements?: string[];
  methods: SDKMethod[];
  properties: SDKProperty[];
  examples: string[];
}

interface SDKMethod {
  name: string;
  description: string;
  parameters: SDKParameter[];
  returnType: string;
  isAsync: boolean;
  isStatic: boolean;
  visibility: 'public' | 'private' | 'protected';
  examples: string[];
}

interface SDKProperty {
  name: string;
  type: string;
  description: string;
  isStatic: boolean;
  visibility: 'public' | 'private' | 'protected';
  readonly?: boolean;
}

interface SDKFunction {
  name: string;
  description: string;
  filePath: string;
  parameters: SDKParameter[];
  returnType: string;
  isAsync: boolean;
  examples: string[];
}

interface SDKInterface {
  name: string;
  description: string;
  filePath: string;
  extends?: string[];
  methods: SDKMethod[];
  properties: SDKProperty[];
}

interface SDKParameter {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  isOptional: boolean;
}

async function parseSDKStructure(
  sdkPath: string,
  language: string
): Promise<SDKStructure> {
  // In production, this would use proper parsers for each language
  // For now, return a mock structure based on file analysis

  const structure: SDKStructure = {
    name: path.basename(sdkPath),
    version: '1.0.0',
    description: 'SDK Documentation',
    language,
    modules: [],
    classes: [],
    functions: []
  };

  // Read package.json or similar
  const packageJsonPath = path.join(sdkPath, 'package.json');
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    structure.name = packageJson.name || structure.name;
    structure.version = packageJson.version || structure.version;
    structure.description = packageJson.description || structure.description;
  } catch {
    // Ignore if package.json doesn't exist
  }

  // Scan source files
  const sourceFiles = await scanSourceFiles(sdkPath, language);

  // Parse each file based on language
  for (const file of sourceFiles) {
    const content = await fs.readFile(file, 'utf-8');

    switch (language) {
      case 'typescript':
      case 'javascript':
        parseJavaScriptFile(content, file, structure);
        break;
      case 'python':
        parsePythonFile(content, file, structure);
        break;
      case 'java':
        parseJavaFile(content, file, structure);
        break;
      // Add more language parsers as needed
    }
  }

  return structure;
}

async function scanSourceFiles(
  sdkPath: string,
  language: string
): Promise<string[]> {
  const sourceFiles: string[] = const extensions: Record<string, string[]> = {
    typescript: ['.ts', '.tsx'],
    javascript: ['.js', '.jsx'],
    python: ['.py'],
    java: ['.java'],
    go: ['.go'],
    csharp: ['.cs'],
    php: ['.php'],
    ruby: ['.rb']
  };

  const exts = extensions[language] || extensions.javascript;

  async function scanDir(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other common exclusions
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await scanDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (exts.includes(ext)) {
          sourceFiles.push(fullPath);
        }
      }
    }
  }

  await scanDir(sdkPath);
  return sourceFiles;
}

function parseJavaScriptFile(
  content: string,
  filePath: string,
  structure: SDKStructure
): void {
  // Simple regex-based parsing for demonstration
  // In production, use TypeScript compiler API or Babel

  // Extract classes
  const classRegex = /export\s+(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w\s,]+))?\s*{([^}]*)}/gs;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const [, className, extendsClass, implementsClause, body] = match;

    const sdkClass: SDKClass = {
      name: className,
      description: extractComment(content, match.index),
      filePath,
      extends: extendsClass,
      implements: implementsClause?.split(',').map(s => s.trim()),
      methods: extractMethods(body),
      properties: extractProperties(body),
      examples: extractExamples(body)
    };

    structure.classes.push(sdkClass);
  }

  // Extract functions
  const functionRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?::\s*(\w+))?\s*{([^}]*)}/gs;

  while ((match = functionRegex.exec(content)) !== null) {
    const [, funcName, params, returnType, body] = match;

    const sdkFunction: SDKFunction = {
      name: funcName,
      description: extractComment(content, match.index),
      filePath,
      parameters: parseParameters(params),
      returnType: returnType || 'void',
      isAsync: content.substring(match.index - 100, match.index).includes('async'),
      examples: extractExamples(body)
    };

    structure.functions.push(sdkFunction);
  }
}

function parsePythonFile(
  content: string,
  filePath: string,
  structure: SDKStructure
): void {
  // Extract classes
  const classRegex = /class\s+(\w+)(?:\(([^)]*)\))?\s*:/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    const bases = match[2];

    // Find class body
    const classStart = match.index + match[0].length;
    const classEnd = findClassEnd(content, classStart);
    const classBody = content.substring(classStart, classEnd);

    const sdkClass: SDKClass = {
      name: className,
      description: extractPythonComment(content, match.index),
      filePath,
      extends: bases?.split(',')[0]?.trim(),
      methods: extractPythonMethods(classBody),
      properties: [],
      examples: extractPythonExamples(classBody)
    };

    structure.classes.push(sdkClass);
  }

  // Extract functions
  const functionRegex = /def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?\s*:/g;

  while ((match = functionRegex.exec(content)) !== null) {
    const funcName = match[1];
    const params = match[2];
    const returnType = match[3];

    const sdkFunction: SDKFunction = {
      name: funcName,
      description: extractPythonComment(content, match.index),
      filePath,
      parameters: parsePythonParameters(params),
      returnType: returnType || 'None',
      isAsync: content.substring(match.index - 50, match.index).includes('async'),
      examples: []
    };

    structure.functions.push(sdkFunction);
  }
}

function parseJavaFile(
  content: string,
  filePath: string,
  structure: SDKStructure
): void {
  // Extract classes
  const classRegex = /(?:public\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w\s,]+))?\s*{([^}]*(?:{[^}]*}[^}]*)*)}/gs;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const [, className, extendsClass, implementsClause, body] = match;

    const sdkClass: SDKClass = {
      name: className,
      description: extractJavaComment(content, match.index),
      filePath,
      extends: extendsClass,
      implements: implementsClause?.split(',').map(s => s.trim()),
      methods: extractJavaMethods(body),
      properties: extractJavaProperties(body),
      examples: []
    };

    structure.classes.push(sdkClass);
  }
}

function extractComment(content: string, index: number): string {
  // Look for JSDoc/JS Doc comments before the declaration
  const before = content.substring(Math.max(0, index - 500), index);
  const commentMatch = before.match(/\/\*\*([\s\S]*?)\*\//);
  return commentMatch
    ? commentMatch[1].replace(/^\s*\*\s?/gm, '').trim()
    : '';
}

function extractPythonComment(content: string, index: number): string {
  // Look for docstring after the declaration
  const after = content.substring(index, Math.min(content.length, index + 500));
  const docstringMatch = after.match(/("""[\s\S]*?"""|'''[\s\S]*?''')/);
  return docstringMatch
    ? docstringMatch[1].replace(/^"""|^'''|"""$|'''$/g, '').trim()
    : '';
}

function extractJavaComment(content: string, index: number): string {
  // Look for Javadoc comments before the declaration
  const before = content.substring(Math.max(0, index - 500), index);
  const commentMatch = before.match(/\/\*\*([\s\S]*?)\*\//);
  return commentMatch
    ? commentMatch[1].replace(/^\s*\*\s?/gm, '').trim()
    : '';
}

function extractMethods(body: string): SDKMethod[] {
  const methods: SDKMethod[] = [];
  const methodRegex = /(?:public|private|protected)?\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)(?::\s*(\w+))?\s*{/g;
  let match;

  while ((match = methodRegex.exec(body)) !== null) {
    methods.push({
      name: match[1],
      description: '',
      parameters: parseParameters(match[2]),
      returnType: match[3] || 'void',
      isAsync: false,
      isStatic: false,
      visibility: 'public',
      examples: []
    });
  }

  return methods;
}

function extractProperties(body: string): SDKProperty[] {
  const properties: SDKProperty[] = [];
  const propRegex = /(?:public|private|protected)?\s*(?:readonly\s+)?(\w+)\s*:\s*(\w+)\s*(?:=.*)?;/g;
  let match;

  while ((match = propRegex.exec(body)) !== null) {
    properties.push({
      name: match[1],
      type: match[2],
      description: '',
      isStatic: false,
      visibility: 'public'
    });
  }

  return properties;
}

function extractExamples(body: string): string[] {
  const examples: string[] = [];
  const exampleRegex = /@example\s+([\s\S]*?)(?=@\w+|\*\/)/g;
  let match;

  while ((match = exampleRegex.exec(body)) !== null) {
    examples.push(match[1].trim());
  }

  return examples;
}

function extractPythonMethods(body: string): SDKMethod[] {
  const methods: SDKMethod[] = [];
  const methodRegex = /def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?\s*:/g;
  let match;

  while ((match = methodRegex.exec(body)) !== null) {
    methods.push({
      name: match[1],
      description: extractPythonComment(body, match.index),
      parameters: parsePythonParameters(match[2]),
      returnType: match[3] || 'None',
      isAsync: false,
      isStatic: match[1] === '__init__',
      visibility: 'public',
      examples: []
    });
  }

  return methods;
}

function extractPythonExamples(body: string): string[] {
  const examples: string[] = [];
  // Simple extraction - look for Example: or Examples: in docstrings
  const exampleRegex = /(?:Example|Examples):\s*\n([\s\S]*?)(?=\n\n|\n\s{0,2}\n|\n\s{0,2}[A-Z]|\Z)/g;
  let match;

  while ((match = exampleRegex.exec(body)) !== null) {
    examples.push(match[1].trim());
  }

  return examples;
}

function extractJavaMethods(body: string): SDKMethod[] {
  const methods: SDKMethod[] = [];
  const methodRegex = /(?:public|private|protected)\s+(?:static\s+)?(?:\w+)\s+(\w+)\s*\(([^)]*)\)(?:\s+throws\s+[\w\s,]+)?\s*{/g;
  let match;

  while ((match = methodRegex.exec(body)) !== null) {
    methods.push({
      name: match[1],
      description: '',
      parameters: parseJavaParameters(match[2]),
      returnType: 'Object',
      isAsync: false,
      isStatic: false,
      visibility: 'public',
      examples: []
    });
  }

  return methods;
}

function extractJavaProperties(body: string): SDKProperty[] {
  const properties: SDKProperty[] = [];
  const propRegex = /(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(\w+)\s+(\w+)\s*(?:=.*)?;/g;
  let match;

  while ((match = propRegex.exec(body)) !== null) {
    properties.push({
      name: match[2],
      type: match[1],
      description: '',
      isStatic: false,
      visibility: 'public'
    });
  }

  return properties;
}

function findClassEnd(content: string, startIndex: number): number {
  let braceCount = 0;
  let foundFirstBrace = false;

  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === ':') {
      foundFirstBrace = true;
      continue;
    }

    if (foundFirstBrace) {
      const line = content.substring(startIndex, i).split('\n').slice(0, -1);
      let minIndent = Infinity;
      for (const l of line) {
        const indent = l.search(/\S/);
        if (indent >= 0 && indent < minIndent) {
          minIndent = indent;
        }
      }

      // Check if next line has less or equal indentation
      if (i < content.length - 1) {
        const nextLineStart = content.indexOf('\n', i) + 1;
        const nextLine = content.substring(nextLineStart, nextLineStart + 100);
        const nextIndent = nextLine.search(/\S/);

        if (nextIndent <= minIndent) {
          return i;
        }
      }
    }
  }

  return content.length;
}

function parseParameters(params: string): SDKParameter[] {
  if (!params.trim()) return [];

  return params.split(',').map(param => {
    const [namePart, ...defaultParts] = param.split('=');
    const [type, name] = namePart.trim().split(':').map(s => s.trim());

    return {
      name: name || type || 'unknown',
      type: type || 'any',
      description: '',
      defaultValue: defaultParts.join('=').trim(),
      isOptional: param.includes('?') || !!defaultParts.length
    };
  });
}

function parsePythonParameters(params: string): SDKParameter[] {
  if (!params.trim()) return [];

  return params.split(',').map(param => {
    const parts = param.trim().split(':');
    const name = parts[0].trim();
    const type = parts[1]?.trim() || 'Any';

    return {
      name,
      type,
      description: '',
      isOptional: name.startsWith('*') || param.includes('=')
    };
  });
}

function parseJavaParameters(params: string): SDKParameter[] {
  if (!params.trim()) return [];

  return params.split(',').map(param => {
    const [type, name] = param.trim().split(/\s+/);
    return {
      name: name || 'unknown',
      type: type || 'Object',
      description: '',
      isOptional: false
    };
  });
}

interface DocumentationPage {
  filename: string;
  content: string;
}

async function generateDocumentationPages(
  structure: SDKStructure,
  config: SDKDocumentationConfig
): Promise<DocumentationPage[]> {
  const pages: DocumentationPage[] = [];

  // Generate pages for each class
  for (const sdkClass of structure.classes) {
    pages.push({
      filename: `${sdkClass.name.toLowerCase()}.html`,
      content: generateClassPage(sdkClass, structure)
    });
  }

  // Generate pages for functions
  if (structure.functions.length > 0) {
    pages.push({
      filename: 'functions.html',
      content: generateFunctionsPage(structure)
    });
  }

  return pages;
}

function generateIndexPage(structure: SDKStructure, config: SDKDocumentationConfig): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${structure.name} - SDK Documentation</title>
  <link rel="stylesheet" href="sdk-docs.css">
</head>
<body>
  <header>
    <h1>${structure.name}</h1>
    <p class="version">v${structure.version}</p>
    <p class="description">${structure.description}</p>
  </header>

  <nav>
    <ul>
      <li><a href="#classes">Classes</a></li>
      ${structure.functions.length > 0 ? '<li><a href="#functions">Functions</a></li>' : ''}
    </ul>
  </nav>

  <main>
    <section id="classes">
      <h2>Classes</h2>
      <ul>
        ${structure.classes.map(c => `
          <li>
            <a href="${c.name.toLowerCase()}.html">${c.name}</a>
            <p>${c.description}</p>
          </li>
        `).join('')}
      </ul>
    </section>

    ${structure.functions.length > 0 ? `
    <section id="functions">
      <h2>Functions</h2>
      <ul>
        ${structure.functions.map(f => `
          <li>
            <code>${f.name}()</code>
            <p>${f.description}</p>
          </li>
        `).join('')}
      </ul>
    </section>
    ` : ''}
  </main>
</body>
</html>`;

  return html;
}

function generateClassPage(sdkClass: SDKClass, structure: SDKStructure): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sdkClass.name} - ${structure.name} SDK</title>
  <link rel="stylesheet" href="sdk-docs.css">
</head>
<body>
  <header>
    <a href="index.html">← Back to Index</a>
    <h1>${sdkClass.name}</h1>
    <p class="description">${sdkClass.description}</p>
    ${sdkClass.extends ? `<p class="extends">Extends: <code>${sdkClass.extends}</code></p>` : ''}
    ${sdkClass.implements ? `<p class="implements">Implements: ${sdkClass.implements.map(i => `<code>${i}</code>`).join(', ')}</p>` : ''}
  </header>

  <main>
    ${sdkClass.properties.length > 0 ? `
    <section class="properties">
      <h2>Properties</h2>
      ${sdkClass.properties.map(prop => `
        <div class="property">
          <h3><code>${prop.name}${prop.readonly ? ' (readonly)' : ''}</code>: ${prop.type}</h3>
          <p>${prop.description}</p>
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${sdkClass.methods.length > 0 ? `
    <section class="methods">
      <h2>Methods</h2>
      ${sdkClass.methods.map(method => `
        <div class="method">
          <h3><code>${method.name}(${method.parameters.map(p => p.name).join(', ')})</code>: ${method.returnType}</h3>
          <p>${method.description}</p>
          ${method.parameters.length > 0 ? `
          <h4>Parameters</h4>
          <ul>
            ${method.parameters.map(p => `
              <li><code>${p.name}</code>: ${p.type}${p.isOptional ? ' (optional)' : ''}</li>
            `).join('')}
          </ul>
          ` : ''}
        </div>
      `).join('')}
    </section>
    ` : ''}
  </main>
</body>
</html>`;

  return html;
}

function generateFunctionsPage(structure: SDKStructure): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Functions - ${structure.name} SDK</title>
  <link rel="stylesheet" href="sdk-docs.css">
</head>
<body>
  <header>
    <a href="index.html">← Back to Index</a>
    <h1>Functions</h1>
  </header>

  <main>
    ${structure.functions.map(func => `
      <div class="function">
        <h2><code>${func.name}(${func.parameters.map(p => p.name).join(', ')})</code>: ${func.returnType}</h2>
        <p>${func.description}</p>
        ${func.parameters.length > 0 ? `
        <h3>Parameters</h3>
        <ul>
          ${func.parameters.map(p => `
            <li><code>${p.name}</code>: ${p.type}${p.isOptional ? ' (optional)' : ''} - ${p.description}</li>
          `).join('')}
        </ul>
        ` : ''}
        ${func.examples.length > 0 ? `
        <h3>Examples</h3>
        ${func.examples.map(ex => `<pre><code>${ex}</code></pre>`).join('')}
        ` : ''}
      </div>
    `).join('')}
  </main>
</body>
</html>`;

  return html;
}

const SDK_DOCS_CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
}

header {
  background: #0066cc;
  color: white;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

header h1 {
  margin-bottom: 0.5rem;
}

header a {
  color: white;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 1rem;
}

nav {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #dee2e6;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 2rem;
}

nav a {
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
}

main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

h2 {
  color: #0066cc;
  margin-bottom: 1rem;
}

h3 {
  margin-bottom: 0.5rem;
}

code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

pre code {
  background: none;
  padding: 0;
}

.property,
.method,
.function {
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem 0;
}

.property:last-child,
.method:last-child,
.function:last-child {
  border-bottom: none;
}

ul {
  list-style-position: inside;
}
`;
