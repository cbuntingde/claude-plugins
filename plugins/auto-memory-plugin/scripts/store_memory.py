#!/usr/bin/env python3
"""
Automatic Memory Store Script
Implements Intent-Experience-Utility triplet storage for MemRL-inspired memory system.
This script is called by hook agents when valuable patterns are detected.
"""

import json
import os
import sys
import uuid
from datetime import datetime, UTC
from pathlib import Path

# Paths
PLUGIN_ROOT = Path(__file__).parent.parent
MEMORY_DATA_DIR = PLUGIN_ROOT / "auto-data"
SESSIONS_DIR = MEMORY_DATA_DIR / "sessions"


def create_session_dir(session_id: str) -> Path:
    """Create session directory if it doesn't exist."""
    session_dir = SESSIONS_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    return session_dir


def generate_memory_entry(
    intent: str,
    experience: str,
    utility: float,
    session_id: str,
    context: dict = None,
) -> dict:
    """Generate a memory triplet with metadata."""
    if not 0.0 <= utility <= 1.0:
        raise ValueError("Utility must be between 0 and 1")

    entry = {
        "id": str(uuid.uuid4()),
        "intent": intent.strip(),
        "experience": experience.strip(),
        "utility": float(utility),
        "sessionId": session_id,
        "timestamp": datetime.now(UTC).isoformat(),
        "embedding": None,  # Reserved for future semantic embeddings
    }

    if context:
        entry["context"] = {
            "file": str(context.get("file", "")) if context.get("file") else "",
            "fileType": context.get("fileType", ""),
            "changeType": context.get("changeType", ""),
            "project": context.get("project", os.getenv("CLAUDE_PROJECT_NAME", "unknown")),
        }

    return entry


def save_memory(entry: dict) -> Path:
    """Save memory entry to session-specific file."""
    session_id = entry["sessionId"]
    session_dir = create_session_dir(session_id)
    memory_file = session_dir / f"{entry['id']}.json"

    with open(memory_file, "w") as f:
        json.dump(entry, f, indent=2)

    return memory_file


def main():
    """Handle CLI invocation from hooks."""
    # Expected JSON input via stdin or args
    if len(sys.argv) >= 2:
        # If called with arguments
        if len(sys.argv) == 2 and sys.argv[1] == "--help":
            print("Automatic Memory Storage Script")
            print("\nOptions:")
            print("  --help    Show this help message")
            print("\nData can be passed either as JSON via stdin or as arguments:")
            print("  stdin: echo '{\"intent\": \"...\", \"experience\": \"...\", \"utility\": 0.7}' | python store_memory.py")
            print("  CLI: python store_memory.py --stdin")
            sys.exit(0)

        # If --stdin flag, read JSON from stdin
        if sys.argv[1] == "--stdin":
            try:
                data = json.loads(sys.stdin.read())
            except json.JSONDecodeError as e:
                print(f"Error reading JSON from stdin: {e}", file=sys.stderr)
                sys.exit(1)

            session_id = data.get("sessionId", os.environ.get("CLAUDE_SESSION_ID", "unknown"))
            intent = data.get("intent", "")
            experience = data.get("experience", "")
            utility = data.get("utility", 0.5)

            if not intent:
                print("Error: 'intent' field is required", file=sys.stderr)
                sys.exit(1)

            if experience == "":
                experience = "No experience description provided"

        # If called directly with arguments (legacy mode)
        else:
            session_id = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("CLAUDE_SESSION_ID", "unknown")
            intent = sys.argv[2] if len(sys.argv) > 2 else ""
            experience = sys.argv[3] if len(sys.argv) > 3 else ""
            utility = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5

            if not intent:
                print("Error: 'intent' (argument 2) is required", file=sys.stderr)
                sys.exit(1)

            if experience == "":
                experience = "No experience description provided"

    else:
        print("Usage: python store_memory.py [--stdin] (<session_id> <intent> <experience> <utility>)", file=sys.stderr)
        print("\nOr pass data via JSON stdin:", file=sys.stderr)
        print('echo \'{"intent": "How to fix React state", "experience": "Use functional setState", "utility": 0.85}\' | python store_memory.py --stdin', file=sys.stderr)
        sys.exit(1)

    try:
        context = data.get("context", {}) if "data" in locals() else {}
        entry = generate_memory_entry(intent, experience, utility, session_id, context)
        memory_file = save_memory(entry)

        print(json.dumps({
            "success": True,
            "memory_id": entry["id"],
            "utility": entry["utility"],
            "stored_at": str(memory_file),
        }))
    except Exception as e:
        print(f"Error storing memory: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()