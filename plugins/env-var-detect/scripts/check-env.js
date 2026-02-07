#!/usr/bin/env node
/**
 * Check Environment Variables Command
 * Standalone script for the /check-env slash command
 */

const path = require('path');
const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  cyan: '\x1b[36m'
};

// Environment file patterns
const envFilePatterns = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
  '.env.example',
  '.env.sample',
  '.env.template',
  'env',
  'env.local',
  'env.dist'
];

// File extensions mapping to languages
const fileExtensions = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.php': 'php',
  '.rb': 'ruby',
  '.go': 'go',
  '.java': 'java'
};

// Language patterns for env var detection
const languagePatterns = {
  javascript: [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g
  ],
  typescript: [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g
  ],
  python: [
    /os\.environ\[?['"`]([A-Z_][A-Z0-9_]*)['"`]\]?/g,
    /os\.getenv\(['"`]([A-Z_][A-Z0-9_]*)['"`]/g
  ],
  shell: [
    /\$([A-Z_][A-Z0-9_]*)/g,
    /\$\{([A-Z_][A-Z0-9_]*)\}/g
  ],
  php: [
    /\$_ENV\[?['"`]([A-Z_][A-Z0-9_]*)['"`]\]?/g,
    /getenv\(['"`]([A-Z_][A-Z0-9_]*)['"`]\)/g
  ],
  ruby: [
    /ENV\[?['"`]([A-Z_][A-Z0-9_]*)['"`]\]?/g
  ],
  go: [
    /os\.Getenv\(['"`]([A-Z_][A-Z0-9_]*)['"`]\)/g
  ],
  java: [
    /System\.getenv\(['"`]([A-Z_][A-Z0-9_]*)['"`]\)/g
  ]
};

// Directories to exclude
const excludePatterns = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', '.venv', 'venv'];

/**
 * Extract defined variables from .env files
 */
function getDefinedEnvVars(rootDir) {
  const definedVars = new Set();

  for (const envFile of envFilePatterns) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
          if (match && !trimmed.startsWith('#')) {
            definedVars.add(match[1]);
          }
        }
      } catch (err) {
        // Ignore file read errors
      }
    }
  }

  return definedVars;
}

/**
 * Extract environment variable usage from code
 */
function extractEnvVarsFromFile(filePath) {
  const ext = path.extname(filePath);
  const language = fileExtensions[ext];

  if (!language || !languagePatterns[language]) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const usedVars = new Set();
    const langPatterns = languagePatterns[language];

    for (const pattern of langPatterns) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      while ((match = regex.exec(content)) !== null) {
        if (match[1]) {
          usedVars.add(match[1]);
        }
      }
    }

    return Array.from(usedVars);
  } catch (err) {
    return [];
  }
}

/**
 * Recursively find code files
 */
function findCodeFiles(dir, excludeDirs = []) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          files.push(...findCodeFiles(fullPath, excludeDirs));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (fileExtensions[ext]) {
          files.push(fullPath);
        }
      }
    }
  } catch (err) {
    // Ignore permission errors
  }

  return files;
}

/**
 * Main function to check environment variables
 */
function runCheckEnv() {
  console.log(`${colors.cyan}${colors.bright}Detecting Environment Variables...${colors.reset}\n`);

  const rootDir = process.cwd();

  // Get all defined environment variables
  const definedVars = getDefinedEnvVars(rootDir);
  console.log(`${colors.blue}Found ${definedVars.size} defined environment variable(s)${colors.reset}`);

  // Find code files
  const files = findCodeFiles(rootDir, excludePatterns);
  console.log(`${colors.blue}Scanning ${files.length} file(s)...${colors.reset}\n`);

  // Extract used variables from each file
  const fileUsage = new Map();
  const allUsedVars = new Set();

  for (const file of files) {
    const usedVars = extractEnvVarsFromFile(file);
    if (usedVars.length > 0) {
      fileUsage.set(file, usedVars);
      usedVars.forEach(v => allUsedVars.add(v));
    }
  }

  // Find missing variables
  const missingVars = Array.from(allUsedVars).filter(v => !definedVars.has(v));
  const uniqueMissingVars = [...new Set(missingVars)];

  // Group by file
  const missingByFile = new Map();
  for (const [file, usedVars] of fileUsage.entries()) {
    const missingInFile = usedVars.filter(v => !definedVars.has(v));
    if (missingInFile.length > 0) {
      missingByFile.set(file, missingInFile);
    }
  }

  // Display results
  if (uniqueMissingVars.length === 0) {
    console.log(`${colors.green}${colors.bright}All environment variables are defined!${colors.reset}`);
    return 0;
  }

  console.log(`${colors.yellow}${colors.bright}Found ${uniqueMissingVars.length} missing environment variable(s):${colors.reset}\n`);

  // Display missing variables by file
  for (const [file, vars] of missingByFile.entries()) {
    const relativePath = path.relative(rootDir, file);
    console.log(`${colors.bright}${colors.red}${relativePath}${colors.reset}`);
    for (const v of vars) {
      console.log(`   ${colors.yellow}- ${v}${colors.reset}`);
    }
    console.log('');
  }

  // Summary
  console.log(`${colors.bright}${colors.cyan}Summary:${colors.reset}`);
  console.log(`   ${colors.red}Missing: ${uniqueMissingVars.length}${colors.reset}`);
  console.log(`   ${colors.green}Defined: ${definedVars.size}${colors.reset}`);
  console.log(`   ${colors.blue}Used in code: ${allUsedVars.size}${colors.reset}\n`);

  // Suggest adding to .env
  console.log(`${colors.cyan}${colors.bright}Suggested .env additions:${colors.reset}`);
  for (const v of uniqueMissingVars) {
    console.log(`${v}=`);
  }

  return uniqueMissingVars.length > 0 ? 1 : 0;
}

// Run the command
process.exit(runCheckEnv());