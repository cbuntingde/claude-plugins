#!/usr/bin/env node
/**
 * Validate .env files and check for missing or unused variables
 */

import { readFileSync, existsSync } from "fs";
import { extname, join } from "path";

const DEFAULT_ENV_FILE = ".env";

const LANGUAGE_PATTERNS = {
  js: [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
  ],
  py: [
    /os\.getenv\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']\s*\)/g,
    /os\.environ\s*\[\s*["']([A-Z_][A-Z0-9_]*)["']\s*\]/g,
    /getenv\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']\s*\)/g,
  ],
  go: [
    /os\.Getenv\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']\s*\)/g,
  ],
  rb: [
    /ENV\s*\[\s*["']([A-Z_][A-Z0-9_]*)["']\s*\]/g,
  ],
  php: [
    /getenv\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']\s*\)/g,
    /\$_ENV\s*\[\s*["']([A-Z_][A-Z0-9_]*)["']\s*\]/g,
  ],
  java: [
    /System\.getenv\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']\s*\)/g,
  ],
  kt: [
    /System\.getenv\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']\s*\)/g,
  ],
  sh: [
    /\$\{([A-Z_][A-Z0-9_]*)\}/g,
    /\$([A-Z_][A-Z0-9_]*)\b/g,
  ],
  cs: [
    /Environment\.GetEnvironmentVariable\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']\s*\)/g,
  ],
  yaml: [
    /\$\{([A-Z_][A-Z0-9_]*)\}/g,
  ],
  dockerfile: [
    /ENV\s+([A-Z_][A-Z0-9_]*)=/g,
  ],
};

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key$/i,
  /token/i,
  /credential/i,
  /auth/i,
  /private/i,
  /sensitive/i,
];

const SECURITY_WARNINGS = [
  /password.*=.*"/i,
  /secret.*=.*"/i,
  /api[_-]?key.*=.*"/i,
  /token.*=.*"/i,
];

const BOOLEAN_PATTERNS = [
  /^(true|false|yes|no|1|0)$/i,
];

/**
 * Recursively get all files in a directory
 */
function getFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
          getFiles(fullPath, files);
        }
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }

  return files;
}

/**
 * Get file extension
 */
function getFileExtension(filename) {
  const ext = extname(filename).toLowerCase();
  return ext.replace(".", "");
}

/**
 * Detect environment variables in a file
 */
function detectVariablesInFile(filePath, content) {
  const ext = getFileExtension(filePath);
  const patterns = LANGUAGE_PATTERNS[ext] || [];

  const variables = new Map();

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
      const varName = match[1];
      const lineNumber = content.substring(0, match.index).split("\n").length;

      if (!variables.has(varName)) {
        variables.set(varName, {
          name: varName,
          files: [],
          line: lineNumber,
        });
      }

      variables.get(varName).files.push({
        path: filePath,
        line: lineNumber,
      });
    }
  }

  return variables;
}

/**
 * Parse .env file
 */
function parseEnvFile(filePath) {
  const variables = new Map();
  const lines = [];
  const comments = [];

  try {
    const content = readFileSync(filePath, "utf8");
    const contentLines = content.split("\n");

    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      lines.push({ line: i + 1, content: line });

      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith("#")) {
        comments.push({ line: i + 1, content: line });
        continue;
      }

      // Parse KEY=VALUE
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, name, value] = match;
        variables.set(name, {
          name,
          value: value.trim(),
          line: i + 1,
          lineContent: line,
        });
      }
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }

  return { variables, lines, comments };
}

/**
 * Check for security issues
 */
function checkSecurityIssues(variables) {
  const issues = [];

  for (const [name, data] of variables) {
    const isSensitive = SENSITIVE_PATTERNS.some((p) => p.test(name));

    // Check for placeholder values that look like defaults
    if (isSensitive) {
      const placeholderPatterns = [
        /^changeme$/i,
        /^password$/i,
        /^secret$/i,
        /^your_.*_here$/i,
        /^<.*>$/,
        /^["'].*["']$/,
      ];

      if (placeholderPatterns.some((p) => p.test(data.value))) {
        issues.push({
          type: "security",
          variable: name,
          message: `${name} appears to be using a placeholder value`,
          line: data.line,
        });
      }
    }
  }

  return issues;
}

/**
 * Check for type issues
 */
function checkTypeIssues(variables) {
  const issues = [];

  for (const [name, data] of variables) {
    const lower = name.toLowerCase();

    // Check for boolean variables
    if (lower.includes("enabled") || lower.includes("active") || lower.includes("debug") || lower.includes("verbose") || lower.includes("use_") || lower.includes("is_")) {
      if (!BOOLEAN_PATTERNS.some((p) => p.test(data.value))) {
        issues.push({
          type: "type",
          variable: name,
          message: `${name} appears to be boolean but value is not true/false`,
          value: data.value,
          line: data.line,
        });
      }
    }

    // Check for numeric variables
    if (lower.includes("port") || lower.includes("timeout") || lower.includes("max") || lower.includes("min") || lower.includes("count") || lower.includes("size") || lower.includes("limit") || lower.includes("threshold")) {
      if (isNaN(parseFloat(data.value)) && !data.value.match(/^\d+$/)) {
        issues.push({
          type: "type",
          variable: name,
          message: `${name} appears to be numeric but value is not a number`,
          value: data.value,
          line: data.line,
        });
      }
    }

    // Check for URLs
    if (lower.includes("url") || lower.includes("uri") || lower.includes("endpoint")) {
      if (!data.value.match(/^https?:\/\//i) && !data.value.startsWith("${")) {
        issues.push({
          type: "type",
          variable: name,
          message: `${name} appears to be a URL but doesn't start with http:// or https://`,
          value: data.value,
          line: data.line,
        });
      }
    }
  }

  return issues;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  let envFile = DEFAULT_ENV_FILE;
  let strict = false;
  let checkUnused = false;
  let checkMissing = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--file" || arg === "-f") {
      envFile = args[++i];
    } else if (arg === "--strict" || arg === "-s") {
      strict = true;
    } else if (arg === "--unused" || arg === "-u") {
      checkUnused = true;
    } else if (arg === "--missing" || arg === "-m") {
      checkMissing = true;
    }
  }

  // If no specific checks, enable both
  if (!checkUnused && !checkMissing) {
    checkUnused = true;
    checkMissing = true;
  }

  const cwd = process.cwd();
  const envPath = join(cwd, envFile);

  console.log(`Validating ${envFile}...`);
  console.log("");

  // Parse .env file
  const { variables: envVariables, lines } = parseEnvFile(envPath);

  if (!existsSync(envPath)) {
    console.log(`Warning: ${envFile} does not exist`);
    console.log("");
  }

  // Scan codebase for used variables
  const allFiles = getFiles(cwd);
  const supportedExtensions = Object.keys(LANGUAGE_PATTERNS);
  const codeFiles = allFiles.filter((file) => {
    const ext = getFileExtension(file);
    return supportedExtensions.includes(ext);
  });

  const usedVariables = new Map();

  for (const file of codeFiles) {
    try {
      const content = readFileSync(file, "utf8");
      const variables = detectVariablesInFile(file, content);

      for (const [name, varData] of variables) {
        if (!usedVariables.has(name)) {
          usedVariables.set(name, varData);
        } else {
          usedVariables.get(name).files.push(...varData.files);
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  // Generate report
  const report = {
    missing: [],
    unused: [],
    security: [],
    type: [],
  };

  // Check for missing variables
  if (checkMissing) {
    for (const [name, varData] of usedVariables) {
      if (!envVariables.has(name)) {
        report.missing.push({
          variable: name,
          files: varData.files,
        });
      }
    }
  }

  // Check for unused variables
  if (checkUnused) {
    for (const [name, varData] of envVariables) {
      if (!usedVariables.has(name)) {
        report.unused.push({
          variable: name,
          value: varData.value,
          line: varData.line,
        });
      }
    }
  }

  // Check for security issues
  report.security = checkSecurityIssues(envVariables);

  // Check for type issues
  report.type = checkTypeIssues(envVariables);

  // Print report
  console.log("=".repeat(50));
  console.log(`Validation Report for ${envFile}`);
  console.log("=".repeat(50));
  console.log("");

  let hasIssues = false;

  // Missing variables
  if (report.missing.length > 0) {
    hasIssues = true;
    console.log("Missing Variables (" + report.missing.length + "):");
    console.log("-".repeat(30));
    for (const item of report.missing) {
      console.log(`  ${item.variable}`);
      for (const file of item.files.slice(0, 3)) {
        console.log(`    Used in: ${file.path}:${file.line}`);
      }
      if (item.files.length > 3) {
        console.log(`    ... and ${item.files.length - 3} more locations`);
      }
    }
    console.log("");
  }

  // Unused variables
  if (report.unused.length > 0) {
    hasIssues = true;
    console.log("Unused Variables (" + report.unused.length + "):");
    console.log("-".repeat(30));
    for (const item of report.unused) {
      console.log(`  ${item.variable} (line ${item.line})`);
    }
    console.log("");
  }

  // Security issues
  if (report.security.length > 0) {
    hasIssues = true;
    console.log("Security Warnings (" + report.security.length + "):");
    console.log("-".repeat(30));
    for (const issue of report.security) {
      console.log(`  ${issue.variable}: ${issue.message}`);
    }
    console.log("");
  }

  // Type issues
  if (report.type.length > 0) {
    hasIssues = true;
    console.log("Type Issues (" + report.type.length + "):");
    console.log("-".repeat(30));
    for (const issue of report.type) {
      console.log(`  ${issue.variable}: ${issue.message}`);
    }
    console.log("");
  }

  if (!hasIssues) {
    console.log("✓ No issues found!");
  }

  // Exit with error if strict mode and issues found
  if (strict && hasIssues) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error validating .env file:", error.message);
  process.exit(1);
});