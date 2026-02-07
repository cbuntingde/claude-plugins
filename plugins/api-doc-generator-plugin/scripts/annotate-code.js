#!/usr/bin/env node
/**
 * Annotate Code with API Documentation
 * Adds JSDoc/docstring annotations to source code for better documentation generation
 */

const fs = require('fs');
const path = require('path');

/**
 * Code Annotator
 */
class CodeAnnotator {
  constructor() {
    this.annotationTemplates = {
      js: {
        before: '/**\n * API endpoint\n * @param {string} path - Endpoint path\n * @returns {Promise<Response>}\n */',
        param: ' * @param {string} {paramName} - Description',
        response: ' * @returns {Object} Response data',
        error: ' * @throws {Error} Error description',
      },
      python: {
        before: '"""API endpoint\n\n    Args:\n        path (str): Endpoint path\n\n    Returns:\n        Response: Response data\n    """',
        param: '    param (str): Description',
        response: '    Returns: Response data',
        error: '    Raises:\n        Error: Error description',
      },
      java: {
        before: '/**\n * API endpoint\n * @param path Endpoint path\n * @return Response data\n */',
        param: ' * @param {paramName} Description',
        response: ' * @return Response data',
        error: ' * @throws Error Description',
      },
    };
  }

  /**
   * Detect language from file extension
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const langMap = {
      '.js': 'js',
      '.jsx': 'js',
      '.ts': 'js',
      '.tsx': 'js',
      '.py': 'python',
      '.java': 'java',
    };
    return langMap[ext] || 'unknown';
  }

  /**
   * Find positions to add annotations
   */
  findAnnotationPoints(content, language) {
    const points = [];
    const regexPatterns = {
      js: /^(export\s+)?(async\s+)?function\s+(\w+)|^(export\s+)?(async\s+)?const\s+(\w+)\s*=\s*(async\s+)?(\([^)]*\)|[^=]+)=>/gm,
      python: /^def\s+(\w+)/gm,
      java: /^(public|private|protected)\s+(static\s+)?(async\s+)?[\w<>[\]]+\s+(\w+)\s*\(/gm,
    };

    const regex = regexPatterns[language] || regexPatterns.js;
    let match;

    while ((match = regex.exec(content)) !== null) {
      points.push({
        index: match.index,
        line: this.getLineNumber(content, match.index),
        match: match[0],
      });
    }

    return points;
  }

  /**
   * Get line number from content index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Add annotations to code
   */
  async annotate(filePath, options = {}) {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const language = this.detectLanguage(filePath);
    const points = this.findAnnotationPoints(content, language);
    const template = this.annotationTemplates[language];

    if (!template) {
      throw new Error(`Unsupported language: ${language}`);
    }

    let annotated = content;
    const annotations = [];

    // Add annotations before each function
    for (const point of points.reverse()) {
      const lineStart = this.getLineNumber(content, point.index);
      const annotation = template.before.replace('API endpoint', options.name || 'Handler');
      annotated = annotated.substring(0, point.index) + '\n' + annotation + annotated.substring(point.index);
      annotations.push({ line: lineStart, annotation });
    }

    // Write annotated file
    const outputPath = options.output || filePath.replace(/(\.[^.]+)$/, '-annotated$1');
    await fs.promises.writeFile(outputPath, annotated);

    return {
      file: filePath,
      output: outputPath,
      language,
      annotationsAdded: annotations.length,
      lines: annotations,
    };
  }

  /**
   * Add endpoint annotation
   */
  addEndpointAnnotation(content, method, path, language) {
    const template = this.annotationTemplates[language];
    const annotation = `/**
 * ${method} ${path}
 *
 * API documentation for this endpoint
 */`;

    const routeRegex = {
      js: new RegExp(`['"]${path}['"]\\s*[,]?\\s*(${method}\\s*\\(`)],
      python: new RegExp(`['"]${path}['"]\\s*[,]?\\s*(\\.)?${method.toLowerCase()}\\s*\\(`),
      java: new RegExp(`['"]${path}['"]\\s*(?:,\\s*)?method\\s*=\\s*RequestMethod\\.${method}`),
    };

    const regex = routeRegex[language] || routeRegex.js;
    const match = content.match(regex);

    if (match) {
      const index = match.index;
      return content.substring(0, index) + '\n' + annotation + content.substring(index);
    }

    return content;
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const annotator = new CodeAnnotator();

  let filePath = null;
  let options = { output: null };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (!arg.startsWith('--')) {
      filePath = arg;
    }
  }

  if (!filePath) {
    console.log('Usage: node annotate-code.js <file> [--output <file>]');
    console.log('');
    console.log('Options:');
    console.log('  --output, -o  Output file path');
    console.log('');
    console.log('Examples:');
    console.log('  node annotate-code.js src/api.js');
    console.log('  node annotate-code.js src/api.js -o src/api-annotated.js');
    process.exit(1);
  }

  try {
    const result = await annotator.annotate(filePath, options);
    console.log(`Annotated ${result.annotationsAdded} functions in ${result.output}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CodeAnnotator;