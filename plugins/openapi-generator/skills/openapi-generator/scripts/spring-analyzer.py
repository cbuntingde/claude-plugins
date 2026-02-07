#!/usr/bin/env python3
"""
Spring Boot API Analyzer
Analyzes Spring Boot Java code to extract API endpoints for OpenAPI generation

Usage: python spring-analyzer.py <directory>
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
import xml.etree.ElementTree as ET


class SpringBootAnalyzer:
    def __init__(self):
        self.endpoints = []
        self.schemas = {}
        self.security_schemes = {}

    def analyze(self, directory: str) -> Dict[str, Any]:
        """Analyze Java files and Spring configuration"""
        java_files = self._find_files(directory, ['.java'])

        for file_path in java_files:
            self._analyze_file(file_path)

        # Look for pom.xml or build.gradle for additional context
        self._analyze_build_config(directory)

        return {
            'endpoints': self.endpoints,
            'schemas': self.schemas,
            'security_schemes': self.security_schemes
        }

    def _find_files(self, directory: str, extensions: List[str]) -> List[str]:
        """Find all files with given extensions recursively"""
        files = []
        ignore_dirs = {'target', '.git', 'node_modules', 'dist', 'build', '.mvn', '.gradle'}

        for root, dirs, filenames in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in extensions):
                    files.append(os.path.join(root, filename))

        return files

    def _analyze_file(self, file_path: str):
        """Analyze a single Java file for Spring endpoints"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            self._parse_java_file(file_path, content)

        except Exception as e:
            print(f"Warning: Error analyzing {file_path}: {e}", file=sys.stderr)

    def _parse_java_file(self, file_path: str, content: str):
        """Parse Java file for Spring annotations"""
        lines = content.split('\n')

        # Find class-level annotations
        class_level = self._extract_class_annotations(content)

        # Find method-level annotations
        for i, line in enumerate(lines):
            # Look for @GetMapping, @PostMapping, etc.
            mapping_match = re.search(r'@(Get|Post|Put|Delete|Patch|Request)Mapping\(?', line)
            if mapping_match:
                method_type = mapping_match.group(1)
                endpoint = self._parse_endpoint_annotation(
                    lines, i, method_type, file_path, class_level
                )
                if endpoint:
                    self.endpoints.append(endpoint)

        # Find @RestController classes
        if '@RestController' in content or '@Controller' in content:
            self._extract_schemas_from_class(content, file_path)

    def _extract_class_annotations(self, content: str) -> Dict[str, Any]:
        """Extract class-level annotations like @RequestMapping"""
        annotations = {}

        # Extract @RequestMapping on class
        class_mapping = re.search(r'@RequestMapping\(\s*value\s*=\s*"([^"]+)"', content)
        if class_mapping:
            annotations['base_path'] = class_mapping.group(1)

        # Check for @RestController
        if '@RestController' in content:
            annotations['is_rest_controller'] = True

        return annotations

    def _parse_endpoint_annotation(
        self,
        lines: List[str],
        start_line: int,
        method_type: str,
        file_path: str,
        class_level: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Parse endpoint annotation to extract path and details"""
        path = '/'
        method = method_type.replace('Mapping', '').upper()
        if method == 'REQUEST':
            method = 'GET'  # Default

        # Look for value/path in the next few lines
        for i in range(start_line, min(start_line + 5, len(lines))):
            line = lines[i]

            # Extract path from value or path attribute
            path_match = re.search(r'(value|path)\s*=\s*"([^"]+)"', line)
            if path_match:
                path = path_match.group(2)
                break

            # Also handle shorthand @GetMapping("/path")
            shorthand_match = re.search(r'@[A-Za-z]+Mapping\(\s*"([^"]+)"', line)
            if shorthand_match:
                path = shorthand_match.group(1)
                break

        # Extract method signature
        method_signature = None
        for i in range(start_line, min(start_line + 10, len(lines))):
            if 'public' in lines[i] or 'private' in lines[i] or 'protected' in lines[i]:
                # Found method declaration
                method_signature = self._parse_method_signature(lines[i:])
                break

        # Combine base path from class with method path
        full_path = path
        if class_level.get('base_path'):
            base = class_level['base_path'].rstrip('/')
            full_path = base + path

        # Extract JavaDoc
        javadoc = self._extract_javadoc(lines, start_line)

        return {
            'method': method,
            'path': full_path,
            'file': file_path,
            'line': start_line + 1,
            'summary': javadoc.get('summary') or f"{method} {full_path}",
            'description': javadoc.get('description'),
            'parameters': self._extract_parameters_from_signature(method_signature),
            'responses': self._extract_responses_from_signature(method_signature)
        }

    def _parse_method_signature(self, lines: List[str]) -> Dict[str, Any]:
        """Parse method signature to extract parameters and return type"""
        signature = ' '.join(lines[:3])  # Get first few lines
        signature = ' '.join(signature.split())

        result = {
            'parameters': [],
            'return_type': 'void'
        }

        # Extract return type
        return_match = re.search(r'(?:public|private|protected)\s+(\S+)\s+\w+\s*\(', signature)
        if return_match:
            result['return_type'] = return_match.group(1)

        # Extract parameters
        params_match = re.search(r'\(([^)]*)\)', signature)
        if params_match:
            params_str = params_match.group(1)
            param_patterns = re.findall(r'@?(\w+(?:<[^>]+>)?)\s+(\w+)', params_str)
            for param_type, param_name in param_patterns:
                if param_name not in ['Model', 'ModelMap', 'HttpServletRequest', 'HttpServletResponse']:
                    result['parameters'].append({
                        'name': param_name,
                        'type': param_type
                    })

        return result

    def _extract_parameters_from_signature(self, signature: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert Java parameters to OpenAPI parameters"""
        parameters = []

        for param in signature.get('parameters', []):
            param_def = {
                'name': param['name'],
                'in': 'query',  # Default to query
                'schema': {'type': self._java_type_to_openapi(param['type'])}
            }

            # Check for @PathVariable
            # (This would require more sophisticated parsing of annotations)

            parameters.append(param_def)

        return parameters

    def _extract_responses_from_signature(self, signature: Dict[str, Any]) -> Dict[str, Any]:
        """Generate response definitions from return type"""
        responses = {
            '200': {
                'description': 'Successful response'
            }
        }

        return_type = signature.get('return_type', 'void')
        if return_type != 'void':
            responses['200']['content'] = {
                'application/json': {
                    'schema': {
                        'type': self._java_type_to_openapi(return_type)
                    }
                }
            }

        return responses

    def _extract_javadoc(self, lines: List[str], start_line: int) -> Dict[str, Optional[str]]:
        """Extract JavaDoc comments before a method"""
        javadoc = {'summary': None, 'description': None}

        # Look backwards for JavaDoc
        for i in range(start_line - 1, max(0, start_line - 20), -1):
            line = lines[i].strip()

            if line.startswith('/**'):
                # Found JavaDoc start
                doc_lines = []
                for j in range(i, min(i + 20, len(lines))):
                    doc_lines.append(lines[j].strip())
                    if '*/' in lines[j]:
                        break

                doc_text = '\n'.join(doc_lines)
                # Extract summary (first line/sentence)
                summary_match = re.search(r'/\*\*\s*\n?\s*\*?\s*([^@\n]+)', doc_text)
                if summary_match:
                    javadoc['summary'] = summary_match.group(1).strip()

                javadoc['description'] = doc_text.replace('/**', '').replace('*/', '').replace('*', '').strip()
                break

            elif line and not line.startswith('*') and not line.startswith('@'):
                # Not a JavaDoc line
                break

        return javadoc

    def _extract_schemas_from_class(self, content: str, file_path: str):
        """Extract schema definitions from DTO/entity classes"""
        # Look for @Entity, @Data, or @RequestBody classes
        if any(annotation in content for annotation in ['@Entity', '@Data', '@RequestBody', '@ResponseBody']):
            # Extract class definition and fields
            class_match = re.search(r'public\s+class\s+(\w+)', content)
            if class_match:
                class_name = class_match.group(1)

                # Extract fields
                fields = re.findall(r'private\s+(\S+(?:<[^>]+>)?)\s+(\w+)', content)

                if fields:
                    properties = {}
                    for field_type, field_name in fields:
                        properties[field_name] = {
                            'type': self._java_type_to_openapi(field_type)
                        }

                    self.schemas[class_name] = {
                        'type': 'object',
                        'properties': properties
                    }

    def _java_type_to_openapi(self, java_type: str) -> str:
        """Convert Java type to OpenAPI type"""
        type_map = {
            'String': 'string',
            'Integer': 'integer',
            'int': 'integer',
            'Long': 'integer',
            'long': 'integer',
            'Double': 'number',
            'double': 'number',
            'Float': 'number',
            'float': 'number',
            'Boolean': 'boolean',
            'boolean': 'boolean',
            'LocalDate': 'string',
            'LocalDateTime': 'string',
            'UUID': 'string',
            'List': 'array',
            'Set': 'array',
            'void': 'void'
        }

        # Handle generics
        if '<' in java_type:
            base_type = java_type.split('<')[0]
            return type_map.get(base_type, 'object')

        return type_map.get(java_type, 'object')

    def _analyze_build_config(self, directory: str):
        """Analyze Maven or Gradle build files for additional context"""
        # Look for pom.xml
        pom_path = os.path.join(directory, 'pom.xml')
        if os.path.exists(pom_path):
            self._parse_pom_xml(pom_path)

        # Look for build.gradle
        gradle_path = os.path.join(directory, 'build.gradle')
        if os.path.exists(gradle_path):
            self._parse_gradle(gradle_path)

    def _parse_pom_xml(self, pom_path: str):
        """Parse Maven pom.xml for Spring context"""
        try:
            tree = ET.parse(pom_path)
            root = tree.getroot()

            # Extract project info
            # (Would need to handle XML namespaces properly)
        except Exception as e:
            print(f"Warning: Could not parse pom.xml: {e}", file=sys.stderr)

    def _parse_gradle(self, gradle_path: str):
        """Parse Gradle build file for Spring context"""
        try:
            with open(gradle_path, 'r') as f:
                content = f.read()

            # Extract Spring dependencies for context
            # (Simple text search for now)
        except Exception as e:
            print(f"Warning: Could not parse build.gradle: {e}", file=sys.stderr)


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
            'responses': endpoint.get('responses', {
                '200': {'description': 'Successful response'}
            })
        }

        if endpoint.get('parameters'):
            operation['parameters'] = endpoint['parameters']

        paths[path_key][endpoint['method'].lower()] = operation

    return {
        'openapi': '3.0.0',
        'info': info or {
            'title': 'Spring Boot API',
            'version': '1.0.0',
            'description': 'Generated from Spring Boot code'
        },
        'paths': paths,
        'components': {
            'schemas': schemas
        }
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python spring-analyzer.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    analyzer = SpringBootAnalyzer()
    result = analyzer.analyze(directory)

    import json
    print(json.dumps(generate_openapi(None, result['endpoints'], result['schemas']), indent=2))


if __name__ == '__main__':
    main()
