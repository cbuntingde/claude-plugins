#!/usr/bin/env python3
"""
Health Check Script
Verifies the plugin is properly configured and accessible.
"""

import json
import os
import sys
from pathlib import Path

# Paths
PLUGIN_ROOT = Path(__file__).parent.parent
MEMORY_DATA_DIR = PLUGIN_ROOT / "auto-data"
SESSIONS_DIR = MEMORY_DATA_DIR / "sessions"
HOOKS_CONFIG = PLUGIN_ROOT / "hooks" / "hooks.json"
AGENT_DIR = PLUGIN_ROOT / "agents"

def check_memory_data_dir() -> dict:
    """Check memory data directory exists and is writable."""
    exists = SESSIONS_DIR.exists()
    writable = False
    if exists:
        try:
            test_file = SESSIONS_DIR / ".write_test"
            test_file.write_text("test")
            test_file.unlink()
            writable = True
        except (IOError, OSError):
            pass

    return {
        "exists": exists,
        "writable": writable,
        "path": str(SESSIONS_DIR),
    }


def check_hooks_config() -> dict:
    """Check hooks configuration file exists and is valid JSON."""
    if not HOOKS_CONFIG.exists():
        return {"exists": False, "valid": False, "error": "File not found"}

    try:
        with open(HOOKS_CONFIG) as f:
            config = json.load(f)
        return {
            "exists": True,
            "valid": True,
            "hooks_count": len(config.get("hooks", {})),
            "config": config,
        }
    except json.JSONDecodeError as e:
        return {"exists": True, "valid": False, "error": str(e)}
    except IOError as e:
        return {"exists": True, "valid": False, "error": str(e)}


def check_agents() -> dict:
    """Check that agent files exist."""
    agents = []
    if AGENT_DIR.exists():
        for agent_file in AGENT_DIR.glob("*.md"):
            agents.append({
                "name": agent_file.name,
                "exists": True,
                "size": agent_file.stat().st_size,
            })

    return {
        "total": len(agents),
        "agents": agents,
        "exists": bool(agents),
    }


def check_scripts() -> dict:
    """Check that script files exist and are executable."""
    scripts = ["store_memory.py", "retrieve_memory.py", "prune_memories.py", "health-check.py"]
    script_dir = PLUGIN_ROOT / "scripts"

    results = []
    for script in scripts:
        script_path = script_dir / script
        if script_path.exists():
            is_executable = os.access(script_path, os.X_OK)
            results.append({
                "name": script,
                "exists": True,
                "executable": is_executable,
            })
        else:
            results.append({
                "name": script,
                "exists": False,
                "executable": False,
            })

    return results


def main():
    """Run all health checks and output results."""
    memory_dir = check_memory_data_dir()
    hooks = check_hooks_config()
    agents = check_agents()
    scripts = check_scripts()

    # Calculate overall status
    health_checks = [
        memory_dir["exists"] and memory_dir["writable"],
        hooks["exists"] and hooks["valid"],
        agents["exists"],
        any(s["exists"] and s["executable"] for s in scripts),
    ]

    is_healthy = all(health_checks)

    result = {
        "status": "healthy" if is_healthy else "unhealthy",
        "checks": {
            "memory_data_directory": memory_dir,
            "hooks_configuration": hooks,
            "agents": agents,
            "scripts": scripts,
        },
    }

    print(json.dumps(result, indent=2))
    sys.exit(0 if is_healthy else 1)


if __name__ == "__main__":
    main()