#!/bin/bash
# Semantic Code Search Index Builder
# Builds the semantic search index for your codebase
# Triggered by the /semantic-index command

set -euo pipefail

# Configuration
MAX_DIFF_SIZE=1048576  # 1MB max file size
MAX_FILES=10000        # Maximum files to index
CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

# Security constants
readonly MAX_OUTPUT_SIZE=$((10 * 1024 * 1024))  # 10MB max response size
readonly MAX_FILES=10000
readonly MAX_FILE_SIZE=$((5 * 1024 * 1024))  # 5MB max individual file size
readonly MAX_LIMIT=1000

# Validate and sanitize root path to prevent path traversal
validate_root_path() {
  local root_path="$1"
  local base_dir="${2:-$PWD}"

  # Resolve to absolute path
  local resolved
  resolved=$(realpath -- "$base_dir/$root_path" 2>/dev/null || echo "$base_dir/$root_path")

  # Ensure path is within allowed scope
  if [[ ! "$resolved" == "$base_dir"* ]]; then
    echo "Error: Access denied - root path is outside allowed scope" >&2
    exit 1
  fi

  echo "$resolved"
}

# Check if running on Windows (WSL or Git Bash)
is_windows() {
  [[ "$(uname)" == "MINGW"* ]] || [[ "$(uname)" == "MSYS"* ]] || [[ -n "${WSL_INTEROP:-}" ]]
}

# Get plugin server path
get_server_path() {
  if is_windows; then
    echo "$CLAUDE_PLUGIN_ROOT/servers/semantic-search-server.js"
  else
    echo "$CLAUDE_PLUGIN_ROOT/servers/semantic-search-server.js"
  fi
}

# Check if node is available
check_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is required but not installed" >&2
    exit 1
  fi
}

# Check if server exists
check_server() {
  local server_path
  server_path=$(get_server_path)

  if [[ ! -f "$server_path" ]]; then
    echo "Error: Semantic search server not found at $server_path" >&2
    exit 1
  fi
}

# Get index status
get_index_status() {
  local server_path
  server_path=$(get_server_path)

  node -e "
    const path = require('path');
    const fs = require('fs');
    const serverPath = '$server_path';

    // Load the server module
    const server = require(serverPath);

    // Get status
    try {
      const status = server.getIndexStatus();
      console.log(JSON.stringify(status));
    } catch (e) {
      console.log(JSON.stringify({ success: false, error: e.message }));
    }
  " 2>/dev/null || echo '{"success":false,"error":"Failed to get index status"}'
}

# Build the index
build_index() {
  local root_path="${1:-.}"
  local force="${2:-false}"
  local server_path
  server_path=$(get_server_path)

  # Validate path
  local validated_path
  validated_path=$(validate_root_path "$root_path")

  echo "Building semantic search index at: $validated_path"
  echo ""

  # Run the indexing via Node.js
  node -e "
    const path = require('path');
    const fs = require('fs');
    const serverPath = '$server_path';

    // Load the server module
    const server = require(serverPath);

    // Build index
    try {
      const result = server.indexCodebase({
        rootPath: '$validated_path',
        force: $force
      });
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log(JSON.stringify({ success: false, error: e.message }));
    }
  " 2>&1
}

# Display usage
usage() {
  cat << EOF
Usage: $(basename "$0") [options]

Build or rebuild the semantic search index for your codebase.

Options:
  --force       Force a complete rebuild of the index
  --root PATH   Root directory to index (default: current directory)
  --help        Show this help message

Examples:
  $(basename "$0")                    # Incremental index update
  $(basename "$0") --force            # Force complete rebuild
  $(basename "$0") --root src         # Index specific directory

EOF
}

# Main execution
main() {
  local force=false
  local root_path="."

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --force)
        force=true
        shift
        ;;
      --root)
        root_path="$2"
        shift 2
        ;;
      --help|-h)
        usage
        exit 0
        ;;
      *)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done

  # Verify prerequisites
  check_node
  check_server

  # Build index
  build_index "$root_path" "$force"
}

main "$@"