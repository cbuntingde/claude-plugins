#!/usr/bin/env bash
# detect-circular.sh - Detect circular dependencies in a TypeScript/JavaScript project

set -e

# Default values
DIRECTORY="."
FORMAT="text"
DEPTH=10
OUTPUT=""

usage() {
    cat << EOF
Usage: detect-circular [OPTIONS]

Detect circular dependencies in a TypeScript/JavaScript project.

Options:
    -p, --path <directory>    Root directory to scan (default: .)
    -f, --format <format>     Output format: text, json, dot (default: text)
    -d, --depth <number>      Maximum dependency depth to analyze (default: 10)
    -o, --output <file>       Output file (optional)
    -h, --help                Show this help message

Examples:
    detect-circular --path ./src
    detect-circular --path ./src --format json --output cycles.json
    detect-circular --format dot > deps.dot
EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--path)
            DIRECTORY="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -d|--depth)
            DEPTH="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed" >&2
    exit 1
fi

# Build if dist doesn't exist
if [ ! -d "$PROJECT_ROOT/dist" ]; then
    echo "Building project..." >&2
    cd "$PROJECT_ROOT"
    npm run build
fi

# Run the MCP tool via Node.js
RESULT=$(cd "$PROJECT_ROOT" && node -e "
const { DependencyAnalyzer } = require('./dist/dependency-analyzer.js');
const path = require('path');

const analyzer = new DependencyAnalyzer('$DIRECTORY');
const cycles = analyzer.analyzeDirectory('$DIRECTORY', {
    filePattern: '**/*.{ts,tsx,js,jsx}',
    excludePatterns: ['node_modules', 'dist', 'build']
}).then(cycles => {
    if (cycles.length === 0) {
        console.log('No circular dependencies found!');
        return;
    }

    console.log('Circular Dependency Report');
    console.log('==========================');
    console.log('');
    console.log('Found ' + cycles.length + ' circular dependency(ies):');
    console.log('');

    cycles.forEach((cycle, index) => {
        console.log((index + 1) + '. ' + cycle.description);
        console.log('   Type: ' + cycle.type);
        console.log('');
    });
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
" 2>&1)

# Output result
if [ -n "$OUTPUT" ]; then
    echo "$RESULT" > "$OUTPUT"
else
    echo "$RESULT"
fi