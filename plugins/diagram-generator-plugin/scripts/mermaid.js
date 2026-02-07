#!/usr/bin/env node

/**
 * Mermaid Diagram Generator
 * Generates Mermaid markdown-compatible diagrams from codebase analysis.
 */

import { analyzeProjectStructure } from '../index.js';
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_OUTPUT_DIR = process.env.DIAGRAM_OUTPUT_DIR || './docs/diagrams';

/**
 * Generates various Mermaid diagram types from project analysis.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated Mermaid diagram content
 */
export async function generateMermaidDiagram(options = {}) {
  const diagramType = options.type || 'flowchart';
  const projectRoot = options.projectRoot || process.cwd();
  const outputPath = options.output;

  const analysis = await analyzeProjectStructure(projectRoot);
  let diagramContent;

  switch (diagramType.toLowerCase()) {
    case 'flowchart':
      diagramContent = generateMermaidFlowchart(analysis);
      break;
    case 'class':
      diagramContent = generateMermaidClassDiagram(analysis);
      break;
    case 'sequence':
      diagramContent = generateMermaidSequenceDiagram(analysis);
      break;
    case 'state':
      diagramContent = generateMermaidStateDiagram(analysis);
      break;
    case 'er':
      diagramContent = generateMermaidERDiagram(analysis);
      break;
    default:
      diagramContent = generateMermaidFlowchart(analysis);
  }

  if (outputPath) {
    const { mkdir } = await import('fs/promises');
    await mkdir(dirname(outputPath) || DEFAULT_OUTPUT_DIR, { recursive: true });
    writeFileSync(outputPath, diagramContent);
  }

  return diagramContent;
}

/**
 * Generates a Mermaid flowchart from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} Mermaid flowchart content
 */
function generateMermaidFlowchart(analysis) {
  const { components, dependencies } = analysis;
  const componentList = Object.values(components);

  let diagram = '```mermaid\n';
  diagram += 'flowchart TB\n';

  for (const component of componentList) {
    const componentId = component.name.replace(/[^a-zA-Z0-9]/g, '_');
    diagram += `    ${componentId}["${component.name}"]\n`;
    diagram += `    class ${componentId} ${component.type}\n`;
  }

  diagram += '    classDef controller fill:#e1f5fe,stroke:#01579b,color:#01579b\n';
  diagram += '    classDef service fill:#f3e5f5,stroke:#4a148c,color:#4a148c\n';
  diagram += '    classDef model fill:#e8f5e9,stroke:#1b5e20,color:#1b5e20\n';
  diagram += '    classDef view fill:#fff3e0,stroke:#e65100,color:#e65100\n';
  diagram += '    classDef utility fill:#fafafa,stroke:#212121,color:#212121\n';
  diagram += '    classDef middleware fill:#fce4ec,stroke:#880e4f,color:#880e4f\n';
  diagram += '    classDef router fill:#e0f7fa,stroke:#006064,color:#006064\n';
  diagram += '    classDef repository fill:#efebe9,stroke:#3e2723,color:#3e2723\n';
  diagram += '    classDef config fill:#fffde7,stroke:#f57f17,color:#f57f17\n';
  diagram += '    classDef api fill:#ede7f6,stroke:#4527a0,color:#4527a0\n';

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
 * Generates a Mermaid class diagram from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} Mermaid class diagram content
 */
function generateMermaidClassDiagram(analysis) {
  const { components } = analysis;
  const componentList = Object.values(components);

  let diagram = '```mermaid\n';
  diagram += 'classDiagram\n';

  const writtenClasses = new Set();

  for (const component of componentList) {
    if (component.type === 'class' && !writtenClasses.has(component.name)) {
      diagram += `    class ${component.name} {\n`;
      diagram += `        +String name\n`;
      diagram += `        +void operation()\n`;
      diagram += '    }\n';
      writtenClasses.add(component.name);
    }
  }

  for (const [target, sources] of Object.entries(analysis.dependencies)) {
    for (const source of sources) {
      if (writtenClasses.has(source) && writtenClasses.has(target)) {
        diagram += `    ${source} --> ${target} : depends on\n`;
      }
    }
  }

  diagram += '```\n';

  return diagram;
}

/**
 * Generates a Mermaid sequence diagram from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} Mermaid sequence diagram content
 */
function generateMermaidSequenceDiagram(analysis) {
  const { imports } = analysis;

  let diagram = '```mermaid\n';
  diagram += 'sequenceDiagram\n';

  const participants = new Set(['Client']);
  for (const imp of imports.slice(0, 10)) {
    participants.add(imp.to);
  }

  for (const participant of participants) {
    diagram += `    participant ${participant}\n`;
  }

  diagram += '\n';
  diagram += '    Client->>API: Request\n';
  diagram += '    activate API\n';

  let current = 'API';
  for (const imp of imports.slice(0, 5)) {
    const next = imp.to;
    diagram += `    ${current}->>${next}: Call\n`;
    diagram += `    activate ${next}\n`;
    diagram += `    ${next}-->>${current}: Response\n`;
    diagram += `    deactivate ${next}\n`;
    current = next;
  }

  diagram += '    API-->>Client: Response\n';
  diagram += '    deactivate API\n';

  diagram += '```\n';

  return diagram;
}

/**
 * Generates a Mermaid state diagram from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} Mermaid state diagram content
 */
function generateMermaidStateDiagram(analysis) {
  const { components } = analysis;
  const componentList = Object.values(components);

  let diagram = '```mermaid\n';
  diagram += 'stateDiagram-v2\n';

  const hasRouter = componentList.some(c => c.type === 'router');
  const hasController = componentList.some(c => c.type === 'controller');
  const hasService = componentList.some(c => c.type === 'service');
  const hasModel = componentList.some(c => c.type === 'model');

  if (hasRouter) {
    diagram += '    [*] --> Router\n';
  }
  if (hasController) {
    diagram += '    [*] --> Controller\n';
  }
  if (hasService) {
    diagram += '    [*] --> Service\n';
  }
  if (hasModel) {
    diagram += '    [*] --> Model\n';
  }

  if (hasRouter && hasController) {
    diagram += '    Router --> Controller: route request\n';
  }
  if (hasController && hasService) {
    diagram += '    Controller --> Service: business logic\n';
  }
  if (hasService && hasModel) {
    diagram += '    Service --> Model: data access\n';
  }

  diagram += '```\n';

  return diagram;
}

/**
 * Generates a Mermaid ER diagram from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} Mermaid ER diagram content
 */
function generateMermaidERDiagram(analysis) {
  const { components } = analysis;
  const componentList = Object.values(components);

  let diagram = '```mermaid\n';
  diagram += 'erDiagram\n';

  const models = componentList.filter(c => c.type === 'model');

  if (models.length === 0) {
    diagram += '    Component {\n';
    diagram += '        string id\n';
    diagram += '        string name\n';
    diagram += '    }\n';
  } else {
    for (const model of models) {
      const tableName = model.name.replace(/[^a-zA-Z0-9]/g, '_');
      diagram += `    ${tableName} {\n`;
      diagram += '        string id PK\n';
      diagram += '        string name\n';
      diagram += '        timestamp createdAt\n';
      diagram += '        timestamp updatedAt\n';
      diagram += '    }\n';
    }
  }

  diagram += '```\n';

  return diagram;
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {
    type: args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'flowchart',
    format: args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'mermaid',
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    projectRoot: args.find(arg => arg.startsWith('--project-root='))?.split('=')[1],
    theme: args.find(arg => arg.startsWith('--theme='))?.split('=')[1] || 'default'
  };

  generateMermaidDiagram(options)
    .then(diagram => {
      console.log(diagram);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating Mermaid diagram:', error.message);
      process.exit(1);
    });
}