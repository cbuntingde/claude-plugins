#!/bin/bash
# Generate changelog from git history

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
FROM=""
TO=""
FORMAT="markdown"
OUTPUT="CHANGELOG.md"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --from)
      FROM="$2"
      shift 2
      ;;
    --to)
      TO="$2"
      shift 2
      ;;
    --format)
      FORMAT="$2"
      shift 2
      ;;
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Generating changelog..."
echo "From: ${FROM:-unreleased}"
echo "To: ${TO:-current}"
echo "Format: $FORMAT"
echo "Output: $OUTPUT"

# Run the changelog generator
node "$PLUGIN_ROOT/index.js" generate-changelog "$FROM" "$TO" "$FORMAT" "$OUTPUT"