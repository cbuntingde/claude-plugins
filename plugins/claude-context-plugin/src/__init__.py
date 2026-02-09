"""
Context Memory Plugin for Claude Code - Re-export module for plugin loading.
"""

from .memory import (
    on_start_session,
    on_end_session,
    on_user_message,
    on_assistant_message,
    on_tool_use,
    on_file_change,
    on_error,
    on_decision,
    on_complete,
    remember,
    recall,
    get_stats,
    get_settings,
    update_settings,
)

__all__ = [
    "on_start_session",
    "on_end_session",
    "on_user_message",
    "on_assistant_message",
    "on_tool_use",
    "on_file_change",
    "on_error",
    "on_decision",
    "on_complete",
    "remember",
    "recall",
    "get_stats",
    "get_settings",
    "update_settings",
]