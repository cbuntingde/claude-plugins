#!/bin/bash
# Generate REST API routes for CRUD operations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
MODEL=""
FRAMEWORK="express"
AUTH="none"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --model)
      MODEL="$2"
      shift 2
      ;;
    --framework)
      FRAMEWORK="$2"
      shift 2
      ;;
    --auth)
      AUTH="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$MODEL" ]]; then
  echo "Error: --model is required"
  exit 1
fi

echo "Generating REST API routes..."
echo "Model: $MODEL"
echo "Framework: $FRAMEWORK"
echo "Auth: $AUTH"

# Run the generator
node "$PLUGIN_ROOT/index.js" generate-routes "$MODEL" "$FRAMEWORK" "$AUTH"