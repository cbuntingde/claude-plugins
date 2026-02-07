#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DependencyAnalyzer } from './dependency-analyzer.js';

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'detect_circular_dependencies',
    description: 'Detects circular dependencies in a TypeScript/JavaScript project. ' +
      'Scans the specified directory and reports any circular import relationships.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The root directory to scan for circular dependencies',
        },
        filePattern: {
          type: 'string',
          description: 'File pattern to match (default: "**/*.{ts,tsx,js,jsx}")',
          default: '**/*.{ts,tsx,js,jsx}',
        },
        excludePatterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Patterns to exclude (default: ["node_modules", "dist", "build"])',
          default: ['node_modules', 'dist', 'build'],
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'suggest_circular_dependency_fixes',
    description: 'Analyzes circular dependencies and provides actionable suggestions for resolving them. ' +
      'Includes specific recommendations based on the type of circular dependency detected.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The root directory to analyze for circular dependencies',
        },
        filePattern: {
          type: 'string',
          description: 'File pattern to match (default: "**/*.{ts,tsx,js,jsx}")',
          default: '**/*.{ts,tsx,js,jsx}',
        },
        excludePatterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Patterns to exclude (default: ["node_modules", "dist", "build"])',
          default: ['node_modules', 'dist', 'build'],
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'export_dependency_graph',
    description: 'Exports the dependency graph as JSON for visualization or further analysis. ' +
      'Useful for understanding the overall structure of your project dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The root directory to analyze',
        },
        filePattern: {
          type: 'string',
          description: 'File pattern to match (default: "**/*.{ts,tsx,js,jsx}")',
          default: '**/*.{ts,tsx,js,jsx}',
        },
        excludePatterns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Patterns to exclude (default: ["node_modules", "dist", "build"])',
          default: ['node_modules', 'dist', 'build'],
        },
      },
      required: ['directory'],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'circular-dependency-detector',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'detect_circular_dependencies':
      case 'suggest_circular_dependency_fixes':
      case 'export_dependency_graph': {
        const directory = args?.directory as string;
        const filePattern = (args?.filePattern as string) || '**/*.{ts,tsx,js,jsx}';
        const excludePatterns = (args?.excludePatterns as string[]) || ['node_modules', 'dist', 'build'];

        if (!directory) {
          throw new Error('Directory is required');
        }

        const analyzer = new DependencyAnalyzer(directory);
        const cycles = await analyzer.analyzeDirectory(directory, {
          filePattern,
          excludePatterns,
        });

        if (name === 'detect_circular_dependencies') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  summary: {
                    total: cycles.length,
                    direct: cycles.filter(c => c.type === 'direct').length,
                    indirect: cycles.filter(c => c.type === 'indirect').length,
                  },
                  cycles: cycles.map(cycle => ({
                    type: cycle.type,
                    description: cycle.description,
                    files: cycle.cycle,
                  })),
                }, null, 2),
              },
            ],
          };
        }

        if (name === 'suggest_circular_dependency_fixes') {
          const suggestions = analyzer.suggestFixes(cycles);
          return {
            content: [
              {
                type: 'text',
                text: suggestions.join('\n'),
              },
            ],
          };
        }

        if (name === 'export_dependency_graph') {
          const graph = analyzer.exportGraph();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  summary: {
                    totalFiles: Object.keys(graph).length,
                    totalDependencies: Object.values(graph).flat().length,
                  },
                  graph,
                }, null, 2),
              },
            ],
          };
        }

        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Circular Dependency Detector MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
