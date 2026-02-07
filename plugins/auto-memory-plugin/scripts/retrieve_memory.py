#!/usr/bin/env python3
"""
Automatic Memory Retrieve Script
Two-phase retrieval: similarity-based filtering (Phase A), then value-aware selection (Phase B).
This script is called by the auto-warmstart agent during SessionStart hooks.
"""

import json
import os
import math
import sys
from pathlib import Path
from datetime import datetime, UTC

# Paths
PLUGIN_ROOT = Path(__file__).parent.parent
MEMORY_DATA_DIR = PLUGIN_ROOT / "auto-data"
SESSIONS_DIR = MEMORY_DATA_DIR / "sessions"


def load_all_memories() -> list[dict]:
    """Load all memories from all sessions across the plugin."""
    memories = []

    if not SESSIONS_DIR.exists():
        return memories

    for session_id in SESSIONS_DIR.iterdir():
        if not session_id.is_dir():
            continue

        for memory_file in session_id.glob("*.json"):
            try:
                with open(memory_file, "r") as f:
                    entry = json.load(f)
                    entry["file_path"] = str(memory_file)
                    memories.append(entry)
            except (json.JSONDecodeError, IOError):
                continue

    return memories


def cosine_similarity(query_words: set[str], text: str) -> float:
    """Simple cosine similarity using keyword matching."""
    text_words = set(text.lower().split())

    if not query_words or not text_words:
        return 0.0

    intersection = query_words & text_words
    dot_product = len(intersection)

    magnitude_query = math.sqrt(len(query_words))
    magnitude_text = math.sqrt(len(text_words))

    if magnitude_query == 0 or magnitude_text == 0:
        return 0.0

    return dot_product / (magnitude_query * magnitude_text)


def similarity_based_recall(
    query: str,
    project_context: str = None,
    memories: list[dict] = None,
    threshold: float = 0.1,
    top_k: int = 20,
) -> list[dict]:
    """
    Phase A: Filter candidates by semantic similarity.
    Uses keyword-based similarity (could be enhanced with embeddings).
    """
    if memories is None:
        memories = load_all_memories()

    # Combine query text and project context
    combined_query = query
    if project_context:
        combined_query = f"{query} {project_context}"

    query_words = set(combined_query.lower().split())

    scored = []
    for memory in memories:
        # Combine intent and experience for similarity
        combined_text = f"{memory['intent']} {memory['experience']}"

        # Also consider context info if available
        if "context" in memory:
            context_text = f"{memory['context'].get('file', '')} {memory['context'].get('fileType', '')}"
            combined_text = f"{combined_text} {context_text}"

        similarity = cosine_similarity(query_words, combined_text)

        if similarity > threshold:
            memory["_similarity_score"] = round(similarity, 4)
            memory["project"] = memory.get("context", {}).get("project", "unknown")
            scored.append(memory)

    # Sort by similarity and take top K
    scored.sort(key=lambda m: m["_similarity_score"], reverse=True)
    return scored[:top_k]


def value_aware_selection(
    candidates: list[dict],
    lambda_: float = 0.5,
    top_k: int = 5,
) -> list[dict]:
    """
    Phase B: Select optimal memories combining similarity with learned utility.
    score = (1-λ) * similarity + λ * utility
    """
    for memory in candidates:
        similarity = memory.get("_similarity_score", 0.0)
        utility = memory.get("utility", 0.0)

        memory["_final_score"] = round((1 - lambda_) * similarity + lambda_ * utility, 4)

    # Sort by combined score
    candidates.sort(key=lambda m: m["_final_score"], reverse=True)
    return candidates[:top_k]


def format_memory(memory: dict, index: int) -> str:
    """Format a memory for display."""
    lines = [
        f"",
        f"{'=' * 60}",
        f"Memory #{index + 1}",
        f"{'=' * 60}",
        f"ID: {memory['id'][:8]}...",
        f"Session: {memory['sessionId'][:12]}...",
        f"Utility: {memory['utility']:.3f}",
        f"Similarity: {memory.get('_similarity_score', 0.0):.3f}",
        f"Project: {memory.get('project', 'unknown')}",
        f"",
        f"Intent:",
        f"  {memory['intent']}",
        f"",
        f"Experience:",
        f"  {memory['experience']}",
        f"{'=' * 60}",
    ]
    return "\n".join(lines)


def main():
    """Handle CLI invocation with options for programmatic use."""
    if len(sys.argv) < 2:
        print("Automatic Memory Retrieve Script")
        print("\nUsage:")
        print("  python retrieve_memory.py <query> [lambda] [top_k] [--project <context>]")
        print("\nArguments:")
        print("  query    - Search query text")
        print("  lambda   - Balance between similarity and utility (0-1, default: 0.5)")
        print("  top_k    - Number of results to return (default: 5)")
        print("  --project - Optional project/context information to improve filtering")
        print("\nExample:")
        print('retrieve_memory.py "React state update problem" 0.5 5')
        sys.exit(1)

    query = sys.argv[1]
    lambda_ = 0.5

    # Parse optional arguments
    i = 2
    top_k = 5
    project_context = None

    while i < len(sys.argv):
        if sys.argv[i] == "--project" and i + 1 < len(sys.argv):
            project_context = sys.argv[i + 1]
            i += 2
        else:
            try:
                lambda_ = float(sys.argv[i])
                del sys.argv[i]  # Remove for remaining parsing
            except (IndexError, ValueError):
                i += 1

    try:
        lambda_ = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
        top_k = int(sys.argv[3]) if len(sys.argv) > 3 else 5
    except (IndexError, ValueError):
        pass

    # Load memories
    memories = load_all_memories()

    if not memories:
        print("No memories found in storage.")
        json.dump([], sys.stdout)
        sys.exit(0)

    sessions_count = len(list(SESSIONS_DIR.glob('*'))) if SESSIONS_DIR.exists() else 0
    print(f"Loaded {len(memories)} memories from {sessions_count} sessions.")

    # Two-phase retrieval
    candidates = similarity_based_recall(query, project_context, memories)

    if not candidates:
        print("No semantically similar memories found.")
        json.dump([], sys.stdout)
        sys.exit(0)

    results = value_aware_selection(candidates, lambda_, top_k)

    # Output results as JSON for programmatic use
    output = []
    for i, memory in enumerate(results):
        memory_entry = {
            "id": memory["id"],
            "session_id": memory["sessionId"],
            "project": memory.get("project", "unknown"),
            "utility": memory["utility"],
            "similarity": memory.get("_similarity_score", 0.0),
            "final_score": memory.get("_final_score", 0.0),
            "intent": memory["intent"],
            "experience": memory["experience"],
            "timestamp": memory["timestamp"],
        }
        output.append(memory_entry)

    json.dump(output, sys.stdout, indent=2)
    sys.exit(0)


if __name__ == "__main__":
    main()