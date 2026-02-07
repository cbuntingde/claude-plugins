# Memory Leak Detector Plugin for Claude Code

A Claude Code plugin that detects memory leaks and provides actionable suggestions for fixing them in JavaScript, TypeScript, and Python codebases.

## Features

- **Multi-Language Support**: Detects memory leaks in JavaScript, TypeScript, and Python
- **Pattern-Based Detection**: Identifies common memory leak patterns
- **Actionable Suggestions**: Provides code examples showing how to fix detected issues
- **Project-Wide Scanning**: Analyze entire codebases for memory leaks
- **Severity Levels**: Prioritize fixes with high/medium/low severity ratings
- **Detailed Reports**: Get line numbers, descriptions, and fix suggestions for each issue

## Installation

### 1. Install Dependencies

```bash
cd memory-leak-detector-plugin
npm install
```

### 2. Configure Claude Code

Add the plugin to your Claude Code configuration file (`~/.claude-code/config.json`):

```json
{
  "plugins": [
    {
      "name": "memory-leak-detector",
      "command": "node",
      "args": ["C:/chris-dev/memory-leak-detector-plugin/src/index.js"]
    }
  ]
}
```

> **Note**: Update the path to match your actual installation directory.

## Available Tools

### 1. `detect_memory_leaks`

Analyzes code files for potential memory leak patterns.

**Parameters:**
- `filePath` (required): Path to file or directory to analyze
- `language` (optional): "javascript", "typescript", "python", or "auto" (default: "auto")
- `severity` (optional): "all", "high", "medium", or "low" (default: "all")

**Example Usage in Claude Code:**
```
Please use detect_memory_leaks to analyze my src/utils.js file
```

```
Scan the src/ directory for memory leaks, only showing high severity issues
```

### 2. `analyze_memory_pattern`

Analyzes a specific code snippet for memory leak patterns.

**Parameters:**
- `code` (required): Code snippet to analyze
- `language` (required): "javascript", "typescript", or "python"

**Example Usage:**
```
Analyze this code for memory leaks:

setInterval(() => {
  fetchAndUpdateData();
}, 1000);
```

```
Check this Python code for memory issues:

CACHE = {}

def memoize(key, value):
    CACHE[key] = value
```

### 3. `get_memory_suggestions`

Provides detailed suggestions for fixing specific memory leak types.

**Parameters:**
- `leakType` (required): Type of memory leak (e.g., "Event Listener Not Removed")
- `language` (required): "javascript", "typescript", or "python"

**Example Usage:**
```
Get suggestions for fixing "Uncleared Intervals/Timeouts" in JavaScript
```

### 4. `scan_project_memory`

Scans an entire project for memory leak patterns.

**Parameters:**
- `projectPath` (required): Path to project directory
- `fileExtensions` (optional): Array of file extensions to scan (default: [".js", ".jsx", ".ts", ".tsx", ".py"])
- `excludeDirs` (optional): Directories to exclude (default: ["node_modules", ".git", "dist", "build"])

**Example Usage:**
```
Scan my entire project for memory leaks
```

```
Scan the /backend directory for Python memory leaks
```

## Detected Memory Leak Patterns

### JavaScript/TypeScript

1. **Event Listener Not Removed** (High Severity)
   - Event listeners added without corresponding removeEventListener calls

2. **Closure Retaining Large Objects** (Medium Severity)
   - Closures that inadvertently retain references to large objects

3. **Uncleared Intervals/Timeouts** (High Severity)
   - Timers not cleared with clearInterval/clearTimeout

4. **Global Variable Accumulation** (Medium Severity)
   - Global variables that accumulate data

5. **DOM References in Detached Elements** (Medium Severity)
   - DOM elements referenced but not attached to the document

6. **Subscription Not Unsubscribed** (High Severity - TypeScript)
   - RxJS subscriptions not unsubscribed

7. **Memory Retention in Subjects** (Medium Severity - TypeScript)
   - Subjects that retain old values

### Python

1. **Circular References** (Medium Severity)
   - Objects with circular references preventing garbage collection

2. **Unclosed File Handles** (High Severity)
   - File handles opened without proper closing

3. **Unclosed Database Connections** (High Severity)
   - Database connections or cursors not properly closed

4. **Global Caches Without Limits** (Medium Severity)
   - Global caches or dictionaries that grow unbounded

5. **Thread Not Joined** (Medium Severity)
   - Threads started but never joined

## Configuration

This plugin uses environment variables for configuration:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MEMORY_LEAK_DETECTOR_SEVERITY` | Default severity filter | No | `all` |
| `MEMORY_LEAK_DETECTOR_LANGUAGE` | Default programming language | No | `auto` |
| `MEMORY_LEAK_DETECTOR_EXCLUDE_DIRS` | Comma-separated directories to exclude | No | `node_modules,.git,dist,build` |

### Example Configuration

```bash
# Set default severity to high only
export MEMORY_LEAK_DETECTOR_SEVERITY=high

# Set default language to TypeScript
export MEMORY_LEAK_DETECTOR_LANGUAGE=typescript

# Customize excluded directories
export MEMORY_LEAK_DETECTOR_EXCLUDE_DIRS=node_modules,.git,dist,build,coverage
```

### MCP Server Configuration

For Claude Code, configure the plugin in your settings:

```json
{
  "mcpServers": {
    "memory-leak-detector": {
      "command": "node",
      "args": ["/path/to/memory-leak-detector-plugin/src/index.js"]
    }
  }
}
```

## Usage Examples

### Example 1: Analyzing a Single File

**Claude Code Prompt:**
```
Use detect_memory_leaks on src/dataHandler.js
```

**Expected Output:**
```json
{
  "success": true,
  "summary": {
    "filesScanned": 1,
    "filesWithIssues": 1,
    "totalIssues": 2
  },
  "results": [
    {
      "file": "src/dataHandler.js",
      "language": "javascript",
      "issues": [
        {
          "line": 15,
          "column": 2,
          "severity": "high",
          "pattern": "Uncleared Intervals/Timeouts",
          "description": "Timers not cleared with clearInterval/clearTimeout",
          "suggestion": "Store timer IDs and clear them when no longer needed",
          "example": {
            "bad": "setInterval(() => { /* ... */ }, 1000);\n// never cleared",
            "good": "const timerId = setInterval(() => { /* ... */ }, 1000);\n// Later:\nclearInterval(timerId);"
          }
        }
      ]
    }
  ]
}
```

### Example 2: Getting Fix Suggestions

**Claude Code Prompt:**
```
Get memory suggestions for "Uncleared Intervals/Timeouts" in JavaScript
```

**Expected Output:**
```json
{
  "success": true,
  "pattern": "Uncleared Intervals/Timeouts",
  "severity": "high",
  "description": "Timers not cleared with clearInterval/clearTimeout",
  "suggestion": "Store timer IDs and clear them when no longer needed",
  "example": {
    "bad": "setInterval(() => { /* ... */ }, 1000);\n// never cleared",
    "good": "const timerId = setInterval(() => { /* ... */ }, 1000);\n// Later:\nclearInterval(timerId);"
  },
  "additionalTips": [
    "Consider using memory profiling tools to verify the leak",
    "Test your fix by monitoring memory usage over time",
    "Review garbage collection logs for patterns"
  ]
}
```

### Example 3: Project-Wide Scan

**Claude Code Prompt:**
```
Scan the entire project for memory leaks using scan_project_memory
```

**Expected Output:**
```json
{
  "success": true,
  "summary": {
    "filesScanned": 47,
    "filesWithIssues": 8,
    "totalIssues": 15,
    "bySeverity": {
      "high": 6,
      "medium": 9,
      "low": 0
    }
  },
  "prioritizedActions": [
    "CRITICAL: Fix 6 high-severity issues first",
    "Review 9 medium-severity issues",
    "Set up memory profiling to monitor improvements",
    "Consider adding memory leak detection to CI/CD pipeline"
  ]
}
```

## Best Practices

1. **Scan Regularly**: Run memory leak detection during code reviews and before deployments

2. **Prioritize High Severity**: Address high-severity issues first as they're most likely to cause problems

3. **Test Your Fixes**: After implementing suggestions, verify fixes with memory profiling tools

4. **Add to CI/CD**: Integrate this plugin into your CI/CD pipeline for automated detection

5. **Combine with Profiling**: Use this plugin alongside memory profiling tools for comprehensive analysis

## Tips for Preventing Memory Leaks

### JavaScript/TypeScript
- Always remove event listeners when components unmount
- Clear intervals and timeouts when done
- Avoid creating closures that capture large objects
- Use WeakMap/WeakSet when appropriate
- Unsubscribe from RxJS observables

### Python
- Use context managers (`with` statements) for files and connections
- Set limits on global caches (use `@lru_cache`)
- Break circular references explicitly
- Join or daemonize threads
- Use weak references for parent pointers

## Development

### Project Structure

```
memory-leak-detector-plugin/
├── package.json          # Plugin configuration
├── README.md            # This file
└── src/
    └── index.js         # Main plugin implementation
```

### Adding New Patterns

To add new memory leak patterns, edit `src/index.js` and add to the `MEMORY_LEAK_PATTERNS` object:

```javascript
{
  name: "Your Pattern Name",
  pattern: /your-regex-pattern/g,
  severity: "high|medium|low",
  description: "Description of the pattern",
  suggestion: "How to fix it",
  example: {
    bad: "bad code example",
    good: "good code example"
  }
}
```

## Troubleshooting

### Plugin Not Loading

1. Verify the path in your Claude Code config
2. Ensure dependencies are installed: `npm install`
3. Check Node.js version (requires 18+)

### No Issues Found

- The plugin only detects common patterns. Not all memory leaks match these patterns
- Use memory profiling tools for deeper analysis
- Consider adding custom patterns for your codebase

## Contributing

Contributions are welcome! Areas for improvement:
- Additional language support (Go, Rust, Java, etc.)
- More sophisticated pattern detection
- Integration with memory profiling tools
- False positive reduction
- Performance optimizations for large codebases

## License

MIT

## Credits

Built with the Model Context Protocol (MCP) for Claude Code.
