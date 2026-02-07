#!/usr/bin/env python3
"""
Code Complexity Analyzer
Analyzes code for complexity metrics and provides refactoring recommendations.
Supports JavaScript, TypeScript, Python, Java, Go, and more.
"""

import ast
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class ComplexityAnalyzer:
    """Analyzes code complexity metrics."""

    # Complexity thresholds
    DEFAULT_CYCLOMATIC_THRESHOLD = 15
    DEFAULT_COGNITIVE_THRESHOLD = 15
    DEFAULT_MAX_LINES = 50
    DEFAULT_MAX_NESTING = 4
    DEFAULT_MAX_PARAMETERS = 5

    def __init__(
        self,
        cyclomatic_threshold: int = DEFAULT_CYCLOMATIC_THRESHOLD,
        cognitive_threshold: int = DEFAULT_COGNITIVE_THRESHOLD,
        max_lines: int = DEFAULT_MAX_LINES,
        max_nesting: int = DEFAULT_MAX_NESTING,
        max_parameters: int = DEFAULT_MAX_PARAMETERS,
    ):
        self.cyclomatic_threshold = cyclomatic_threshold
        self.cognitive_threshold = cognitive_threshold
        self.max_lines = max_lines
        self.max_nesting = max_nesting
        self.max_parameters = max_parameters

    def analyze_file(self, file_path: str) -> Dict:
        """Analyze a single file for complexity."""
        path = Path(file_path)

        if not path.exists():
            return {"error": f"File not found: {file_path}"}

        content = path.read_text()

        # Determine language and analyze
        if path.suffix in [".py"]:
            return self._analyze_python(content, str(path))
        elif path.suffix in [".js", ".jsx", ".ts", ".tsx"]:
            return self._analyze_javascript(content, str(path))
        else:
            return self._analyze_generic(content, str(path))

    def _analyze_python(self, content: str, file_path: str) -> Dict:
        """Analyze Python code."""
        try:
            tree = ast.parse(content)
        except SyntaxError as e:
            return {"error": f"Syntax error in {file_path}: {e}"}

        functions = []

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                func_info = self._analyze_python_function(node, content)
                functions.append(func_info)

        return self._generate_report(file_path, functions)

    def _analyze_python_function(self, node: ast.FunctionDef, content: str) -> Dict:
        """Analyze a Python function."""
        # Get function lines
        lines = content.split("\n")
        func_lines = lines[node.lineno - 1 : node.end_lineno] if hasattr(node, "end_lineno") else []
        line_count = len(func_lines)

        # Calculate cyclomatic complexity
        cyclomatic = 1  # Base complexity
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                cyclomatic += 1
            elif isinstance(child, ast.BoolOp):
                cyclomatic += len(child.values) - 1

        # Calculate cognitive complexity
        cognitive = self._calculate_cognitive_complexity(node)

        # Count parameters
        param_count = len(node.args.args) + len(node.args.kwonlyargs)

        # Calculate nesting depth
        nesting_depth = self._calculate_nesting_depth(node)

        # Determine issues
        issues = []
        if cyclomatic > self.cyclomatic_threshold:
            issues.append(f"High cyclomatic complexity ({cyclomatic} > {self.cyclomatic_threshold})")
        if cognitive > self.cognitive_threshold:
            issues.append(f"High cognitive complexity ({cognitive} > {self.cognitive_threshold})")
        if line_count > self.max_lines:
            issues.append(f"Function too long ({line_count} > {self.max_lines} lines)")
        if nesting_depth > self.max_nesting:
            issues.append(f"Deep nesting ({nesting_depth} > {self.max_nesting} levels)")
        if param_count > self.max_parameters:
            issues.append(f"Too many parameters ({param_count} > {self.max_parameters})")

        return {
            "name": node.name,
            "line_start": node.lineno,
            "line_end": node.end_lineno if hasattr(node, "end_lineno") else node.lineno,
            "cyclomatic_complexity": cyclomatic,
            "cognitive_complexity": cognitive,
            "line_count": line_count,
            "nesting_depth": nesting_depth,
            "parameter_count": param_count,
            "issues": issues,
            "needs_refactoring": len(issues) > 0,
        }

    def _calculate_cognitive_complexity(self, node: ast.AST) -> int:
        """Calculate cognitive complexity."""
        complexity = 0
        nesting_level = 0

        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For)):
                # Add nesting penalty
                complexity += 1 + nesting_level
                nesting_level += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
            elif isinstance(child, (ast.Break, ast.Continue)):
                complexity += 1
            elif isinstance(child, ast.ExceptHandler):
                complexity += 1

        return complexity

    def _calculate_nesting_depth(self, node: ast.AST) -> int:
        """Calculate maximum nesting depth."""
        max_depth = 0

        def count_depth(n: ast.AST, current_depth: int = 0):
            nonlocal max_depth
            max_depth = max(max_depth, current_depth)

            if isinstance(n, (ast.If, ast.While, ast.For, ast.With, ast.Try)):
                for child in ast.iter_child_nodes(n):
                    count_depth(child, current_depth + 1)
            else:
                for child in ast.iter_child_nodes(n):
                    count_depth(child, current_depth)

        count_depth(node)
        return max_depth

    def _analyze_javascript(self, content: str, file_path: str) -> Dict:
        """Analyze JavaScript/TypeScript code (regex-based)."""
        functions = []

        # Find functions using regex
        func_pattern = r'(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?function)'
        matches = re.finditer(func_pattern, content)

        for match in matches:
            func_name = match.group(1) or match.group(2) or match.group(3)
            if not func_name:
                continue

            # Find function body (simple heuristic)
            start_pos = match.start()
            lines = content[:start_pos].count("\n") + 1

            # Count lines to end of function
            remaining = content[start_pos:]
            brace_count = 0
            func_lines = 0
            found_start = False

            for char in remaining:
                if char == "{":
                    found_start = True
                    brace_count += 1
                elif char == "}":
                    brace_count -= 1
                    if brace_count == 0 and found_start:
                        break
                if found_start:
                    if char == "\n":
                        func_lines += 1

            # Estimate complexity
            cyclomatic = 1 + remaining[: func_lines * 50].count("if") + remaining[: func_lines * 50].count("for") + remaining[: func_lines * 50].count("while")

            functions.append(
                {
                    "name": func_name,
                    "line_start": lines,
                    "line_end": lines + func_lines,
                    "cyclomatic_complexity": cyclomatic,
                    "cognitive_complexity": cyclomatic // 2 + func_lines // 20,
                    "line_count": func_lines,
                    "nesting_depth": min(5, func_lines // 10),
                    "parameter_count": 0,  # Would need more sophisticated parsing
                    "issues": [],
                    "needs_refactoring": False,
                }
            )

        return self._generate_report(file_path, functions)

    def _analyze_generic(self, content: str, file_path: str) -> Dict:
        """Generic analysis for unsupported languages."""
        lines = content.split("\n")

        return {
            "file": file_path,
            "language": "unknown",
            "functions": [],
            "message": f"Language not fully supported. Basic analysis only.",
            "total_lines": len(lines),
        }

    def _generate_report(self, file_path: str, functions: List[Dict]) -> Dict:
        """Generate a complexity report."""
        total_functions = len(functions)
        needs_refactoring = sum(1 for f in functions if f.get("needs_refactoring", False))

        return {
            "file": file_path,
            "total_functions": total_functions,
            "functions_needing_refactoring": needs_refactoring,
            "functions": functions,
            "summary": {
                "high_complexity": [f for f in functions if f.get("cyclomatic_complexity", 0) > self.cyclomatic_threshold],
                "long_functions": [f for f in functions if f.get("line_count", 0) > self.max_lines],
                "deep_nesting": [f for f in functions if f.get("nesting_depth", 0) > self.max_nesting],
            },
        }

    def print_report(self, report: Dict, output_format: str = "detailed", show_cognitive: bool = False, show_suggestions: bool = False, minimal: bool = False):
        """Print the complexity report."""
        if "error" in report:
            print(f"Error: {report['error']}")
            return

        if output_format == "json":
            print(json.dumps(report, indent=2))
            return

        print(f"\n{'='*60}")
        print(f"Complexity Analysis Report: {report['file']}")
        print(f"{'='*60}\n")

        functions = report.get("functions", [])
        if not functions:
            print("No functions found or language not supported.")
            return

        if output_format == "table":
            self._print_table_report(functions, show_cognitive=show_cognitive)
        else:
            self._print_detailed_report(functions, show_cognitive=show_cognitive, show_suggestions=show_suggestions, minimal=minimal)

    def _print_table_report(self, functions: List[Dict], show_cognitive: bool = False):
        """Print a compact table report."""
        if show_cognitive:
            print(f"{'Function':<30} {'Cyclo':<8} {'Cogn':<8} {'Lines':<8} {'Nest':<8} {'Status':<10}")
            print("-" * 80)
        else:
            print(f"{'Function':<30} {'Cyclo':<8} {'Lines':<8} {'Nest':<8} {'Status':<10}")
            print("-" * 70)

        for func in functions:
            status = "!" if func.get("needs_refactoring") else "OK"
            if show_cognitive:
                print(
                    f"{func['name']:<30} "
                    f"{func['cyclomatic_complexity']:<8} "
                    f"{func['cognitive_complexity']:<8} "
                    f"{func['line_count']:<8} "
                    f"{func['nesting_depth']:<8} "
                    f"{status:<10}"
                )
            else:
                print(
                    f"{func['name']:<30} "
                    f"{func['cyclomatic_complexity']:<8} "
                    f"{func['line_count']:<8} "
                    f"{func['nesting_depth']:<8} "
                    f"{status:<10}"
                )

    def _print_detailed_report(self, functions: List[Dict], show_cognitive: bool = False, show_suggestions: bool = False, minimal: bool = False):
        """Print a detailed report."""
        for func in functions:
            if minimal and not func.get("needs_refactoring"):
                continue

            print(f"\n{'─'*60}")
            print(f"Function: `{func['name']}` (lines {func['line_start']}-{func['line_end']})")
            print(f"{'─'*60}")

            print("\n**Metrics:**")
            print(f"  • Cyclomatic Complexity: {func['cyclomatic_complexity']}", end="")
            if func['cyclomatic_complexity'] > self.cyclomatic_threshold:
                print(" ! (High)")
            else:
                print()

            if show_cognitive:
                print(f"  • Cognitive Complexity: {func['cognitive_complexity']}", end="")
                if func['cognitive_complexity'] > self.cognitive_threshold:
                    print(" ! (High)")
                else:
                    print()

            print(f"  • Lines of Code: {func['line_count']}", end="")
            if func['line_count'] > self.max_lines:
                print(" ! (Too long)")
            else:
                print()

            print(f"  • Nesting Depth: {func['nesting_depth']}", end="")
            if func['nesting_depth'] > self.max_nesting:
                print(" ! (Deep)")
            else:
                print()

            print(f"  • Parameters: {func['parameter_count']}")

            if func.get("issues"):
                print("\n**Issues:**")
                for issue in func["issues"]:
                    print(f"  • {issue}")

                if show_suggestions:
                    print("\n**Refactoring Suggestions:**")
                    self._print_suggestions(func)

    def _print_suggestions(self, func: Dict):
        """Print refactoring suggestions based on issues."""
        if func["cyclomatic_complexity"] > self.cyclomatic_threshold:
            print("  1. Extract smaller functions to reduce complexity")
            print("  2. Simplify conditional logic")
            print("  3. Consider Strategy pattern for complex conditionals")

        if func["line_count"] > self.max_lines:
            print("  4. Break into multiple focused functions")
            print("  5. Extract repeated logic into helper functions")

        if func["nesting_depth"] > self.max_nesting:
            print("  6. Use early returns/guard clauses")
            print("  7. Extract nested conditions into separate functions")

        if func["parameter_count"] > self.max_parameters:
            print("  8. Use parameter objects to group related parameters")
            print("  9. Consider using configuration objects")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Analyze code complexity")
    parser.add_argument("files", nargs="+", help="Files to analyze")
    parser.add_argument("--threshold", type=int, default=15, help="Complexity threshold")
    parser.add_argument("--output", choices=["table", "detailed", "json"], default="detailed", help="Output format")
    parser.add_argument("--minimal", action="store_true", help="Only show problematic functions")
    parser.add_argument("--cognitive", action="store_true", help="Include cognitive complexity analysis")
    parser.add_argument("--suggest", action="store_true", help="Include refactoring suggestions")

    args = parser.parse_args()

    analyzer = ComplexityAnalyzer(cyclomatic_threshold=args.threshold)

    for file_path in args.files:
        report = analyzer.analyze_file(file_path)
        analyzer.print_report(
            report,
            output_format=args.output,
            show_cognitive=args.cognitive,
            show_suggestions=args.suggest,
            minimal=args.minimal
        )


if __name__ == "__main__":
    main()
