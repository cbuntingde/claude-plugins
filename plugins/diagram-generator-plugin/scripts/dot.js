#!/usr/bin/env node

/**
 * DOT Diagram Generator
 * Generates Graphviz DOT format diagrams from codebase analysis.
 */

import { analyzeProjectStructure } from '../index.js';
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_OUTPUT_DIR = process.env.DIAGRAM_OUTPUT_DIR || './docs/diagrams';

/**
 * Generates various DOT diagram types from project analysis.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated DOT diagram content
 */
export async function generateDotDiagram(options = {}) {
  const diagramType = options.type || 'graph';
  const projectRoot = options.projectRoot || process.cwd();
  const outputPath = options.output;

  const analysis = await analyzeProjectStructure(projectRoot);
  let diagramContent;

  switch (diagramType.toLowerCase()) {
    case 'graph':
      diagramContent = generateDotGraph(analysis);
      break;
    case 'digraph':
      diagramContent = generateDotDigraph(analysis);
      break;
    case 'cluster':
      diagramContent = generateDotClusterGraph(analysis);
      break;
    case 'hierarchy':
      diagramContent = generateDotHierarchy(analysis);
      break;
    default:
      diagramContent = generateDotGraph(analysis);
  }

  if (outputPath) {
    const { mkdir } = await import('fs/promises');
    await mkdir(dirname(outputPath) || DEFAULT_OUTPUT_DIR, { recursive: true });
    writeFileSync(outputPath, diagramContent);
  }

  return diagramContent;
}

/**
 * Generates a simple DOT graph from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} DOT graph content
 */
function generateDotGraph(analysis) {
  const { components, dependencies } = analysis;
  const componentList = Object.values(components);

  let diagram = 'graph architecture {\n';
  diagram += '  layout=dot;\n';
  diagram += '  rankdir=TB;\n';
  diagram += '  node [shape=box, style="rounded,filled", fontname="Arial", fontsize=10];\n';
  diagram += '  edge [fontname="Arial", fontsize=8];\n\n';

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
    const label = component.name.replace(/"/g, '\\"');
    const color = colorMap[component.type] || '#f5f5f5';
    diagram += `  "${component.name}" [fillcolor="${color}", label="${label}"];\n`;
  }

  const writtenEdges = new Set();
  for (const [target, sources] of Object.entries(dependencies)) {
    for (const source of sources) {
      const edgeKey = `"${source}" -- "${target}"`;
      if (!writtenEdges.has(edgeKey) && source !== target) {
        diagram += `  "${source}" -- "${target}";\n`;
        writtenEdges.add(edgeKey);
      }
    }
  }

  diagram += '}\n';

  return diagram;
}

/**
 * Generates a DOT digraph from project analysis (directed graph).
 * @param {Object} analysis - Project analysis data
 * @returns {string} DOT digraph content
 */
function generateDotDigraph(analysis) {
  const { components, dependencies } = analysis;
  const componentList = Object.values(components);

  let diagram = 'digraph architecture {\n';
  diagram += `  layout=${options.layout || 'dot'};\n`;
  diagram += '  rankdir=TB;\n';
  diagram += '  compound=true;\n';
  diagram += '  node [shape=box, style="rounded,filled", fontname="Arial", fontsize=10];\n';
  diagram += '  edge [fontname="Arial", fontsize=8, dir=forward];\n\n';

  const colorMap = {
    controller: '#e1f5fe:#b3e5fc',
    service: '#f3e5f5:#e1bee7',
    model: '#e8f5e9:#c8e6c9',
    view: '#fff3e0:#ffe0b2',
    utility: '#fafafa:#eeeeee',
    middleware: '#fce4ec:#f8bbd9',
    router: '#e0f7fa:#b2ebf2',
    repository: '#efebe9:#d7ccc8',
    config: '#fffde7:#fff9c4',
    api: '#ede7f6:#d1c4e9'
  };

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

  for (const component of componentList) {
    const label = component.name.replace(/"/g, '\\"');
    const colors = colorMap[component.type] || '#f5f5f5:#eeeeee';
    const shape = shapeMap[component.type] || 'box';
    diagram += `  "${component.name}" [shape=${shape}, style="rounded,filled", fillcolor="${colors.split(':')[0]}", gradientangle=30, label="${label}"];\n`;
  }

  const writtenEdges = new Set();
  for (const [target, sources] of Object.entries(dependencies)) {
    for (const source of sources) {
      const edgeKey = `"${source}" -> "${target}"`;
      if (!writtenEdges.has(edgeKey) && source !== target) {
        diagram += `  "${source}" -> "${target}";\n`;
        writtenEdges.add(edgeKey);
      }
    }
  }

  diagram += '}\n';

  return diagram;
}

/**
 * Generates a DOT graph with clusters from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} DOT cluster graph content
 */
function generateDotClusterGraph(analysis) {
  const { components } = analysis;
  const componentList = Object.values(components);

  let diagram = 'digraph architecture {\n';
  diagram += `  layout=${options.layout || 'dot'};\n`;
  diagram += '  rankdir=TB;\n';
  diagram += '  node [shape=box, style="rounded,filled", fontname="Arial", fontsize=10];\n';
  diagram += '  edge [fontname="Arial", fontsize=8];\n\n';

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

  const packageGroups = new Map();

  for (const component of componentList) {
    const packageName = component.name.split('/')[0] || 'default';
    if (!packageGroups.has(packageName)) {
      packageGroups.set(packageName, []);
    }
    packageGroups.get(packageName).push(component);
  }

  let clusterNumber = 0;
  for (const [packageName, comps] of packageGroups) {
    diagram += `  subgraph cluster_${clusterNumber++} {\n`;
    diagram += `    label="${packageName}";\n`;
    diagram += `    style=filled; color=${colorMap[comps[0]?.type] || '#f5f5f5'};\n`;
    diagram += '    node [style=filled];\n\n';

    for (const component of comps) {
      const label = component.name.split('/').pop().replace(/"/g, '\\"');
      diagram += `    "${component.name}" [label="${label}"];\n`;
    }

    diagram += '  }\n\n';
  }

  const writtenEdges = new Set();
  for (const [target, sources] of Object.entries(analysis.dependencies)) {
    for (const source of sources) {
      const edgeKey = `${source} -> ${target}`;
      if (!writtenEdges.has(edgeKey)) {
        diagram += `  "${source}" -> "${target}";\n`;
        writtenEdges.add(edgeKey);
      }
    }
  }

  diagram += '}\n';

  return diagram;
}

/**
 * Generates a hierarchical DOT graph from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} DOT hierarchy content
 */
function generateDotHierarchy(analysis) {
  const { components, dependencies } = analysis;
  const componentList = Object.values(components);

  let diagram = 'digraph hierarchy {\n';
  diagram += `  layout=${options.layout || 'dot'};\n`;
  diagram += '  rankdir=TB;\n';
  diagram += '  node [shape=Mrecord, style="rounded,filled", fontname="Arial", fontsize=10];\n';
  diagram += '  edge [fontname="Arial", fontsize=8];\n\n';

  const layerColor = '#f5f5f5';
  diagram += `  subgraph cluster_layers {\n`;
  diagram += `    style=filled; color=${layerColor};\n`;
  diagram += '    label="Application Layers";\n\n';

  const layers = [
    { name: 'Presentation', types: ['view', 'controller'] },
    { name: 'Application', types: ['service', 'api'] },
    { name: 'Domain', types: ['model', 'entity'] },
    { name: 'Infrastructure', types: ['repository', 'config', 'utility', 'middleware'] }
  ];

  for (const layer of layers) {
    diagram += `    subgraph cluster_${layer.name.toLowerCase()} {\n`;
    diagram += `      label="${layer.name}";\n`;
    diagram += '      style=dashed;\n\n';

    const layerComps = componentList.filter(c => layer.types.includes(c.type));
    for (const component of layerComps) {
      const label = component.name.split('/').pop().replace(/"/g, '\\"');
      diagram += `      "${component.name}" [label="${label}"];\n`;
    }

    diagram += '    }\n\n';
  }

  diagram += '  }\n\n';

  const writtenEdges = new Set();
  for (const [target, sources] of Object.entries(dependencies)) {
    for (const source of sources) {
      const edgeKey = `${source} -> ${target}`;
      if (!writtenEdges.has(edgeKey)) {
        diagram += `  "${source}" -> "${target}";\n`;
        writtenEdges.add(edgeKey);
      }
    }
  }

  diagram += '}\n';

  return diagram;
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {
    type: args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'digraph',
    layout: args.find(arg => arg.startsWith('--layout='))?.split('=')[1] || 'dot',
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    projectRoot: args.find(arg => arg.startsWith('--project-root='))?.split('=')[1]
  };

  generateDotDiagram(options)
    .then(diagram => {
      console.log(diagram);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating DOT diagram:', error.message);
      process.exit(1);
    });
}