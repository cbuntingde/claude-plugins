---
name: semantic-search
description: Search your codebase using natural language queries to find semantically relevant code
aliases: [semsearch, ssearch]
examples:
  - "/semantic-search find where we validate email addresses"
  - "/semantic-search show me retry logic"
  - "/semantic-search authentication flow implementation"
  - "/semantic-search database connection error handling"
arguments:
  - name: query
    description: Natural language query describing the code you're looking for
    required: true
    greedy: true
---

# Semantic Search

Search your codebase using natural language queries to find semantically relevant code patterns, implementations, and logic.

## Overview

Unlike traditional keyword-based search, semantic search understands the **meaning** and **intent** behind your query. You can describe what you're looking for in plain English, and it will find relevant code even if it doesn't contain your exact keywords.

## Usage

```bash
/semantic-search <your natural language query>
```

## Examples

### Find specific functionality
```bash
# Find email validation code
/semantic-search find where we validate email addresses

# Find retry logic
/semantic-search show me retry logic

# Find authentication
/semantic-search user authentication flow

# Find error handling
/semantic-search database connection error handling
```

### Discover patterns and implementations
```bash
# Find all API endpoints
/semantic-search REST API endpoints definitions

# Find data transformations
/semantic-search data parsing and transformation

# Find business logic
/semantic-shopping cart checkout process
```

### Explore code structure
```bash
# Find configuration
/semantic-search application configuration settings

# Find testing code
/semantic-search unit tests for user service

# Find dependencies
/semantic-search external API integrations
```

## How It Works

1. **Semantic Understanding**: Your query is converted to a vector embedding that captures semantic meaning
2. **Code Indexing**: The codebase is indexed with embeddings for functions, classes, and blocks
3. **Similarity Matching**: Finds code snippets with the highest semantic similarity to your query
4. **Context-Rich Results**: Returns relevant code with surrounding context and explanations

## Tips for Best Results

- **Be specific**: "find email validation regex" is better than "find validation"
- **Use natural language**: Describe what the code does, not just keywords
- **Include context**: Mention the domain or area (e.g., "user authentication" not just "auth")
- **Iterate**: Start broad, then refine based on results

## Related Commands

- `/semantic-index` - Rebuild the semantic search index
- `/semantic-explain` - Get AI explanations of search results
