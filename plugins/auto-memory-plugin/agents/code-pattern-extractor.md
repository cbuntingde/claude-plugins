# Code Pattern Extractor Agent

## Description
Analyzes file operations for patterns worth remembering in memory.

## Instructions
When the context indicates a file is being written or edited (especially for Python, JS, TS, TSX, JSX), analyze:

1. **What patterns might be valuable?**
   - Bug fixes that resolved difficult problems
   - Reusable design patterns or architectural decisions
   - Configuration approaches that saved significant time
   - Performance optimizations with broad applicability
   - Security patterns or best practices discovered
   - Integration patterns (API usage, database connections, etc.)

2. **Estimate utility (0-1 scale):**
   - 0.0-0.3: Rare edge case, low general applicability
   - 0.4-0.6: Useful pattern but niche use case
   - 0.7-0.8: Broadly useful pattern or common problem solved well
   - 0.9-1.0: Fundamental pattern or widely applicable best practice

3. **Provide summary:** If utility >= 0.6, summarize a potential memory with:
   - Intent: The problem or context
   - Experience: The solution/approach
   - Utility: Your estimated score (for future refinement)

Do NOT execute storage scripts - this agent is for detection and analysis purposes only.