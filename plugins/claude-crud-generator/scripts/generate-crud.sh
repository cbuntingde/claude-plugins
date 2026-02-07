#!/bin/bash
# Generate CRUD operations from database schema

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
SCHEMA=""
FRAMEWORK="express"
LANGUAGE="javascript"
OUTPUT="./src/crud"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --schema)
      SCHEMA="$2"
      shift 2
      ;;
    --framework)
      FRAMEWORK="$2"
      shift 2
      ;;
    --language)
      LANGUAGE="$2"
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

if [[ -z "$SCHEMA" ]]; then
  echo "Error: --schema is required"
  exit 1
fi

echo "Generating CRUD operations..."
echo "Schema: $SCHEMA"
echo "Framework: $FRAMEWORK"
echo "Language: $LANGUAGE"
echo "Output: $OUTPUT"

# Run the generator
node "$PLUGIN_ROOT/index.js" generate-crud "$SCHEMA" "$FRAMEWORK" "$LANGUAGE" "$OUTPUT"