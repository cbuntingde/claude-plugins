#!/usr/bin/env python3
"""
Comprehensive security scanner script
Detects common vulnerabilities and security issues in code
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict, Tuple

# Vulnerability patterns
VULN_PATTERNS = {
    'SQL Injection': [
        r'query\s*=\s*[f\"\'].*\{.*\}.*[\'\"]',  # f-strings with variables
        r'execute\([\"\'].*\+.*[\"\']\)',  # String concatenation
        r'SELECT.*FROM.*WHERE.*\+',  # SQL with +
    ],
    'XSS': [
        r'innerHTML\s*=\s*',  # Direct innerHTML assignment
        r'document\.write\(',  # document.write
        r'eval\(',  # eval
    ],
    'Command Injection': [
        r'system\(',  # C system()
        r'exec\(',  # Python exec
        r'subprocess\.call\(.*shell=True',  # subprocess with shell
        r'os\.system\(',  # os.system
    ],
    'Hardcoded Secrets': [
        r'password\s*[=:]\s*[\"\'][^\"\']{8,}[\"\']',
        r'api[_-]?key\s*[=:]\s*[\"\'][^\"\']{20,}[\"\']',
        r'secret[_-]?key\s*[=:]\s*[\"\'][^\"\']{20,}[\"\']',
        r'token\s*[=:]\s*[\"\'][^\"\']{30,}[\"\']',
        r'AKIA[0-9A-Z]{16}',  # AWS access key
        r'ghp_[a-zA-Z0-9]{36}',  # GitHub token
        r'sk-[a-zA-Z0-9]{48}',  # Stripe key
    ],
    'Weak Cryptography': [
        r'\.md5\(',
        r'\.sha1\(',
        r'hash\s*=\s*[\"\']md5[\"\']',
        r'cipher\s*=\s*[\"\']DES[\"\']',
        r'cipher\s*=\s*[\"\']RC4[\"\']',
    ],
    'Insecure Random': [
        r'Math\.random\(\)',  # JS weak random
        r'random\.random\(\)',  # Python weak random
    ],
}

class SecurityScanner:
    def __init__(self, path: str = '.', severity: str = 'medium'):
        self.path = Path(path)
        self.severity_threshold = {
            'critical': 3,
            'high': 2,
            'medium': 1,
            'low': 0
        }.get(severity.lower(), 1)
        self.findings = []

    def scan_file(self, file_path: Path) -> List[Dict]:
        """Scan a single file for vulnerabilities"""
        findings = []

        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()

            for line_num, line in enumerate(lines, 1):
                for vuln_type, patterns in VULN_PATTERNS.items():
                    for pattern in patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            findings.append({
                                'file': str(file_path),
                                'line': line_num,
                                'type': vuln_type,
                                'severity': self.get_severity(vuln_type),
                                'code': line.strip(),
                                'pattern': pattern
                            })
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")

        return findings

    def get_severity(self, vuln_type: str) -> int:
        """Get severity level for vulnerability type"""
        high_severity = ['SQL Injection', 'Command Injection', 'Hardcoded Secrets']
        medium_severity = ['XSS', 'Weak Cryptography']

        if vuln_type in high_severity:
            return 3
        elif vuln_type in medium_severity:
            return 2
        else:
            return 1

    def scan_directory(self) -> List[Dict]:
        """Scan all files in directory"""
        # Extensions to scan
        extensions = {'.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.cs'}

        # Directories to skip
        skip_dirs = {
            'node_modules', 'vendor', '.git', '__pycache__',
            'dist', 'build', '.venv', 'venv', 'env'
        }

        all_findings = []

        for root, dirs, files in os.walk(self.path):
            # Remove skipped directories
            dirs[:] = [d for d in dirs if d not in skip_dirs]

            for file in files:
                file_path = Path(root) / file

                # Check file extension
                if file_path.suffix in extensions:
                    findings = self.scan_file(file_path)
                    all_findings.extend(findings)

        # Filter by severity threshold
        filtered_findings = [
            f for f in all_findings
            if f['severity'] >= self.severity_threshold
        ]

        return filtered_findings

    def print_report(self, findings: List[Dict], output_format: str = 'text'):
        """Print scan report"""
        if output_format == 'json':
            print(json.dumps(findings, indent=2))
            return

        # Text format
        print("\n" + "="*60)
        print("    SECURITY SCAN REPORT")
        print("="*60 + "\n")

        if not findings:
            print("✓ No vulnerabilities found!")
            return

        # Group by severity
        critical = [f for f in findings if f['severity'] == 3]
        high = [f for f in findings if f['severity'] == 2]
        medium = [f for f in findings if f['severity'] == 1]

        print(f"Total findings: {len(findings)}")
        print(f"  Critical: {len(critical)}")
        print(f"  High: {len(high)}")
        print(f"  Medium: {len(medium)}")
        print()

        # Print findings
        for finding in sorted(findings, key=lambda x: -x['severity']):
            severity_label = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][finding['severity']]
            severity_emoji = ['🔵', '🟡', '🟠', '🔴'][finding['severity']]

            print(f"{severity_emoji} {severity_label}: {finding['type']}")
            print(f"   File: {finding['file']}:{finding['line']}")
            print(f"   Code: {finding['code'][:80]}")
            print()

def main():
    parser = argparse.ArgumentParser(description='Security vulnerability scanner')
    parser.add_argument('path', nargs='?', default='.', help='Path to scan')
    parser.add_argument('--severity', choices=['critical', 'high', 'medium', 'low'],
                       default='medium', help='Minimum severity level')
    parser.add_argument('--output', choices=['text', 'json'], default='text',
                       help='Output format')

    args = parser.parse_args()

    scanner = SecurityScanner(args.path, args.severity)
    findings = scanner.scan_directory()
    scanner.print_report(findings, args.output)

    # Exit with error code if vulnerabilities found
    sys.exit(1 if findings else 0)

if __name__ == '__main__':
    main()
