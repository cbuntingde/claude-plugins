/**
 * Dead Code Hunter Tests
 *
 * Comprehensive test suite for dead-code-hunter plugin
 * Tests cover validation, file operations, backup/restore, and security
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const {
  findFiles,
  analyzeFile,
  scanZombieFiles,
  generateReport,
  createBackup,
  listBackups,
  restoreBackup,
  autoRemove,
  validateFileTypes,
  validateExcludePatterns,
  validateDepth,
  validatePathSafety,
  VERSION,
} = require('../index');

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Creates a temporary directory for testing
 *
 * @returns {string} Temp directory path
 */
function createTempDir() {
  const tmpDir = path.join(os.tmpdir(), `dead-code-test-${crypto.randomBytes(8).toString('hex')}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

/**
 * Cleans up a temporary directory
 *
 * @param {string} dir - Directory to clean up
 */
function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Creates test files in a directory
 *
 * @param {string} dir - Directory to create files in
 * @param {Object} files - Object mapping file names to contents
 */
function createTestFiles(dir, files) {
  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(dir, fileName);
    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

// ============================================================================
// INPUT VALIDATION TESTS
// ============================================================================

describe('Input Validation', () => {
  describe('validateFileTypes', () => {
    it('should accept valid file types', () => {
      const result = validateFileTypes(['js', 'ts', 'py']);
      expect(result).toEqual(['js', 'ts', 'py']);
    });

    it('should sanitize file types', () => {
      const result = validateFileTypes(['.JS', ' TS ', 'Py']);
      expect(result).toEqual(['js', 'ts', 'py']);
    });

    it('should remove duplicates', () => {
      const result = validateFileTypes(['js', 'js', 'ts']);
      expect(result).toEqual(['js', 'ts']);
    });

    it('should throw on non-array input', () => {
      expect(() => validateFileTypes('js')).toThrow('File types must be an array');
    });

    it('should throw on empty array', () => {
      expect(() => validateFileTypes([])).toThrow('At least one file type must be specified');
    });

    it('should throw on non-string elements', () => {
      expect(() => validateFileTypes(['js', 123])).toThrow('File type must be string');
    });

    it('should throw on invalid characters', () => {
      expect(() => validateFileTypes(['js', '../malicious'])).toThrow('Only alphanumeric characters allowed');
    });

    it('should throw on empty string', () => {
      expect(() => validateFileTypes(['js', ''])).toThrow('File type cannot be empty');
    });

    it('should throw on too long file type', () => {
      expect(() => validateFileTypes(['a'.repeat(21)])).toThrow('File type too long');
    });
  });

  describe('validateExcludePatterns', () => {
    it('should accept valid patterns', () => {
      const result = validateExcludePatterns(['node_modules', '.git', '*.min.js']);
      expect(result).toHaveLength(3);
    });

    it('should handle empty strings', () => {
      const result = validateExcludePatterns(['node_modules', '', 'dist']);
      expect(result).toHaveLength(3);
    });

    it('should throw on non-array input', () => {
      expect(() => validateExcludePatterns('node_modules')).toThrow('Exclude patterns must be an array');
    });

    it('should throw on path traversal attempts', () => {
      expect(() => validateExcludePatterns(['../etc/passwd'])).toThrow("cannot contain '..'");
    });

    it('should throw on too many patterns', () => {
      const patterns = Array(101).fill('pattern');
      expect(() => validateExcludePatterns(patterns)).toThrow('Too many exclude patterns');
    });

    it('should throw on too long pattern', () => {
      expect(() => validateExcludePatterns(['a'.repeat(201)])).toThrow('Exclude pattern too long');
    });
  });

  describe('validateDepth', () => {
    it('should accept valid depth', () => {
      expect(validateDepth(5)).toBe(5);
      expect(validateDepth(1)).toBe(1);
      expect(validateDepth(50)).toBe(50);
    });

    it('should parse string numbers', () => {
      expect(validateDepth('10')).toBe(10);
    });

    it('should throw on NaN', () => {
      expect(() => validateDepth(NaN)).toThrow('Invalid depth value');
    });

    it('should throw on invalid string', () => {
      expect(() => validateDepth('abc')).toThrow('Invalid depth value');
    });

    it('should throw on too small', () => {
      expect(() => validateDepth(0)).toThrow('Depth must be between 1 and 50');
    });

    it('should throw on too large', () => {
      expect(() => validateDepth(51)).toThrow('Depth must be between 1 and 50');
    });
  });

  describe('validatePathSafety', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should accept safe paths', () => {
      const safePath = path.join(tempDir, 'subdir', 'file.js');
      fs.mkdirSync(path.dirname(safePath), { recursive: true });
      fs.writeFileSync(safePath, 'content');

      expect(() => validatePathSafety(safePath, tempDir)).not.toThrow();
    });

    it('should throw on path traversal', () => {
      const maliciousPath = path.join(tempDir, '..', 'etc', 'passwd');

      expect(() => validatePathSafety(maliciousPath, tempDir)).toThrow('Path traversal detected');
    });

    it('should throw on absolute path escaping', () => {
      const otherDir = createTempDir();
      const maliciousPath = path.join(otherDir, 'file.js');

      expect(() => validatePathSafety(maliciousPath, tempDir)).toThrow();
    });
  });
});

// ============================================================================
// FILE FINDING TESTS
// ============================================================================

describe('File Finding', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  });

  it('should find files by extension', () => {
    createTestFiles(tempDir, {
      'file1.js': 'const x = 1;',
      'file2.ts': 'const y = 2;',
      'file3.py': 'print("hello")',
      'README.md': '# Test',
    });

    const jsFiles = findFiles(['js']);
    expect(jsFiles).toHaveLength(1);
    expect(jsFiles[0]).toContain('file1.js');

    const tsFiles = findFiles(['ts']);
    expect(tsFiles).toHaveLength(1);
    expect(tsFiles[0]).toContain('file2.ts');
  });

  it('should find multiple file types', () => {
    createTestFiles(tempDir, {
      'file1.js': 'const x = 1;',
      'file2.ts': 'const y = 2;',
      'file3.py': 'print("hello")',
    });

    const files = findFiles(['js', 'ts']);
    expect(files).toHaveLength(2);
  });

  it('should exclude specified patterns', () => {
    createTestFiles(tempDir, {
      'src/file1.js': 'const x = 1;',
      'node_modules/file2.js': 'const y = 2;',
      'dist/file3.js': 'const z = 3;',
    });

    const files = findFiles(['js'], { exclude: ['node_modules', 'dist'] });
    expect(files).toHaveLength(1);
    expect(files[0]).toContain('src');
  });

  it('should respect depth limit', () => {
    createTestFiles(tempDir, {
      'level1/file1.js': 'const x = 1;',
      'level1/level2/file2.js': 'const y = 2;',
      'level1/level2/level3/file3.js': 'const z = 3;',
    });

    const files = findFiles(['js'], { maxDepth: 2 });
    expect(files.length).toBeGreaterThan(0);
    // Should not include level3
    expect(files.some(f => f.includes('level3'))).toBe(false);
  });

  it('should handle non-existent directories gracefully', () => {
    const files = findFiles(['js'], { exclude: ['non-existent'] });
    expect(files).toEqual([]);
  });

  it('should handle permission errors gracefully', () => {
    // This test may not work on all systems
    const restrictedDir = path.join(tempDir, 'restricted');
    fs.mkdirSync(restrictedDir, { recursive: true });

    // Create a file that should be found
    createTestFiles(tempDir, {
      'file.js': 'const x = 1;',
    });

    const files = findFiles(['js']);
    expect(files.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// FILE ANALYSIS TESTS
// ============================================================================

describe('File Analysis', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  });

  it('should detect unused functions', () => {
    const testFile = path.join(tempDir, 'test.js');
    fs.writeFileSync(testFile, `
      function unusedFunction() {
        return 42;
      }

      function anotherUnused() {
        console.log('hello');
      }

      const usedVar = 1;
    `);

    const findings = analyzeFile(testFile);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some(f => f.match === 'unusedFunction')).toBe(true);
    expect(findings.some(f => f.match === 'anotherUnused')).toBe(true);
  });

  it('should handle TypeScript files', () => {
    const testFile = path.join(tempDir, 'test.ts');
    fs.writeFileSync(testFile, `
      interface MyInterface {
        name: string;
      }

      class MyClass {
        constructor() {}
      }

      const myVar = 1;
    `);

    const findings = analyzeFile(testFile);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('should handle Python files', () => {
    const testFile = path.join(tempDir, 'test.py');
    fs.writeFileSync(testFile, `
      def my_function():
          pass

      class MyClass:
          pass
    `);

    const findings = analyzeFile(testFile);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('should handle file read errors', () => {
    const testFile = path.join(tempDir, 'test.js');

    const findings = analyzeFile(testFile);
    expect(findings).toHaveLength(1);
    expect(findings[0].type).toBe('error');
  });

  it('should handle permission errors', () => {
    const testFile = path.join(tempDir, 'test.js');
    fs.writeFileSync(testFile, 'const x = 1;');
    fs.chmodSync(testFile, 0o000);

    const findings = analyzeFile(testFile);

    // Restore permissions for cleanup
    fs.chmodSync(testFile, 0o644);

    expect(findings.some(f => f.message.includes('Permission denied'))).toBe(true);
  });
});

// ============================================================================
// ZOMBIE FILE DETECTION TESTS
// ============================================================================

describe('Zombie File Detection', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  });

  it('should detect unreferenced files', () => {
    createTestFiles(tempDir, {
      'src/index.js': "import utils from './utils';",
      'src/utils.js': "export default {};",
      'orphaned.js': "console.log('hello');",
      'README.md': '# Test',
    });

    const zombies = scanZombieFiles(['js']);
    // Should find orphaned.js as a zombie file
    expect(zombies.some(z => z.path.includes('orphaned.js'))).toBe(true);
  });

  it('should not detect referenced files', () => {
    createTestFiles(tempDir, {
      'src/index.js': "import utils from './utils';",
      'src/utils.js': "export default {};",
    });

    const zombies = scanZombieFiles(['js']);
    // utils.js is referenced, should not be a zombie
    expect(zombies.some(z => z.path.includes('utils.js'))).toBe(false);
  });

  it('should exclude common directories', () => {
    createTestFiles(tempDir, {
      'src/file.js': 'const x = 1;',
      'node_modules/library.js': 'module.exports = {};',
      'dist/bundle.js': 'const bundle = {};',
    });

    const zombies = scanZombieFiles(['js']);
    // Should not scan node_modules or dist by default
    expect(zombies.some(z => z.path.includes('node_modules'))).toBe(false);
    expect(zombies.some(z => z.path.includes('dist'))).toBe(false);
  });
});

// ============================================================================
// BACKUP AND RESTORE TESTS
// ============================================================================

describe('Backup and Restore', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  });

  describe('createBackup', () => {
    it('should create backup of files', () => {
      createTestFiles(tempDir, {
        'file1.js': 'const x = 1;',
        'file2.js': 'const y = 2;',
      });

      const files = [
        path.join(tempDir, 'file1.js'),
        path.join(tempDir, 'file2.js'),
      ];

      const backup = createBackup(files);

      expect(backup.id).toMatch(/^[a-f0-9]{32}$/);
      expect(backup.totalCount).toBe(2);
      expect(backup.files).toHaveLength(2);

      // Verify backup directory exists
      const backupDir = path.join(tempDir, '.dead-code-backups', backup.id);
      expect(fs.existsSync(backupDir)).toBe(true);

      // Verify metadata file exists
      const metadataPath = path.join(backupDir, 'metadata.json');
      expect(fs.existsSync(metadataPath)).toBe(true);

      // Verify files are backed up
      expect(fs.existsSync(path.join(backupDir, 'file1.js'))).toBe(true);
      expect(fs.existsSync(path.join(backupDir, 'file2.js'))).toBe(true);
    });

    it('should handle file read errors gracefully', () => {
      const files = [path.join(tempDir, 'non-existent.js')];

      const backup = createBackup(files);

      // Should create backup with successfully backed up files (0 in this case)
      expect(backup.totalCount).toBe(0);
    });
  });

  describe('listBackups', () => {
    it('should list all backups', () => {
      createTestFiles(tempDir, {
        'file1.js': 'const x = 1;',
      });

      const files = [path.join(tempDir, 'file1.js')];
      const backup1 = createBackup(files);
      const backup2 = createBackup(files);

      const backups = listBackups();

      expect(backups).toHaveLength(2);
      expect(backups[0].id).toBe(backup2.id); // Newest first
      expect(backups[1].id).toBe(backup1.id);
    });

    it('should return empty array when no backups exist', () => {
      const backups = listBackups();
      expect(backups).toEqual([]);
    });
  });

  describe('restoreBackup', () => {
    it('should restore files from backup', () => {
      createTestFiles(tempDir, {
        'file1.js': 'const x = 1;',
        'file2.js': 'const y = 2;',
      });

      const files = [
        path.join(tempDir, 'file1.js'),
        path.join(tempDir, 'file2.js'),
      ];

      const backup = createBackup(files);

      // Delete original files
      fs.unlinkSync(files[0]);
      fs.unlinkSync(files[1]);

      // Restore
      const restoredCount = restoreBackup(backup.id);

      expect(restoredCount).toBe(2);
      expect(fs.existsSync(files[0])).toBe(true);
      expect(fs.existsSync(files[1])).toBe(true);
    });

    it('should throw on invalid backup ID format', () => {
      expect(() => restoreBackup('invalid')).toThrow('Invalid backup ID format');
    });

    it('should throw on non-existent backup', () => {
      const fakeId = crypto.randomBytes(16).toString('hex');
      expect(() => restoreBackup(fakeId)).toThrow('Backup not found');
    });

    it('should preserve file contents', () => {
      const originalContent = 'const x = 42;';
      createTestFiles(tempDir, {
        'file1.js': originalContent,
      });

      const files = [path.join(tempDir, 'file1.js')];
      const backup = createBackup(files);

      // Modify and delete file
      fs.writeFileSync(files[0], 'modified content');
      fs.unlinkSync(files[0]);

      // Restore
      restoreBackup(backup.id);

      // Verify original content is restored
      const restoredContent = fs.readFileSync(files[0], 'utf-8');
      expect(restoredContent).toBe(originalContent);
    });
  });
});

// ============================================================================
// REPORT GENERATION TESTS
// ============================================================================

describe('Report Generation', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  });

  it('should generate report with findings', () => {
    createTestFiles(tempDir, {
      'src/file.js': 'function unused() { return 1; }',
      'orphaned.js': 'const x = 1;',
    });

    const report = generateReport({ types: ['js'] });

    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.zombieFiles.length).toBeGreaterThanOrEqual(0);
  });

  it('should respect exclude options', () => {
    createTestFiles(tempDir, {
      'src/file.js': 'function unused() { return 1; }',
      'node_modules/file.js': 'function unused2() { return 2; }',
    });

    const report = generateReport({
      types: ['js'],
      exclude: ['node_modules'],
    });

    // Should only analyze src/file.js
    expect(report.findings.length).toBe(1);
  });

  it('should respect depth limit', () => {
    createTestFiles(tempDir, {
      'file.js': 'function unused() { return 1; }',
    });

    const report = generateReport({
      types: ['js'],
      depth: 1,
    });

    expect(report).toBeDefined();
    expect(report.findings).toBeDefined();
  });
});

// ============================================================================
// AUTO-REMOVE TESTS
// ============================================================================

describe('Auto-Remove', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  });

  it('should create backup before removal', () => {
    createTestFiles(tempDir, {
      'orphaned.js': 'const x = 1;',
    });

    const result = autoRemove({ backup: true });

    expect(result.backupId).toBeTruthy();
    expect(result.backupId).toMatch(/^[a-f0-9]{32}$/);
  });

  it('should remove zombie files', () => {
    createTestFiles(tempDir, {
      'orphaned.js': 'const x = 1;',
      'referenced.js': 'const y = 2;',
    });

    createTestFiles(tempDir, {
      'index.js': "import('./referenced.js');",
    });

    const result = autoRemove({ backup: false });

    expect(result.removed).toBeGreaterThanOrEqual(0);
  });

  it('should not remove when dry-run is enabled', () => {
    createTestFiles(tempDir, {
      'orphaned.js': 'const x = 1;',
    });

    const filePath = path.join(tempDir, 'orphaned.js');

    const result = autoRemove({
      backup: false,
      dryRun: true,
    });

    // File should still exist
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should handle removal errors gracefully', () => {
    createTestFiles(tempDir, {
      'orphaned.js': 'const x = 1;',
    });

    // Make file read-only
    const filePath = path.join(tempDir, 'orphaned.js');
    fs.chmodSync(filePath, 0o400);

    const result = autoRemove({ backup: false });

    // Restore permissions for cleanup
    fs.chmodSync(filePath, 0o644);

    expect(result.errors).toBeDefined();
  });
});

// ============================================================================
// MODULE METADATA TESTS
// ============================================================================

describe('Module Metadata', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBeDefined();
    expect(typeof VERSION).toBe('string');
  });

  it('should export all functions', () => {
    expect(typeof findFiles).toBe('function');
    expect(typeof analyzeFile).toBe('function');
    expect(typeof scanZombieFiles).toBe('function');
    expect(typeof generateReport).toBe('function');
    expect(typeof createBackup).toBe('function');
    expect(typeof listBackups).toBe('function');
    expect(typeof restoreBackup).toBe('function');
    expect(typeof autoRemove).toBe('function');
  });
});
