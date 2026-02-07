#!/bin/bash
# Generate TypeScript types from database schema

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
SCHEMA=""
OUTPUT="./src/types/entities.ts"
STRICT="true"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --schema)
      SCHEMA="$2"
      shift 2
      ;;
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    --strict)
      STRICT="$2"
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

echo "Generating TypeScript types..."
echo "Schema: $SCHEMA"
echo "Output: $OUTPUT"
echo "Strict: $STRICT"

# Run the generator
node "$PLUGIN_ROOT/index.js" generate-types "$SCHEMA" "$OUTPUT" --strict "$STRICT"