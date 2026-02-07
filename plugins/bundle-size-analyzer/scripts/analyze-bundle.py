#!/usr/bin/env python3
"""
Bundle Size Analyzer - Python Script
Analyzes JavaScript bundle files for size and composition
"""

import json
import os
import sys
import argparse
from pathlib import Path
import struct
import zlib
import brotli


def get_file_size(file_path):
    """Get file size in bytes"""
    return os.path.getsize(file_path)


def get_gzip_size(file_path):
    """Calculate gzipped file size"""
    with open(file_path, 'rb') as f:
        data = f.read()
    return len(zlib.compress(data, level=9))


def get_brotli_size(file_path):
    """Calculate brotli compressed file size"""
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
        compressed = brotli.compress(data, quality=11)
        return len(compressed)
    except Exception:
        return None


def analyze_source_map(bundle_path):
    """Analyze source map to get module breakdown"""
    map_path = str(bundle_path) + '.map'

    if not os.path.exists(map_path):
        return None

    with open(map_path, 'r') as f:
        source_map = json.load(f)

    modules = {}

    for i, source in enumerate(source_map.get('sources', [])):
        modules[source] = {
            'index': i,
            'size': 0  # Would need deeper analysis
        }

    return {
        'version': source_map.get('version'),
        'sources': list(modules.keys()),
        'module_count': len(modules)
    }


def analyze_bundle(bundle_path, args):
    """Main bundle analysis function"""
    bundle_path = Path(bundle_path)

    if not bundle_path.exists():
        print(f"❌ Error: Bundle file not found: {bundle_path}")
        sys.exit(1)

    # Basic size info
    raw_size = get_file_size(bundle_path)
    gzip_size = get_gzip_size(bundle_path)
    brotli_size = get_brotli_size(bundle_path)

    # Source map analysis
    source_map_analysis = analyze_source_map(bundle_path)

    # Output results
    if args.format == 'json':
        result = {
            'bundle': str(bundle_path),
            'raw_size': raw_size,
            'gzip_size': gzip_size,
            'brotli_size': brotli_size,
            'compression_ratio': round((1 - gzip_size / raw_size) * 100, 2),
            'source_map': source_map_analysis
        }
        print(json.dumps(result, indent=2))
    else:
        print(f"\n📊 Bundle Analysis: {bundle_path.name}")
        print("=" * 50)
        print(f"Raw size:     {format_size(raw_size)}")
        print(f"Gzip size:    {format_size(gzip_size)} ({round((1 - gzip_size / raw_size) * 100, 1)}% reduction)")
        if brotli_size:
            print(f"Brotli size:  {format_size(brotli_size)} ({round((1 - brotli_size / raw_size) * 100, 1)}% reduction)")

        if source_map_analysis:
            print(f"\nModules:      {source_map_analysis['module_count']}")
            print(f"Source map:   version {source_map_analysis['version']}")


def format_size(bytes_size):
    """Format bytes to human readable size"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} TB"


def main():
    parser = argparse.ArgumentParser(
        description='Analyze JavaScript bundle sizes'
    )
    parser.add_argument(
        'bundle',
        help='Path to bundle file'
    )
    parser.add_argument(
        '--format',
        choices=['text', 'json'],
        default='text',
        help='Output format'
    )

    args = parser.parse_args()
    analyze_bundle(args.bundle, args)


if __name__ == '__main__':
    main()
