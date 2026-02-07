#!/usr/bin/env node
/**
 * Environment Variable Detection Plugin
 * Main entry point for Claude Code plugin
 */

const path = require('path');
const fs = require('fs');

/**
 * Plugin metadata
 */
const pluginInfo = {
  name: 'env-var-detect',
  version: '1.0.0',
  description: 'Automatically detect missing environment variables in your codebase'
};

/**
 * Load configuration from various locations
 * @returns {object} Plugin configuration
 */
function loadConfig() {
  const configPaths = [
    path.join(process.cwd(), '.env-detect.json'),
    path.join(process.cwd(), '.claude', 'env-detect.json'),
    path.join(__dirname, 'config.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        // Continue with defaults
      }
    }
  }

  return getDefaultConfig();
}

/**
 * Get default configuration
 * @returns {object} Default configuration
 */
function getDefaultConfig() {
  return {
    scanOnWrite: true,
    scanOnSessionStart: false,
    excludedPatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**', 'vendor/**'],
    envFilePatterns: [
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
    ],
    languagePatterns: {
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
    },
    fileExtensions: {
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
    }
  };
}

/**
 * Extract defined variables from .env files
 * @param {string} rootDir - Root directory to scan
 * @param {string[]} envFilePatterns - Patterns for env files
 * @returns {Set<string>} Set of defined variable names
 */
function getDefinedEnvVars(rootDir, envFilePatterns) {
  const definedVars = new Set();

  for (const envFile of envFilePatterns) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          // Match VAR=value or VAR="value" or VAR='value'
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
 * @param {string} filePath - Path to the file
 * @param {object} languagePatterns - Patterns for each language
 * @param {object} fileExtensions - Mapping of extensions to languages
 * @returns {string[]} Array of used variable names
 */
function extractEnvVarsFromFile(filePath, languagePatterns, fileExtensions) {
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
 * @param {string} dir - Directory to scan
 * @param {string[]} excludePatterns - Patterns to exclude
 * @param {object} fileExtensions - Mapping of extensions to languages
 * @returns {string[]} Array of file paths
 */
function findCodeFiles(dir, excludePatterns, fileExtensions) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const shouldExclude = excludePatterns.some(pattern => {
          if (pattern.endsWith('/**')) {
            return entry.name === pattern.replace('/**', '');
          }
          return entry.name === pattern;
        });
        if (!shouldExclude) {
          files.push(...findCodeFiles(fullPath, excludePatterns, fileExtensions));
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
 * Check env command handler
 * @param {object} params - Parameters
 * @returns {object} Check result
 */
function checkEnv(params = {}) {
  const rootDir = params.path || process.cwd();
  const outputFormat = params.format || 'text';

  const config = loadConfig();

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

  console.log(`${colors.cyan}${colors.bright}Detecting Environment Variables...${colors.reset}\n`);

  // Get all defined environment variables
  const definedVars = getDefinedEnvVars(rootDir, config.envFilePatterns);
  console.log(`${colors.blue}Found ${definedVars.size} defined environment variable(s)${colors.reset}`);

  // Find code files
  const files = findCodeFiles(rootDir, config.excludedPatterns, config.fileExtensions);
  console.log(`${colors.blue}Scanning ${files.length} file(s)...${colors.reset}\n`);

  // Extract used variables from each file
  const fileUsage = new Map();
  const allUsedVars = new Set();

  for (const file of files) {
    const usedVars = extractEnvVarsFromFile(
      file,
      config.languagePatterns,
      config.fileExtensions
    );
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

  if (outputFormat === 'json') {
    return {
      success: true,
      summary: {
        defined: definedVars.size,
        used: allUsedVars.size,
        missing: uniqueMissingVars.length
      },
      missingVars: uniqueMissingVars,
      missingByFile: Array.from(missingByFile.entries()).map(([file, vars]) => ({
        file: path.relative(rootDir, file),
        vars
      }))
    };
  }

  // Text output
  let outputText = '';

  if (uniqueMissingVars.length === 0) {
    outputText += `${colors.green}${colors.bright}All environment variables are defined!${colors.reset}\n`;
    return {
      success: true,
      text: outputText,
      summary: {
        defined: definedVars.size,
        used: allUsedVars.size,
        missing: 0
      }
    };
  }

  outputText += `${colors.yellow}${colors.bright}Found ${uniqueMissingVars.length} missing environment variable(s):${colors.reset}\n\n`;

  // Display missing variables by file
  for (const [file, vars] of missingByFile.entries()) {
    const relativePath = path.relative(rootDir, file);
    outputText += `${colors.bright}${colors.red}${relativePath}${colors.reset}\n`;
    for (const v of vars) {
      outputText += `   ${colors.yellow}- ${v}${colors.reset}\n`;
    }
    outputText += '\n';
  }

  // Summary
  outputText += `${colors.bright}${colors.cyan}Summary:${colors.reset}\n`;
  outputText += `   ${colors.red}Missing: ${uniqueMissingVars.length}${colors.reset}\n`;
  outputText += `   ${colors.green}Defined: ${definedVars.size}${colors.reset}\n`;
  outputText += `   ${colors.blue}Used in code: ${allUsedVars.size}${colors.reset}\n\n`;

  // Suggest adding to .env
  outputText += `${colors.cyan}${colors.bright}Suggested .env additions:${colors.reset}\n`;
  for (const v of uniqueMissingVars) {
    outputText += `${v}=\n`;
  }

  return {
    success: true,
    text: outputText,
    summary: {
      defined: definedVars.size,
      used: allUsedVars.size,
      missing: uniqueMissingVars.length
    },
    missingVars: uniqueMissingVars
  };
}

module.exports = {
  // Plugin metadata
  ...pluginInfo,

  // Configuration
  loadConfig,
  getDefaultConfig,

  // Command handlers
  checkEnv
};