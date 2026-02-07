/**
 * Documentation Onboarding Plugin
 * Generates comprehensive onboarding documentation and developer guides from codebase analysis.
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';
import { join, basename } from 'path';

export const name = 'doc-onboarding';
export const version = '1.0.0';
export const commands = {
  'generate-onboarding': './scripts/generate-onboarding.js',
  'quick-start': './scripts/quick-start.js',
  'developer-guide': './scripts/developer-guide.js'
};

/**
 * Analyzes project structure and extracts documentation information.
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<Object>} Project analysis data
 */
export async function analyzeProjectForDocumentation(projectRoot) {
  const sourcePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py', '**/*.go'];
  const configPatterns = ['**/package.json', '**/tsconfig.json', '**/pyproject.toml', '**/requirements.txt', '**/.env.example'];
  const docsPatterns = ['**/*.md', '**/README*', '**/CHANGELOG*', '**/CONTRIBUTING*'];

  const sourceFiles = [];
  for (const pattern of sourcePatterns) {
    const matches = await glob(pattern, { cwd: projectRoot, ignore: ['node_modules/**', '.git/**'] });
    sourceFiles.push(...matches);
  }

  const configFiles = [];
  for (const pattern of configPatterns) {
    const matches = await glob(pattern, { cwd: projectRoot, ignore: ['node_modules/**', '.git/**'] });
    configFiles.push(...matches);
  }

  const docsFiles = [];
  for (const pattern of docsPatterns) {
    const matches = await glob(pattern, { cwd: projectRoot, ignore: ['node_modules/**', '.git/**'] });
    docsFiles.push(...matches);
  }

  const projectInfo = {
    name: extractProjectName(projectRoot),
    language: detectLanguage(sourceFiles),
    framework: detectFramework(sourceFiles),
    entryPoints: identifyEntryPoints(sourceFiles),
    dependencies: extractDependencies(projectRoot),
    commands: identifyCommands(sourceFiles),
    apiEndpoints: identifyApiEndpoints(sourceFiles),
    testSetup: detectTestSetup(projectRoot),
    structure: categorizeFiles(sourceFiles)
  };

  return projectInfo;
}

/**
 * Extracts project name from package.json or directory.
 * @param {string} projectRoot - Project root directory
 * @returns {string} Project name
 */
function extractProjectName(projectRoot) {
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.name || basename(projectRoot);
  } catch {
    return basename(projectRoot);
  }
}

/**
 * Detects the primary programming language.
 * @param {string[]} files - List of source files
 * @returns {string} Detected language
 */
function detectLanguage(files) {
  const extensions = files.map(f => f.split('.').pop()).reduce((acc, ext) => {
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(extensions).sort((a, b) => b[1] - a[1]);
  const languageMap = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'jsx': 'JavaScript (React)',
    'tsx': 'TypeScript (React)',
    'py': 'Python',
    'go': 'Go'
  };

  return languageMap[sorted[0]?.[0]] || 'Unknown';
}

/**
 * Detects the framework being used.
 * @param {string[]} files - List of source files
 * @returns {string} Detected framework
 */
function detectFramework(files) {
  const content = files.slice(0, 20).map(f => {
    try {
      return readFileSync(f, 'utf-8');
    } catch {
      return '';
    }
  }).join('\n');

  const frameworks = [
    { name: 'Express', pattern: /express|from\s+['"]express['"]/i },
    { name: 'Fastify', pattern: /fastify|from\s+['"]fastify['"]/i },
    { name: 'React', pattern: /react|from\s+['"]react['"]|import\s+\{.*React.*\}/i },
    { name: 'Vue', pattern: /vue|from\s+['"]vue['"]/i },
    { name: 'Next.js', pattern: /next|from\s+['"]next[\\/]/i },
    { name: 'NestJS', pattern: /nestjs|from\s+['"]@nestjs[\\/]/i },
    { name: 'Django', pattern: /django|from\s+['"]django['"]/i },
    { name: 'Flask', pattern: /flask|from\s+['"]flask['"]/i },
    { name: 'Gin', pattern: /gin-gonic\/gin|from\s+['"]github.com\/gin-gonic\/gin['"]/i }
  ];

  for (const framework of frameworks) {
    if (framework.pattern.test(content)) {
      return framework.name;
    }
  }

  return 'None detected';
}

/**
 * Identifies entry points of the application.
 * @param {string[]} files - List of source files
 * @returns {string[]} Entry point files
 */
function identifyEntryPoints(files) {
  const entryPatterns = [
    /index\.(js|ts|jsx|tsx)$/,
    /main\.(js|ts|jsx|tsx)$/,
    /app\.(js|ts|jsx|tsx)$/,
    /server\.(js|ts)$/,
    /entry\.(js|ts)$/,
    /bootstrap\.(js|ts)$/
  ];

  return files.filter(f => entryPatterns.some(p => p.test(basename(f))));
}

/**
 * Extracts dependencies from package.json.
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Dependencies categorized by type
 */
function extractDependencies(projectRoot) {
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    return {
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      scripts: Object.keys(packageJson.scripts || {})
    };
  } catch {
    return { dependencies: [], devDependencies: [], scripts: [] };
  }
}

/**
 * Identifies command/CLI patterns in the codebase.
 * @param {string[]} files - List of source files
 * @returns {string[]} Identified commands
 */
function identifyCommands(files) {
  const commands = [];

  for (const file of files.slice(0, 50)) {
    try {
      const content = readFileSync(file, 'utf-8');
      const cliPatterns = [
        /yargs\.command\s*\(\s*['"]([^'"]+)/g,
        /commander\.(command|version)\s*\(['"]([^'"]+)/g,
        /meow\s*\([^)]*help:\s*([^)]+)/g
      ];

      for (const pattern of cliPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1] && !commands.includes(match[1])) {
            commands.push(match[1]);
          }
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return commands;
}

/**
 * Identifies API endpoint patterns.
 * @param {string[]} files - List of source files
 * @returns {string[]} Identified API endpoints
 */
function identifyApiEndpoints(files) {
  const endpoints = [];
  const endpointPattern = /(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)|router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)|@Route\s*\(\s*['"]([^'"]+)|@\((get|post|put|patch|delete)\)\s*['"]([^'"]+)/gi;

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      let match;
      while ((match = endpointPattern.exec(content)) !== null) {
        const endpoint = match[2] || match[3] || match[4] || match[5];
        const method = (match[1] || match[2] || match[3] || match[4] || match[5] || '').toUpperCase();
        if (endpoint && !endpoints.find(e => e.path === endpoint)) {
          endpoints.push({ method, path: endpoint });
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return endpoints.slice(0, 20);
}

/**
 * Detects test setup and configuration.
 * @param {string} projectRoot - Project root directory
 * @returns {Object} Test configuration info
 */
function detectTestSetup(projectRoot) {
  const testPatterns = [
    'jest.config.js',
    'jest.config.ts',
    'vitest.config.ts',
    'playwright.config.ts',
    'cypress.config.js',
    'pytest.ini',
    'conftest.py',
    'tests',
    '__tests__',
    'test'
  ];

  const testInfo = {
    framework: 'None detected',
    files: []
  };

  for (const pattern of testPatterns) {
    const matches = glob.sync(pattern, { cwd: projectRoot, ignore: ['node_modules/**', '.git/**'] });
    if (matches.length > 0) {
      testInfo.files.push(...matches);
    }
  }

  if (testInfo.files.length > 0) {
    const configFiles = testInfo.files.filter(f => f.endsWith('.config.js') || f.endsWith('.config.ts'));
    for (const configFile of configFiles) {
      if (configFile.includes('jest')) testInfo.framework = 'Jest';
      else if (configFile.includes('vitest')) testInfo.framework = 'Vitest';
      else if (configFile.includes('playwright')) testInfo.framework = 'Playwright';
      else if (configFile.includes('cypress')) testInfo.framework = 'Cypress';
    }
    if (testInfo.framework === 'None detected' && testInfo.files.some(f => f.includes('test') || f.includes('spec'))) {
      testInfo.framework = 'Unknown (check __tests__ folder)';
    }
  }

  return testInfo;
}

/**
 * Categorizes files by their directory structure.
 * @param {string[]} files - List of source files
 * @returns {Object} Categorized files
 */
function categorizeFiles(files) {
  const categories = {
    controllers: [],
    services: [],
    models: [],
    views: [],
    utils: [],
    middleware: [],
    routes: [],
    config: [],
    other: []
  };

  const categoryPatterns = [
    { pattern: /controllers?[_\/]/i, category: 'controllers' },
    { pattern: /services?[_\/]/i, category: 'services' },
    { pattern: /models?[_\/]|entities?[_\/]/i, category: 'models' },
    { pattern: /views?[_\/]|templates?[_\/]/i, category: 'views' },
    { pattern: /utils?[_\/]|helpers?[_\/]/i, category: 'utils' },
    { pattern: /middleware[s]?[_\/]/i, category: 'middleware' },
    { pattern: /routes?[_\/]/i, category: 'routes' },
    { pattern: /config[s]?[_\/]/i, category: 'config' }
  ];

  for (const file of files) {
    let categorized = false;
    for (const { pattern, category } of categoryPatterns) {
      if (pattern.test(file)) {
        categories[category].push(file);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categories.other.push(file);
    }
  }

  return categories;
}