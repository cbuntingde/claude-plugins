#!/usr/bin/env bash
# Check if knowledge index needs updating
# Runs on session start to ensure fresh data

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
INDEX_DIR="${PLUGIN_ROOT}/data/knowledge_index"
LOCK_FILE="${INDEX_DIR}/.update_lock"

# Create index directory if it doesn't exist
mkdir -p "$INDEX_DIR"

# Check if index is stale (older than 24 hours)
if [ -f "${INDEX_DIR}/.last_update" ]; then
    last_update=$(stat -c %Y "${INDEX_DIR}/.last_update" 2>/dev/null || stat -f %m "${INDEX_DIR}/.last_update")
    current_time=$(date +%s)
    age=$((current_time - last_update))
    max_age=86400  # 24 hours

    if [ $age -lt $max_age ]; then
        # Index is fresh, no update needed
        exit 0
    fi
fi

# Check if update is already running
if [ -f "$LOCK_FILE" ]; then
    lock_age=$(($(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || stat -f %m "$LOCK_FILE")))
    if [ $lock_age -lt 3600 ]; then
        # Lock file is recent, another process is updating
        exit 0
    fi
    # Lock is stale, remove it
    rm -f "$LOCK_FILE"
fi

# Create lock file
touch "$LOCK_FILE"

# Trigger background index update
nohup bash "${PLUGIN_ROOT}/scripts/update-index.sh" > "${INDEX_DIR}/update.log" 2>&1 &

echo "Knowledge index update scheduled in background"
