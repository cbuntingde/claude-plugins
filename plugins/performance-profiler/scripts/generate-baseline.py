#!/usr/bin/env python3
"""
Performance Baseline Generator
Generates baseline performance profiles for regression detection
"""

import json
import sys
import subprocess
import os
from datetime import datetime
from pathlib import Path

def generate_baseline(name=None, output_file=None):
    """
    Generate a performance baseline profile

    Args:
        name: Name for this baseline (e.g., "v1.0.0", "before-optimization")
        output_file: Custom output file path
    """
    timestamp = datetime.now().isoformat()

    # Detect project type and run appropriate profiler
    project_type = detect_project_type()

    if project_type == "node":
        profile_data = profile_nodejs()
    elif project_type == "python":
        profile_data = profile_python()
    elif project_type == "go":
        profile_data = profile_go()
    else:
        print(f"Unsupported project type: {project_type}")
        return None

    # Create baseline data structure
    baseline = {
        "name": name or f"baseline-{timestamp}",
        "timestamp": timestamp,
        "project_type": project_type,
        "profile": profile_data,
        "metadata": {
            "os": os.uname().sysname if hasattr(os, 'uname') else "unknown",
            "python_version": sys.version.split()[0] if project_type == "python" else None,
            "node_version": get_node_version() if project_type == "node" else None
        }
    }

    # Save baseline
    if output_file is None:
        output_dir = Path(".claude")
        output_dir.mkdir(exist_ok=True)
        output_file = output_dir / "performance-baseline.json"

    with open(output_file, 'w') as f:
        json.dump(baseline, f, indent=2)

    print(f"Performance baseline saved to: {output_file}")
    print(f"   Name: {baseline['name']}")
    print(f"   Type: {project_type}")

    return baseline

def detect_project_type():
    """Detect the type of project based on files present"""
    if Path("package.json").exists():
        return "node"
    elif Path("requirements.txt").exists() or Path("setup.py").exists() or Path("pyproject.toml").exists():
        return "python"
    elif Path("go.mod").exists():
        return "go"
    else:
        return "unknown"

def profile_nodejs():
    """Generate profile data for Node.js projects"""
    print("Profiling Node.js application...")

    # Try to use 0x if available
    try:
        result = subprocess.run(
            ["npx", "0x", "--output", ".claude/profile.json", "npm", "start"],
            capture_output=True,
            timeout=60
        )

        if Path(".claude/profile.json").exists():
            with open(".claude/profile.json") as f:
                return json.load(f)
    except Exception as e:
        print(f"0x profiling failed: {e}")

    # Fallback: basic metrics
    return {"method": "basic", "metrics": {}}

def profile_python():
    """Generate profile data for Python projects"""
    print("Profiling Python application...")

    # Try to use py-spy if available
    try:
        result = subprocess.run(
            ["py-spy", "record", "-o", ".claude/profile.svg", "-f", "speedscope"],
            capture_output=True,
            timeout=60
        )

        # Return basic info if py-spy succeeded
        return {"method": "py-spy", "output": ".claude/profile.svg"}
    except Exception as e:
        print(f"py-spy profiling failed: {e}")

    return {"method": "basic", "metrics": {}}

def profile_go():
    """Generate profile data for Go projects"""
    print("Profiling Go application...")

    # Go profiling with pprof
    try:
        result = subprocess.run(
            ["go", "test", "-cpuprofile", ".claude/cpu.prof", "-memprofile", ".claude/mem.prof"],
            capture_output=True,
            timeout=60
        )

        return {
            "method": "pprof",
            "cpu_profile": ".claude/cpu.prof",
            "mem_profile": ".claude/mem.prof"
        }
    except Exception as e:
        print(f"Go profiling failed: {e}")

    return {"method": "basic", "metrics": {}}

def get_node_version():
    """Get Node.js version if available"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        return result.stdout.strip()
    except:
        return None

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate performance baseline")
    parser.add_argument("--name", help="Baseline name")
    parser.add_argument("--output", help="Output file path")

    args = parser.parse_args()

    generate_baseline(args.name, args.output)
