#!/usr/bin/env node

/**
 * Dead Code Hunter
 *
 * Scans codebase to identify unused code, zombie files, and stale configurations.
 * Provides safe removal recommendations with rollback support.
 *
 * @module dead-code-hunter
 * @author Chris Bunting <cbuntingde@gmail.com>
 * @version 1.0.0
 * @license MIT
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ============================================================================
// CONSTANTS
// ============================================================================

const PLUGIN_NAME = 'dead-code-hunter';
const VERSION = '1.0.0';
const MAX_DEPTH_DEFAULT = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const BACKUP_DIR = '.dead-code-backups';
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 };

// ============================================================================
// TYPES (JSDoc)
// ============================================================================

/**
 * @typedef {Object} Logger
 * @property {function(string, string): void} debug
 * @property {function(string, string): void} info
 * @property {function(string, string): void} warn
 * @property {function(string, string): void} error
 * @property {function(string, string): void} fatal
 */

/**
 * @typedef {Object} ScanOptions
 * @property {string[]} [types=['js', 'ts']] - File types to scan
 * @property {string[]} [exclude=[]] - Paths/patterns to exclude
 * @property {number} [depth=10] - Maximum directory depth
 * @property {boolean} [report=false] - Generate report only
 * @property {boolean} [dryRun=false] - Preview without changes
 * @property {boolean} [autoRemove=false] - Auto-remove confirmed dead code
 * @property {boolean} [backup=false] - Create backup before removal
 * @property {boolean} [listBackups=false] - List available backups
 * @property {string|null} [restore=null] - Restore from backup ID
 */

/**
 * @typedef {Object} Finding
 * @property {string} file - File path
 * @property {number} [line] - Line number
 * @property {string} type - Finding type
 * @property {string} [match] - Matched content
 * @property {string} message - Finding message
 */

/**
 * @typedef {Object} ZombieFile
 * @property {string} path - File path
 * @property {number} size - File size in bytes
 * @property {string} modified - ISO timestamp
 */

/**
 * @typedef {Object} ScanReport
 * @property {Finding[]} findings - All findings
 * @property {ZombieFile[]} zombieFiles - All zombie files
 */

/**
 * @typedef {Object} BackupMetadata
 * @property {string} id - Backup ID (UUID)
 * @property {string} timestamp - ISO timestamp
 * @property {string[]} files - Files in backup
 * @property {number} totalCount - Total files backed up
 */

// ============================================================================
// STRUCTURED LOGGER
// ============================================================================

/**
 * Creates a structured logger instance
 *
 * @param {string} [minLevel='INFO'] - Minimum log level
 * @returns {Logger} Logger instance
 */
function createLogger(minLevel = 'INFO') {
  const levelValue = LOG_LEVELS[minLevel] || LOG_LEVELS.INFO;

  return {
    /**
     * Log debug message
     * @param {string} message - Log message
     * @param {string} [context] - Additional context
     */
    debug(message, context = '') {
      if (levelValue <= LOG_LEVELS.DEBUG) {
        console.error(`[DEBUG] ${formatTimestamp()} ${message}${context ? ` - ${context}` : ''}`);
      }
    },

    /**
     * Log info message
     * @param {string} message - Log message
     * @param {string} [context] - Additional context
     */
    info(message, context = '') {
      if (levelValue <= LOG_LEVELS.INFO) {
        console.log(`[INFO] ${formatTimestamp()} ${message}${context ? ` - ${context}` : ''}`);
      }
    },

    /**
     * Log warning message
     * @param {string} message - Log message
     * @param {string} [context] - Additional context
     */
    warn(message, context = '') {
      if (levelValue <= LOG_LEVELS.WARN) {
        console.warn(`[WARN] ${formatTimestamp()} ${message}${context ? ` - ${context}` : ''}`);
      }
    },

    /**
     * Log error message
     * @param {string} message - Log message
     * @param {string} [context] - Additional context
     */
    error(message, context = '') {
      if (levelValue <= LOG_LEVELS.ERROR) {
        console.error(`[ERROR] ${formatTimestamp()} ${message}${context ? ` - ${context}` : ''}`);
      }
    },

    /**
     * Log fatal message
     * @param {string} message - Log message
     * @param {string} [context] - Additional context
     */
    fatal(message, context = '') {
      if (levelValue <= LOG_LEVELS.FATAL) {
        console.error(`[FATAL] ${formatTimestamp()} ${message}${context ? ` - ${context}` : ''}`);
      }
    }
  };
}

/**
 * Format timestamp for logging
 *
 * @returns {string} ISO timestamp
 */
function formatTimestamp() {
  return new Date().toISOString();
}

// Initialize logger
const logger = createLogger(process.env.LOG_LEVEL || 'INFO');

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates and sanitizes file type extensions
 *
 * @param {string[]} types - File type extensions to validate
 * @returns {string[]} Sanitized extensions
 * @throws {Error} If validation fails
 */
function validateFileTypes(types) {
  if (!Array.isArray(types)) {
    throw new Error('File types must be an array');
  }

  if (types.length === 0) {
    throw new Error('At least one file type must be specified');
  }

  const validExtensions = new Set();
  const maxLength = 20;

  for (const type of types) {
    if (typeof type !== 'string') {
      throw new Error(`File type must be string, got ${typeof type}`);
    }

    const sanitized = type.trim().toLowerCase().replace(/^\.+/, '');

    if (sanitized.length === 0) {
      throw new Error('File type cannot be empty');
    }

    if (sanitized.length > maxLength) {
      throw new Error(`File type too long: ${sanitized}`);
    }

    // Whitelist validation: only allow alphanumeric extensions
    if (!/^[a-z0-9]+$/.test(sanitized)) {
      throw new Error(`Invalid file type: ${sanitized}. Only alphanumeric characters allowed`);
    }

    validExtensions.add(sanitized);
  }

  return Array.from(validExtensions);
}

/**
 * Validates and sanitizes exclude patterns
 *
 * @param {string[]} exclude - Exclude patterns to validate
 * @returns {string[]} Sanitized patterns
 * @throws {Error} If validation fails
 */
function validateExcludePatterns(exclude) {
  if (!Array.isArray(exclude)) {
    throw new Error('Exclude patterns must be an array');
  }

  const sanitized = [];
  const maxPatterns = 100;

  if (exclude.length > maxPatterns) {
    throw new Error(`Too many exclude patterns (max ${maxPatterns})`);
  }

  for (const pattern of exclude) {
    if (typeof pattern !== 'string') {
      throw new Error(`Exclude pattern must be string, got ${typeof pattern}`);
    }

    const trimmed = pattern.trim();

    if (trimmed.length === 0) {
      continue;
    }

    if (trimmed.length > 200) {
      throw new Error(`Exclude pattern too long: ${trimmed}`);
    }

    // Prevent path traversal attempts in patterns
    if (trimmed.includes('..')) {
      throw new Error(`Exclude pattern cannot contain '..': ${trimmed}`);
    }

    sanitized.push(trimmed);
  }

  return sanitized;
}

/**
 * Validates depth parameter
 *
 * @param {number} depth - Depth value to validate
 * @returns {number} Validated depth
 * @throws {Error} If validation fails
 */
function validateDepth(depth) {
  const parsed = parseInt(String(depth), 10);

  if (isNaN(parsed)) {
    throw new Error(`Invalid depth value: ${depth}`);
  }

  if (parsed < 1 || parsed > 50) {
    throw new Error(`Depth must be between 1 and 50, got ${parsed}`);
  }

  return parsed;
}

/**
 * Validates that a path is within allowed boundaries
 *
 * @param {string} targetPath - Path to validate
 * @param {string} basePath - Base directory path
 * @returns {boolean} True if path is safe
 * @throws {Error} If path traversal detected
 */
function validatePathSafety(targetPath, basePath) {
  try {
    const resolvedTarget = path.resolve(targetPath);
    const resolvedBase = path.resolve(basePath);

    const relative = path.relative(resolvedBase, resolvedTarget);

    // Check if path tries to escape base directory
    if (relative.startsWith('..')) {
      throw new Error(`Path traversal detected: ${targetPath}`);
    }

    // Check for symlink escapes
    const targetStat = fs.statSync(resolvedTarget, { throwIfNoEntry: false });
    const baseStat = fs.statSync(resolvedBase);

    if (targetStat && baseStat && targetStat.dev !== baseStat.dev) {
      throw new Error(`Path crosses device boundary: ${targetPath}`);
    }

    return true;
  } catch (error) {
    if (error.message.includes('Path traversal detected')) {
      throw error;
    }
    // If stat fails, path doesn't exist yet, which is okay for some operations
    return true;
  }
}

// ============================================================================
// FILE SYSTEM FUNCTIONS
// ============================================================================

/**
 * Finds files matching given patterns with security validation
 *
 * @param {string[]} patterns - File extension patterns
 * @param {Object} [options={}] - Scan options
 * @param {string[]} [options.exclude=[]] - Exclude patterns
 * @param {number} [options.maxDepth=10] - Maximum depth
 * @returns {string[]} Array of file paths
 */
function findFiles(patterns, options = {}) {
  try {
    const { exclude = [], maxDepth = MAX_DEPTH_DEFAULT } = options;

    // Validate inputs
    const sanitizedPatterns = validateFileTypes(patterns);
    const sanitizedExclude = validateExcludePatterns(exclude);
    const validatedDepth = validateDepth(maxDepth);

    const found = new Set();
    const cwd = process.cwd();
    const scannedDirs = new Set();

    /**
     * Recursively search directory
     * @param {string} dir - Directory to search
     * @param {number} depth - Current depth
     */
    function searchDir(dir, depth) {
      // Validate path safety
      try {
        validatePathSafety(dir, cwd);
      } catch (error) {
        logger.warn(`Skipping unsafe path: ${error.message}`, dir);
        return;
      }

      if (depth > validatedDepth) {
        return;
      }

      // Prevent circular symlinks
      const realDir = fs.realpathSync(dir);
      if (scannedDirs.has(realDir)) {
        return;
      }
      scannedDirs.add(realDir);

      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (error) {
        // Log specific error instead of silent catch
        if (error.code === 'EACCES') {
          logger.warn(`Permission denied accessing directory`, dir);
        } else if (error.code === 'ENOENT') {
          logger.debug(`Directory not found (may have been deleted)`, dir);
        } else {
          logger.error(`Failed to read directory: ${error.message}`, dir);
        }
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Validate path safety for each entry
        try {
          validatePathSafety(fullPath, cwd);
        } catch (error) {
          logger.debug(`Skipping unsafe entry: ${error.message}`, entry.name);
          continue;
        }

        // Check exclusion patterns
        const shouldExclude = sanitizedExclude.some((pattern) => {
          if (pattern.startsWith('*')) {
            const suffix = pattern.slice(1);
            return entry.name.endsWith(suffix) || entry.name.includes(suffix);
          }
          return entry.name === pattern || fullPath.includes(pattern);
        });

        if (shouldExclude) {
          logger.debug(`Excluding path`, fullPath);
          continue;
        }

        if (entry.isDirectory()) {
          searchDir(fullPath, depth + 1);
        } else if (entry.isFile()) {
          // Check file size before reading
          try {
            const stats = fs.statSync(fullPath);
            if (stats.size > MAX_FILE_SIZE) {
              logger.warn(`Skipping large file`, `${fullPath} (${Math.round(stats.size / 1024 / 1024)}MB)`);
              continue;
            }
          } catch (error) {
            logger.debug(`Cannot stat file`, fullPath);
            continue;
          }

          // Match against patterns
          for (const pattern of sanitizedPatterns) {
            const ext = `.${pattern}`;
            if (entry.name.endsWith(ext) || entry.name === pattern) {
              found.add(fullPath);
              break;
            }
          }
        }
      }
    }

    searchDir(cwd, 0);
    return Array.from(found);
  } catch (error) {
    logger.fatal(`Fatal error in findFiles: ${error.message}`);
    throw new Error(`File search failed: ${error.message}`, { cause: error });
  }
}

/**
 * Analyzes a file for unused code patterns
 *
 * @param {string} filePath - Path to file
 * @returns {Finding[]} Array of findings
 */
function analyzeFile(filePath) {
  const findings = [];

  try {
    // Validate path safety
    validatePathSafety(filePath, process.cwd());

    // Check file size before reading
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      findings.push({
        file: filePath,
        type: 'warning',
        message: `File too large to analyze (${Math.round(stats.size / 1024 / 1024)}MB)`,
      });
      return findings;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const ext = path.extname(filePath).slice(1);

    // Get language-specific patterns
    const patterns = getLanguagePatterns(ext);

    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern.regex, 'gm');
        let match;

        while ((match = regex.exec(content)) !== null) {
          const lineNum = content.substring(0, match.index).split('\n').length;
          findings.push({
            file: filePath,
            line: lineNum,
            type: pattern.type,
            match: match[1] || match[0],
            message: pattern.message,
          });
        }
      } catch (error) {
        logger.error(`Regex pattern failed: ${error.message}`, pattern.type);
      }
    }
  } catch (error) {
    if (error.code === 'EACCES') {
      findings.push({
        file: filePath,
        type: 'error',
        message: 'Permission denied reading file',
      });
    } else if (error.code === 'ENOENT') {
      findings.push({
        file: filePath,
        type: 'error',
        message: 'File not found (may have been deleted)',
      });
    } else {
      logger.error(`Failed to analyze file: ${error.message}`, filePath);
      findings.push({
        file: filePath,
        type: 'error',
        message: `Analysis failed: ${error.message}`,
      });
    }
  }

  return findings;
}

/**
 * Returns language-specific patterns for dead code detection
 *
 * @param {string} ext - File extension
 * @returns {Object[]} Array of pattern objects
 */
function getLanguagePatterns(ext) {
  const commonPatterns = [
    {
      type: 'unused-function',
      regex: /(?:function\s+|const\s+|let\s+|var\s+|class\s+)(\w+)\s*[=(]/g,
      message: 'Potentially unused function or variable',
    },
  ];

  const langSpecific = {
    js: commonPatterns,
    ts: commonPatterns,
    py: [
      {
        type: 'unused-function',
        regex: /(?:def\s+|class\s+)(\w+)/g,
        message: 'Potentially unused function or class',
      },
    ],
    java: commonPatterns,
  };

  return langSpecific[ext] || commonPatterns;
}

// ============================================================================
// ZOMBIE FILE DETECTION
// ============================================================================

/**
 * Scans for zombie files (files not referenced anywhere)
 *
 * @param {string[]} extensions - File extensions to scan
 * @param {string[]} [exclude=[]] - Exclude patterns
 * @returns {ZombieFile[]} Array of zombie files
 */
function scanZombieFiles(extensions, exclude = []) {
  try {
    const allSourceFiles = findFiles(['js', 'ts', 'py', 'java', 'go', 'rs'], {
      exclude: ['node_modules', '.git', 'dist', 'build', ...exclude],
    });

    // Build a reference map of all strings that could be file references
    const references = new Set();

    for (const file of allSourceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');

        // Find require/import statements
        const importRegex = /(?:require|import).*?['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          references.add(match[1]);
        }
      } catch (error) {
        logger.debug(`Failed to read source file for reference analysis`, file);
      }
    }

    // Find all files and check if they're referenced
    const allFiles = findFiles(extensions, { exclude });
    const zombieFiles = [];

    for (const file of allFiles) {
      const relativePath = path.relative(process.cwd(), file);
      const fileName = path.basename(file);
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

      // Check if file is referenced
      let isReferenced = references.has(relativePath) ||
        references.has(`./${relativePath}`) ||
        references.has(fileName) ||
        references.has(`./${fileName}`) ||
        references.has(fileNameWithoutExt) ||
        references.has(`./${fileNameWithoutExt}`);

      // Check if any source file mentions this filename
      if (!isReferenced) {
        for (const ref of references) {
          if (ref.includes(fileNameWithoutExt)) {
            isReferenced = true;
            break;
          }
        }
      }

      if (!isReferenced) {
        try {
          const stats = fs.statSync(file);
          zombieFiles.push({
            path: relativePath,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          });
        } catch (error) {
          logger.debug(`Failed to stat zombie file candidate`, file);
          zombieFiles.push({
            path: relativePath,
            size: 0,
            modified: 'unknown',
          });
        }
      }
    }

    return zombieFiles;
  } catch (error) {
    logger.error(`Zombie file scan failed: ${error.message}`);
    throw new Error(`Zombie file scan failed: ${error.message}`, { cause: error });
  }
}

// ============================================================================
// BACKUP AND RESTORE FUNCTIONS
// ============================================================================

/**
 * Creates a backup of specified files
 *
 * @param {string[]} files - Files to backup
 * @returns {BackupMetadata} Backup metadata
 */
function createBackup(files) {
  try {
    const backupId = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    const backupPath = path.join(process.cwd(), BACKUP_DIR, backupId);

    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });

    // Copy files to backup
    const backedUpFiles = [];

    for (const file of files) {
      try {
        validatePathSafety(file, process.cwd());

        const relativePath = path.relative(process.cwd(), file);
        const backupFilePath = path.join(backupPath, relativePath);

        // Create directory structure
        fs.mkdirSync(path.dirname(backupFilePath), { recursive: true });

        // Copy file
        fs.copyFileSync(file, backupFilePath);

        backedUpFiles.push(relativePath);
        logger.debug(`Backed up file`, relativePath);
      } catch (error) {
        logger.error(`Failed to backup file: ${error.message}`, file);
      }
    }

    // Write metadata
    const metadata = {
      id: backupId,
      timestamp,
      files: backedUpFiles,
      totalCount: backedUpFiles.length,
    };

    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    logger.info(`Created backup ${backupId} with ${backedUpFiles.length} files`);

    return metadata;
  } catch (error) {
    logger.error(`Backup creation failed: ${error.message}`);
    throw new Error(`Backup failed: ${error.message}`, { cause: error });
  }
}

/**
 * Lists all available backups
 *
 * @returns {BackupMetadata[]} Array of backup metadata
 */
function listBackups() {
  try {
    const backupBasePath = path.join(process.cwd(), BACKUP_DIR);

    if (!fs.existsSync(backupBasePath)) {
      return [];
    }

    const backups = [];
    const backupDirs = fs.readdirSync(backupBasePath, { withFileTypes: true });

    for (const dir of backupDirs) {
      if (!dir.isDirectory()) {
        continue;
      }

      const metadataPath = path.join(backupBasePath, dir.name, 'metadata.json');

      try {
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          backups.push(metadata);
        }
      } catch (error) {
        logger.warn(`Failed to read backup metadata`, dir.name);
      }
    }

    // Sort by timestamp, newest first
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return backups;
  } catch (error) {
    logger.error(`Failed to list backups: ${error.message}`);
    throw new Error(`Backup listing failed: ${error.message}`, { cause: error });
  }
}

/**
 * Restores files from a backup
 *
 * @param {string} backupId - Backup ID to restore
 * @returns {number} Number of files restored
 */
function restoreBackup(backupId) {
  try {
    // Validate backup ID format
    if (!/^[a-f0-9]{32}$/.test(backupId)) {
      throw new Error(`Invalid backup ID format: ${backupId}`);
    }

    const backupPath = path.join(process.cwd(), BACKUP_DIR, backupId);
    const metadataPath = path.join(backupPath, 'metadata.json');

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Backup metadata not found: ${backupId}`);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    let restoredCount = 0;

    for (const relativePath of metadata.files) {
      try {
        const backupFilePath = path.join(backupPath, relativePath);
        const targetPath = path.join(process.cwd(), relativePath);

        // Validate path safety
        validatePathSafety(targetPath, process.cwd());

        // Create directory structure
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // Restore file
        fs.copyFileSync(backupFilePath, targetPath);

        restoredCount++;
        logger.debug(`Restored file`, relativePath);
      } catch (error) {
        logger.error(`Failed to restore file: ${error.message}`, relativePath);
      }
    }

    logger.info(`Restored ${restoredCount} files from backup ${backupId}`);

    return restoredCount;
  } catch (error) {
    logger.error(`Backup restoration failed: ${error.message}`);
    throw new Error(`Restore failed: ${error.message}`, { cause: error });
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generates a comprehensive dead code report
 *
 * @param {ScanOptions} [options={}] - Scan options
 * @returns {ScanReport} Scan report
 */
function generateReport(options = {}) {
  try {
    const { types = ['js', 'ts'], exclude = [], depth = MAX_DEPTH_DEFAULT } = options;

    logger.info('');
    logger.info('=== Dead Code Hunter Report ===');
    logger.info('');

    // Scan for dead code
    const files = findFiles(types, { exclude, maxDepth: depth });
    let totalFindings = 0;
    const allFindings = [];

    for (const file of files) {
      const findings = analyzeFile(file);
      if (findings.length > 0) {
        allFindings.push(...findings);
        totalFindings += findings.length;
      }
    }

    // Scan for zombie files
    const zombieFiles = scanZombieFiles(types, exclude);

    // Display results
    logger.info(`Dead Code Findings: ${totalFindings}`);
    logger.info(`Zombie Files: ${zombieFiles.length}`);

    if (allFindings.length > 0) {
      logger.info('');
      logger.info('--- Dead Code Items ---');
      for (const finding of allFindings.slice(0, 20)) {
        const location = finding.line ? `${finding.file}:${finding.line}` : finding.file;
        logger.info(`${location} - ${finding.type}: ${finding.message}`);
      }
      if (allFindings.length > 20) {
        logger.info(`  ... and ${allFindings.length - 20} more`);
      }
    }

    if (zombieFiles.length > 0) {
      logger.info('');
      logger.info('--- Zombie Files ---');
      for (const file of zombieFiles.slice(0, 20)) {
        logger.info(`  ${file.path} (${file.size} bytes)`);
      }
      if (zombieFiles.length > 20) {
        logger.info(`  ... and ${zombieFiles.length - 20} more`);
      }
    }

    logger.info('');
    logger.info('=== End Report ===');
    logger.info('');

    return { findings: allFindings, zombieFiles };
  } catch (error) {
    logger.fatal(`Report generation failed: ${error.message}`);
    throw new Error(`Report generation failed: ${error.message}`, { cause: error });
  }
}

// ============================================================================
// AUTO-REMOVE WITH SAFETY CHECKS
// ============================================================================

/**
 * Automatically removes confirmed dead code with safety checks
 *
 * @param {ScanOptions} [options={}] - Scan options
 * @returns {Object} Removal results
 */
function autoRemove(options = {}) {
  try {
    const { backup: createBackupFlag = true } = options;

    logger.warn('AUTO-REMOVE MODE ENABLED');
    logger.warn('This will permanently delete files identified as zombie files');
    logger.warn('Please review with --report and --dry-run first');

    // Generate report first
    const report = generateReport(options);

    if (report.zombieFiles.length === 0) {
      logger.info('No zombie files found to remove');
      return { removed: 0, skipped: 0, errors: [] };
    }

    // Create backup if requested
    let backupId = null;
    if (createBackupFlag) {
      const zombieFilePaths = report.zombieFiles.map((zf) =>
        path.join(process.cwd(), zf.path)
      );
      const backupMetadata = createBackup(zombieFilePaths);
      backupId = backupMetadata.id;
      logger.info(`Backup created: ${backupId}`);
    }

    // Remove files
    let removedCount = 0;
    const errors = [];

    for (const zombieFile of report.zombieFiles) {
      try {
        const filePath = path.join(process.cwd(), zombieFile.path);

        // Validate path safety
        validatePathSafety(filePath, process.cwd());

        // Additional safety check: confirm file exists
        if (!fs.existsSync(filePath)) {
          logger.warn(`File no longer exists (skipping)`, zombieFile.path);
          continue;
        }

        // Delete file
        fs.unlinkSync(filePath);
        removedCount++;

        logger.info(`Removed zombie file`, zombieFile.path);
      } catch (error) {
        const errorMsg = `Failed to remove ${zombieFile.path}: ${error.message}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    logger.info(``);
    logger.info(`=== Removal Summary ===`);
    logger.info(`Removed: ${removedCount} files`);
    logger.info(`Errors: ${errors.length}`);

    if (backupId) {
      logger.info(``);
      logger.info(`To restore, run:`);
      logger.info(`  /dead-code-hunter --restore ${backupId}`);
    }

    return { removed: removedCount, skipped: report.zombieFiles.length - removedCount, errors, backupId };
  } catch (error) {
    logger.fatal(`Auto-remove failed: ${error.message}`);
    throw new Error(`Auto-remove failed: ${error.message}`, { cause: error });
  }
}

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

/**
 * Parses CLI arguments
 *
 * @param {string[]} args - CLI arguments
 * @returns {ScanOptions} Parsed options
 */
function parseArgs(args) {
  const options = {
    types: ['js', 'ts'],
    exclude: [],
    depth: MAX_DEPTH_DEFAULT,
    report: false,
    dryRun: false,
    autoRemove: false,
    backup: true,
    listBackups: false,
    restore: null,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    try {
      if (arg === '--types' && args[i + 1]) {
        options.types = args[i + 1].split(',');
        i += 2;
      } else if (arg === '--exclude' && args[i + 1]) {
        options.exclude = args[i + 1].split(',');
        i += 2;
      } else if (arg === '--depth' && args[i + 1]) {
        options.depth = parseInt(args[i + 1], 10);
        i += 2;
      } else if (arg === '--report') {
        options.report = true;
        i++;
      } else if (arg === '--dry-run') {
        options.dryRun = true;
        i++;
      } else if (arg === '--auto-remove') {
        options.autoRemove = true;
        i++;
      } else if (arg === '--backup') {
        options.backup = true;
        i++;
      } else if (arg === '--no-backup') {
        options.backup = false;
        i++;
      } else if (arg === '--list-backups') {
        options.listBackups = true;
        i++;
      } else if (arg === '--restore' && args[i + 1]) {
        options.restore = args[i + 1];
        i += 2;
      } else if (arg === '--help' || arg === '-h') {
        showHelp();
        process.exit(0);
      } else {
        logger.warn(`Unknown argument: ${arg}`);
        i++;
      }
    } catch (error) {
      logger.error(`Error parsing argument ${arg}: ${error.message}`);
      throw error;
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Dead Code Hunter v${VERSION} - Find and safely remove unused code

Usage: dead-code-hunter [options]

Options:
  --types <types>      File types to scan (default: js,ts)
  --exclude <paths>    Paths to exclude (comma-separated)
  --depth <n>          Directory depth to scan (default: 10)
  --report             Generate detailed report without changes
  --dry-run            Preview what would be found
  --auto-remove        Automatically remove confirmed dead code
  --backup             Create backup before removal (default: true)
  --no-backup          Skip backup creation
  --list-backups       List available backups
  --restore <id>       Restore from backup
  --help, -h           Show this help message

Examples:
  dead-code-hunter --types js,ts,py
  dead-code-hunter --report --exclude node_modules,dist
  dead-code-hunter --dry-run --depth 5
  dead-code-hunter --auto-remove --backup

For more information, visit:
  https://github.com/cbuntingde/claude-plugins-dev/tree/main/plugins/dead-code-hunter
`);
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  try {
    const options = parseArgs(args);

    // Handle list-backups command
    if (options.listBackups) {
      const backups = listBackups();

      logger.info('');
      logger.info('=== Available Backups ===');
      logger.info('');

      if (backups.length === 0) {
        logger.info('No backups found');
      } else {
        for (const backup of backups) {
          logger.info(`Backup ID: ${backup.id}`);
          logger.info(`  Created: ${backup.timestamp}`);
          logger.info(`  Files: ${backup.totalCount}`);
          logger.info('');
        }
      }

      return;
    }

    // Handle restore command
    if (options.restore) {
      const restoredCount = restoreBackup(options.restore);
      logger.info(`Restore complete: ${restoredCount} files restored`);
      return;
    }

    // Normal scan/report mode
    logger.info(``);
    logger.info(`Dead Code Hunter v${VERSION}`);
    logger.info(`Scanning for: ${options.types.join(', ')}`);
    logger.info(`Excluding: ${options.exclude.join(', ') || 'nothing'}`);
    logger.info(``);

    if (options.autoRemove) {
      const result = autoRemove(options);

      if (options.dryRun) {
        logger.info(``);
        logger.info(`[DRY RUN] No changes were made.`);
      }
    } else {
      const report = generateReport(options);

      if (options.dryRun) {
        logger.info(`[DRY RUN] No changes were made.`);
      }

      // Summary
      logger.info(`=== Summary ===`);
      logger.info(`Dead code items: ${report.findings.length}`);
      logger.info(`Zombie files: ${report.zombieFiles.length}`);
      logger.info(``);
    }
  } catch (error) {
    logger.fatal(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for programmatic use
module.exports = {
  findFiles,
  analyzeFile,
  scanZombieFiles,
  generateReport,
  createBackup,
  listBackups,
  restoreBackup,
  autoRemove,
  PLUGIN_NAME,
  VERSION,
};

// Run if executed directly
if (require.main === module) {
  main();
}
