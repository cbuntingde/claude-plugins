#!/usr/bin/env bash
# visualize-deps.sh - Generate a visual dependency graph

set -e

# Default values
DIRECTORY="."
FORMAT="mermaid"
FOCUS=""
DEPTH=3
OUTPUT=""

usage() {
    cat << EOF
Usage: visualize-deps [OPTIONS]

Generate a visual dependency graph for a TypeScript/JavaScript project.

Options:
    -p, --path <directory>    Root directory to visualize (default: .)
    -f, --format <format>     Output format: mermaid, dot, json (default: mermaid)
    --focus <module>          Focus on specific module (optional)
    -d, --depth <number>      Maximum depth to show (default: 3)
    -o, --output <file>       Output file (optional)
    -h, --help                Show this help message

Examples:
    visualize-deps --path ./src
    visualize-deps --path ./src --format mermaid --output deps.mmd
    visualize-deps --focus src/services/user.ts --depth 2 --format dot
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
        --focus)
            FOCUS="$2"
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

# Generate the visualization
cd "$PROJECT_ROOT"

generate_mermaid() {
    node -e "
const { DependencyAnalyzer } = require('./dist/dependency-analyzer.js');

const analyzer = new DependencyAnalyzer('$DIRECTORY');
analyzer.analyzeDirectory('$DIRECTORY').then(cycles => {
    const graph = analyzer.exportGraph();

    console.log('```mermaid');
    console.log('graph TD');

    // Track nodes and colors
    const allNodes = new Set();
    const circularNodes = new Set();
    cycles.forEach(c => c.cycle.forEach(f => circularNodes.add(f)));

    // Add all nodes
    Object.keys(graph).forEach(file => {
        const color = circularNodes.has(file) ? 'fill:#ffcccc,stroke:#ff0000' : 'fill:#e1f5fe,stroke:#0277bd';
        const shortName = file.split('/').pop().replace(/\\.[^/.]+\$/, '');
        console.log('    ' + shortName.replace(/[^a-zA-Z0-9]/g, '_') + '[\\""' + shortName + '\\""]');
    });

    // Add edges
    Object.entries(graph).forEach(([file, deps]) => {
        const fromShort = file.split('/').pop().replace(/\\.[^/.]+\$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        deps.forEach(dep => {
            const depShort = dep.split('/').pop().replace(/\\.[^/.]+\$/, '').replace(/[^a-zA-Z0-9]/g, '_');
            const isCircular = circularNodes.has(file) && circularNodes.has(dep);
            const style = isCircular ? ',styleDef fill:#ffcccc,stroke:#ff0000' : '';
            console.log('    ' + fromShort + ' --> ' + depShort);
        });
    });

    console.log('```');
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
"
}

generate_dot() {
    node -e "
const { DependencyAnalyzer } = require('./dist/dependency-analyzer.js');

const analyzer = new DependencyAnalyzer('$DIRECTORY');
analyzer.analyzeDirectory('$DIRECTORY').then(cycles => {
    const graph = analyzer.exportGraph();

    console.log('digraph dependencies {');
    console.log('    rankdir=LR;');
    console.log('    node [shape=box, style=filled];');

    const circularNodes = new Set();
    cycles.forEach(c => c.cycle.forEach(f => circularNodes.add(f)));

    // Add all nodes
    Object.keys(graph).forEach(file => {
        const shortName = file.split('/').pop().replace(/\\.[^/.]+\$/, '');
        const safeName = shortName.replace(/[^a-zA-Z0-9]/g, '_');
        const color = circularNodes.has(file) ? 'red' : 'lightblue';
        console.log('    \"' + safeName + '\" [label=\"' + shortName + '\", fillcolor=' + color + '];');
    });

    // Add edges
    Object.entries(graph).forEach(([file, deps]) => {
        const fromShort = file.split('/').pop().replace(/\\.[^/.]+\$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        deps.forEach(dep => {
            const depShort = dep.split('/').pop().replace(/\\.[^/.]+\$/, '').replace(/[^a-zA-Z0-9]/g, '_');
            console.log('    \"' + fromShort + '\" -> \"' + depShort + '\";');
        });
    });

    console.log('}');
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
"
}

generate_json() {
    node -e "
const { DependencyAnalyzer } = require('./dist/dependency-analyzer.js');

const analyzer = new DependencyAnalyzer('$DIRECTORY');
analyzer.analyzeDirectory('$DIRECTORY').then(cycles => {
    const graph = analyzer.exportGraph();

    const result = {
        summary: {
            totalFiles: Object.keys(graph).length,
            totalDependencies: Object.values(graph).flat().length,
            circularDependencies: cycles.length
        },
        cycles: cycles.map(c => ({
            type: c.type,
            description: c.description,
            files: c.cycle
        })),
        graph: graph
    };

    console.log(JSON.stringify(result, null, 2));
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
"
}

# Generate statistics
generate_stats() {
    node -e "
const { DependencyAnalyzer } = require('./dist/dependency-analyzer.js');

const analyzer = new DependencyAnalyzer('$DIRECTORY');
analyzer.analyzeDirectory('$DIRECTORY').then(cycles => {
    const graph = analyzer.exportGraph();

    // Calculate stats
    const dependencyCounts = {};
    Object.values(graph).flat().forEach(dep => {
        dependencyCounts[dep] = (dependencyCounts[dep] || 0) + 1;
    });

    const sorted = Object.entries(dependencyCounts).sort((a, b) => b[1] - a[1]);
    const topModules = sorted.slice(0, 5).map(([file, count]) => ({
        file: file.split('/').pop(),
        dependents: count
    }));

    console.log('');
    console.log('Dependency Statistics');
    console.log('=====================');
    console.log('');
    console.log('Total Files: ' + Object.keys(graph).length);
    console.log('Total Dependencies: ' + Object.values(graph).flat().length);
    console.log('Circular Dependencies: ' + cycles.length);
    console.log('');
    console.log('Most Connected Modules:');
    topModules.forEach((m, i) => {
        console.log((i+1) + '. ' + m.file + ' (' + m.dependents + ' dependents)');
    });
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
);
"
}

# Run the appropriate format
echo "Dependency Graph Visualization"
echo "============================="
echo ""
echo "Directory: $DIRECTORY"
echo "Format: $FORMAT"
[ -n "$FOCUS" ] && echo "Focus: $FOCUS"
echo ""

if [ "$FORMAT" = "mermaid" ]; then
    generate_mermaid
elif [ "$FORMAT" = "dot" ]; then
    generate_dot
elif [ "$FORMAT" = "json" ]; then
    generate_json
else
    echo "Error: Unknown format: $FORMAT" >&2
    exit 1
fi

generate_stats

# Output or save
if [ -n "$OUTPUT" ]; then
    # Re-run and save to file
    if [ "$FORMAT" = "mermaid" ]; then
        generate_mermaid > "$OUTPUT"
    elif [ "$FORMAT" = "dot" ]; then
        generate_dot > "$OUTPUT"
    elif [ "$FORMAT" = "json" ]; then
        generate_json > "$OUTPUT"
    fi
    echo ""
    echo "Output saved to: $OUTPUT"
fi