#!/usr/bin/env bash
# Queue files for knowledge indexing after edits
# This script runs after Edit/Write tool use

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
QUEUE_FILE="${PLUGIN_ROOT}/data/index_queue.txt"

mkdir -p "$(dirname "$QUEUE_FILE")"

# Get the file path from arguments
if [ $# -gt 0 ]; then
    FILE_PATH="$1"

    # Validate FILE_PATH to prevent path traversal attacks
    # Reject paths containing parent directory references
    if [[ "$FILE_PATH" == *".."* ]]; then
        echo "Error: Invalid file path - path traversal not allowed" >&2
        exit 1
    fi

    # Reject absolute paths outside the workspace
    if [[ "$FILE_PATH" == /* ]]; then
        echo "Error: Invalid file path - absolute paths not allowed" >&2
        exit 1
    fi

    # Reject paths starting with dash (could be interpreted as options)
    if [[ "$FILE_PATH" == -* ]]; then
        echo "Error: Invalid file path - cannot start with dash" >&2
        exit 1
    fi

    # Add to queue if it's a tracked file type
    case "$FILE_PATH" in
        *.py|*.js|*.ts|*.go|*.java|*.md|*.yml|*.yaml|*.json)
            echo "$FILE_PATH" >> "$QUEUE_FILE"
            # Keep queue manageable
            tail -n 1000 "$QUEUE_FILE" > "${QUEUE_FILE}.tmp" && mv "${QUEUE_FILE}.tmp" "$QUEUE_FILE"
            ;;
    esac
fi
