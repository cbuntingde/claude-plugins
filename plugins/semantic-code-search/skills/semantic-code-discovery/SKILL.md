---
name: semantic-code-discovery
description: Automatically discovers and understands code patterns using semantic search
triggers:
  - User asks to find code functionality
  - User searches for specific implementations
  - User explores unfamiliar codebase areas
  - User needs to locate business logic
---

# Semantic Code Discovery Skill

Automatically discovers code patterns and implementations using semantic understanding.

## When This Skill Activates

Claude automatically invokes this skill when you:

- Ask "Where do we handle X?"
- Request "Show me Y implementation"
- Search "Find Z functionality"
- Explore "How does W work?"

## Capabilities

- **Natural Language Understanding**: Interprets your intent, not just keywords
- **Semantic Matching**: Finds code regardless of variable/function names
- **Pattern Recognition**: Identifies similar implementations across codebase
- **Context Awareness**: Provides surrounding code and explanations
- **Relationship Mapping**: Shows connections between related code

## What It Does

1. **Analyzes Your Query**: Extracts semantic meaning from your question
2. **Searches Codebase**: Uses vector embeddings to find relevant code
3. **Ranks Results**: Orders by semantic similarity and relevance
4. **Provides Context**: Returns code with explanations and connections
5. **Suggests Alternatives**: Shows similar implementations when available

## Example Interactions

```
You: Where do we validate user input?
Claude: [Activates Semantic Code Discovery]
Found 3 implementations:

1. src/validation/user-validator.js (similarity: 0.89)
   - Validates email, password, username
   - Uses regex and schema validation

2. src/api/middleware/validation.js (similarity: 0.76)
   - Generic request validation middleware
   - Validates request body against schemas

3. src/forms/registration.js (similarity: 0.68)
   - Frontend form validation
   - Real-time user input validation
```

```
You: Show me retry logic
Claude: [Activates Semantic Code Discovery]
Found retry patterns in:

1. src/api/client.js (similarity: 0.91)
   - Exponential backoff retry for API calls
   - Max 3 retries, 100ms initial delay

2. src/database/connection.js (similarity: 0.84)
   - Database connection retry with jitter
   - Handles connection timeouts

3. src/workers/job-processor.js (similarity: 0.72)
   - Job retry with dead letter queue
   - 5 retry attempts with exponential delay
```

## Integration with Claude

This skill seamlessly integrates with Claude's existing tools:

- **Read**: Retrieves file contents when you select results
- **Grep**: Complements with traditional keyword search
- **Glob**: Finds files by pattern when needed
- **LSP**: Provides code intelligence for results

## Best Practices

- **Be Descriptive**: "find user authentication" is better than "find auth"
- **Provide Context**: Mention the domain or layer you're interested in
- **Iterate**: Start broad, then refine based on results
- **Explore**: Use results to discover related code patterns

## Technical Details

This skill uses the semantic search MCP server which:
1. Generates vector embeddings for code units
2. Builds searchable index of codebase
3. Performs cosine similarity searches
4. Returns ranked results with context

## Performance

- **Query Time**: <500ms for most codebases
- **Index Updates**: Automatic incremental updates
- **Memory Usage**: ~10-30% of codebase size
