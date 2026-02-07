# Bundle Size Analyzer - Plugin Structure

This document describes the architecture and structure of the Bundle Size Analyzer plugin.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code CLI                      │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌──────────┐ ┌─────────────┐
│   Commands    │ │  Skills  │ │   Agents    │
│   (User-init) │ │ (Auto)   │ │ (Deep Dive) │
└───────┬───────┘ └────┬─────┘ └──────┬──────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              ┌────────────────┐
              │  Core Analyzer │
              └────────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌───────────────┐ ┌──────────┐ ┌─────────────┐
│  Bundler API  │ │  Scripts │ │   Reports   │
│  Detection    │ │          │ │             │
└───────────────┘ └──────────┘ └─────────────┘
```

## Component Details

### 1. Plugin Manifest (`plugin.json`)

Defines plugin metadata and entry points:

```json
{
  "name": "bundle-size-analyzer",
  "version": "1.0.0",
  "commands": ["./commands/*.md"],
  "skills": "./skills/",
  "agents": "./agents/",
  "hooks": "./hooks/hooks.json"
}
```

### 2. Commands Layer

**Purpose**: User-initiated actions via CLI commands

**Files**:
- `analyze-bundle.md` - Main bundle analysis command
- `tree-shake.md` - Tree-shaking analysis and fixes
- `compare-bundles.md` - Bundle size comparison
- `export-report.md` - Report generation

**Command Structure**:
```markdown
---
description: Command description
---

# Command Name

Usage examples, arguments, options, and output format.
```

**Execution Flow**:
1. User invokes command (e.g., `/analyze-bundle`)
2. Claude parses command markdown
3. Executes analysis based on parameters
4. Returns formatted results

### 3. Skills Layer

**Purpose**: Proactive, automatic analysis during development

**File**: `skills/bundle-analyzer/SKILL.md`

**Trigger Conditions**:
- Installing large dependencies
- Importing heavy libraries
- Building bundles
- Modifying bundler config

**Skill Structure**:
```markdown
---
name: bundle-analyzer
description: Auto analysis description
trigger:
  - "bundle"
  - "optimize"
categories:
  - performance
---

# Skill Documentation
```

**Behavior**:
- Monitors file changes
- Detects patterns
- Provides suggestions
- Can auto-apply fixes

### 4. Agents Layer

**Purpose**: Deep, specialized analysis requiring expert knowledge

**File**: `agents/bundle-specialist.md`

**Capabilities**:
- Complex dependency graph analysis
- Bundler-specific optimization strategies
- Architecture recommendations
- Performance regression investigation

**When Used**:
- Invoked for complex analysis tasks
- Provides expert-level recommendations
- Handles edge cases

### 5. Hooks Layer

**Purpose**: Integrate into Claude Code lifecycle events

**File**: `hooks/hooks.json`

**Available Hooks**:
```json
{
  "preBuild": "analyze-bundle",      // Before production build
  "postBuild": "analyze-bundle",     // After build completes
  "preCommit": "tree-shake",         // Before git commit
  "onDependencyInstall": "analyze-bundle" // When installing packages
}
```

**Integration Points**:
- Build pipeline
- Git workflow
- Dependency management

### 6. Scripts Layer

**Purpose**: Standalone scripts for analysis and installation

**Files**:
- `install-tools.sh` - Install bundler-specific tools
- `analyze-bundle.py` - Python bundle analysis script

**Usage**:
```bash
# Install analysis tools
./scripts/install-tools.sh

# Analyze bundle with Python
./scripts/analyze-bundle.py dist/app.js
```

## Data Flow

### Bundle Analysis Flow

```
User Request
     │
     ▼
Detect Bundler Type
     │
     ├──► Webpack → webpack-bundle-analyzer
     ├──► Vite → rollup-plugin-visualizer
     ├──► Rollup → rollup stats
     ├──► esbuild → metafile
     └──► Parcel → bundle report
     │
     ▼
Parse Bundle Data
     │
     ├──► Module sizes
     ├──► Dependency graph
     ├──► Source maps
     └───► Compression data
     │
     ▼
Analysis Engine
     │
     ├──► Large module detection
     ├──► Unused code detection
     ├──► Tree-shaking analysis
     └───► Optimization opportunities
     │
     ▼
Format Output
     │
     ├──► Text/Markdown
     ├──► JSON
     ├──► HTML
     └───► CSV/PDF
     │
     ▼
Return to User
```

### Tree-Shaking Flow

```
Source Code Analysis
     │
     ├──► Find exports
     ├──► Find imports
     ├───► Build usage graph
     └───► Detect side effects
     │
     ▼
Identify Issues
     │
     ├──► Unused exports
     ├──► Dead code
     ├──► Side effects
     └───► Non-tree-shakeable patterns
     │
     ▼
Generate Fixes
     │
     ├──► Remove unused exports
     ├──► Add pure annotations
     ├──► Configure sideEffects
     └───► Refactor imports
     │
     ▼
Apply (if --fix)
     │
     ▼
Report Changes
```

## Extension Points

### Adding New Commands

1. Create markdown file in `commands/`
2. Follow command template structure
3. Register in `plugin.json`

```markdown
---
description: Command description
---

# Command Name

## Usage
`/command-name [args]`

## Examples
...
```

### Adding New Analysis Types

1. Extend core analyzer in scripts
2. Add detection logic
3. Format output for reports

### Supporting New Bundlers

1. Add bundler detection logic
2. Implement bundler-specific API calls
3. Parse bundler output format
4. Add to supported bundlers list

## Configuration

### Plugin Configuration

```json
{
  "bundleAnalyzer": {
    "enabled": true,
    "thresholds": {
      "warn": 10,
      "error": 25
    },
    "ignores": [
      "node_modules/react/**"
    ]
  }
}
```

### Bundler-Specific Config

Each bundler requires specific configuration for optimal analysis:

**Webpack**:
```javascript
optimization: {
  usedExports: true,
  sideEffects: true
}
```

**Vite/Rollup**:
```javascript
output: {
  manualChunks: {...}
}
```

## Testing

### Unit Tests
- Test individual analysis functions
- Mock bundler outputs
- Verify report generation

### Integration Tests
- Test with real bundles
- Test with different bundlers
- Verify CI/CD integration

### Performance Tests
- Test with large codebases
- Measure analysis time
- Optimize bottlenecks

## Debugging

### Enable Debug Logging

```bash
# Set environment variable
export BUNDLE_ANALYZER_DEBUG=1

# Run with verbose output
/analyze-bundle --verbose
```

### Common Issues

1. **Source maps not found**
   - Ensure bundler generates source maps
   - Check source map path

2. **Incorrect sizes**
   - Verify production build
   - Check minification enabled
   - Clear bundler cache

3. **Tree-shaking not working**
   - Use ES modules
   - Enable production mode
   - Configure sideEffects

## Dependencies

### Runtime Dependencies
- `@rollup/pluginutils` - Module resolution
- `terser` - Minification analysis
- `gzip-size` - Compression calculation
- `brotli-size` - Brotli compression

### Bundler-Specific Tools
- `webpack-bundle-analyzer` - Webpack analysis
- `rollup-plugin-visualizer` - Rollup/Vite analysis
- `esbuild` - esbuild metafile parsing

### Development Dependencies
- `typescript` - Type definitions
- `vitest` - Testing framework
- `eslint` - Linting

## Performance Considerations

1. **Lazy Loading**: Load heavy analysis tools only when needed
2. **Caching**: Cache analysis results to avoid re-computation
3. **Parallel Processing**: Analyze multiple chunks in parallel
4. **Streaming**: Use streaming for large file processing

## Security Considerations

1. **Source Map Validation**: Validate source map before parsing
2. **Path Traversal**: Prevent path traversal attacks
3. **Dependency Scanning**: Scan for malicious dependencies
4. **No Remote Calls**: All analysis performed locally

## Future Enhancements

- [ ] Machine learning-based optimization suggestions
- [ ] Real-time bundle monitoring dashboard
- [ ] Cloud-based bundle analysis service
- [ ] Plugin ecosystem for custom analyzers
- [ ] Visual bundle editor
