#!/bin/bash
# Generate SDK documentation in multiple programming languages

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
API_SPEC=""
LANGUAGES="javascript,python"
OUTPUT="./docs/sdk"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --apiSpec)
      API_SPEC="$2"
      shift 2
      ;;
    --languages)
      LANGUAGES="$2"
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

if [[ -z "$API_SPEC" ]]; then
  echo "Error: --apiSpec is required"
  exit 1
fi

echo "Generating SDK documentation..."
echo "API Spec: $API_SPEC"
echo "Languages: $LANGUAGES"
echo "Output: $OUTPUT"

# Run the SDK documentation generator
node "$PLUGIN_ROOT/index.js" generate-sdk "$API_SPEC" "$LANGUAGES" "$OUTPUT"