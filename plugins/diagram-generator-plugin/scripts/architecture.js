#!/usr/bin/env node

/**
 * Architecture Diagram Generator
 * Generates system architecture diagrams from codebase analysis.
 */

import { analyzeProjectStructure } from '../index.js';
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_OUTPUT_DIR = process.env.DIAGRAM_OUTPUT_DIR || './docs/diagrams';
const DEFAULT_FORMAT = process.env.DIAGRAM_DEFAULT_FORMAT || 'mermaid';

/**
 * Generates an architecture diagram from project analysis.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated diagram content
 */
export async function generateArchitectureDiagram(options = {}) {
  const format = options.format || DEFAULT_FORMAT;
  const projectRoot = options.projectRoot || process.cwd();
  const outputPath = options.output;

  const analysis = await analyzeProjectStructure(projectRoot);
  let diagramContent;

  switch (format.toLowerCase()) {
    case 'mermaid':
      diagramContent = generateMermaidArchitecture(analysis);
      break;
    case 'plantuml':
      diagramContent = generatePlantUMLArchitecture(analysis);
      break;
    case 'dot':
      diagramContent = generateDotArchitecture(analysis);
      break;
    default:
      throw new Error(`Unsupported format: ${format}. Use mermaid, plantuml, or dot.`);
  }

  if (outputPath) {
    const { mkdir } = await import('fs/promises');
    await mkdir(dirname(outputPath) || DEFAULT_OUTPUT_DIR, { recursive: true });
    writeFileSync(outputPath, diagramContent);
  }

  return diagramContent;
}

/**
 * Generates a Mermaid architecture diagram.
 * @param {Object} analysis - Project analysis data
 * @returns {string} Mermaid diagram content
 */
function generateMermaidArchitecture(analysis) {
  const { components, dependencies } = analysis;
  const componentList = Object.values(components);

  let diagram = '```mermaid\n';
  diagram += 'graph TB\n';

  const styleMap = {
    controller: 'fill:#e1f5fe,stroke:#01579b',
    service: 'fill:#f3e5f5,stroke:#4a148c',
    model: 'fill:#e8f5e9,stroke:#1b5e20',
    view: 'fill:#fff3e0,stroke:#e65100',
    utility: 'fill:#fafafa,stroke:#212121',
    middleware: 'fill:#fce4ec,stroke:#880e4f',
    router: 'fill:#e0f7fa,stroke:#006064',
    repository: 'fill:#efebe9,stroke:#3e2723',
    config: 'fill:#fffde7,stroke:#f57f17',
    api: 'fill:#ede7f6,stroke:#4527a0'
  };

  for (const component of componentList) {
    const componentId = component.name.replace(/[^a-zA-Z0-9]/g, '_');
    const style = styleMap[component.type] || 'fill:#f5f5f5,stroke:#666';
    diagram += `    ${componentId}["${component.name}"]\n`;
    diagram += `    style ${componentId} ${style}\n`;
  }

  const writtenDependencies = new Set();
  for (const [target, sources] of Object.entries(dependencies)) {
    const targetId = target.replace(/[^a-zA-Z0-9]/g, '_');
    for (const source of sources) {
      const sourceId = source.replace(/[^a-zA-Z0-9]/g, '_');
      const depKey = `${sourceId}->${targetId}`;
      if (!writtenDependencies.has(depKey)) {
        diagram += `    ${sourceId} --> ${targetId}\n`;
        writtenDependencies.add(depKey);
      }
    }
  }

  diagram += '```\n';

  return diagram;
}

/**
 * Generates a PlantUML architecture diagram.
 * @param {Object} analysis - Project analysis data
 * @returns {string} PlantUML diagram content
 */
function generatePlantUMLArchitecture(analysis) {
  const { components, dependencies } = analysis;
  const componentList = Object.values(components);

  let diagram = '@startuml\n';
  diagram += 'skinparam rectangle {\n';
  diagram += '  BackgroundColor White\n';
  diagram += '  BorderColor Black\n';
  diagram += '}\n\n';

  const colorMap = {
    controller: '#e1f5fe/#01579b',
    service: '#f3e5f5/#4a148c',
    model: '#e8f5e9/#1b5e20',
    view: '#fff3e0/#e65100',
    utility: '#fafafa/#212121',
    middleware: '#fce4ec/#880e4f',
    router: '#e0f7fa/#006064',
    repository: '#efebe9/#3e2723',
    config: '#fffde7/#f57f17',
    api: '#ede7f6/#4527a0'
  };

  for (const component of componentList) {
    const color = colorMap[component.type] || '#f5f5f5/#666666';
    diagram += `rectangle "${component.name}" <<${component.type}>> #${color} {\n`;
    diagram += '}\n\n';
  }

  for (const [target, sources] of Object.entries(dependencies)) {
    for (const source of sources) {
      diagram += `"${source}" --> "${target}"\n`;
    }
  }

  diagram += '@enduml\n';

  return diagram;
}

/**
 * Generates a DOT architecture diagram.
 * @param {Object} analysis - Project analysis data
 * @returns {string} DOT diagram content
 */
function generateDotArchitecture(analysis) {
  const { components, dependencies } = analysis;
  const componentList = Object.values(components);

  let diagram = 'digraph architecture {\n';
  diagram += '  rankdir=TB;\n';
  diagram += '  node [shape=box, style="rounded,filled", fontname="Arial"];\n';
  diagram += '  edge [arrowhead=normal];\n\n';

  const shapeMap = {
    controller: 'box',
    service: 'ellipse',
    model: 'cylinder',
    view: 'folder',
    utility: 'component',
    middleware: 'diamond',
    router: 'parallelogram',
    repository: 'datastore',
    config: 'tab',
    api: 'note'
  };

  const colorMap = {
    controller: '#e1f5fe',
    service: '#f3e5f5',
    model: '#e8f5e9',
    view: '#fff3e0',
    utility: '#fafafa',
    middleware: '#fce4ec',
    router: '#e0f7fa',
    repository: '#efebe9',
    config: '#fffde7',
    api: '#ede7f6'
  };

  for (const component of componentList) {
    const shape = shapeMap[component.type] || 'box';
    const color = colorMap[component.type] || '#f5f5f5';
    const label = component.name.replace(/"/g, '\\"');
    diagram += `  "${component.name}" [shape=${shape}, fillcolor="${color}", label="${label}"];\n`;
  }

  for (const [target, sources] of Object.entries(dependencies)) {
    for (const source of sources) {
      diagram += `  "${source}" -> "${target}";\n`;
    }
  }

  diagram += '}\n';

  return diagram;
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {
    format: args.find(arg => arg.startsWith('--format='))?.split('=')[1],
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    projectRoot: args.find(arg => arg.startsWith('--project-root='))?.split('=')[1]
  };

  generateArchitectureDiagram(options)
    .then(diagram => {
      console.log(diagram);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating architecture diagram:', error.message);
      process.exit(1);
    });
}