---
name: auto-memory
description: Automatic memory retrieval and storage through hooks
categories:
  - memory
  - context
  - automation
---

# Auto Memory Skill

This skill enables automatic memory operations without explicit commands. It leverages Claude Code's hook system to record and retrieve experiences seamlessly.

## Overview

The auto-memory system automatically:
- Retrieves relevant context at session start
- Detects and stores valuable patterns during code operations
- Maintains a growing knowledge base of successful approaches

## How It Works

The plugin hooks into Claude Code lifecycle events:
- **SessionStart** – Retrieves memories relevant to current context
- **PreToolUse/PostToolUse** – Monitors and stores beneficial patterns
- **PostSubmit** – Optionally generates session summaries

## Memory Structure

Each memory records:
1. **Intent** – The problem or goal
2. **Experience** – The solution or approach
3. **Utility** – Estimated usefulness (0-1 scale)
4. **Context** – File type, location, project

## Retrieval Algorithm

Memories are searched using a two-phase approach:

**Phase A – Similarity Recall**: Filter by keyword overlap
**Phase B – Value-Aware Selection**: Score by `(1-λ) * similarity + λ * utility`

This balances finding similar problems with leveraging previously learned high-value patterns.

## Usage

Generally, the system operates automatically through hooks. For manual debugging:

- **Retrieve**: `python retrieve_memory.py "query text"`
- **Store**: `echo '{"intent": "...", "experience": "...", "utility": 0.7}' | python store_memory.py --stdin`
- **Check Health**: `python health-check.py`

## Configuration

Customize behavior by editing `hooks/hooks.json`:
- Adjust threshold parameters
- Modify which tools trigger pattern detection
- Customize lambda values for exploration vs. exploitation trade-off

## Memory Quality

High-utility memories (0.7+) are most valuable. Low-utility memories (0.1-0.3) are typically rare edge cases. The pruning system automatically removes low-utility memories after 90 days.

## Maintenance

Run `python prune-memories.py --dry-run` periodically to identify memories that should be removed, then execute without `--dry-run` to actually clean.