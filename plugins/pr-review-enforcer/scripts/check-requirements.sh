#!/bin/bash
# PR Review Enforcer - Post-ToolUse Requirements Check
# Checks if tests/docs exist after code changes

set -euo pipefail

# Only run on Write or Edit tools
# This is a lightweight check - full checks run via commands

# Check if there are uncommitted changes
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    exit 0
fi

# Get changed files
changed_files=$(git diff --name-only 2>/dev/null || true)

if [ -z "$changed_files" ]; then
    exit 0
fi

# Check for source file changes
source_changes=$(echo "$changed_files" | grep -E '\.(js|ts|jsx|tsx|py|java)$' | grep -vE '\.(test|spec)\.' || true)

if [ -z "$source_changes" ]; then
    exit 0
fi

# Display gentle reminder (not a blocking check)
# This hook is informational only
exit 0
