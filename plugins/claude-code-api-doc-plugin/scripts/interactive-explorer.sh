#!/bin/bash
# Generate interactive API explorer from OpenAPI spec

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
SPEC=""
OUTPUT="api-explorer.html"
TITLE="API Explorer"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --spec)
      SPEC="$2"
      shift 2
      ;;
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    --title)
      TITLE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$SPEC" ]]; then
  echo "Error: --spec is required"
  exit 1
fi

echo "Generating interactive API explorer..."
echo "Spec: $SPEC"
echo "Output: $OUTPUT"
echo "Title: $TITLE"

# Run the API explorer generator
node "$PLUGIN_ROOT/index.js" interactive-explorer "$SPEC" "$OUTPUT" --title "$TITLE"