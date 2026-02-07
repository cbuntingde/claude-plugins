#!/usr/bin/env python3
"""
FastAPI API Analyzer
Analyzes FastAPI code to extract API endpoints for OpenAPI generation

Usage: python fastapi-analyzer.py <directory>
"""

import ast
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional


class FastAPIAnalyzer:
    def __init__(self):
        self.endpoints = []
        self.schemas = {}
        self.security_schemes = {}

    def analyze(self, directory: str) -> Dict[str, Any]:
        """Analyze Python files in the given directory"""
        py_files = self._find_files(directory, ['.py'])

        for file_path in py_files:
            self._analyze_file(file_path)

        return {
            'endpoints': self.endpoints,
            'schemas': self.schemas,
            'security_schemes': self.security_schemes
        }

    def _find_files(self, directory: str, extensions: List[str]) -> List[str]:
        """Find all files with given extensions recursively"""
        files = []
        ignore_dirs = {'venv', '__pycache__', '.git', 'node_modules', 'dist', 'build'}

        for root, dirs, filenames in os.walk(directory):
            # Remove ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in extensions):
                    files.append(os.path.join(root, filename))

        return files

    def _analyze_file(self, file_path: str):
        """Analyze a single Python file for FastAPI endpoints"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            tree = ast.parse(content, filename=file_path)
            analyzer = FastAPIVisitor(file_path, content)
            analyzer.visit(tree)

            self.endpoints.extend(analyzer.endpoints)
            self.schemas.update(analyzer.schemas)

        except SyntaxError as e:
            print(f"Warning: Could not parse {file_path}: {e}", file=sys.stderr)
        except Exception as e:
            print(f"Warning: Error analyzing {file_path}: {e}", file=sys.stderr)


class FastAPIVisitor(ast.NodeVisitor):
    """AST visitor for FastAPI route detection"""

    def __init__(self, file_path: str, content: str):
        self.file_path = file_path
        self.content = content
        self.endpoints = []
        self.schemas = {}
        self.current_class = None
        self.dependencies = {}
        self.router_prefix = ''

    def visit_FunctionDef(self, node):
        # Check for FastAPI route decorators
        route_decorator = self._get_route_decorator(node)

        if route_decorator:
            method, path, summary, description, tags = self._parse_route_decorator(route_decorator)

            # Check if it's inside a class (Router API)
            if self.current_class:
                self._extract_router_prefix(node)

            endpoint = {
                'method': method,
                'path': path,
                'file': self.file_path,
                'line': node.lineno,
                'function': node.name,
                'summary': summary,
                'description': description,
                'tags': tags,
                'parameters': self._extract_parameters(node),
                'responses': self._extract_responses(node),
                'request_body': self._extract_request_body(node),
                'security': self._extract_security(node)
            }

            self.endpoints.append(endpoint)

        # Extract Pydantic models from type hints
        self._extract_pydantic_models(node)

        self.generic_visit(node)

    def visit_ClassDef(self, node):
        """Visit class definitions for APIRouter classes"""
        old_class = self.current_class
        self.current_class = node.name

        # Check for APIRouter prefix
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name) and decorator.func.id == 'router':
                    self._extract_router_prefix(decorator)

        self.generic_visit(node)
        self.current_class = old_class

    def _get_route_decorator(self, node: ast.FunctionDef) -> Optional[ast.expr]:
        """Extract the route decorator from a function"""
        for decorator in node.decorator_list:
            # Handle @app.get(), @router.post(), etc.
            if isinstance(decorator, ast.Call):
                func = decorator.func
                if isinstance(func, ast.Attribute):
                    if func.attr in ['get', 'post', 'put', 'delete', 'patch',
                                    'options', 'head', 'trace']:
                        return decorator
                elif isinstance(func, ast.Name):
                    if func.id in ['get', 'post', 'put', 'delete', 'patch',
                                  'options', 'head', 'trace']:
                        return decorator

        return None

    def _parse_route_decorator(self, decorator: ast.Call) -> tuple:
        """Parse route decorator to extract method, path, and metadata"""
        func = decorator.func
        method = None

        if isinstance(func, ast.Attribute):
            method = func.attr.upper()
        elif isinstance(func, ast.Name):
            method = func.id.upper()

        # Extract path
        path = '/'
        if decorator.args:
            path_arg = decorator.args[0]
            if isinstance(path_arg, ast.Constant):
                path = path_arg.value

        # Extract metadata from keyword arguments
        summary = None
        description = None
        tags = []

        for keyword in decorator.keywords:
            if keyword.arg == 'summary':
                if isinstance(keyword.value, ast.Constant):
                    summary = keyword.value.value
            elif keyword.arg == 'description':
                if isinstance(keyword.value, ast.Constant):
                    description = keyword.value.value
            elif keyword.arg == 'tags':
                if isinstance(keyword.value, ast.List):
                    tags = [elt.value for elt in keyword.value.elts
                           if isinstance(elt, ast.Constant)]

        # Extract docstring as description if not provided
        if not description and not summary:
            description = self._extract_docstring(decorator.lineno)

        return method, path, summary, description, tags

    def _extract_router_prefix(self, node):
        """Extract router prefix from router initialization"""
        for keyword in node.keywords:
            if keyword.arg == 'prefix':
                if isinstance(keyword.value, ast.Constant):
                    self.router_prefix = keyword.value.value

    def _extract_parameters(self, node: ast.FunctionDef) -> List[Dict[str, Any]]:
        """Extract parameters from function arguments"""
        parameters = []

        for arg in node.args.args:
            if arg.arg in ['self', 'cls']:
                continue

            param = {
                'name': arg.arg,
                'in': 'query',  # Default to query parameter
                'required': False,
                'schema': {'type': 'string'}
            }

            # Check for Path parameters
            if node.decorator_list:
                for decorator in node.decorator_list:
                    if isinstance(decorator, ast.Call) and decorator.args:
                        path = decorator.args[0]
                        if isinstance(path, ast.Constant):
                            if f'{{{arg.arg}}}' in path.value:
                                param['in'] = 'path'
                                param['required'] = True

            # Extract type annotation
            if arg.annotation:
                param['schema'] = self._parse_type_annotation(arg.annotation)

            # Check for default value
            defaults = dict(zip(node.args.args[-len(node.args.defaults):],
                               node.args.defaults))
            if arg.arg in defaults:
                param['required'] = False
                default_val = defaults[arg.arg]
                if isinstance(default_val, ast.Constant):
                    param['schema']['default'] = default_val.value
            else:
                if arg.arg != 'self' and arg.arg != 'cls':
                    param['required'] = True

            parameters.append(param)

        return parameters

    def _parse_type_annotation(self, annotation: ast.expr) -> Dict[str, Any]:
        """Parse type annotation to OpenAPI schema"""
        if isinstance(annotation, ast.Name):
            type_map = {
                'str': 'string',
                'int': 'integer',
                'float': 'number',
                'bool': 'boolean',
                'list': 'array',
                'dict': 'object'
            }
            return {'type': type_map.get(annotation.id, 'string')}

        elif isinstance(annotation, ast.Subscript):
            # Handle List[type], Dict[type, type], Optional[type]
            if isinstance(annotation.value, ast.Name):
                if annotation.value.id == 'List':
                    return {
                        'type': 'array',
                        'items': self._parse_type_annotation(annotation.slice)
                    }
                elif annotation.value.id == 'Optional':
                    return {
                        **self._parse_type_annotation(annotation.slice),
                        'nullable': True
                    }

        return {'type': 'string'}

    def _extract_responses(self, node: ast.FunctionDef) -> Dict[str, Any]:
        """Extract response definitions"""
        responses = {
            '200': {
                'description': 'Successful Response'
            }
        }

        # Check for return type annotation
        if node.returns:
            responses['200']['content'] = {
                'application/json': {
                    'schema': self._parse_type_annotation(node.returns)
                }
            }

        # Check for response decorators
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                if isinstance(decorator.func, ast.Name):
                    if decorator.func.id == 'response':
                        # Handle custom responses
                        pass

        return responses

    def _extract_request_body(self, node: ast.FunctionDef) -> Optional[Dict[str, Any]]:
        """Extract request body schema"""
        # Look for Body() parameters or Pydantic models
        for arg in node.args.args:
            if arg.annotation and isinstance(arg.annotation, ast.Name):
                # Check if it's a Pydantic model (capitalized name usually)
                if arg.arg not in ['self', 'cls']:
                    return {
                        'content': {
                            'application/json': {
                                'schema': {
                                    '$ref': f'#/components/schemas/{arg.annotation.id}'
                                }
                            }
                        },
                        'required': True
                    }

        return None

    def _extract_security(self, node: ast.FunctionDef) -> List[Dict[str, Any]]:
        """Extract security requirements"""
        # Check for Depends() with OAuth2PasswordBearer etc.
        security = []

        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                for keyword in decorator.keywords:
                    if keyword.arg == 'dependencies':
                        # Parse dependencies
                        pass

        return security

    def _extract_pydantic_models(self, node: ast.FunctionDef):
        """Extract Pydantic model definitions from the file"""
        # This would scan for BaseModel subclasses
        pass

    def _extract_docstring(self, lineno: int) -> Optional[str]:
        """Extract docstring for a function"""
        lines = self.content.split('\n')
        if lineno < len(lines):
            # Look for docstring in the function body
            for i in range(lineno, min(lineno + 10, len(lines))):
                if '"""' in lines[i] or "'''" in lines[i]:
                    return lines[i].strip().strip('"').strip("'")
        return None


def generate_openapi(info: Dict, endpoints: List[Dict], schemas: Dict) -> Dict:
    """Generate OpenAPI specification from analyzed endpoints"""
    paths = {}

    for endpoint in endpoints:
        path_key = endpoint['path']
        if path_key not in paths:
            paths[path_key] = {}

        operation = {
            'summary': endpoint.get('summary') or f"{endpoint['method']} {endpoint['path']}",
            'description': endpoint.get('description', ''),
            'operationId': f"{endpoint['method'].lower()}{endpoint['path'].replace('/', '-')}",
            'responses': endpoint.get('responses', {}),
        }

        if endpoint.get('parameters'):
            operation['parameters'] = endpoint['parameters']

        if endpoint.get('request_body'):
            operation['requestBody'] = endpoint['request_body']

        if endpoint.get('tags'):
            operation['tags'] = endpoint['tags']

        if endpoint.get('security'):
            operation['security'] = endpoint['security']

        paths[path_key][endpoint['method'].lower()] = operation

    return {
        'openapi': '3.0.0',
        'info': info or {
            'title': 'API',
            'version': '1.0.0',
            'description': 'Generated from FastAPI code'
        },
        'paths': paths,
        'components': {
            'schemas': schemas
        }
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python fastapi-analyzer.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    analyzer = FastAPIAnalyzer()
    result = analyzer.analyze(directory)

    import json
    print(json.dumps(generate_openapi(None, result['endpoints'], result['schemas']), indent=2))


if __name__ == '__main__':
    main()
