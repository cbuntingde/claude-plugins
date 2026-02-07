/**
 * Diagram Generator Plugin
 * Generates architectural diagrams (Mermaid, PlantUML, DOT) from codebase analysis.
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const name = 'diagram-generator';
export const version = '1.0.0';
export const commands = {
  'architecture': './scripts/architecture.js',
  'dot': './scripts/dot.js',
  'mermaid': './scripts/mermaid.js',
  'plantuml': './scripts/plantuml.js'
};

/**
 * Analyzes project structure and returns component information.
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Object>} Project structure analysis
 */
export async function analyzeProjectStructure(projectRoot) {
  const patterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py', '**/*.go'];
  const files = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: projectRoot, ignore: ['node_modules/**', '.git/**'] });
    files.push(...matches);
  }

  const components = new Map();
  const dependencies = new Map();
  const imports = [];

  for (const file of files) {
    const content = readFileSync(join(projectRoot, file), 'utf-8');
    const componentName = identifyComponent(file, content);

    if (!components.has(componentName)) {
      components.set(componentName, {
        name: componentName,
        files: [],
        type: inferComponentType(content),
        path: file
      });
    }
    components.get(componentName).files.push(file);

    const fileImports = extractImports(content);
    for (const imp of fileImports) {
      imports.push({ from: file, to: imp });
      if (!dependencies.has(imp)) {
        dependencies.set(imp, new Set());
      }
      dependencies.get(imp).add(componentName);
    }
  }

  return { components: Object.fromEntries(components), dependencies: Object.fromEntries(dependencies), imports };
}

/**
 * Identifies the component name from a file path.
 * @param {string} file - File path
 * @param {string} content - File content
 * @returns {string} Component name
 */
function identifyComponent(file, content) {
  const baseName = file.replace(/\.(js|ts|jsx|tsx|py|go)$/, '');

  const patterns = [
    { regex: /controllers?[_\/]/i, type: 'controller' },
    { regex: /services?[_\/]/i, type: 'service' },
    { regex: /models?[_\/]|entities?[_\/]/i, type: 'model' },
    { regex: /views?[_\/]|templates?[_\/]/i, type: 'view' },
    { regex: /utils?[_\/]|helpers?[_\/]/i, type: 'utility' },
    { regex: /middleware[s]?[_\/]/i, type: 'middleware' },
    { regex: /routes?[_\/]/i, type: 'router' },
    { regex: /repositories?[_\/]|daos?[_\/]/i, type: 'repository' },
    { regex: /config[s]?[_\/]/i, type: 'config' },
    { regex: /api[s]?[_\/]/i, type: 'api' }
  ];

  for (const { regex, type } of patterns) {
    if (regex.test(file)) {
      const match = file.match(regex);
      const parts = file.substring(match.index).split('/');
      return `${type.charAt(0).toUpperCase() + type.slice(1)}/${parts[0]}`;
    }
  }

  return baseName.split('/').pop();
}

/**
 * Infers the component type from file content.
 * @param {string} content - File content
 * @returns {string} Component type
 */
function inferComponentType(content) {
  const hasClass = /\b(class|interface|struct|type)\s+\w+\s+(extends|implements|:)/.test(content);
  const hasFunction = /\b(function|def|func)\s+\w+/.test(content);
  const hasImport = /require\s*\(/.test(content) || /import\s+/.test(content);

  if (hasClass) return 'class';
  if (hasFunction) return 'function';
  if (hasImport) return 'module';
  return 'file';
}

/**
 * Extracts import statements from file content.
 * @param {string} content - File content
 * @returns {string[]} List of imported modules
 */
function extractImports(content) {
  const imports = [];

  const patterns = [
    /import\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /from\s+['"]([^'"]+)['"]\s+import/g,
    /import\s+['"]([^'"]+)['"]/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const imp = match[1];
      if (!imp.startsWith('.') && !imp.startsWith('/')) {
        imports.push(imp.split('/')[0]);
      }
    }
  }

  return imports;
}