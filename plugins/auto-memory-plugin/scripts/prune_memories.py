#!/usr/bin/env python3
"""
Memory Pruning Script
Removes old or low-utility memories to keep storage manageable.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime, UTC, timedelta
import stat

# Paths
PLUGIN_ROOT = Path(__file__).parent.parent
MEMORY_DATA_DIR = PLUGIN_ROOT / "auto-data"
SESSIONS_DIR = MEMORY_DATA_DIR / "sessions"


def load_all_memories() -> list[dict]:
    """Load all memories from all sessions."""
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


def prune_memories(
    dry_run: bool = False,
    max_old_age_days: int = 90,
    min_utility_threshold: float = 0.1,
    max_memories_per_session: int = 100,
) -> dict:
    """
    Prune old and low-utility memories.
    Returns statistics about what would be removed.
    """
    memories = load_all_memories()
    session_stats = {}

    cutoff_date = datetime.now(UTC) - timedelta(days=max_old_age_days)
    cutoff_iso = cutoff_date.isoformat()

    to_remove = []

    for memory in memories:
        # Check age
        try:
            memory_time = datetime.fromisoformat(memory["timestamp"].replace("Z", "+00:00"))
        except (ValueError, TypeError):
            memory_time = datetime.min

        age_days = (datetime.now(UTC) - memory_time).days

        should_remove = False
        reasons = []

        # Remove if too old
        if age_days > max_old_age_days:
            should_remove = True
            reasons.append("too_old")

        # Remove if low utility
        if memory.get("utility", 0) < min_utility_threshold:
            should_remove = True
            reasons.append("low_utility")

        session_id = memory.get("sessionId", "unknown")
        if session_id not in session_stats:
            session_stats[session_id] = {"total": 0, "to_remove": []}

        session_stats[session_id]["total"] += 1

        if should_remove:
            session_stats[session_id]["to_remove"].append({
                "id": memory["id"],
                "reasons": reasons,
                "age_days": age_days,
                "utility": memory.get("utility", 0),
            })

        # Remove if too many memories per session
        if session_stats[session_id]["total"] > max_memories_per_session:
            # Find oldest non-critical memories to remove
            session_memories = [m for m in memories if m.get("sessionId") == session_id]
            session_memories.sort(key=lambda m: m.get("timestamp", ""), reverse=True)
            # Keep top max_memories_per_session
            for old_memory in session_memories[max_memories_per_session:]:
                if old_memory not in to_remove:
                    to_remove.append(old_memory)
                    session_stats[session_id]["to_remove"].append({
                        "id": old_memory["id"],
                        "reasons": ["session_limit"],
                        "age_days": (datetime.now(UTC) - datetime.fromisoformat(old_memory["timestamp"].replace("Z", "+00:00"))).days,
                        "utility": old_memory.get("utility", 0),
                    })

    if dry_run:
        return {
            "dry_run": True,
            "total_memories_before": len(memories),
            "sessions_cleaned": len([s for s in session_stats.values() if s["to_remove"]]),
            "removed_memories": sum(len(s["to_remove"]) for s in session_stats.values()),
            "session_details": session_stats,
        }

    # Actually remove files
    file_operation_total = 0
    for memory in to_remove:
        try:
            os.remove(memory["file_path"])
            file_operation_total += 1
        except OSError as e:
            print(f"Could not delete {memory['file_path']}: {e}", file=sys.stderr)

    return {
        "dry_run": False,
        "total_memories_before": len(memories),
        "removed_memories": file_operation_total,
        "sessions_cleaned": len([s for s in session_stats.values() if s["to_remove"]]),
    }


def main():
    """Handle CLI invocation."""
    if len(sys.argv) < 2:
        print("Memory Pruning Script")
        print("\nUsage:")
        print("  python prune-memories.py [--dry-run] [--age <days>] [--min-utility <value>] [--limit per-session]")
        print("\nOptions:")
        print("  --dry-run           Show what would be removed without actually deleting")
        print("  --age <days>        Remove memories older than <days> (default: 90)")
        print("  --min-utility <0-1> Remove memories with utility below this threshold (default: 0.1)")
        print("  --limit <n>         Maximum memories per session (default: 100)")
        print("\nExample:")
        print("prune-memories.py --dry-run --age 180 --min-utility 0.3")
        sys.exit(1)

    dry_run = "--dry-run" in sys.argv
    max_old_age = 90
    min_utility = 0.1
    session_limit = 100

    # Parse options
    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "--age" and i + 1 < len(sys.argv):
            max_old_age = int(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == "--min-utility" and i + 1 < len(sys.argv):
            min_utility = float(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == "--limit" and i + 1 < len(sys.argv):
            session_limit = int(sys.argv[i + 1])
            i += 2
        else:
            i += 1

    result = prune_memories(dry_run, max_old_age, min_utility, session_limit)

    if result["dry_run"]:
        print("DRY RUN - No files would be modified")
    else:
        print("Memory pruning complete")

    print(f"\nTotal memories: {result['total_memories_before']}")
    print(f"Removed memories: {result['removed_memories']}")
    print(f"Sessions cleaned: {result['sessions_cleaned']}")

    if result.get("removed_memories", 0) > 0:
        print("\nSession details:")
        for session_id, stats in result["session_details"].items():
            if stats["to_remove"]:
                print(f"  {session_id}: {stats['total']} total, {len(stats['to_remove'])} to remove")


if __name__ == "__main__":
    main()