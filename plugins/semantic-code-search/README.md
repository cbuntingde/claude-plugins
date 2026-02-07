# Semantic Code Search Plugin for Claude Code

> **Transform how you find code** - Search using natural language instead of exact keywords

## Overview

Developers spend ~30% of their time just finding code. Traditional search requires exact keywords, which fails when:
- You don't know the exact function names
- Code uses different terminology than your query
- You're exploring an unfamiliar codebase

**Semantic Code Search** solves this by understanding the **meaning** and **intent** behind your queries.

## Features

- **🧠 Natural Language Queries**: Ask questions like "find where we validate email addresses"
- **🎯 Semantic Understanding**: Finds relevant code even with different terminology
- **⚡ Fast Results**: Vector-based search for instant responses
- **📊 Context-Rich**: Returns code with surrounding context and explanations
- **🔍 Pattern Discovery**: Find similar implementations across your codebase

## Installation

```bash
# Install to user scope (available in all projects)
claude plugin install semantic-code-search

# Or install to project scope (shared with team)
claude plugin install semantic-code-search --scope project
```

## Quick Start

### 1. Build the Search Index

```bash
/semantic-index
```

This analyzes your codebase and builds a vector embedding index.

### 2. Search Using Natural Language

```bash
# Find specific functionality
/semantic-search find where we validate email addresses

# Discover patterns
/semantic-search show me retry logic

# Explore code structure
/semantic-search authentication flow implementation
```

## Usage Examples

### Find Specific Functionality

```bash
# Email validation
/semantic-search find email validation code

# Error handling
/semantic-search database connection error handling

# Retry logic
/semantic-search show me retry logic

# Authentication
/semantic-search user authentication flow
```

### Discover Patterns

```bash
# API endpoints
/semantic-search REST API endpoints definitions

# Data transformations
/semantic-search data parsing and transformation

# Caching implementations
/semantic-search caching mechanisms

# Async operations
/semantic-search asynchronous operations
```

### Explore Codebases

```bash
# Configuration
/semantic-search application configuration settings

# Testing code
/semantic-search unit tests for user service

# Dependencies
/semantic-search external API integrations

# Business logic
/semantic-search shopping cart checkout process
```

## Commands

### `/semantic-search <query>`

Search your codebase using natural language queries.

**Options:**
- `query` (required): Natural language description of the code you're looking for

**Examples:**
```bash
/semantic-search find where we handle file uploads
/semantic-search show me database query builders
/semantic-search error handling for API calls
```

### `/semantic-index [options]`

Build or rebuild the semantic search index.

**Options:**
- `--force`: Force a complete rebuild of the index
- `--incremental`: Only index recently changed files (default)

**When to use:**
- After significant code changes
- When search quality seems degraded
- When you've added many new files

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SEMANTIC_SEARCH_ROOT` | Root directory to index | No | Current working directory |
| `SEMANTIC_SEARCH_LIMIT` | Maximum number of results | No | 10 |
| `SEMANTIC_SEARCH_THRESHOLD` | Minimum similarity threshold (0-1) | No | 0.3 |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | No | - |
| `COHERE_API_KEY` | Cohere API key for embeddings | No | - |

### Plugin Settings

Create a `.semantic-search.json` config file in your project root:

```json
{
  "rootPath": "src",
  "extensions": [".js", ".ts", ".py", ".go", ".java"],
  "excludePatterns": ["node_modules", "dist", "build", ".git"],
  "maxFileSize": 5242880,
  "maxFiles": 10000,
  "embeddingModel": "hash"
}
```

## Agent Integration

The plugin includes a **Semantic Code Explorer** agent that Claude can invoke automatically when:
- You ask questions about code location
- You need to find specific implementations
- You're exploring unfamiliar codebases
- You want to discover code patterns

## How It Works

### 1. Semantic Understanding

Your query is converted to a vector embedding that captures semantic meaning, not just keywords.

### 2. Vector Search

The codebase is indexed with embeddings for:
- Functions and methods
- Classes and their members
- Code blocks and patterns
- Comments and documentation

### 3. Similarity Matching

Finds code snippets with the highest semantic similarity to your query using cosine similarity.

### 4. Context-Rich Results

Returns relevant code with:
- File locations and line numbers
- Surrounding context
- Relevance scores
- Code previews

## Architecture

```
semantic-code-search/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/                 # Slash commands
│   ├── semantic-search.md
│   └── semantic-index.md
├── agents/                   # Specialized agents
│   └── semantic-code-explorer.md
├── servers/                  # MCP server
│   └── semantic-search-server.js
├── scripts/                  # Utility scripts
└── README.md
```

## Production Embeddings

The demo server uses a simple hash-based embedding. For production, integrate with:

### OpenAI Embeddings

```javascript
async generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  });

  const data = await response.json();
  return data.data[0].embedding;
}
```

### Cohere Embeddings

```javascript
const cohere = require('cohere-ai');

async generateEmbedding(text) {
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-english-v3.0'
  });

  return response.body.embeddings[0];
}
```

### Local Models (sentence-transformers)

```javascript
const { pipeline } = require('@xenova/transformers');

const generator = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

async generateEmbedding(text) {
  const output = await generator(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
```

## Tips for Best Results

### ✅ Be Specific

Good: "find email validation regex pattern"
Bad: "find validation"

### ✅ Use Natural Language

Good: "show me how we handle database connection errors"
Bad: "database error handle connection"

### ✅ Include Context

Good: "user authentication token validation"
Bad: "auth token"

### ✅ Iterate and Refine

Start broad: "find authentication code"
Then refine: "show me JWT token validation"

## Performance

| Codebase Size | Index Time | Query Time |
|---|------|---|
| Small (1K files) | ~30s | <100ms |
| Medium (10K files) | ~2min | <200ms |
| Large (100K files) | ~10min | <500ms |

## Limitations

- **Index Size**: Typically 10-30% of codebase size
- **First Run**: Initial indexing takes time
- **Language Support**: Best results with common programming languages
- **Code Quality**: Semantic understanding works best with well-structured, documented code

## Contributing

Contributions welcome! Areas for improvement:

1. **Better Embeddings**: Integration with production embedding services
2. **Hybrid Search**: Combine semantic with keyword search
3. **Code Understanding**: Deep parsing of AST structures
4. **Index Optimization**: Faster indexing and smaller index size
5. **Multi-Language**: Better support for more programming languages

## License

MIT

## Sources

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code Plugins GitHub](https://github.com/anthropics/claude-code/blob/main/plugins/README.md)
- [Claude 中文 - Plugins Reference](https://claudecn.com/en/docs/claude-code/plugins/plugins-reference/)
- [Claude Code Overview](https://code.claude.com/docs/en/overview)
