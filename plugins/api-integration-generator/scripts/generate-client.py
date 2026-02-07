#!/usr/bin/env python3
"""
API Client Generator
Generates fully-typed API client code from OpenAPI specifications
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
import urllib.request
import urllib.error


class ApiClientGenerator:
    """Generate API clients from OpenAPI specifications"""

    def __init__(self, spec_url: str, language: str, output_dir: str, name: Optional[str] = None):
        self.spec_url = spec_url
        self.language = language.lower()
        self.output_dir = Path(output_dir)
        self.name = name
        self.spec = None

    def fetch_spec(self) -> Dict[str, Any]:
        """Fetch OpenAPI spec from URL with security validations"""
        print(f"Fetching spec from {self.spec_url}...")

        # SECURITY: Validate URL protocol
        if not self.spec_url.startswith(('http://', 'https://')):
            print(f"Error: Invalid URL protocol. Only http:// and https:// are allowed.")
            sys.exit(1)

        # SECURITY: Validate URL format
        try:
            from urllib.parse import urlparse
            parsed = urlparse(self.spec_url)
            if not parsed.netloc:
                print(f"Error: Invalid URL format.")
                sys.exit(1)
        except Exception as e:
            print(f"Error: Invalid URL: {e}")
            sys.exit(1)

        try:
            # SECURITY: Add size limit (10MB max)
            MAX_RESPONSE_SIZE = 10 * 1024 * 1024  # 10MB

            with urllib.request.urlopen(self.spec_url) as response:
                # Read in chunks to enforce size limit
                chunks = []
                total_size = 0
                while True:
                    chunk = response.read(65536)  # 64KB chunks
                    if not chunk:
                        break
                    total_size += len(chunk)
                    if total_size > MAX_RESPONSE_SIZE:
                        print(f"Error: Response exceeds maximum size of 10MB")
                        sys.exit(1)
                    chunks.append(chunk)

                content = b''.join(chunks).decode('utf-8')
                self.spec = json.loads(content)
                return self.spec
        except urllib.error.URLError as e:
            print(f"Error fetching spec: {e}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error parsing spec JSON: {e}")
            sys.exit(1)

    def generate(self):
        """Generate client code"""
        if not self.spec:
            self.fetch_spec()

        # SECURITY: Validate output directory to prevent path traversal
        resolved_output = self.output_dir.resolve()

        # Get current working directory and home directory as allowed roots
        cwd = Path.cwd().resolve()
        home_dir = Path.home().resolve()

        # Allow output dir if it's under cwd or home, or if it's a relative path
        try:
            resolved_output.relative_to(cwd)
        except ValueError:
            try:
                resolved_output.relative_to(home_dir)
            except ValueError:
                # Allow relative paths (they'll be relative to cwd)
                if self.output_dir.is_absolute():
                    print(f"Error: Output directory must be within current project or home directory")
                    sys.exit(1)

        self.output_dir.mkdir(parents=True, exist_ok=True)

        if self.language == 'typescript':
            self.generate_typescript()
        elif self.language == 'python':
            self.generate_python()
        elif self.language == 'go':
            self.generate_go()
        else:
            print(f"Unsupported language: {self.language}")
            sys.exit(1)

    def generate_typescript(self):
        """Generate TypeScript client"""
        client_name = self.name or self.to_pascal_case(self.spec.get('info', {}).get('title', 'ApiClient'))

        # Generate types
        types_code = f"// Auto-generated from {self.spec.get('info', {}).get('title', 'API')}\n\n"
        components = self.spec.get('components', {})
        schemas = components.get('schemas', {})

        for schema_name, schema in schemas.items():
            types_code += f"export interface {schema_name} {{\n"
            properties = schema.get('properties', {})
            required = schema.get('required', [])

            for prop_name, prop in properties.items():
                optional = '' if prop_name in required else '?'
                prop_type = self.ts_type(prop.get('type', 'any'))
                types_code += f"  {prop_name}{optional}: {prop_type};\n"

            types_code += "}\n\n"

        types_file = self.output_dir / 'types.ts'
        types_file.write_text(types_code)
        print(f"Generated {types_file}")

        # Generate client
        client_code = f"""// Auto-generated from {self.spec.get('info', {}).get('title', 'API')}

import {{ baseUrl }} from './config';

export interface ClientConfig {{
  baseUrl?: string;
  apiKey?: string;
  bearer?: string;
  timeout?: number;
}}

export class {client_name}Client {{
  private baseUrl: string;

  constructor(private config: ClientConfig = {{}}) {{
    this.baseUrl = config.baseUrl || '{self.spec.get('servers', [{}])[0].get('url', '')}';
  }}

  private async request<T>(
    method: string,
    path: string,
    options?: RequestInit
  ): Promise<T> {{
    const url = `{{this.baseUrl}}{{path}}`;
    const headers: Record<string, string> = {{
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {{}}),
    }};

    if (this.config.apiKey) {{
      headers['X-API-Key'] = this.config.apiKey;
    }}

    if (this.config.bearer) {{
      headers['Authorization'] = `Bearer ${{this.config.bearer}}`;
    }}

    const response = await fetch(url, {{
      method,
      headers,
      ...options,
    }});

    if (!response.ok) {{
      throw new Error(`API Error: ${{response.status}} ${{response.statusText}}`);
    }}

    return response.json();
  }}
}}
"""
        # Generate methods for each endpoint
        paths = self.spec.get('paths', {})
        for path, methods in paths.items():
            for method, details in methods.items():
                if method in ['parameters', '$ref']:
                    continue

                operation_id = details.get('operationId') or self.get_method_name(method, path)
                summary = details.get('summary', '')
                description = details.get('description', '')

                params = self.extract_params(details)
                method_code = f"""
  /**
   * {summary or description or f'{method.upper()} {path}'}
   */
  async {operation_id}({params}): Promise<any> {{
    return this.request<any>(
      '{method.upper()}',
      '{self.template_path(path)}',
      {self.request_options(details)}
    );
  }}
"""
                client_code += method_code

        client_file = self.output_dir / 'client.ts'
        client_file.write_text(client_code)
        print(f"Generated {client_file}")

    def generate_python(self):
        """Generate Python client"""
        client_name = self.name or self.to_snake_case(self.spec.get('info', {}).get('title', 'api_client'))

        # Generate models
        models_code = f"# Auto-generated from {self.spec.get('info', {}).get('title', 'API')}\n\n"
        models_code += "from pydantic import BaseModel\nfrom typing import Optional, List, Dict, Any\n\n"

        components = self.spec.get('components', {})
        schemas = components.get('schemas', {})

        for schema_name, schema in schemas.items():
            models_code += f"class {schema_name}(BaseModel):\n"
            properties = schema.get('properties', {})
            required = schema.get('required', [])

            for prop_name, prop in properties.items():
                optional = '' if prop_name in required else ' = None'
                prop_type = self.python_type(prop.get('type', 'Any'))
                models_code += f"    {prop_name}: {prop_type}{optional}\n"

            models_code += "\n"

        models_file = self.output_dir / 'models.py'
        models_file.write_text(models_code)
        print(f"Generated {models_file}")

        # Generate client
        client_code = f"""# Auto-generated from {self.spec.get('info', {}).get('title', 'API')}

import httpx
from typing import Optional, Dict, Any

class {self.to_pascal_case(client_name)}Client:
    def __init__(
        self,
        base_url: str = "{self.spec.get('servers', [{}])[0].get('url', '')}",
        api_key: Optional[str] = None,
        bearer_token: Optional[str] = None,
        timeout: int = 30,
    ):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.bearer_token = bearer_token
        self.timeout = timeout
        self._client = httpx.Client(timeout=timeout)

    def _get_headers(self) -> Dict[str, str]:
        headers = {{"Content-Type": "application/json"}}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        if self.bearer_token:
            headers["Authorization"] = f"Bearer {{self.bearer_token}}"
        return headers

    def close(self):
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
"""
        client_file = self.output_dir / 'client.py'
        client_file.write_text(client_code)
        print(f"Generated {client_file}")

        # Generate __init__.py
        init_file = self.output_dir / '__init__.py'
        init_file.write_text(f"""from .client import {self.to_pascal_case(client_name)}Client
from .models import *

__all__ = ['{self.to_pascal_case(client_name)}Client']
""")
        print(f"Generated {init_file}")

    def generate_go(self):
        """Generate Go client"""
        print("Go client generation not yet implemented")
        sys.exit(1)

    # Helper methods
    def to_pascal_case(self, s: str) -> str:
        return ''.join(word.capitalize() for word in s.replace('-', ' ').replace('_', ' ').split())

    def to_snake_case(self, s: str) -> str:
        import re
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', s)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def ts_type(self, openapi_type: str) -> str:
        type_map = {
            'string': 'string',
            'integer': 'number',
            'number': 'number',
            'boolean': 'boolean',
            'array': 'any[]',
            'object': 'any',
        }
        return type_map.get(openapi_type, 'any')

    def python_type(self, openapi_type: str) -> str:
        type_map = {
            'string': 'str',
            'integer': 'int',
            'number': 'float',
            'boolean': 'bool',
            'array': 'List[Any]',
            'object': 'Dict[str, Any]',
        }
        return type_map.get(openapi_type, 'Any')

    def get_method_name(self, method: str, path: str) -> str:
        method = method.lower()
        path = path.replace('/', '_').replace('{', '').replace('}', '').replace('-', '_')
        path = path.strip('_')
        return f"{method}{path}"

    def extract_params(self, details: Dict) -> str:
        """Extract parameters for method signature"""
        params = details.get('parameters', [])
        param_strings = []

        for param in params:
            name = param.get('name')
            location = param.get('in')
            required = param.get('required', False)
            param_type = self.ts_type(param.get('schema', {}).get('type', 'any'))

            if location == 'path':
                param_strings.append(f"{name}: {param_type}")
            elif location == 'query':
                optional = '' if required else '?'
                param_strings.append(f"{name}{optional}: {param_type}")

        if details.get('requestBody'):
            param_strings.append("body?: any")

        return ', '.join(param_strings) if param_strings else ''

    def template_path(self, path: str) -> str:
        """Convert OpenAPI path to template string"""
        return path.replace('{', '${').replace('}', '}')

    def request_options(self, details: Dict) -> str:
        """Generate request options object"""
        has_body = details.get('requestBody') is not None

        if has_body:
            return """{
      body: JSON.stringify(body),
    }"""
        return 'undefined'


def main():
    parser = argparse.ArgumentParser(description='Generate API client from OpenAPI spec')
    parser.add_argument('source', help='URL to OpenAPI spec or local file path')
    parser.add_argument('--language', '-l', choices=['typescript', 'python', 'go'],
                        default='typescript', help='Target language')
    parser.add_argument('--output', '-o', default='./api-clients/generated',
                        help='Output directory')
    parser.add_argument('--name', '-n', help='Client name')

    args = parser.parse_args()

    generator = ApiClientGenerator(
        spec_url=args.source,
        language=args.language,
        output_dir=args.output,
        name=args.name
    )

    generator.generate()
    print(f"\n✅ Client generated successfully in {args.output}")
    print(f"Language: {args.language}")


if __name__ == '__main__':
    main()
