#!/usr/bin/env python3
"""
API Client Updater
Updates existing API clients when specifications change
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime
import shutil


class ApiClientUpdater:
    """Update API clients from new specifications with security validations"""

    def __init__(self, client_path: str, new_spec_url: Optional[str] = None):
        # SECURITY: Validate client_path to prevent path traversal
        resolved_path = Path(client_path).resolve()
        cwd = Path.cwd().resolve()
        home_dir = Path.home().resolve()

        # Check if path is within allowed directories
        try:
            resolved_path.relative_to(cwd)
        except ValueError:
            try:
                resolved_path.relative_to(home_dir)
            except ValueError:
                if Path(client_path).is_absolute():
                    print(f"Error: Client path must be within current project or home directory")
                    sys.exit(1)

        self.client_path = Path(client_path)
        self.new_spec_url = new_spec_url

    def load_version_history(self) -> Dict[str, Any]:
        """Load API version history"""
        history_file = self.client_path / '.api-version-history.json'
        if history_file.exists():
            return json.loads(history_file.read_text())
        return {}

    def save_version_history(self, history: Dict[str, Any]):
        """Save API version history"""
        history_file = self.client_path / '.api-version-history.json'
        history_file.write_text(json.dumps(history, indent=2))

    def create_backup(self) -> Path:
        """Create backup of current client"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = self.client_path / '.api-backups' / timestamp
        backup_dir.mkdir(parents=True, exist_ok=True)

        # Copy all files except .api-backups
        for item in self.client_path.iterdir():
            if item.name == '.api-backups':
                continue
            if item.is_file():
                shutil.copy2(item, backup_dir / item.name)
            elif item.is_dir():
                shutil.copytree(item, backup_dir / item.name,
                              ignore=shutil.ignore_patterns('.api-backups'),
                              dirs_exist_ok=True)

        print(f"Created backup: {backup_dir}")
        return backup_dir

    def detect_changes(self, old_spec: Dict, new_spec: Dict) -> Dict[str, Any]:
        """Detect changes between two API specs"""
        changes = {
            'added': [],
            'modified': [],
            'removed': [],
            'breaking': []
        }

        # Compare paths/endpoints
        old_paths = set(old_spec.get('paths', {}).keys())
        new_paths = set(new_spec.get('paths', {}).keys())

        changes['added'] = list(new_paths - old_paths)
        changes['removed'] = list(old_paths - new_paths)
        changes['breaking'] = [f"Removed endpoint: {path}" for path in changes['removed']]

        # Check for modified endpoints
        for path in old_paths & new_paths:
            old_methods = set(old_spec['paths'][path].keys()) - {'parameters', '$ref'}
            new_methods = set(new_spec['paths'][path].keys()) - {'parameters', '$ref'}

            for method in old_methods | new_methods:
                old_def = old_spec['paths'][path].get(method)
                new_def = new_spec['paths'][path].get(method)

                if old_def and new_def:
                    if json.dumps(old_def, sort_keys=True) != json.dumps(new_def, sort_keys=True):
                        changes['modified'].append(f"{method.upper()} {path}")
                elif old_def and not new_def:
                    changes['breaking'].append(f"Removed method: {method.upper()} {path}")
                elif not old_def and new_def:
                    changes['added'].append(f"{method.upper()} {path}")

        return changes

    def generate_migration_guide(self, changes: Dict[str, Any]) -> str:
        """Generate migration guide for breaking changes"""
        guide = [
            "# API Migration Guide",
            f"\nGenerated: {datetime.now().isoformat()}",
            "\n## Summary",
            f"\n- Added: {len(changes['added'])} items",
            f"- Modified: {len(changes['modified'])} items",
            f"- Removed: {len(changes['removed'])} items",
            f"- Breaking Changes: {len(changes['breaking'])} items",
        ]

        if changes['breaking']:
            guide.append("\n## ⚠️ Breaking Changes")
            for change in changes['breaking']:
                guide.append(f"\n### {change}")
                guide.append("\n**Action Required:** Review code using this endpoint\n")

        if changes['added']:
            guide.append("\n## ✨ New Features")
            for item in changes['added']:
                guide.append(f"- {item}")

        if changes['modified']:
            guide.append("\n## 🔄 Modified Endpoints")
            for item in changes['modified']:
                guide.append(f"- {item}")

        return '\n'.join(guide)

    def rollback(self, version: str):
        """Rollback to a previous version with security validation"""
        # SECURITY: Validate version parameter to prevent path traversal
        # Only allow alphanumeric versions and basic separators
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', version):
            print(f"Error: Invalid version format")
            sys.exit(1)

        backup_dir = self.client_path / '.api-backups' / version

        if not backup_dir.exists():
            print(f"Backup not found: {backup_dir}")
            sys.exit(1)

        # SECURITY: Ensure backup_dir is still within client_path (defense in depth)
        resolved_backup = backup_dir.resolve()
        resolved_client = self.client_path.resolve()
        try:
            resolved_backup.relative_to(resolved_client)
        except ValueError:
            print(f"Error: Backup path is outside client directory")
            sys.exit(1)

        # Remove current files (except .api-backups)
        for item in self.client_path.iterdir():
            if item.name == '.api-backups':
                continue
            if item.is_file():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)

        # Restore from backup
        for item in backup_dir.iterdir():
            if item.is_file():
                shutil.copy2(item, self.client_path / item.name)
            elif item.is_dir():
                shutil.copytree(item, self.client_path / item.name)

        print(f"Rolled back to version: {version}")

    def update(self, strategy: str = 'merge'):
        """Update client with new spec"""
        if not self.client_path.exists():
            print(f"Client path does not exist: {self.client_path}")
            sys.exit(1)

        # Load version history
        history = self.load_version_history()

        if not history.get('currentVersion'):
            print("No version history found. This may be a new client.")
            return

        # Fetch new spec
        if not self.new_spec_url:
            self.new_spec_url = history.get('specUrl')

        if not self.new_spec_url:
            print("No spec URL available. Please provide --source argument.")
            sys.exit(1)

        print(f"Fetching new spec from {self.new_spec_url}...")

        # Import the generator to fetch and parse
        # In real implementation, would reuse generator code
        print("Update functionality requires integration with generate-client.py")
        print(f"Strategy: {strategy}")
        print("Please use /api-gen command for full regeneration")


def main():
    parser = argparse.ArgumentParser(description='Update API client from new spec')
    parser.add_argument('path', help='Path to existing client directory')
    parser.add_argument('--source', '-s', help='New API spec URL')
    parser.add_argument('--strategy', choices=['merge', 'recreate', 'diff'],
                       default='merge', help='Update strategy')
    parser.add_argument('--rollback-to', help='Rollback to specific backup version')
    parser.add_argument('--migration-guide', action='store_true',
                       help='Generate migration guide')

    args = parser.parse_args()

    updater = ApiClientUpdater(
        client_path=args.path,
        new_spec_url=args.source
    )

    if args.rollback_to:
        updater.rollback(args.rollback_to)
        return

    if args.strategy == 'diff':
        print("Diff strategy: Compare specs before updating")
        # Would load old and new specs and show changes
    else:
        updater.create_backup()
        updater.update(strategy=args.strategy)


if __name__ == '__main__':
    main()
