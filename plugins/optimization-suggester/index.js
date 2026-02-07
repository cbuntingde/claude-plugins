/**
 * Optimization Suggester Plugin
 *
 * A Claude Code plugin that analyzes code and suggests performance optimizations
 * focused on caching, memoization, and async patterns.
 */

const path = require('path');
const fs = require('fs');

const PLUGIN_NAME = 'optimization-suggester';
const PLUGIN_VERSION = '1.0.0';

/**
 * Parse command line arguments
 * @param {string[]} args - Command arguments
 * @returns {Object} Parsed options
 */
function parseOptions(args) {
  const options = {
    path: process.cwd(),
    output: null,
    verbose: false,
    categories: ['caching', 'memoization', 'async']
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--path' && nextArg && !nextArg.startsWith('--')) {
      options.path = nextArg;
      i++;
    } else if (arg === '--output' && nextArg && !nextArg.startsWith('--')) {
      options.output = nextArg;
      i++;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--category' && nextArg && !nextArg.startsWith('--')) {
      if (['caching', 'memoization', 'async'].includes(nextArg)) {
        options.categories = [nextArg];
      }
      i++;
    }
  }

  return options;
}

/**
 * Find source files in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to include
 * @returns {string[]} List of file paths
 */
function findSourceFiles(dir, extensions) {
  const files = [];

  function scanDirectory(currentDir) {
    if (!fs.existsSync(currentDir)) {
      return;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, and other hidden/special directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  scanDirectory(dir);
  return files;
}

/**
 * Analyze a single file for optimization opportunities
 * @param {string} filePath - Path to file
 * @param {string[]} categories - Categories to analyze
 * @returns {Object} Analysis results
 */
function analyzeFile(filePath, categories) {
  const results = {
    file: filePath,
    suggestions: []
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Pattern definitions for different optimization categories
    const patterns = {
      caching: [
        {
          name: 'Repeated database queries',
          regex: /(?:query|find|findOne|select)\s*\([^)]*\)\s*(?:\.then|\s*await|\s*;)/gi,
          description: 'Database query that may benefit from caching'
        },
        {
          name: 'Repeated file reads',
          regex: /(?:readFile|readFileSync|readFileAsStream)\s*\(/gi,
          description: 'File read operation that may be cached'
        },
        {
          name: 'Regex in loop',
          regex: /(?:const|let|var)\s+\w+\s*=\s*\/(?:[^\/]|\/)*\/[gimy]*\s*[;\n]/gi,
          description: 'Regex compilation that could be cached outside loop'
        }
      ],
      memoization: [
        {
          name: 'Repeated function calls',
          regex: /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*=>)/gi,
          description: 'Function that could benefit from memoization'
        }
      ],
      async: [
        {
          name: 'Sequential await in loop',
          regex: /for\s*\([^)]*\)\s*\{\s*[^}]*await/gi,
          description: 'Await in loop that could use Promise.all'
        },
        {
          name: 'Missing Promise.all',
          regex: /await\s+(\w+)\s*;[\s\S]*?await\s+(\w+)\s*;/gi,
          description: 'Independent await calls that could be parallelized'
        },
        {
          name: 'Callback-based async',
          regex: /\.on\([^)]+,\s*(?:\([^)]*\)\s*=>|function)/gi,
          description: 'Callback-based pattern that could use Promise'
        }
      ]
    };

    // Check each category for patterns
    for (const category of categories) {
      const categoryPatterns = patterns[category] || [];

      for (const pattern of categoryPatterns) {
        let match;
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

        while ((match = regex.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          results.suggestions.push({
            category,
            line: lineNumber,
            title: pattern.name,
            description: pattern.description,
            matched: match[0].trim().substring(0, 50)
          });
        }
      }
    }
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

/**
 * Generate optimization suggestions report
 * @param {Object} options - Analysis options
 * @returns {string} Formatted report
 */
function generateReport(options) {
  const { path: targetPath, categories, verbose } = options;

  // Find source files
  const extensions = ['.js', '.ts', '.py', '.java', '.go', '.rb', '.php', '.c', '.cpp'];
  const sourceFiles = findSourceFiles(targetPath, extensions);

  if (sourceFiles.length === 0) {
    return 'No source files found in the specified directory.';
  }

  // Analyze all files
  const allResults = [];
  for (const file of sourceFiles) {
    const result = analyzeFile(file, categories);
    if (result.suggestions.length > 0) {
      allResults.push(result);
    }
  }

  if (allResults.length === 0) {
    return 'No obvious optimization opportunities found. The code appears well-optimized!';
  }

  // Generate report
  let report = '# Optimization Suggestions\n\n';
  report += `Analyzed ${sourceFiles.length} files in: ${targetPath}\n`;
  report += `Categories: ${categories.join(', ')}\n\n`;

  // Group by category
  const byCategory = {};
  for (const result of allResults) {
    for (const suggestion of result.suggestions) {
      if (!byCategory[suggestion.category]) {
        byCategory[suggestion.category] = [];
      }
      byCategory[suggestion.category].push({
        file: result.file,
        ...suggestion
      });
    }
  }

  // Output by category
  for (const [category, items] of Object.entries(byCategory)) {
    report += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

    for (const item of items) {
      const relativePath = path.relative(targetPath, item.file);
      report += `### ${item.title}\n`;
      report += `- **Location**: \`${relativePath}:${item.line}\`\n`;
      report += `- **Description**: ${item.description}\n`;
      if (verbose) {
        report += `- **Match**: \`${item.matched}\`\n`;
      }
      report += '\n';
    }
  }

  return report;
}

/**
 * Handle suggest-optimizations command
 * @param {Object} args - Command arguments
 * @returns {Promise<void>}
 */
async function handleSuggestOptimizations(args) {
  const options = parseOptions(args.args || []);

  try {
    // Check if path exists
    if (!fs.existsSync(options.path)) {
      console.error(`Error: Path does not exist: ${options.path}`);
      process.exit(1);
    }

    // Generate report
    const report = generateReport(options);

    // Output report
    if (options.output) {
      fs.writeFileSync(options.output, report, 'utf8');
      console.log(`Report written to: ${options.output}`);
    } else {
      console.log(report);
    }
  } catch (error) {
    console.error(`Error analyzing code: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  name: PLUGIN_NAME,
  version: PLUGIN_VERSION,
  commands: {
    'suggest-optimizations': handleSuggestOptimizations
  }
};