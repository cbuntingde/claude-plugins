#!/bin/bash

# Bundle Size Analyzer - Install Dependencies Script
# Installs necessary tools for bundle analysis across different bundlers

set -e

echo "🔍 Installing Bundle Size Analyzer dependencies..."

# Detect package manager
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v yarn &> /dev/null; then
    PKG_MANAGER="yarn"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo "❌ Error: No package manager found (npm, yarn, or pnpm required)"
    exit 1
fi

echo "📦 Using package manager: $PKG_MANAGER"

# Install core dependencies
echo "Installing core analysis tools..."
$PKG_MANAGER add -D \
    @rollup/pluginutils \
    rollup \
    terser \
    gzip-size \
    brotli-size

# Install webpack-bundle-analyzer if webpack detected
if [ -f "webpack.config.js" ] || [ -f "webpack.config.ts" ]; then
    echo "📦 Installing webpack-bundle-analyzer..."
    $PKG_MANAGER add -D webpack-bundle-analyzer webpack-cli
fi

# Install vite-plugin-inspect if vite detected
if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
    echo "📦 Installing vite analysis plugins..."
    $PKG_MANAGER add -D vite-plugin-inspect rollup-plugin-visualizer
fi

# Install esbuild-visualizer if esbuild detected
if grep -q "esbuild" package.json; then
    echo "📦 Installing esbuild visualizer..."
    $PKG_MANAGER add -D @esbuild-plugins/node-modules-polyfill
fi

# Install source-map support
echo "📦 Installing source-map support..."
$PKG_MANAGER add -D source-map source-map-loader

echo ""
echo "✅ Bundle analysis tools installed successfully!"
echo ""
echo "🚀 Quick start:"
echo "   Run: /analyze-bundle"
echo "   Or: npm run build && /analyze-bundle dist/"
