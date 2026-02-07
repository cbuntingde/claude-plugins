#!/usr/bin/env python3
"""
Flask API Analyzer
Analyzes Flask code to extract API endpoints for OpenAPI generation

Usage: python flask-analyzer.py <directory>
"""

import ast
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional


class FlaskAnalyzer:
    def __init__(self):
        self.endpoints = []
        self.schemas = {}
        self.blueprints = {}

    def analyze(self, directory: str) -> Dict[str, Any]:
        """Analyze Python files in the given directory"""
        py_files = self._find_files(directory, ['.py'])

        for file_path in py_files:
            self._analyze_file(file_path)

        return {
            'endpoints': self.endpoints,
            'schemas': self.schemas,
            'blueprints': self.blueprints
        }

    def _find_files(self, directory: str, extensions: List[str]) -> List[str]:
        """Find all files with given extensions recursively"""
        files = []
        ignore_dirs = {'venv', '__pycache__', '.git', 'node_modules', 'dist', 'build'}

        for root, dirs, filenames in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in extensions):
                    files.append(os.path.join(root, filename))

        return files

    def _analyze_file(self, file_path: str):
        """Analyze a single Python file for Flask endpoints"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            tree = ast.parse(content, filename=file_path)
            analyzer = FlaskVisitor(file_path, content)
            analyzer.visit(tree)

            self.endpoints.extend(analyzer.endpoints)
            self.schemas.update(analyzer.schemas)

            # Track blueprints
            if analyzer.blueprints:
                self.blueprints[file_path] = analyzer.blueprints

        except SyntaxError as e:
            print(f"Warning: Could not parse {file_path}: {e}", file=sys.stderr)
        except Exception as e:
            print(f"Warning: Error analyzing {file_path}: {e}", file=sys.stderr)


class FlaskVisitor(ast.NodeVisitor):
    """AST visitor for Flask route detection"""

    def __init__(self, file_path: str, content: str):
        self.file_path = file_path
        self.content = content
        self.endpoints = []
        self.schemas = {}
        self.blueprints = {}
        self.app_var = None
        self.current_class = None

    def visit_Assign(self, node):
        """Track Flask app and blueprint assignments"""
        # Look for app = Flask(__name__)
        if isinstance(node.value, ast.Call):
            if isinstance(node.value.func, ast.Name):
                if node.value.func.id == 'Flask':
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            self.app_var = target.id

                # Track Blueprint() assignments
                if node.value.func.id == 'Blueprint':
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            # Extract blueprint name from args
                            bp_name = None
                            if node.value.args:
                                if isinstance(node.value.args[0], ast.Constant):
                                    bp_name = node.value.args[0].value

                            self.blueprints[target.id] = {
                                'name': bp_name,
                                'variable': target.id
                            }

        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        """Check for Flask route decorators"""
        route_decorator = self._get_route_decorator(node)

        if route_decorator:
            methods, path, blueprint = self._parse_route_decorator(route_decorator)

            if not methods:
                methods = ['GET']  # Default method

            for method in methods:
                endpoint = {
                    'method': method.upper(),
                    'path': path,
                    'file': self.file_path,
                    'line': node.lineno,
                    'function': node.name,
                    'blueprint': blueprint,
                    'summary': self._extract_summary(node),
                    'description': self._extract_docstring(node)
                }

                self.endpoints.append(endpoint)

        self.generic_visit(node)

    def _get_route_decorator(self, node: ast.FunctionDef) -> Optional[ast.expr]:
        """Extract the route decorator from a function"""
        for decorator in node.decorator_list:
            # Handle @app.route('/path')
            if isinstance(decorator, ast.Call):
                func = decorator.func
                if isinstance(func, ast.Attribute):
                    if func.attr == 'route':
                        return decorator

            # Handle @bp.route('/path') for blueprints
            if isinstance(decorator, ast.Call):
                func = decorator.func
                if isinstance(func, ast.Attribute) and func.attr == 'route':
                    return decorator

        return None

    def _parse_route_decorator(self, decorator: ast.Call) -> tuple:
        """Parse route decorator to extract methods, path, and blueprint"""
        path = '/'
        methods = ['GET']
        blueprint = None

        # Extract path
        if decorator.args:
            path_arg = decorator.args[0]
            if isinstance(path_arg, ast.Constant):
                path = path_arg.value

        # Extract methods from keyword arguments
        for keyword in decorator.keywords:
            if keyword.arg == 'methods':
                if isinstance(keyword.value, ast.List):
                    methods = []
                    for elt in keyword.value.elts:
                        if isinstance(elt, ast.Constant):
                            methods.append(elt.value)

        # Check if this is a blueprint route
        func = decorator.func
        if isinstance(func, ast.Attribute):
            if isinstance(func.value, ast.Name):
                if func.value.id in self.blueprints:
                    blueprint = func.value.id

        return methods, path, blueprint

    def _extract_summary(self, node: ast.FunctionDef) -> Optional[str]:
        """Extract summary from decorator or function name"""
        # Could extract from @route decorator summary parameter
        return f"{node.name.replace('_', ' ').title()}"

    def _extract_docstring(self, node: ast.FunctionDef) -> Optional[str]:
        """Extract function docstring"""
        if (node.body and
            isinstance(node.body[0], ast.Expr) and
            isinstance(node.body[0].value, ast.Constant)):
            return node.body[0].value.value
        return None


def generate_openapi(info: Dict, endpoints: List[Dict], schemas: Dict) -> Dict:
    """Generate OpenAPI specification from analyzed endpoints"""
    paths = {}

    for endpoint in endpoints:
        path_key = endpoint['path']
        if path_key not in paths:
            paths[path_key] = {}

        operation = {
            'summary': endpoint.get('summary', f"{endpoint['method']} {endpoint['path']}"),
            'description': endpoint.get('description', ''),
            'operationId': f"{endpoint['method'].lower()}{endpoint['path'].replace('/', '-')}",
            'responses': {
                '200': {
                    'description': 'Successful response'
                }
            }
        }

        # Extract path parameters
        path_params = re.findall(r'<(\w+):?(\w+)?>', endpoint['path'])
        if path_params:
            params = []
            # Convert Flask path params <type:name> to OpenAPI format
            converted_path = re.sub(r'<(\w+):?(\w+)?>', r'{\2}', endpoint['path'])

            for param_type, param_name in path_params:
                params.append({
                    'name': param_name,
                    'in': 'path',
                    'required': True,
                    'schema': {
                        'type': _flask_type_to_openapi(param_type) if param_type else 'string'
                    }
                })

            if params:
                operation['parameters'] = params

        paths[path_key][endpoint['method'].lower()] = operation

    return {
        'openapi': '3.0.0',
        'info': info or {
            'title': 'Flask API',
            'version': '1.0.0',
            'description': 'Generated from Flask code'
        },
        'paths': paths,
        'components': {
            'schemas': schemas
        }
    }


def _flask_type_to_openapi(flask_type: str) -> str:
    """Convert Flask type to OpenAPI type"""
    type_map = {
        'string': 'string',
        'int': 'integer',
        'float': 'number',
        'path': 'string',
        'uuid': 'string',
        'any': 'string'
    }
    return type_map.get(flask_type.lower(), 'string')


def main():
    if len(sys.argv) < 2:
        print("Usage: python flask-analyzer.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    analyzer = FlaskAnalyzer()
    result = analyzer.analyze(directory)

    import json
    print(json.dumps(generate_openapi(None, result['endpoints'], result['schemas']), indent=2))


if __name__ == '__main__':
    main()
