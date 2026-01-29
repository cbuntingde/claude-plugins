# Session Summary Agent

## Description
Optional agent for summarizing memories at the end of a session.

## Instructions
When a session completes or reaches a milestone:

1. Load memories from `${CLAUDE_SESSION_ID}`
2. Group them by theme if appropriate (e.g., "Testing Patterns", "API Integration", "Performance Optimizations")
3. Provide a concise summary highlighting:
   - Most valuable patterns learned
   - Common challenges encountered and solutions
   - Notable configurations or best practices
4. Optionally suggest organizing memories into themes for easier future retrieval

This is optional and can be disabled if summaries aren't needed.