# Circular Dependency Detector Plugin for Claude Code

A Claude Code plugin (MCP server) that detects circular dependencies in TypeScript and JavaScript projects and provides actionable suggestions for fixing them.

## Features

- 🔍 **Automatic Detection**: Scans your codebase for circular import dependencies
- 📊 **Detailed Analysis**: Distinguishes between direct and indirect circular dependencies
- 💡 **Smart Suggestions**: Provides specific fix recommendations based on dependency type
- 📈 **Graph Export**: Export dependency graphs for visualization and further analysis
- ⚙️ **Configurable**: Customizable file patterns and exclusion patterns

## Installation

1. **Install dependencies**:
   ```bash
   cd claude-code-circular-deps-plugin
   npm install
   ```

2. **Build the plugin**:
   ```bash
   npm run build
   ```

3. **Configure Claude Code** to use this plugin by adding it to your MCP settings:

   Create or edit `~/.config/claude-code/mcp.json` (or the appropriate path for your OS):

   ```json
   {
     "mcpServers": {
       "circular-deps": {
         "command": "node",
         "args": ["/path/to/claude-code-circular-deps-plugin/dist/index.js"]
       }
     }
   }
   ```

   Replace `/path/to/claude-code-circular-deps-plugin` with the actual path to this directory.

## Usage

Once installed and configured, the plugin provides three tools that you can use from Claude Code:

### 1. `detect_circular_dependencies`

Scans a directory and reports all circular dependencies found.

**Parameters**:
- `directory` (required): The root directory to scan
- `filePattern` (optional): File pattern to match (default: `"**/*.{ts,tsx,js,jsx}"`)
- `excludePatterns` (optional): Patterns to exclude (default: `["node_modules", "dist", "build"]`)

**Example**:
```
Please use detect_circular_dependencies to scan my src directory
```

**Response**:
```json
{
  "summary": {
    "total": 2,
    "direct": 1,
    "indirect": 1
  },
  "cycles": [
    {
      "type": "direct",
      "description": "Direct circular dependency: fileA.ts ⇄ fileB.ts",
      "files": ["/path/to/fileA.ts", "/path/to/fileB.ts"]
    }
  ]
}
```

### 2. `suggest_circular_dependency_fixes`

Analyzes circular dependencies and provides actionable recommendations for resolving them.

**Parameters**:
- `directory` (required): The root directory to analyze
- `filePattern` (optional): File pattern to match
- `excludePatterns` (optional): Patterns to exclude

**Example**:
```
Use suggest_circular_dependency_fixes on my project to see how to fix the issues
```

**Response includes**:
- For **direct circular dependencies** (A ⇄ B):
  - Extract shared logic to a third module
  - Use dependency injection or inversion of control
  - Use events/observers pattern
  - Consider lazy loading with dynamic imports

- For **indirect circular dependencies** (A → B → C → A):
  - Introduce abstraction layers (interfaces, types)
  - Apply the Dependency Inversion Principle
  - Restructure into layers with clear boundaries
  - Move shared types/utilities to a common module

### 3. `export_dependency_graph`

Exports the complete dependency graph as JSON for visualization or external tools.

**Parameters**:
- `directory` (required): The root directory to analyze
- `filePattern` (optional): File pattern to match
- `excludePatterns` (optional): Patterns to exclude

**Example**:
```
Export my dependency graph so I can visualize it
```

**Response**:
```json
{
  "summary": {
    "totalFiles": 25,
    "totalDependencies": 47
  },
  "graph": {
    "/path/to/fileA.ts": ["/path/to/fileB.ts", "/path/to/utils.ts"],
    "/path/to/fileB.ts": ["/path/to/fileA.ts"]
  }
}
```

## Example Workflow

Here's a typical workflow when using this plugin with Claude Code:

```
You: Can you check my src directory for circular dependencies?

Claude: I'll use the circular dependency detector to analyze your src directory.
[Uses detect_circular_dependencies tool]

I found 2 circular dependencies:
1. Direct: src/components/Button.ts ⇄ src/utils/validation.ts
2. Indirect: src/services/auth.ts → src/models/user.ts → src/services/api.ts → src/services/auth.ts

Would you like me to suggest fixes for these?

You: Yes, please suggest fixes

Claude: [Uses suggest_circular_dependency_fixes tool]

Here are the suggested fixes:

1. For the direct circular dependency between Button.ts and validation.ts:
   • Extract shared logic to a third module
   • Use dependency injection
   • Consider using events pattern

2. For the indirect circular dependency...
   [detailed suggestions]

Would you like me to help implement any of these fixes?
```

## Technical Details

### Supported File Types

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- Automatically resolves index files

### What Gets Detected

- ES6 `import` statements
- TypeScript `import` statements
- Dynamic `import()` expressions
- Relative imports only (`./` and `../`)
- Absolute file path resolution

### What's Not Detected

- Node module imports (packages from `node_modules`)
- Non-relative imports without path mapping
- Runtime `require()` calls (CommonJS)

## Development

### Build the project:
```bash
npm run build
```

### Watch mode for development:
```bash
npm run watch
```

### Project Structure:
```
claude-code-circular-deps-plugin/
├── src/
│   ├── index.ts                 # MCP server implementation
│   └── dependency-analyzer.ts   # Core detection logic
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

### Environment Variables

No environment variables are required for basic usage. All configuration is passed through the tool parameters.

### MCP Server Configuration

To use this plugin with Claude Code, add it to your MCP settings file (`~/.config/claude-code/mcp.json`):

```json
{
  "mcpServers": {
    "circular-deps": {
      "command": "node",
      "args": ["/absolute/path/to/claude-code-circular-deps-plugin/dist/index.js"]
    }
  }
}
```

### Analysis Options

When using the tools, you can customize the analysis with these options:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `directory` | string | (required) | Root directory to scan |
| `filePattern` | string | `"**/*.{ts,tsx,js,jsx}"` | File pattern to match |
| `excludePatterns` | string[] | `["node_modules", "dist", "build"]` | Patterns to exclude |

### Example Custom Configuration

```bash
# Scan only TypeScript files, excluding tests
detect_circular_dependencies with:
  directory: "./src"
  filePattern: "**/*.ts"
  excludePatterns: ["node_modules", "dist", "build", "**/*.test.ts"]
```

## Troubleshooting

### Plugin not appearing in Claude Code

1. Verify the path in `mcp.json` is correct and absolute
2. Ensure the plugin has been built (`npm run build`)
3. Check that Node.js can execute the file: `node dist/index.js`

### No dependencies found

- Make sure your `tsconfig.json` is at the project root
- Verify file patterns match your source files
- Check that exclude patterns aren't too broad

### Error during analysis

- Ensure all files can be parsed (no syntax errors)
- Check file permissions
- Verify TypeScript configuration is valid

## Contributing

Contributions are welcome! Feel free to:

- Add support for more import patterns
- Improve detection accuracy
- Add visualization features
- Enhance fix suggestions

## License

MIT

## Credits

Built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- [ts-morph](https://github.com/dsherret/ts-morph) for TypeScript parsing
- [dependency-graph](https://github.com/jriecken/dependency-graph) inspiration

---

**Plugin Author**: cbuntingde
**Version**: 1.0.0
**Homepage**: https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/claude-code-circular-deps-plugin
