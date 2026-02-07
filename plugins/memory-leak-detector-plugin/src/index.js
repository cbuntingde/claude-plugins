#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Memory leak patterns for different languages
const MEMORY_LEAK_PATTERNS = {
  javascript: [
    {
      name: "Event Listener Not Removed",
      pattern: /addEventListener\s*\(/g,
      severity: "high",
      description: "Event listeners added without corresponding removeEventListener calls",
      suggestion: "Always remove event listeners when they're no longer needed using removeEventListener()",
      example: {
        bad: "element.addEventListener('click', handler);\n// element never gets cleaned up",
        good: "element.addEventListener('click', handler);\n// Later:\nelement.removeEventListener('click', handler);"
      }
    },
    {
      name: "Closure Retaining Large Objects",
      pattern: /function\s*\(\s*\)\s*\{[^}]*\}\s*\(/g,
      severity: "medium",
      description: "Closures that inadvertently retain references to large objects",
      suggestion: "Be mindful of what variables closures capture. Use null to clear large objects when done.",
      example: {
        bad: "function createHandler() {\n  const largeData = new Array(1000000).fill('data');\n  return function() { console.log(largeData.length); };\n}",
        good: "function createHandler() {\n  const largeData = new Array(1000000).fill('data');\n  const length = largeData.length;\n  return function() { console.log(length); };\n}"
      }
    },
    {
      name: "Uncleared Intervals/Timeouts",
      pattern: /setInterval|setTimeout/g,
      severity: "high",
      description: "Timers not cleared with clearInterval/clearTimeout",
      suggestion: "Store timer IDs and clear them when no longer needed",
      example: {
        bad: "setInterval(() => { /* ... */ }, 1000);\n// never cleared",
        good: "const timerId = setInterval(() => { /* ... */ }, 1000);\n// Later:\nclearInterval(timerId);"
      }
    },
    {
      name: "Global Variable Accumulation",
      pattern: /window\.\w+\s*=|global\.\w+\s*=/g,
      severity: "medium",
      description: "Global variables that accumulate data",
      suggestion: "Avoid global variables. Use module-scoped variables or clear them explicitly",
      example: {
        bad: "window.cache = {};\nwindow.cache[key] = largeData;",
        good: "const cache = new Map();\nfunction setCache(key, value) {\n  cache.set(key, value);\n}"
      }
    },
    {
      name: "DOM References in Detached Elements",
      pattern: /document\.createElement|document\.getElementById/g,
      severity: "medium",
      description: "DOM elements referenced but not attached to the document",
      suggestion: "Clear references to detached DOM elements and set innerHTML to empty string",
      example: {
        bad: "const elements = [];\nfor (let i = 0; i < 1000; i++) {\n  elements.push(document.createElement('div'));\n}",
        good: "let element = document.createElement('div');\n// Use the element\nelement = null; // Clear reference"
      }
    }
  ],
  python: [
    {
      name: "Circular References",
      pattern: /self\.\w+\s*=\s*self/g,
      severity: "medium",
      description: "Objects with circular references that prevent garbage collection",
      suggestion: "Use weak references or explicitly break cycles",
      example: {
        bad: "class Node:\n    def __init__(self):\n        self.parent = None\n        self.children = []",
        good: "import weakref\nclass Node:\n    def __init__(self):\n        self.parent = None\n        self.children = []\n        # Use weakref for parent to avoid cycles"
      }
    },
    {
      name: "Unclosed File Handles",
      pattern: /open\s*\(/g,
      severity: "high",
      description: "File handles opened without proper closing",
      suggestion: "Use context managers (with statements) to ensure files are closed",
      example: {
        bad: "f = open('file.txt', 'r')\ndata = f.read()\n# File never closed",
        good: "with open('file.txt', 'r') as f:\n    data = f.read()\n# File automatically closed"
      }
    },
    {
      name: "Unclosed Database Connections",
      pattern: /connect\s*\(|\.cursor\s*\(/g,
      severity: "high",
      description: "Database connections or cursors not properly closed",
      suggestion: "Use context managers or explicit close() calls",
      example: {
        bad: "conn = db.connect()\ncursor = conn.cursor()\ncursor.execute('SELECT * FROM table')",
        good: "with db.connect() as conn:\n    with conn.cursor() as cursor:\n        cursor.execute('SELECT * FROM table')"
      }
    },
    {
      name: "Global Caches Without Limits",
      pattern: /^[A-Z_]+\s*=\s*\{\}/gm,
      severity: "medium",
      description: "Global caches or dictionaries that grow unbounded",
      suggestion: "Use LRU caches or implement size limits",
      example: {
        bad: "CACHE = {}\n\ndef memoize(key, value):\n    CACHE[key] = value  # Grows forever",
        good: "from functools import lru_cache\n\n@lru_cache(maxsize=128)\ndef expensive_function(arg):\n    # Automatically limited cache\n    pass"
      }
    },
    {
      name: "Thread Not Joined",
      pattern: /Thread\s*\(|\.start\s*\(\)/g,
      severity: "medium",
      description: "Threads started but never joined",
      suggestion: "Always join threads or use daemon threads for background tasks",
      example: {
        bad: "thread = Thread(target=worker)\nthread.start()\n# Thread never joined",
        good: "thread = Thread(target=worker)\nthread.start()\n# Later:\nthread.join()\n# Or:\nthread = Thread(target=worker, daemon=True)"
      }
    }
  ],
  typescript: [
    {
      name: "Subscription Not Unsubscribed",
      pattern: /\.subscribe\s*\(/g,
      severity: "high",
      description: "RxJS subscriptions not unsubscribed",
      suggestion: "Always store subscriptions and call unsubscribe() or use takeUntil()",
      example: {
        bad: "observable.subscribe(data => {\n  console.log(data);\n});\n// Never unsubscribed",
        good: "const subscription = observable.subscribe(data => {\n  console.log(data);\n});\n// Later:\nsubscription.unsubscribe();"
      }
    },
    {
      name: "Memory Retention in Subjects",
      pattern: /new\s+(BehaviorSubject|ReplaySubject)/g,
      severity: "medium",
      description: "Subjects that retain old values",
      suggestion: "Use regular Subjects when you don't need to retain values",
      example: {
        bad: "const subject$ = new ReplaySubject(1000);\n// Retains 1000 values in memory",
        good: "const subject$ = new Subject();\n// Doesn't retain values"
      }
    }
  ]
};

// Create server instance
const server = new Server(
  {
    name: "memory-leak-detector",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "detect_memory_leaks",
        description: "Analyzes code files for potential memory leak patterns and vulnerabilities",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the file or directory to analyze",
            },
            language: {
              type: "string",
              enum: ["javascript", "typescript", "python", "auto"],
              description: "Programming language to analyze (auto-detect if not specified)",
            },
            severity: {
              type: "string",
              enum: ["all", "high", "medium", "low"],
              description: "Minimum severity level to report (default: all)",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "analyze_memory_pattern",
        description: "Analyzes a specific code snippet for memory leak patterns",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Code snippet to analyze",
            },
            language: {
              type: "string",
              enum: ["javascript", "typescript", "python"],
              description: "Programming language of the code snippet",
            },
          },
          required: ["code", "language"],
        },
      },
      {
        name: "get_memory_suggestions",
        description: "Provides actionable suggestions to fix detected memory leaks",
        inputSchema: {
          type: "object",
          properties: {
            leakType: {
              type: "string",
              description: "Type of memory leak to get suggestions for",
            },
            language: {
              type: "string",
              enum: ["javascript", "typescript", "python"],
              description: "Programming language",
            },
          },
          required: ["leakType", "language"],
        },
      },
      {
        name: "scan_project_memory",
        description: "Scans an entire project for memory leak patterns across all files",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: {
              type: "string",
              description: "Path to the project directory",
            },
            fileExtensions: {
              type: "array",
              items: {
                type: "string",
              },
              description: "File extensions to scan (e.g., ['.js', '.ts', '.py'])",
            },
            excludeDirs: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Directories to exclude (e.g., ['node_modules', '.git'])",
            },
          },
          required: ["projectPath"],
        },
      },
    ],
  };
});

// Detect file language from extension
function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const langMap = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".mjs": "javascript",
    ".cjs": "javascript",
  };
  return langMap[ext] || null;
}

// Analyze file for memory leaks
function analyzeForMemoryLeaks(content, language, severity = "all") {
  const patterns = MEMORY_LEAK_PATTERNS[language] || [];
  const issues = [];

  // Strip comments, pattern definitions, and example strings to reduce false positives
  let cleanContent = content
    .replace(/\/\/.*$/gm, "") // Remove line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
    .replace(/pattern:\s*\/.*?\/[gimuy]*/g, "pattern: /[]/g"); // Replace regex patterns

  // Remove example lines (lines containing "bad:" or "good:" or "example: {")
  const lines = cleanContent.split("\n");
  const cleanedLines = lines.map((line) => {
    // Skip lines that are just example metadata
    if (/^\s*"?(bad|good|example|suggestion|description)[""]?\s*[:}]/.test(line)) {
      return "";
    }
    return line;
  });

  cleanContent = cleanedLines.join("\n");

  patterns.forEach((pattern) => {
    if (severity !== "all" &&
        ["high", "medium", "low"].indexOf(pattern.severity) <
        ["high", "medium", "low"].indexOf(severity)) {
      return;
    }

    lines.forEach((line, index) => {
      const matches = line.match(pattern.pattern);
      if (matches) {
        issues.push({
          line: index + 1,
          column: line.indexOf(matches[0]) + 1,
          severity: pattern.severity,
          pattern: pattern.name,
          description: pattern.description,
          suggestion: pattern.suggestion,
          example: pattern.example,
          matchedText: matches[0],
        });
      }
    });
  });

  return issues;
}

// Recursively scan directory
function scanDirectory(dir, extensions, excludeDirs = [], results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(item)) {
        scanDirectory(fullPath, extensions, excludeDirs, results);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  });

  return results;
}

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "detect_memory_leaks": {
        const filePath = args.filePath;
        const language = args.language || "auto";
        const severityFilter = args.severity || "all";

        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }

        const stat = fs.statSync(filePath);
        let filesToAnalyze = [];

        if (stat.isDirectory()) {
          const exts = [".js", ".jsx", ".ts", ".tsx", ".py"];
          filesToAnalyze = scanDirectory(filePath, exts, ["node_modules", ".git", "dist", "build"]);
        } else {
          filesToAnalyze = [filePath];
        }

        const allResults = [];

        for (const file of filesToAnalyze) {
          const content = fs.readFileSync(file, "utf-8");
          const detectedLang = language === "auto" ? detectLanguage(file) : language;

          if (!detectedLang || !MEMORY_LEAK_PATTERNS[detectedLang]) {
            continue;
          }

          const issues = analyzeForMemoryLeaks(content, detectedLang, severityFilter);

          if (issues.length > 0) {
            allResults.push({
              file: file,
              language: detectedLang,
              issues: issues,
            });
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                summary: {
                  filesScanned: filesToAnalyze.length,
                  filesWithIssues: allResults.length,
                  totalIssues: allResults.reduce((sum, r) => sum + r.issues.length, 0),
                },
                results: allResults,
              }, null, 2),
            },
          ],
        };
      }

      case "analyze_memory_pattern": {
        const code = args.code;
        const language = args.language;

        const issues = analyzeForMemoryLeaks(code, language);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                language: language,
                issues: issues,
                recommendation: issues.length > 0
                  ? "Memory leak patterns detected. Review the suggestions below."
                  : "No obvious memory leak patterns detected in this snippet.",
              }, null, 2),
            },
          ],
        };
      }

      case "get_memory_suggestions": {
        const leakType = args.leakType;
        const language = args.language;

        const patterns = MEMORY_LEAK_PATTERNS[language] || [];
        const pattern = patterns.find((p) => p.name === leakType);

        if (!pattern) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: `Pattern '${leakType}' not found for language '${language}'`,
                }, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                pattern: pattern.name,
                severity: pattern.severity,
                description: pattern.description,
                suggestion: pattern.suggestion,
                example: pattern.example,
                additionalTips: [
                  "Consider using memory profiling tools to verify the leak",
                  "Test your fix by monitoring memory usage over time",
                  "Review garbage collection logs for patterns",
                ],
              }, null, 2),
            },
          ],
        };
      }

      case "scan_project_memory": {
        const projectPath = args.projectPath;
        const fileExtensions = args.fileExtensions || [".js", ".jsx", ".ts", ".tsx", ".py"];
        const excludeDirs = args.excludeDirs || ["node_modules", ".git", "dist", "build", "__pycache__", ".venv", "venv"];

        if (!fs.existsSync(projectPath)) {
          throw new Error(`Project path not found: ${projectPath}`);
        }

        const files = scanDirectory(projectPath, fileExtensions, excludeDirs);
        const allResults = [];

        for (const file of files) {
          const content = fs.readFileSync(file, "utf-8");
          const detectedLang = detectLanguage(file);

          if (!detectedLang || !MEMORY_LEAK_PATTERNS[detectedLang]) {
            continue;
          }

          const issues = analyzeForMemoryLeaks(content, detectedLang);

          if (issues.length > 0) {
            allResults.push({
              file: file,
              language: detectedLang,
              issues: issues,
            });
          }
        }

        // Group by severity
        const bySeverity = {
          high: [],
          medium: [],
          low: [],
        };

        allResults.forEach((result) => {
          result.issues.forEach((issue) => {
            bySeverity[issue.severity].push({
              file: result.file,
              line: issue.line,
              pattern: issue.pattern,
            });
          });
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                summary: {
                  filesScanned: files.length,
                  filesWithIssues: allResults.length,
                  totalIssues: allResults.reduce((sum, r) => sum + r.issues.length, 0),
                  bySeverity: {
                    high: bySeverity.high.length,
                    medium: bySeverity.medium.length,
                    low: bySeverity.low.length,
                  },
                },
                results: allResults,
                prioritizedActions: [
                  ...(bySeverity.high.length > 0
                    ? [`CRITICAL: Fix ${bySeverity.high.length} high-severity issues first`]
                    : []),
                  ...(bySeverity.medium.length > 0
                    ? [`Review ${bySeverity.medium.length} medium-severity issues`]
                    : []),
                  "Set up memory profiling to monitor improvements",
                  "Consider adding memory leak detection to CI/CD pipeline",
                ],
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memory Leak Detector plugin running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
