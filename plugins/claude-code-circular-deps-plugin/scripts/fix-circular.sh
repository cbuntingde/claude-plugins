#!/usr/bin/env bash
# fix-circular.sh - Suggest and apply fixes for circular dependencies

set -e

# Default values
DIRECTORY="."
STRATEGY="suggest"
DRY_RUN=true
VERBOSE=false

usage() {
    cat << EOF
Usage: fix-circular [OPTIONS]

Suggest and apply fixes for circular dependencies.

Options:
    -p, --path <directory>    Root directory to analyze (default: .)
    -s, --strategy <strategy> Fix strategy: suggest, extract, interface, forward-declare, refactor (default: suggest)
    -a, --apply               Apply fixes (default: dry run only)
    -v, --verbose             Show detailed output
    -h, --help                Show this help message

Examples:
    fix-circular --path ./src --strategy suggest
    fix-circular --path ./src --strategy extract --apply
    fix-circular --path ./src --strategy interface --verbose
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
        -s|--strategy)
            STRATEGY="$2"
            shift 2
            ;;
        -a|--apply)
            DRY_RUN=false
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
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

echo "Circular Dependency Fixer"
echo "========================="
echo ""
echo "Analyzing: $DIRECTORY"
echo "Strategy: $STRATEGY"
echo "Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN (no changes will be made)" || echo "APPLY (changes will be made)")"
echo ""

# Run the analysis and suggestions
cd "$PROJECT_ROOT"

if [ "$VERBOSE" = true ]; then
    echo "=== Analyzing Dependencies ===" >&2
fi

node -e "
const { DependencyAnalyzer } = require('./dist/dependency-analyzer.js');
const path = require('path');

const analyzer = new DependencyAnalyzer('$DIRECTORY');
analyzer.analyzeDirectory('$DIRECTORY').then(cycles => {
    const suggestions = analyzer.suggestFixes(cycles);

    if (cycles.length === 0) {
        console.log('No circular dependencies found. Nothing to fix!');
        return;
    }

    console.log('Found ' + cycles.length + ' circular dependency(ies):');
    console.log('');
    console.log(suggestions.join('\\n'));
    console.log('');
    console.log('=== Fix Strategy: $STRATEGY ===');
    console.log('');

    if ('$STRATEGY' === 'suggest') {
        console.log('General recommendations:');
        console.log('1. Use type-only imports (import type { ... } from \'...\')');
        console.log('2. Extract shared types to a common module');
        console.log('3. Use dependency injection');
        console.log('4. Restructure into layers with clear boundaries');
    } else if ('$STRATEGY' === 'extract') {
        console.log('Extraction strategy selected.');
        console.log('This would create a shared module for common dependencies.');
        console.log('(Not yet implemented in CLI)');
    } else if ('$STRATEGY' === 'interface') {
        console.log('Interface strategy selected.');
        console.log('Use TypeScript type-only imports to break cycles:');
        console.log('  import type { Type } from \'./module\'');
    } else if ('$STRATEGY' === 'forward-declare') {
        console.log('Forward declaration strategy selected.');
        console.log('Use forward references or type aliases.');
    } else if ('$STRATEGY' === 'refactor') {
        console.log('Refactor strategy selected.');
        console.log('Consider architectural restructuring.');
    }

    if ('$DRY_RUN' === 'true') {
        console.log('');
        console.log('=== DRY RUN COMPLETE ===');
        console.log('No changes were made. Use --apply to apply fixes.');
    } else {
        console.log('');
        console.log('=== APPLY MODE ===');
        console.log('Automatic application of fixes is not yet implemented.');
        console.log('Please apply the suggested changes manually.');
    }
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
"

echo ""
echo "Safety Checklist:"
echo "  [ ] Review all suggested changes"
echo "  [ ] Run tests after applying fixes"
echo "  [ ] Verify no new cycles were introduced"