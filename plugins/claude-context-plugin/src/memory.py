"""
Context Memory Plugin for Claude Code - Native Plugin with Auto Hooks

This plugin automatically captures context throughout Claude Code sessions:
- Session lifecycle tracking
- Message capture (user and assistant)
- Tool usage tracking
- File change monitoring
- Error learning
- Decision tracking

Installation:
    # Copy to Claude Code plugins directory
    cp -r plugin ~/.claude/plugins/context-memory

    # Or install via claude plugin command
    claude plugin install /home/gsxrchris/claude-context-plugin/plugin
"""

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from claude_code_sdk import hook
    HAS_SDK = True
except ImportError:
    HAS_SDK = False
    hook = lambda x: x  # Fallback decorator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - context-memory - %(levelname)s - %(message)s",
)
logger = logging.getLogger("context-memory-plugin")

# Shared storage path
STORAGE_DIR = Path.home() / ".claude" / "context-memory"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = STORAGE_DIR / "memory.db"

# Session state (persists across hook calls)
_session_state: dict = {}


def _get_db():
    """Get or create SQLite connection."""
    import sqlite3
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    """Initialize database schema."""
    conn = _get_db()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                category TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                metadata TEXT,
                importance REAL DEFAULT 0.5,
                tags TEXT,
                source TEXT DEFAULT 'hook'
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                project_path TEXT,
                working_directory TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT,
                summary TEXT,
                key_decisions TEXT,
                errors_encountered TEXT,
                files_modified TEXT,
                tools_used TEXT,
                messages TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS error_learnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                error_hash TEXT UNIQUE,
                error_type TEXT,
                error_text TEXT,
                suggestion TEXT,
                solution TEXT,
                frequency INTEGER DEFAULT 1,
                first_seen TEXT,
                last_seen TEXT
            )
        """)
        conn.commit()
    finally:
        conn.close()


# Initialize database on module load
try:
    _init_db()
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")


def _generate_id():
    """Generate a unique ID."""
    import hashlib
    return hashlib.md5(f"{datetime.now().isoformat()}".encode()).hexdigest()[:16]


# Plugin settings
_settings = {
    "auto_capture": True,
    "learn_from_errors": True,
    "min_importance": 0.6,
}


# ============================================================================
# Plugin Hooks - These run automatically with Claude Code
# ============================================================================

if HAS_SDK:
    @hook
    def on_start_session(project_path: str | None = None, **kwargs) -> dict:
        """Called when a new Claude session starts."""
        session_id = _generate_id()
        _session_state[session_id] = {
            "project_path": project_path,
            "messages": [],
            "tools": [],
            "files": [],
            "decisions": [],
            "errors": [],
            "start_time": datetime.now().isoformat(),
        }

        conn = _get_db()
        try:
            conn.execute("""
                INSERT INTO sessions
                (session_id, project_path, working_directory, start_time, end_time,
                 summary, key_decisions, errors_encountered, files_modified, tools_used, messages)
                VALUES (?, ?, ?, ?, NULL, NULL, '[]', '[]', '[]', '[]', '[]')
            """, (
                session_id,
                project_path,
                str(Path.cwd()),
            ))
            conn.commit()
        finally:
            conn.close()

        logger.info(f"Session started: {session_id[:8]}")
        return {"session_id": session_id}

    @hook
    def on_end_session(session_id: str | None = None, **kwargs) -> dict:
        """Called when a Claude session ends."""
        if not session_id:
            # Find most recent session
            conn = _get_db()
            try:
                row = conn.execute(
                    "SELECT session_id FROM sessions WHERE end_time IS NULL ORDER BY start_time DESC"
                ).fetchone()
                if row:
                    session_id = row["session_id"]
            finally:
                conn.close()

        if session_id and session_id in _session_state:
            state = _session_state[session_id]

            # Generate summary
            parts = []
            if state["decisions"]:
                parts.append(f"Made {len(state['decisions'])} decision(s)")
            if state["files"]:
                parts.append(f"Modified {len(state['files'])} file(s)")
            if state["tools"]:
                parts.append(f"Used {len(state['tools'])} tool(s)")
            if state["errors"]:
                parts.append(f"Encountered {len(state['errors'])} error(s)")

            summary = "; ".join(parts) if parts else "Session completed"

            # Update session
            conn = _get_db()
            try:
                conn.execute("""
                    UPDATE sessions SET
                        end_time = ?,
                        summary = ?,
                        key_decisions = ?,
                        errors_encountered = ?,
                        files_modified = ?,
                        tools_used = ?,
                        messages = ?
                    WHERE session_id = ?
                """, (
                    datetime.now().isoformat(),
                    summary,
                    json.dumps(state["decisions"]),
                    json.dumps(state["errors"]),
                    json.dumps(list(set(state["files"]))),
                    json.dumps(list(set(state["tools"]))),
                    json.dumps(state["messages"]),
                    session_id,
                ))
                conn.commit()
            finally:
                conn.close()

            del _session_state[session_id]
            logger.info(f"Session ended: {session_id[:8]}, summary: {summary}")

            return {"session_ended": True, "session_id": session_id, "summary": summary}

        return {"session_ended": False, "error": "No active session"}

    @hook
    def on_user_message(message: str, **kwargs) -> dict:
        """Called when user sends a message."""
        if not _settings["auto_capture"]:
            return {"captured": False}

        session_id = _get_active_session()
        if session_id and session_id in _session_state:
            _session_state[session_id]["messages"].append({
                "role": "user",
                "content": message[:10000],
                "timestamp": datetime.now().isoformat(),
            })
            logger.debug(f"Captured user message in session {session_id[:8]}")

        return {"captured": True}

    @hook
    def on_assistant_message(message: str, **kwargs) -> dict:
        """Called when assistant sends a message."""
        if not _settings["auto_capture"]:
            return {"captured": False}

        session_id = _get_active_session()
        if session_id and session_id in _session_state:
            _session_state[session_id]["messages"].append({
                "role": "assistant",
                "content": message[:10000],
                "timestamp": datetime.now().isoformat(),
            })

            # Auto-learn from important content
            _auto_learn_from_message(message)

        return {"captured": True}

    @hook
    def on_tool_use(tool_name: str, input_data: dict | None = None, result: dict | None = None, **kwargs) -> dict:
        """Called when a tool is used."""
        session_id = _get_active_session()
        if session_id and session_id in _session_state:
            _session_state[session_id]["tools"].append(tool_name)

        return {"tracked": True}

    @hook
    def on_file_change(file_path: str, change_type: str, **kwargs) -> dict:
        """Called when a file is modified."""
        session_id = _get_active_session()
        if session_id and session_id in _session_state:
            if change_type in ("create", "modify", "delete"):
                _session_state[session_id]["files"].append(file_path)

        return {"tracked": True}

    @hook
    def on_error(error_text: str, error_type: str = "runtime", context: str | None = None, solution: str | None = None, **kwargs) -> dict:
        """Called when an error occurs."""
        if not _settings["learn_from_errors"]:
            return {"learned": False}

        import hashlib
        error_hash = hashlib.md5(error_text.encode()).hexdigest()
        now = datetime.now().isoformat()

        session_id = _get_active_session()
        if session_id and session_id in _session_state:
            _session_state[session_id]["errors"].append({
                "error": error_text,
                "type": error_type,
                "timestamp": now,
            })

        # Learn from error
        conn = _get_db()
        try:
            existing = conn.execute(
                "SELECT frequency FROM error_learnings WHERE error_hash = ?",
                (error_hash,)
            ).fetchone()

            if existing:
                freq = existing["frequency"] + 1
                conn.execute("""
                    UPDATE error_learnings SET frequency = ?, last_seen = ?
                    WHERE error_hash = ?
                """, (freq, now, error_hash))
            else:
                suggestion = _get_error_suggestion(error_type)
                conn.execute("""
                    INSERT INTO error_learnings
                    (error_hash, error_type, error_text, suggestion, solution, frequency, first_seen, last_seen)
                    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                """, (error_hash, error_type, error_text, suggestion, solution, now, now))
            conn.commit()
        finally:
            conn.close()

        logger.info(f"Learned error: {error_type} (hash: {error_hash[:8]})")
        return {"learned": True, "error_type": error_type}

    @hook
    def on_decision(decision: str, reasoning: str | None = None, **kwargs) -> dict:
        """Called when an important decision is made."""
        session_id = _get_active_session()
        decision_text = f"Decision: {decision}"
        if reasoning:
            decision_text += f" | Reasoning: {reasoning}"

        if session_id and session_id in _session_state:
            _session_state[session_id]["decisions"].append(decision_text)

        # Also save as memory
        conn = _get_db()
        try:
            conn.execute("""
                INSERT INTO memories (id, content, category, timestamp, metadata, importance, tags, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                _generate_id(),
                decision_text,
                "decision",
                datetime.now().isoformat(),
                json.dumps({"reasoning": reasoning} if reasoning else {}),
                0.95,
                json.dumps(["decision", "important"]),
                "hook",
            ))
            conn.commit()
        finally:
            conn.close()

        return {"captured": True}

    @hook
    def on_complete(**kwargs) -> dict:
        """Called when a task completes."""
        session_id = _get_active_session()
        if session_id and session_id in _session_state:
            state = _session_state[session_id]
            logger.info(f"Task complete for session {session_id[:8]}: {len(state['messages'])} msgs, {len(state['tools'])} tools")

        return {"complete": True}


# ============================================================================
# Helper Functions
# ============================================================================

def _get_active_session() -> str | None:
    """Get the most recent active session ID."""
    conn = _get_db()
    try:
        row = conn.execute(
            "SELECT session_id FROM sessions WHERE end_time IS NULL ORDER BY start_time DESC"
        ).fetchone()
        return row["session_id"] if row else None
    finally:
        conn.close()


def _auto_learn_from_message(message: str) -> None:
    """Automatically learn important content from a message."""
    importance_keywords = {
        "critical": 1.0,
        "important": 0.9,
        "remember": 0.8,
        "crucial": 0.95,
        "key decision": 0.9,
    }

    message_lower = message.lower()
    importance = 0.5

    for keyword, weight in importance_keywords.items():
        if keyword in message_lower:
            importance = max(importance, weight)

    if importance >= _settings["min_importance"]:
        # Determine category
        category = "general"
        if any(w in message_lower for w in ["fix", "bug", "error", "issue"]):
            category = "bug_fix"
        elif any(w in message_lower for w in ["add", "create", "implement", "new"]):
            category = "feature"
        elif any(w in message_lower for w in ["config", "setting", "env"]):
            category = "config"
        elif any(w in message_lower for w in ["test", "verify"]):
            category = "testing"

        conn = _get_db()
        try:
            conn.execute("""
                INSERT INTO memories (id, content, category, timestamp, metadata, importance, tags, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                _generate_id(),
                message[:5000],  # Truncate long messages
                category,
                datetime.now().isoformat(),
                json.dumps({"auto_learned": True}),
                importance,
                json.dumps(["auto-learned", category]),
                "hook",
            ))
            conn.commit()
        finally:
            conn.close()


def _get_error_suggestion(error_type: str) -> str:
    """Get suggested fix for error type."""
    suggestions = {
        "syntax": "Check for missing colons, parentheses, or indentation issues",
        "import": "Install missing dependency with pip install <module-name>",
        "type": "Check type conversions and function argument types",
        "value": "Validate input values and type conversions",
        "io": "Check file paths, permissions, and that files exist",
        "runtime": "Check for uninitialized variables or logic errors",
        "assertion": "Verify assumptions about code state",
        "reference": "Check variable/function names and imports",
    }
    return suggestions.get(error_type, "Review the error message and code context")


# ============================================================================
# Plugin Settings
# ============================================================================

def get_settings() -> dict:
    """Get current plugin settings."""
    return _settings


def update_settings(new_settings: dict) -> dict:
    """Update plugin settings."""
    _settings.update(new_settings)
    return _settings


# ============================================================================
# Public API (for use from MCP server or other plugins)
# ============================================================================

def remember(content: str, category: str = "general", importance: float = 0.7, tags: list | None = None) -> dict:
    """Remember important information."""
    conn = _get_db()
    try:
        conn.execute("""
            INSERT INTO memories (id, content, category, timestamp, metadata, importance, tags, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            _generate_id(),
            content,
            category,
            datetime.now().isoformat(),
            json.dumps({}),
            importance,
            json.dumps(tags or []),
            "plugin_api",
        ))
        conn.commit()
    finally:
        conn.close()
    return {"remembered": True}


def recall(query: str | None = None, category: str | None = None, limit: int = 20) -> list[dict]:
    """Recall remembered information."""
    conn = _get_db()
    try:
        sql = "SELECT * FROM memories WHERE 1=1"
        params = []

        if category:
            sql += " AND category = ?"
            params.append(category)
        if query:
            sql += " AND content LIKE ?"
            params.append(f"%{query}%")

        sql += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        rows = conn.execute(sql, params).fetchall()
        return [
            {
                "id": row["id"],
                "content": row["content"],
                "category": row["category"],
                "timestamp": row["timestamp"],
                "importance": row["importance"],
                "tags": json.loads(row["tags"] or "[]"),
            }
            for row in rows
        ]
    finally:
        conn.close()


def get_stats() -> dict:
    """Get memory statistics."""
    conn = _get_db()
    try:
        mem_count = conn.execute("SELECT COUNT(*) FROM memories").fetchone()[0]
        session_count = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
        error_count = conn.execute("SELECT COUNT(*) FROM error_learnings").fetchone()[0]
        return {
            "total_memories": mem_count,
            "total_sessions": session_count,
            "total_errors": error_count,
            "database": str(DB_PATH),
        }
    finally:
        conn.close()


# Export module info for plugin loading
__version__ = "1.0.0"
__all__ = [
    "remember",
    "recall",
    "get_stats",
    "get_settings",
    "update_settings",
    "on_start_session",
    "on_end_session",
    "on_user_message",
    "on_assistant_message",
    "on_tool_use",
    "on_file_change",
    "on_error",
    "on_decision",
    "on_complete",
]