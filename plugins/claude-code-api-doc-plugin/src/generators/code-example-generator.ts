/**
 * Code Example Generator
 * Generates code examples in multiple programming languages for API endpoints
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import type { OpenAPISpec, CodeExample, GeneratorResult } from '../types.js';

const DEFAULT_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'csharp',
  'php',
  'ruby',
  'go',
  'typescript',
  'curl',
  'nodejs'
];

export async function generateCodeExamples(
  openApiSpecPath: string,
  outputPath: string,
  languages: string[] = DEFAULT_LANGUAGES
): Promise<GeneratorResult> {
  const filesGenerated: string[] = [];
  const warnings: string[] = [];

  try {
    // Parse OpenAPI spec
    const spec = await parseOpenAPISpec(openApiSpecPath);

    // Create output directory
    await fs.mkdir(outputPath, { recursive: true });

    // Generate examples for each endpoint and language
    const examples = generateAllExamples(spec, languages);

    // Create markdown documentation with code examples
    const markdown = generateMarkdownExamples(spec, examples);
    const mdPath = path.join(outputPath, 'CODE_EXAMPLES.md');
    await fs.writeFile(mdPath, markdown, 'utf-8');
    filesGenerated.push(mdPath);

    // Generate individual files for each language
    for (const lang of languages) {
      const langExamples = examples.filter(e => e.language === lang);
      if (langExamples.length > 0) {
        const langPath = path.join(outputPath, `${lang.toLowerCase()}_examples.md`);
        const langMarkdown = generateLanguageMarkdown(spec, lang, langExamples);
        await fs.writeFile(langPath, langMarkdown, 'utf-8');
        filesGenerated.push(langPath);
      }
    }

    // Generate JSON file with all examples
    const jsonPath = path.join(outputPath, 'examples.json');
    await fs.writeFile(jsonPath, JSON.stringify(examples, null, 2), 'utf-8');
    filesGenerated.push(jsonPath);

    return {
      success: true,
      outputPath,
      filesGenerated,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      success: false,
      outputPath,
      filesGenerated,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

async function parseOpenAPISpec(specPath: string): Promise<OpenAPISpec> {
  const content = await fs.readFile(specPath, 'utf-8');
  const ext = path.extname(specPath).toLowerCase();

  if (ext === '.yaml' || ext === '.yml') {
    return YAML.parse(content) as OpenAPISpec;
  } else if (ext === '.json') {
    return JSON.parse(content) as OpenAPISpec;
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .json, .yaml, or .yml`);
  }
}

function generateAllExamples(
  spec: OpenAPISpec,
  languages: string[]
): CodeExample[] {
  const examples: CodeExample[] = [];

  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue;

      const op = operation as any;
      const baseUrl = spec.servers?.[0]?.url || 'https://api.example.com';

      for (const lang of languages) {
        const example = generateCodeExample(spec, pathStr, method, op, lang, baseUrl);
        if (example) {
          examples.push(example);
        }
      }
    }
  }

  return examples;
}

function generateCodeExample(
  spec: OpenAPISpec,
  pathStr: string,
  method: string,
  operation: any,
  language: string,
  baseUrl: string
): CodeExample | null {
  const summary = operation.summary || operation.operationId || `${method} ${pathStr}`;
  const description = operation.description || '';

  let code = '';

  switch (language.toLowerCase()) {
    case 'curl':
      code = generateCurlExample(method, baseUrl, pathStr, operation);
      break;
    case 'javascript':
      code = generateJavaScriptExample(method, baseUrl, pathStr, operation);
      break;
    case 'typescript':
      code = generateTypeScriptExample(method, baseUrl, pathStr, operation);
      break;
    case 'nodejs':
      code = generateNodeJSExample(method, baseUrl, pathStr, operation);
      break;
    case 'python':
      code = generatePythonExample(method, baseUrl, pathStr, operation);
      break;
    case 'java':
      code = generateJavaExample(method, baseUrl, pathStr, operation);
      break;
    case 'csharp':
      code = generateCSharpExample(method, baseUrl, pathStr, operation);
      break;
    case 'php':
      code = generatePHPExample(method, baseUrl, pathStr, operation);
      break;
    case 'ruby':
      code = generateRubyExample(method, baseUrl, pathStr, operation);
      break;
    case 'go':
      code = generateGoExample(method, baseUrl, pathStr, operation);
      break;
    default:
      return null;
  }

  return {
    language,
    code,
    description: description || `${method.toUpperCase()} ${pathStr}`
  };
}

function generateCurlExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `curl -X ${method.toUpperCase()} "${baseUrl}${pathStr}"`;

  // Add headers
  const headers: string[] = [];
  if (operation.parameters) {
    operation.parameters.forEach((param: any) => {
      if (param.in === 'header') {
        headers.push(`-H "${param.name}: VALUE"`);
      }
    });
  }
  headers.push(`-H "Content-Type: application/json"`);

  if (headers.length > 0) {
    code += ' \\\n  ' + headers.join(' \\\n  ');
  }

  // Add request body for POST/PUT/PATCH
  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += ` \\\n  -d '${body}'`;
  }

  return code;
}

function generateJavaScriptExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `const url = "${baseUrl}${pathStr}";\n\n`;

  code += `const options = {\n  method: '${method.toUpperCase()}',\n  headers: {\n`;
  code += `    'Content-Type': 'application/json'\n  }`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += `,\n  body: JSON.stringify(${body})`;
  }

  code += `\n};\n\n`;
  code += `fetch(url, options)\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`;

  return code;
}

function generateTypeScriptExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `interface ApiResponse {\n  // Define your response type here\n  [key: string]: any;\n}\n\n`;
  code += `const url = "${baseUrl}${pathStr}";\n\n`;

  code += `const options: RequestInit = {\n  method: '${method.toUpperCase()}',\n  headers: {\n`;
  code += `    'Content-Type': 'application/json'\n  }`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += `,\n  body: JSON.stringify(${body})`;
  }

  code += `\n};\n\n`;
  code += `async function makeRequest(): Promise<ApiResponse> {\n  try {\n    const response = await fetch(url, options);\n    const data: ApiResponse = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n    throw error;\n  }\n}\n\n`;
  code += `makeRequest().then(data => console.log(data));`;

  return code;
}

function generateNodeJSExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `const https = require('https');\n\n`;

  code += `const options = {\n  hostname: '${new URL(baseUrl).hostname}',\n`;
  code += `  path: '${pathStr}',\n`;
  code += `  method: '${method.toUpperCase()}',\n`;
  code += `  headers: {\n    'Content-Type': 'application/json'\n  }\n};\n\n`;

  code += `const req = https.request(options, (res) => {\n  let data = '';\n\n  res.on('data', (chunk) => {\n    data += chunk;\n  });\n\n  res.on('end', () => {\n    console.log(JSON.parse(data));\n  });\n});\n\n`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += `req.write(JSON.stringify(${body}));\n`;
  }

  code += `req.on('error', (error) => {\n  console.error('Error:', error);\n});\n\n`;
  code += `req.end();`;

  return code;
}

function generatePythonExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `import requests\nimport json\n\n`;
  code += `url = "${baseUrl}${pathStr}"\n`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += `payload = ${body}\n\n`;
    code += `response = requests.${method.toLowerCase()}(url, json=payload)\n`;
  } else {
    code += `response = requests.${method.toLowerCase()}(url)\n`;
  }

  code += `print(response.json())`;

  return code;
}

function generateJavaExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `import java.net.URI;\n`;
  code += `import java.net.http.HttpClient;\n`;
  code += `import java.net.http.HttpRequest;\n`;
  code += `import java.net.http.HttpResponse;\n`;
  code += `import java.time.Duration;\n\n`;

  code += `public class ApiClient {\n    public static void main(String[] args) {\n`;
  code += `        HttpClient client = HttpClient.newBuilder()\n            .connectTimeout(Duration.ofSeconds(10))\n            .build();\n\n`;

  let request = `HttpRequest request = HttpRequest.newBuilder()\n            .uri(URI.create("${baseUrl}${pathStr}"))\n            .method("${method.toUpperCase()"`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    request += `, HttpRequest.BodyPublishers.ofString("${body}")`;
  }

  request += `)\n            .header("Content-Type", "application/json")\n            .build();\n\n`;

  code += `        ` + request;
  code += `        try {\n            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n            System.out.println(response.body());\n        } catch (Exception e) {\n            e.printStackTrace();\n        }\n    }\n}`;

  return code;
}

function generateCSharpExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `using System;\nusing System.Net.Http;\nusing System.Text;\nusing System.Threading.Tasks;\nusing Newtonsoft.Json;\n\n`;

  code += `class Program\n{\n    static async Task Main()\n    {\n        using (var client = new HttpClient())\n        {\n            client.BaseAddress = new Uri("${baseUrl}");\n            client.DefaultRequestHeaders.Add("Content-Type", "application/json");\n\n`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += `            var payload = ${body};\n`;
    code += `            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");\n\n`;
    code += `            var response = await client.${method.charAt(0).toUpperCase() + method.slice(1)}Async("${pathStr}", content);\n`;
  } else {
    code += `            var response = await client.${method.charAt(0).toUpperCase() + method.slice(1)}Async("${pathStr}");\n`;
  }

  code += `            var responseString = await response.Content.ReadAsStringAsync();\n`;
  code += `            Console.WriteLine(responseString);\n        }\n    }\n}`;

  return code;
}

function generatePHPExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `<?php\n\n`;
  code += `$url = "${baseUrl}${pathStr}";\n\n`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += `$data = ${body};\n\n`;
    code += `$options = [\n    'http' => [\n        'header'  => "Content-type: application/json\\r\\n",\n        'method'  => '${method.toUpperCase()}',\n        'content' => json_encode($data)\n    ]\n];\n\n`;
  } else {
    code += `$options = [\n    'http' => [\n        'method'  => '${method.toUpperCase()}'\n    ]\n];\n\n`;
  }

  code += `$context  = stream_context_create($options);\n`;
  code += `$result = file_get_contents($url, false, $context);\n`;
  code += `if ($result === FALSE) { /* Handle error */ }\n\n`;
  code += `var_dump(json_decode($result));\n?>`;

  return code;
}

function generateRubyExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `require 'net/http'\nrequire 'uri'\nrequire 'json'\n\n`;

  code += `uri = URI("${baseUrl}${pathStr}")\n`;

  if (['post', 'put', 'patch'].includes(method)) {
    const body = generateExampleBody(operation);
    code += `data = ${body}\n\n`;

    code += `header = {'Content-Type' => 'application/json'}\n\n`;

    code += `http = Net::HTTP.new(uri.host, uri.port)\n`;
    code += `request = Net::HTTP::${method.charAt(0).toUpperCase() + method.slice(1)}.new(uri.request_uri, header)\n`;
    code += `request.body = data.to_json\n\n`;
    code += `response = http.request(request)\n`;
    code += `puts JSON.parse(response.body)\n`;
  } else {
    code += `header = {'Content-Type' => 'application/json'}\n\n`;

    code += `response = Net::HTTP.get_response(uri, header)\n`;
    code += `puts JSON.parse(response.body)\n`;
  }

  return code;
}

function generateGoExample(
  method: string,
  baseUrl: string,
  pathStr: string,
  operation: any
): string {
  let code = `package main\n\n`;
  code += `import (\n    "bytes"\n    "encoding/json"\n    "fmt"\n    "io"\n    "net/http"\n    "strings"\n)\n\n`;

  code += `func main() {\n`;
  code += `    url := "${baseUrl}${pathStr}"\n\n`;

  if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
    const body = generateExampleBody(operation);
    code += `    payload := ${body}\n`;
    code += `    jsonData, _ := json.Marshal(payload)\n\n`;

    code += `    req, _ := http.NewRequest("${method.toUpperCase()}", url, bytes.NewBuffer(jsonData))\n`;
    code += `    req.Header.Set("Content-Type", "application/json")\n\n`;
  } else {
    code += `    req, _ := http.NewRequest("${method.toUpperCase()}", url, nil)\n`;
    code += `    req.Header.Set("Content-Type", "application/json")\n\n`;
  }

  code += `    client := &http.Client{}\n`;
  code += `    resp, err := client.Do(req)\n`;
  code += `    if err != nil {\n        fmt.Println("Error:", err)\n        return\n    }\n`;
  code += `    defer resp.Body.Close()\n\n`;
  code += `    body, _ := io.ReadAll(resp.Body)\n`;
  code += `    fmt.Println(string(body))\n}`;
  return code;
}

function generateExampleBody(operation: any): string {
  return JSON.stringify(
    {
      // Example body - in production, this would be generated from the schema
      key1: "value1",
      key2: "value2"
    },
    null,
    2
  );
}

function generateMarkdownExamples(spec: OpenAPISpec, examples: CodeExample[]): string {
  let markdown = `# Code Examples for ${spec.info.title}\n\n`;
  markdown += `Version: ${spec.info.version}\n\n`;
  markdown += `This document contains code examples for all API endpoints in multiple programming languages.\n\n---\n\n`;

  // Group by endpoint
  const endpointGroups = new Map<string, CodeExample[]>();

  for (const example of examples) {
    const key = example.description.split('\n')[0]; // Use first line as key
    if (!endpointGroups.has(key)) {
      endpointGroups.set(key, []);
    }
    endpointGroups.get(key)!.push(example);
  }

  for (const [endpoint, endpointExamples] of endpointGroups) {
    markdown += `## ${endpoint}\n\n`;

    for (const example of endpointExamples) {
      markdown += `### ${example.language}\n\n`;
      if (example.description) {
        markdown += `${example.description}\n\n`;
      }
      markdown += '```' + example.language + '\n';
      markdown += example.code + '\n';
      markdown += '```\n\n';
    }

    markdown += '---\n\n';
  }

  return markdown;
}

function generateLanguageMarkdown(
  spec: OpenAPISpec,
  language: string,
  examples: CodeExample[]
): string {
  let markdown = `# ${language} Code Examples for ${spec.info.title}\n\n`;
  markdown += `Version: ${spec.info.version}\n\n`;
  markdown += `This document contains ${language} code examples for all API endpoints.\n\n---\n\n`;

  for (const example of examples) {
    markdown += `## ${example.description}\n\n`;
    markdown += '```' + example.language + '\n';
    markdown += example.code + '\n';
    markdown += '```\n\n---\n\n';
  }

  return markdown;
}
