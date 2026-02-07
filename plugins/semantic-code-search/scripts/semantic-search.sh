#!/bin/bash
# Semantic Code Search Command
# Searches your codebase using natural language queries
# Triggered by the /semantic-search command

set -euo pipefail

# Configuration
MAX_QUERY_LENGTH=1000
MAX_LIMIT=1000
CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

# Security constants
readonly MAX_OUTPUT_SIZE=$((10 * 1024 * 1024))  # 10MB max response size
readonly MAX_FILES=10000
readonly MAX_FILE_SIZE=$((5 * 1024 * 1024))  # 5MB max individual file size
readonly MAX_LIMIT=1000

# Check if running on Windows (WSL or Git Bash)
is_windows() {
  [[ "$(uname)" == "MINGW"* ]] || [[ "$(uname)" == "MSYS"* ]] || [[ -n "${WSL_INTEROP:-}" ]]
}

# Get plugin server path
get_server_path() {
  echo "$CLAUDE_PLUGIN_ROOT/servers/semantic-search-server.js"
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

# Validate and sanitize query to prevent injection
sanitize_query() {
  local query="$1"

  # Remove null bytes and control characters (except newlines, tabs)
  local sanitized
  sanitized=$(echo "$query" | tr -d '\000\001\002\003\004\005\006\007\010\013\014\016\017\020\021\022\023\024\025\026\027\030\031\032\033\034\035\036\037\177')

  # Trim whitespace
  sanitized=$(echo "$sanitized" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

  echo "$sanitized"
}

# Perform semantic search
perform_search() {
  local query="$1"
  local limit="${2:-10}"
  local threshold="${3:-0.3}"
  local server_path
  server_path=$(get_server_path)

  # Run the search via Node.js
  node -e "
    const path = require('path');
    const fs = require('fs');
    const serverPath = '$server_path';

    // Load the server module
    const server = require(serverPath);

    // Perform search
    try {
      const result = server.semanticSearch({
        query: '$query',
        limit: $limit,
        threshold: $threshold
      });
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log(JSON.stringify({ success: false, error: e.message }));
    }
  " 2>&1
}

# Display search results
display_results() {
  local json_output="$1"

  # Parse and format the JSON output
  node -e "
    const data = JSON.parse(process.stdin.read());
    const output = data;

    if (output.success === false) {
      console.log('Error:', output.message);
      if (output.error) console.log(output.error);
      process.exit(1);
    }

    console.log('Search Query:', output.query);
    console.log('Results:', output.resultCount);
    console.log('');

    if (output.results && output.results.length > 0) {
      output.results.forEach((r, i) => {
        console.log((i + 1) + '. ' + r.filePath);
        console.log('   Relevance: ' + r.relevance + ' (' + (r.similarity * 100).toFixed(1) + '%)');
        if (r.context && r.context.lines) {
          r.context.lines.forEach(l => {
            console.log('   Line ' + l.number + ': ' + l.content.substring(0, 80));
          });
        }
        console.log('');
      });
    } else {
      console.log('No matching code found.');
      console.log('Try rephrasing your query or run /semantic-index to rebuild the index.');
    }
  " <<< "$json_output"
}

# Display usage
usage() {
  cat << EOF
Usage: $(basename "$0") [options] <query>

Search your codebase using natural language queries to find semantically relevant code.

Arguments:
  query                   Natural language query (required)

Options:
  --limit NUMBER          Maximum number of results (default: 10)
  --threshold NUMBER      Minimum similarity threshold 0-1 (default: 0.3)
  --help, -h              Show this help message

Examples:
  $(basename "$0") find where we validate email addresses
  $(basename "$0") show me retry logic
  $(basename "$0") --limit 5 authentication flow implementation

EOF
}

# Main execution
main() {
  local query=""
  local limit=10
  local threshold=0.3

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --limit)
        limit="$2"
        shift 2
        ;;
      --threshold)
        threshold="$2"
        shift 2
        ;;
      --help|-h)
        usage
        exit 0
        ;;
      -*)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
      *)
        query="$1"
        shift
        ;;
    esac
  done

  # Validate query
  if [[ -z "$query" ]]; then
    echo "Error: Search query is required" >&2
    usage >&2
    exit 1
  fi

  # Sanitize query
  query=$(sanitize_query "$query")

  # Validate query length
  if [[ ${#query} -gt $MAX_QUERY_LENGTH ]]; then
    echo "Error: Query exceeds maximum length of $MAX_QUERY_LENGTH characters" >&2
    exit 1
  fi

  # Validate limit
  if ! [[ "$limit" =~ ^[0-9]+$ ]] || [[ "$limit" -lt 1 ]] || [[ "$limit" -gt $MAX_LIMIT ]]; then
    echo "Error: Limit must be a number between 1 and $MAX_LIMIT" >&2
    exit 1
  fi

  # Validate threshold
  if ! [[ "$threshold" =~ ^[0-9]*\.?[0-9]+$ ]] || (( $(echo "$threshold < 0 || $threshold > 1" | bc -l) )); then
    echo "Error: Threshold must be a number between 0 and 1" >&2
    exit 1
  fi

  # Verify prerequisites
  check_node
  check_server

  # Perform search
  local result
  result=$(perform_search "$query" "$limit" "$threshold")

  # Display results
  display_results "$result"
}

main "$@"