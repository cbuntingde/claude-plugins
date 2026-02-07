#!/bin/bash
# Generate API documentation from OpenAPI/Swagger spec

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
INPUT="."
OUTPUT="./docs/api"
THEME="default"
INCLUDE_EXAMPLES="true"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --input)
      INPUT="$2"
      shift 2
      ;;
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    --theme)
      THEME="$2"
      shift 2
      ;;
    --includeExamples)
      INCLUDE_EXAMPLES="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Generating API documentation..."
echo "Input: $INPUT"
echo "Output: $OUTPUT"
echo "Theme: $THEME"
echo "Include Examples: $INCLUDE_EXAMPLES"

# Run the documentation generator
node "$PLUGIN_ROOT/index.js" generate-docs "$INPUT" "$OUTPUT" --theme "$THEME" --include-examples "$INCLUDE_EXAMPLES"