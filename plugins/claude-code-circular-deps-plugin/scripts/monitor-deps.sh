#!/usr/bin/env bash
# monitor-deps.sh - Monitor dependencies and alert on new circular dependencies

set -e

# Default values
DIRECTORY="."
THRESHOLD="warning"
ON_CHANGE="report"
WATCH_MODE=false
CI_MODE=false

usage() {
    cat << EOF
Usage: monitor-deps [OPTIONS]

Monitor dependencies and alert on new circular dependencies.

Options:
    -p, --path <directory>     Root directory to monitor (default: .)
    -t, --threshold <level>    Severity threshold: error, warning, info (default: warning)
    -c, --on-change <action>   Action on detecting new cycles: alert, fail, report (default: report)
    -w, --watch                Enable watch mode (continuously monitor)
    -i, --ci                   CI/CD mode (for pipeline integration)
    -h, --help                 Show this help message

Examples:
    monitor-deps --path ./src
    monitor-deps --path ./src --threshold error --on-change fail
    monitor-deps --watch --path ./src
    monitor-deps --ci --path ./src
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
        -t|--threshold)
            THRESHOLD="$2"
            shift 2
            ;;
        -c|--on-change)
            ON_CHANGE="$2"
            shift 2
            ;;
        -w|--watch)
            WATCH_MODE=true
            shift
            ;;
        -i|--ci)
            CI_MODE=true
            shift
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

run_analysis() {
    cd "$PROJECT_ROOT"

    RESULT=$(node -e "
const { DependencyAnalyzer } = require('./dist/dependency-analyzer.js');

const analyzer = new DependencyAnalyzer('$DIRECTORY');
analyzer.analyzeDirectory('$DIRECTORY').then(cycles => {
    const suggestions = analyzer.suggestFixes(cycles);
    console.log(JSON.stringify({
        count: cycles.length,
        cycles: cycles.map(c => ({ type: c.type, description: c.description })),
        suggestions: suggestions
    }, null, 2));
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1));
};
" 2>&1)

    COUNT=$(echo "$RESULT" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.count);")

    if [ "$COUNT" -gt 0 ]; then
        echo "Dependency Health Report"
        echo "======================="
        echo ""
        echo "Current Status: NEEDS ATTENTION"
        echo "  - Total circular deps: $COUNT"
        echo ""
        echo "Circular dependencies found:"
        echo "$RESULT" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); d.cycles.forEach((c, i) => console.log((i+1) + '. ' + c.description));"
        echo ""

        # Check threshold
        if [ "$THRESHOLD" = "error" ]; then
            HAS_ERROR=$(echo "$RESULT" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.count);")
            if [ "$HAS_ERROR" -gt 0 ]; then
                echo "ERROR: Circular dependencies detected at error threshold" >&2
                [ "$ON_CHANGE" = "fail" ] && exit 1
            fi
        elif [ "$THRESHOLD" = "warning" ]; then
            if [ "$COUNT" -gt 0 ]; then
                echo "[DEP-WARN] Circular dependencies detected" >&2
                [ "$ON_CHANGE" = "fail" ] && exit 1
            fi
        fi
    else
        echo "Dependency Health Report"
        echo "======================="
        echo ""
        echo "Current Status: HEALTHY"
        echo "  - Total circular deps: 0"
        echo "  - No issues detected"
    fi
}

if [ "$WATCH_MODE" = true ]; then
    echo "Watch Mode: Continuously monitoring $DIRECTORY for changes"
    echo "Press Ctrl+C to stop"
    echo ""

    # Use inotifywait on Linux or fswatch on macOS
    if command -v inotifywait &> /dev/null; then
        inotifywait -m -e modify,create,delete -r "$DIRECTORY" --exclude 'node_modules|dist|build' | while read -r events; do
            echo "Change detected, re-analyzing..."
            run_analysis
            echo ""
        done
    elif command -v fswatch &> /dev/null; then
        fswatch -r "$DIRECTORY" --exclude='node_modules' --exclude='dist' --exclude='build' | while read -r; do
            echo "Change detected, re-analyzing..."
            run_analysis
            echo ""
        done
    else
        echo "Warning: Neither inotifywait nor fswatch is available."
        echo "Installing inotify-tools (Linux) or fswatch (macOS) for watch mode."
        echo ""
        echo "Running one-time analysis instead:"
        run_analysis
    fi
elif [ "$CI_MODE" = true ]; then
    echo "CI/CD Mode: Checking for circular dependencies"
    echo "Path: $DIRECTORY"
    echo "Threshold: $THRESHOLD"
    echo ""

    run_analysis

    COUNT=$(echo "$RESULT" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.count);" 2>/dev/null || echo "0")

    if [ "$COUNT" -gt 0 ] && [ "$ON_CHANGE" = "fail" ]; then
        echo ""
        echo "dependency-check: failed"
        echo ""
        echo "Circular dependency found - build cannot proceed."
        exit 1
    else
        echo ""
        echo "dependency-check: passed"
    fi
else
    run_analysis
fi