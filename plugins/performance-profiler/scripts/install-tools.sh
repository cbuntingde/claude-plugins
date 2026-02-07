#!/bin/bash
# Performance Profiler - Tool Installation Script
# This script installs language-specific profiling tools

set -e

echo "🚀 Installing Performance Profiler dependencies..."

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    OS="windows"
fi

# Function to install Node.js tools
install_node_tools() {
    if command -v npm &> /dev/null; then
        echo "📦 Installing Node.js profiling tools..."

        # 0x - Node.js profiling profiler
        npm install -g 0x || echo "⚠️  0x installation skipped"

        # clinic.js - Node.js performance profiling
        npm install -g clinic || echo "⚠️  clinic.js installation skipped"

        # autocannon - HTTP benchmarking
        npm install -g autocannon || echo "⚠️  autocannon installation skipped"

        echo "✅ Node.js tools installed"
    else
        echo "⚠️  npm not found, skipping Node.js tools"
    fi
}

# Function to install Python tools
install_python_tools() {
    if command -v pip3 &> /dev/null; then
        echo "📦 Installing Python profiling tools..."

        # py-spy - Python profiler
        pip3 install py-spy || echo "⚠️  py-spy installation skipped"

        # memory-profiler
        pip3 install memory-profiler || echo "⚠️  memory-profiler installation skipped"

        # line-profiler
        pip3 install line-profiler || echo "⚠️  line-profiler installation skipped"

        echo "✅ Python tools installed"
    else
        echo "⚠️  pip3 not found, skipping Python tools"
    fi
}

# Function to install Go tools
install_go_tools() {
    if command -v go &> /dev/null; then
        echo "📦 Installing Go profiling tools..."

        # pprof - Go profiling tool
        go install github.com/google/pprof@latest || echo "⚠️  pprof installation skipped"

        echo "✅ Go tools installed"
    else
        echo "⚠️  go not found, skipping Go tools"
    fi
}

# Function to install Java tools
install_java_tools() {
    if command -v java &> /dev/null; then
        echo "📦 Installing Java profiling tools..."

        # async-profiler - Java profiler
        echo "⚠️  async-profiler requires manual installation from:"
        echo "   https://github.com/jvm-profiling-tools/async-profiler"

        echo "✅ Java tools info displayed"
    else
        echo "⚠️  java not found, skipping Java tools"
    fi
}

# Function to install Rust tools
install_rust_tools() {
    if command -v cargo &> /dev/null; then
        echo "📦 Installing Rust profiling tools..."

        # flamegraph - Rust flamegraph generation
        cargo install flamegraph || echo "⚠️  flamegraph installation skipped"

        echo "✅ Rust tools installed"
    else
        echo "⚠️  cargo not found, skipping Rust tools"
    fi
}

# Function to install general tools
install_general_tools() {
    echo "📦 Installing general profiling tools..."

    # Install based on OS
    if [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            brew install flamegraph || echo "⚠️  flamegraph installation skipped"
        fi
    elif [[ "$OS" == "linux" ]]; then
        # Linux tools vary by distribution
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y linux-tools-common linux-tools-generic || echo "⚠️  perf installation skipped"
        elif command -v yum &> /dev/null; then
            sudo yum install -y perf || echo "⚠️  perf installation skipped"
        fi
    fi

    echo "✅ General tools installed"
}

# Main installation flow
echo "Detecting installed languages and tools..."

install_general_tools
install_node_tools
install_python_tools
install_go_tools
install_java_tools
install_rust_tools

echo ""
echo "✨ Performance Profiler tool installation complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Restart your terminal or shell"
echo "  2. Use /profile to start profiling"
echo "  3. Use /benchmark to run performance tests"
echo ""
echo "📖 For more information, see the plugin documentation"
