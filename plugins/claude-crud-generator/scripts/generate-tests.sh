#!/bin/bash
# Generate tests for CRUD operations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
MODEL=""
FRAMEWORK="jest"
COVERAGE="true"

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
    --coverage)
      COVERAGE="$2"
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

echo "Generating tests..."
echo "Model: $MODEL"
echo "Framework: $FRAMEWORK"
echo "Coverage: $COVERAGE"

# Run the generator
node "$PLUGIN_ROOT/index.js" generate-tests "$MODEL" "$FRAMEWORK" --coverage "$COVERAGE"