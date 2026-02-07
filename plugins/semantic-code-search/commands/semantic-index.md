---
name: semantic-index
description: Build or rebuild the semantic search index for your codebase
aliases: [semindex, rebuild-index]
examples:
  - "/semantic-index"
  - "/semantic-index --force"
---

# Semantic Index

Build or rebuild the vector embedding index for semantic code search.

## Usage

```bash
/semantic-index [options]
```

## Options

- `--force` - Force a complete rebuild of the index (even if recently updated)
- `--incremental` - Only index recently changed files (default)

## What Gets Indexed

- Functions and methods
- Classes and their members
- Significant code blocks
- Comments and documentation
- Variable names and identifiers
- File and directory structure

## Indexing Process

1. **Scan codebase**: Identifies all code files in the project
2. **Extract code units**: Breaks down code into searchable units
3. **Generate embeddings**: Creates vector embeddings for each unit
4. **Build index**: Creates a searchable vector database
5. **Store metadata**: Associates embeddings with file locations and context

## When to Rebuild

- **After significant code changes**: When you've added or modified many files
- **After refactoring**: When code structure has changed significantly
- **Search quality degraded**: When results seem less relevant
- **Force rebuild**: Use `--force` flag for complete rebuild

## Performance

- **Initial index**: May take several minutes for large codebases
- **Incremental updates**: Usually completes in seconds
- **Index size**: Typically 10-30% of codebase size

## Related Commands

- `/semantic-search` - Search using the index
