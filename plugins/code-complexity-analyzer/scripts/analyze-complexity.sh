#!/usr/bin/env bash
#
# Code Complexity Analyzer Wrapper Script
# Wraps the Python analyzer for use as a Claude Code plugin command.
#

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="${SCRIPT_DIR}/complexity-analyzer.py"

# Default values
TARGET="."
THRESHOLD=15
OUTPUT="detailed"
MINIMAL=false
COGNITIVE=false
SUGGEST=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --threshold=*)
      THRESHOLD="${1#*=}"
      shift
      ;;
    --output=*)
      OUTPUT="${1#*=}"
      shift
      ;;
    --cognitive)
      COGNITIVE=true
      shift
      ;;
    --minimal)
      MINIMAL=true
      shift
      ;;
    --suggest)
      SUGGEST=true
      shift
      ;;
    -*)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
    *)
      TARGET="$1"
      shift
      ;;
  esac
done

# Validate threshold
if ! [[ "$THRESHOLD" =~ ^[0-9]+$ ]] || [[ "$THRESHOLD" -lt 1 ]]; then
  echo "Error: Threshold must be a positive integer" >&2
  exit 1
fi

# Validate output format
if [[ ! "$OUTPUT" =~ ^(table|detailed|json)$ ]]; then
  echo "Error: Output must be one of: table, detailed, json" >&2
  exit 1
fi

# Check if Python script exists
if [[ ! -f "$PYTHON_SCRIPT" ]]; then
  echo "Error: Python analyzer script not found at $PYTHON_SCRIPT" >&2
  exit 1
fi

# Build command
PYTHON_CMD="python3"

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
  # Try python as fallback
  PYTHON_CMD="python"
  if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed" >&2
    exit 1
  fi
fi

# Build arguments for Python script
PYTHON_ARGS=("$TARGET")
PYTHON_ARGS+=("--threshold" "$THRESHOLD")
PYTHON_ARGS+=("--output" "$OUTPUT")

if [[ "$MINIMAL" == "true" ]]; then
  PYTHON_ARGS+=("--minimal")
fi

# Cognitive complexity is supported by the Python script
if [[ "$COGNITIVE" == "true" ]]; then
  PYTHON_ARGS+=("--cognitive")
fi

# Execute the Python analyzer
"$PYTHON_CMD" "$PYTHON_SCRIPT" "${PYTHON_ARGS[@]}"