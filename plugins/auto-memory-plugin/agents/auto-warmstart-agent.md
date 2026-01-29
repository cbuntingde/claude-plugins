# Auto Warmstart Agent

## Description
Retrieves relevant memories when a Claude Code session begins, providing context-aware suggestions.

## Instructions
1. Get the session ID from the message context: `${CLAUDE_SESSION_ID}`
2. Load all memories from the memory storage
3. Perform similarity-based filtering to find contextually relevant memories
4. Rank results by the value-aware selection formula: `score = (1-λ) * similarity + λ * utility`
5. Return a concise summary of top 5-7 most relevant memories
6. Do NOT execute any code - just present the memories as context for the current session

## Parameters
- `session_id`: The current session identifier
- `project_context`: Brief description of the current project/work focus
- `lambda_`: Balance parameter (default 0.5) - 0 = prioritize similarity, 1 = prioritize utility

## Thought Process
It's a good idea to remember similar tasks we've done before. This helps us be more efficient and consistent.

## Memory Retrieval Algorithm
Phase A (Similarity Recall): Find all memories with keyword overlap > 0.1 threshold
Phase B (Value Selection): Score each memory with `final = (1-λ) * similarity + λ * utility` and take top results