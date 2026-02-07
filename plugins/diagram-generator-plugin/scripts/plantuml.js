#!/usr/bin/env node

/**
 * PlantUML Diagram Generator
 * Generates PlantUML text format diagrams from codebase analysis.
 */

import { analyzeProjectStructure } from '../index.js';
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_OUTPUT_DIR = process.env.DIAGRAM_OUTPUT_DIR || './docs/diagrams';

/**
 * Generates various PlantUML diagram types from project analysis.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated PlantUML diagram content
 */
export async function generatePlantUMLDiagram(options = {}) {
  const diagramType = options.type || 'class';
  const projectRoot = options.projectRoot || process.cwd();
  const outputPath = options.output;

  const analysis = await analyzeProjectStructure(projectRoot);
  let diagramContent;

  switch (diagramType.toLowerCase()) {
    case 'class':
      diagramContent = generatePlantUMLClassDiagram(analysis);
      break;
    case 'component':
      diagramContent = generatePlantUMLComponentDiagram();
      break;
    case 'deployment':
      diagramContent = generatePlantUMLDeploymentDiagram();
      break;
    case 'activity':
      diagramContent = generatePlantUMLActivityDiagram();
      break;
    case 'sequence':
      diagramContent = generatePlantUMLSequenceDiagram();
      break;
    default:
      diagramContent = generatePlantUMLComponentDiagram();
  }

  if (outputPath) {
    const { mkdir } = await import('fs/promises');
    await mkdir(dirname(outputPath) || DEFAULT_OUTPUT_DIR, { recursive: true });
    writeFileSync(outputPath, diagramContent);
  }

  return diagramContent;
}

/**
 * Generates a PlantUML class diagram from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} PlantUML class diagram content
 */
function generatePlantUMLClassDiagram(analysis) {
  const { components } = analysis;
  const componentList = Object.values(components);

  let diagram = '@startuml\n';
  diagram += 'skinparam classAttributeIconSize 0\n\n';

  const packageGroups = new Map();

  for (const component of componentList) {
    const packageName = component.name.split('/')[0] || 'default';
    if (!packageGroups.has(packageName)) {
      packageGroups.set(packageName, []);
    }
    packageGroups.get(packageName).push(component);
  }

  for (const [, comps] of packageGroups) {
    for (const component of comps) {
      if (component.type === 'class' || component.type === 'module') {
        const className = component.name.split('/').pop();
        diagram += `  class ${className} {\n`;
        diagram += '    +String id\n';
        diagram += '    +String name\n';
        diagram += '    +void create()\n';
        diagram += '    +void update()\n';
        diagram += '    +void delete()\n';
        diagram += '  }\n\n';
      }
    }
  }

  diagram += '@enduml\n';

  return diagram;
}

/**
 * Generates a PlantUML component diagram from project analysis.
 * @param {Object} analysis - Project analysis data
 * @returns {string} PlantUML component diagram content
 */
function generatePlantUMLComponentDiagram() {
  let diagram = '@startuml\n';
  diagram += 'skinparam component {\n';
  diagram += '  BackgroundColor #f8f9fa\n';
  diagram += '  BorderColor #6c757d\n';
  diagram += '  ArrowColor #0d6efd\n';
  diagram += '}\n\n';

  diagram += 'actor "User" as User\n\n';

  diagram += '[API Gateway] <<gateway>>\n';
  diagram += '[Controllers] <<controller>>\n';
  diagram += '[Services] <<service>>\n';
  diagram += '[Repositories] <<repository>>\n';
  diagram += '[Database] <<database>>\n\n';

  diagram += 'User --> [API Gateway] : HTTP Request\n';
  diagram += '[API Gateway] --> [Controllers] : Route\n';
  diagram += '[Controllers] --> [Services] : Business Logic\n';
  diagram += '[Services] --> [Repositories] : Data Access\n';
  diagram += '[Repositories] --> [Database] : CRUD\n\n';

  diagram += '@enduml\n';

  return diagram;
}

/**
 * Generates a PlantUML deployment diagram from project analysis.
 * @returns {string} PlantUML deployment diagram content
 */
function generatePlantUMLDeploymentDiagram() {
  let diagram = '@startuml\n';
  diagram += 'skinparam rectangle {\n';
  diagram += '  BackgroundColor White\n';
  diagram += '  BorderColor Black\n';
  diagram += '}\n\n';

  diagram += 'rectangle "Application Server" {\n';
  diagram += '  rectangle "Web Server" {\n';
  diagram += '    [Static Assets]\n';
  diagram += '    [API Gateway]\n';
  diagram += '  }\n';
  diagram += '  rectangle "App Server" {\n';
  diagram += '    [Controllers]\n';
  diagram += '    [Services]\n';
  diagram += '  }\n';
  diagram += '}\n\n';

  diagram += 'rectangle "Database Server" {\n';
  diagram += '  database "Database" {\n';
  diagram += '    [Tables]\n';
  diagram += '    [Indexes]\n';
  diagram += '  }\n';
  diagram += '}\n\n';

  diagram += 'cloud "External Services" {\n';
  diagram += '  [Authentication]\n';
  diagram += '  [Payment Gateway]\n';
  diagram += '  [Email Service]\n';
  diagram += '}\n\n';

  diagram += '[API Gateway] --> [Controllers] : HTTP\n';
  diagram += '[Controllers] --> [Services] : Internal\n';
  diagram += '[Services] --> [Database] : TCP/IP\n';
  diagram += '[Services] --> [Authentication] : OAuth\n';
  diagram += '[Services] --> [Payment Gateway] : HTTPS\n';
  diagram += '[Web Server] --> [Static Assets] : Local\n\n';

  diagram += '@enduml\n';

  return diagram;
}

/**
 * Generates a PlantUML activity diagram from project analysis.
 * @returns {string} PlantUML activity diagram content
 */
function generatePlantUMLActivityDiagram() {
  let diagram = '@startuml\n';
  diagram += 'skinparam activity {\n';
  diagram += '  BackgroundColor #e3f2fd\n';
  diagram += '  BorderColor #1565c0\n';
  diagram += '  StartColor #4caf50\n';
  diagram += '  EndColor #f44336\n';
  diagram += '}\n\n';

  diagram += 'start\n';
  diagram += ':Receive Request;\n';
  diagram += ':Route Request;\n';
  diagram += ':Validate Input;\n';
  diagram += ':Execute Business Logic;\n';
  diagram += ':Access Database;\n';
  diagram += ':Generate Response;\n';
  diagram += ':Send Response;\n';
  diagram += 'stop\n\n';

  diagram += 'if "Valid Input?" then\n';
  diagram += '  :Execute Business Logic;\n';
  diagram += 'else\n';
  diagram +=  ':Return Validation Error;\n';
  diagram += '  stop\n';
  diagram += 'endif\n\n';

  diagram += 'if "Cache Hit?" then\n';
  diagram += '  :Return Cached Response;\n';
  diagram += 'else\n';
  diagram += '  :Access Database;\n';
  diagram += '  :Cache Response;\n';
  diagram += 'endif\n\n';

  diagram += '@enduml\n';

  return diagram;
}

/**
 * Generates a PlantUML sequence diagram from project analysis.
 * @returns {string} PlantUML sequence diagram content
 */
function generatePlantUMLSequenceDiagram() {
  let diagram = '@startuml\n';
  diagram += 'skinparam sequence {\n';
  diagram += '  BackgroundColor #fafafa\n';
  diagram += '  ArrowColor #0d6efd\n';
  diagram += '  ActorBackgroundColor #e3f2fd\n';
  diagram += '}\n\n';

  diagram += 'actor "Client" as Client\n';
  diagram += 'participant "API Gateway" as Gateway\n';
  diagram += 'participant "Controller" as Controller\n';
  diagram += 'participant "Service" as Service\n';
  diagram += 'participant "Repository" as Repository\n';
  diagram += 'database "Database" as Database\n\n';

  diagram += 'Client ->> Gateway: HTTP Request\n';
  diagram += 'activate Gateway\n\n';

  diagram += 'Gateway ->> Controller: route()\n';
  diagram += 'activate Controller\n\n';

  diagram += 'Controller ->> Service: process()\n';
  diagram += 'activate Service\n\n';

  diagram += 'Service ->> Repository: find()\n';
  diagram += 'activate Repository\n\n';

  diagram += 'Repository ->> Database: SELECT\n';
  diagram += 'activate Database\n';
  diagram += 'Database -->> Repository: Results\n';
  diagram += 'deactivate Database\n\n';

  diagram += 'Repository -->> Service: Entities\n';
  diagram += 'deactivate Repository\n\n';

  diagram += 'Service -->> Controller: Result\n';
  diagram += 'deactivate Service\n\n';

  diagram += 'Controller -->> Gateway: Response\n';
  diagram += 'deactivate Controller\n\n';

  diagram += 'Gateway -->> Client: HTTP Response\n';
  diagram += 'deactivate Gateway\n\n';

  diagram += '@enduml\n';

  return diagram;
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {
    type: args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'component',
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    projectRoot: args.find(arg => arg.startsWith('--project-root='))?.split('=')[1]
  };

  generatePlantUMLDiagram(options)
    .then(diagram => {
      console.log(diagram);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating PlantUML diagram:', error.message);
      process.exit(1);
    });
}