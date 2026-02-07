#!/usr/bin/env bash
# Update the knowledge index from all sources

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
INDEX_DIR="${PLUGIN_ROOT}/data/knowledge_index"
LOCK_FILE="${INDEX_DIR}/.update_lock"
LOG_FILE="${INDEX_DIR}/update.log"

mkdir -p "$INDEX_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "Starting knowledge index update"

# Clean up on exit
cleanup() {
    rm -f "$LOCK_FILE"
    log "Knowledge index update completed"
}
trap cleanup EXIT

# Check prerequisites
if ! command -v node &> /dev/null && ! command -v python3 &> /dev/null; then
    log "ERROR: Neither node nor python3 found"
    exit 1
fi

# Step 1: Index repositories
log "Indexing repositories..."
if [ -f "${PLUGIN_ROOT}/scripts/index-repos.py" ]; then
    python3 "${PLUGIN_ROOT}/scripts/index-repos.py" >> "$LOG_FILE" 2>&1 || log "Warning: Repo indexing failed"
fi

# Step 2: Index Slack (if configured)
if [ -n "${SLACK_TOKEN:-}" ]; then
    log "Indexing Slack..."
    if [ -f "${PLUGIN_ROOT}/scripts/index-slack.py" ]; then
        python3 "${PLUGIN_ROOT}/scripts/index-slack.py" >> "$LOG_FILE" 2>&1 || log "Warning: Slack indexing failed"
    fi
fi

# Step 3: Index Jira (if configured)
if [ -n "${JIRA_TOKEN:-}" ]; then
    log "Indexing Jira..."
    if [ -f "${PLUGIN_ROOT}/scripts/index-jira.py" ]; then
        python3 "${PLUGIN_ROOT}/scripts/index-jira.py" >> "$LOG_FILE" 2>&1 || log "Warning: Jira indexing failed"
    fi
fi

# Step 4: Index Confluence (if configured)
if [ -n "${CONFLUENCE_TOKEN:-}" ]; then
    log "Indexing Confluence..."
    if [ -f "${PLUGIN_ROOT}/scripts/index-confluence.py" ]; then
        python3 "${PLUGIN_ROOT}/scripts/index-confluence.py" >> "$LOG_FILE" 2>&1 || log "Warning: Confluence indexing failed"
    fi
fi

# Step 5: Build embeddings and vector index
log "Building vector embeddings..."
if [ -f "${PLUGIN_ROOT}/scripts/build-embeddings.py" ]; then
    python3 "${PLUGIN_ROOT}/scripts/build-embeddings.py" >> "$LOG_FILE" 2>&1 || log "Warning: Embedding generation failed"
fi

# Step 6: Build knowledge graph
log "Building knowledge graph..."
if [ -f "${PLUGIN_ROOT}/scripts/build-graph.py" ]; then
    python3 "${PLUGIN_ROOT}/scripts/build-graph.py" >> "$LOG_FILE" 2>&1 || log "Warning: Knowledge graph build failed"
fi

# Update timestamp
touch "${INDEX_DIR}/.last_update"

log "Knowledge index update finished successfully"
