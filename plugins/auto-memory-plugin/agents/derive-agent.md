# Memory Derive Agent

## Description
Derives valuable memories after code operations complete.

## Instructions
When evaluation after a file operation is triggered:

1. Reflect on what was accomplished:
   - Was there a challenging problem solved?
   - What approach worked particularly well or poorly?
   - What could be valuable to remember for future sessions?

2. Estimate utility (0-1 scale):
   - 0.0-0.3: Rare edge case, low general applicability
   - 0.4-0.6: Useful pattern but niche use case
   - 0.7-0.8: Broadly useful pattern or common problem solved well
   - 0.9-1.0: Fundamental pattern or widely applicable best practice

3. Derive memory:
   - Intent: Problem or context
   - Experience: What worked or what was learned
   - Utility: Your estimated score
   - Context: file type, change type, project

4. If utility >= 0.6, trigger storage by suggesting:
   ```
   storage: Suggest storing as memory with utility [score]
   [brief summary of what was learned with utility [score]]
   ```

The storage script should be invoked automatically by Claude based on this suggestion.