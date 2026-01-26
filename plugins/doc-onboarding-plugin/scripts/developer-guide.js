#!/usr/bin/env node

/**
 * Developer Guide Generator
 * Creates detailed developer documentation with coding standards and practices.
 */

import { analyzeProjectForDocumentation } from '../index.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

const DEFAULT_OUTPUT_DIR = process.env.ONBOARDING_OUTPUT_DIR || './docs/onboarding';

/**
 * Generates a developer guide.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated guide path
 */
export async function generateDeveloperGuide(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;

  const analysis = await analyzeProjectForDocumentation(projectRoot);
  const codingStandards = await extractCodingStandards(projectRoot);
  const developerDoc = generateDeveloperGuideDocument(analysis, codingStandards);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, 'DEVELOPER_GUIDE.md');
  writeFileSync(outputPath, developerDoc);

  return outputPath;
}

/**
 * Extracts coding standards from project configuration files.
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Object>} Coding standards information
 */
async function extractCodingStandards(projectRoot) {
  const standards = { linting: {}, formatting: {}, testing: {}, naming: {} };

  try {
    const eslintConfig = await findConfigFile(projectRoot, ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'eslint.config.js']);
    if (eslintConfig) {
      standards.linting.config = 'ESLint configured';
    }

    const prettierConfig = await findConfigFile(projectRoot, ['.prettierrc', '.prettierrc.js', '.prettierrc.json', 'prettier.config.js']);
    if (prettierConfig) {
      standards.formatting.config = 'Prettier configured';
    }

    const tsconfig = await findConfigFile(projectRoot, ['tsconfig.json']);
    if (tsconfig) {
      standards.linting.typescript = true;
    }
  } catch {
    // Use defaults if config files not found
  }

  return standards;
}

/**
 * Finds a configuration file in the project.
 * @param {string} projectRoot - Project root directory
 * @param {string[]} fileNames - File names to search for
 * @returns {Promise<string|null>} Path to config file or null
 */
async function findConfigFile(projectRoot, fileNames) {
  for (const fileName of fileNames) {
    const matches = await glob(fileName, { cwd: projectRoot, ignore: ['node_modules/**', '.git/**'] });
    if (matches.length > 0) {
      return join(projectRoot, matches[0]);
    }
  }
  return null;
}

/**
 * Generates the developer guide document content.
 * @param {Object} analysis - Project analysis
 * @param {Object} codingStandards - Coding standards information
 * @returns {string} Markdown content
 */
function generateDeveloperGuideDocument(analysis, codingStandards) {
  const lines = [];

  lines.push(`# ${analysis.name} - Developer Guide`);
  lines.push('');
  lines.push(`> Auto-generated on ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push('## Table of Contents');
  lines.push('');
  lines.push('- [Overview](#overview)');
  lines.push('- [Development Environment](#development-environment)');
  lines.push('- [Project Structure](#project-structure)');
  lines.push('- [Coding Standards](#coding-standards)');
  lines.push('- [Architecture](#architecture)');
  lines.push('- [API Development](#api-development)');
  lines.push('- [Testing](#testing)');
  lines.push('- [Debugging](#debugging)');
  lines.push('- [Deployment](#deployment)');
  lines.push('- [Troubleshooting](#troubleshooting)');
  lines.push('');

  // Overview section
  lines.push('## Overview');
  lines.push('');
  lines.push('### Technology Stack');
  lines.push('');
  lines.push('| Layer | Technology |');
  lines.push('|-------|------------|');
  lines.push('| Runtime | Node.js 18+ |');
  lines.push(`| Language | ${analysis.language} |`);
  lines.push(`| Framework | ${analysis.framework} |`);
  lines.push('| API Style | REST |');
  lines.push(`| Testing | ${analysis.testSetup.framework} |`);
  lines.push('');
  lines.push('### Key Features');
  lines.push('');
  lines.push('- Modular, component-based architecture');
  lines.push('- RESTful API design');
  lines.push('- Comprehensive test coverage');
  lines.push('- CI/CD pipeline with automated testing');
  lines.push('- Docker support for containerized deployments');
  lines.push('');

  // Dev Environment section
  lines.push('## Development Environment');
  lines.push('');
  lines.push('### Required Tools');
  lines.push('');
  lines.push('- **Node.js 18+** - Runtime environment');
  lines.push('- **npm or yarn** - Package manager');
  lines.push('- **Git** - Version control');
  lines.push('- **VS Code** - Recommended editor (see workspace settings)');
  lines.push('');
  lines.push('### Recommended VS Code Extensions');
  lines.push('');
  lines.push('- ESLint - Code linting');
  lines.push('- Prettier - Code formatting');
  lines.push('- TypeScript - Type checking');
  lines.push('- GitLens - Enhanced Git integration');
  lines.push('');
  lines.push('### Initial Setup');
  lines.push('');
  lines.push('```bash');
  lines.push('# 1. Clone repository');
  lines.push('git clone <repo-url>');
  lines.push(`cd ${analysis.name}`);
  lines.push('');
  lines.push('# 2. Install dependencies');
  lines.push('npm install');
  lines.push('');
  lines.push('# 3. Set up environment');
  lines.push('cp .env.example .env');
  lines.push('');
  lines.push('# 4. Verify setup');
  lines.push('npm run verify');
  lines.push('```');
  lines.push('');
  lines.push('### Linting and Formatting');
  lines.push('');
  lines.push(`${codingStandards.linting.config || 'Run `npm run lint` to check code quality.'}`);
  lines.push('');
  lines.push(`${codingStandards.formatting.config || 'Run `npm run format` to format code.'}`);
  lines.push('');

  // Project Structure section
  lines.push('## Project Structure');
  lines.push('');
  lines.push('```');
  lines.push(`${analysis.name}/`);
  lines.push('├── .github/                 # GitHub Actions CI/CD');
  lines.push('├── .vscode/                 # VS Code settings');
  lines.push('├── config/                  # Configuration files');
  lines.push('├── docs/                    # Documentation');
  lines.push('├── scripts/                 # Build and utility scripts');
  lines.push('├── src/                     # Application source');
  lines.push('│   ├── controllers/        # Request handlers');
  lines.push('│   ├── services/           # Business logic');
  lines.push('│   ├── models/             # Data models');
  lines.push('│   ├── routes/             # API routes');
  lines.push('│   ├── middleware/         # Custom middleware');
  lines.push('│   ├── utils/              # Helper functions');
  lines.push('│   ├── config/             # App configuration');
  lines.push('│   └── index.ts             # Entry point');
  lines.push('├── tests/                   # Test files');
  lines.push('├── package.json            # Dependencies and scripts');
  lines.push('├── tsconfig.json           # TypeScript config');
  lines.push('├── .eslintrc.json          # ESLint config');
  lines.push('└── .env.example            # Environment template');
  lines.push('```');
  lines.push('');
  lines.push('### Directory Guidelines');
  lines.push('');
  lines.push('| Directory | Purpose | Rules |');
  lines.push('|-----------|---------|-------|');
  lines.push('| `controllers/` | HTTP handlers | One file per endpoint |');
  lines.push('| `services/` | Business logic | No HTTP concerns |');
  lines.push('| `models/` | Data models | Database schemas |');
  lines.push('| `routes/` | Route definitions | Mount controllers |');
  lines.push('| `middleware/` | Custom middleware | Reusable functions |');
  lines.push('| `utils/` | Helpers | Pure functions preferred |');
  lines.push('');

  // Coding Standards section
  lines.push('## Coding Standards');
  lines.push('');
  lines.push('### JavaScript/TypeScript Style');
  lines.push('');
  lines.push('- Use **ES modules** (import/export)');
  lines.push('- Enable **strict mode** in TypeScript');
  lines.push('- Use **async/await** for asynchronous code');
  lines.push('- Prefer **const** over **let**, avoid **var**');
  lines.push('- Use **camelCase** for variables and functions');
  lines.push('- Use **PascalCase** for classes and interfaces');
  lines.push('- Use **SCREAMING_SNAKE_CASE** for constants');
  lines.push('');
  lines.push('### Code Organization');
  lines.push('');
  lines.push('- Keep functions small (single responsibility)');
  lines.push('- Limit file length (max ~300 lines preferred)');
  lines.push('- Use named exports for modules');
  lines.push('- Avoid deeply nested code (>3 levels)');
  lines.push('- Extract reusable logic to utilities');
  lines.push('');
  lines.push('### Error Handling');
  lines.push('');
  lines.push('```typescript');
  lines.push('// Use try/catch for async operations');
  lines.push('try {');
  lines.push('  const result = await service.method();');
  lines.push('  return result;');
  lines.push('} catch (error) {');
  lines.push('  logger.error("Operation failed", { error: error.message });');
  lines.push('  throw new AppError("Operation failed", 500);');
  lines.push('}');
  lines.push('```');
  lines.push('');
  lines.push('### Comments and Documentation');
  lines.push('');
  lines.push('- Use JSDoc for public APIs');
  lines.push('- Explain "why", not "what"');
  lines.push('- Keep comments current with code');
  lines.push('- Avoid commented-out code');
  lines.push('');
  lines.push('### Git Commit Messages');
  lines.push('');
  lines.push('Follow Conventional Commits:');
  lines.push('');
  lines.push('| Type | Description |');
  lines.push('|------|-------------|');
  lines.push('| `feat:` | New feature |');
  lines.push('| `fix:` | Bug fix |');
  lines.push('| `docs:` | Documentation changes |');
  lines.push('| `style:` | Formatting, semicolons, etc. |');
  lines.push('| `refactor:` | Code restructuring |');
  lines.push('| `test:` | Adding tests |');
  lines.push('| `chore:` | Maintenance |');
  lines.push('');

  // Architecture section
  lines.push('## Architecture');
  lines.push('');
  lines.push('### Design Pattern');
  lines.push('');
  lines.push('The application follows a layered architecture pattern:');
  lines.push('');
  lines.push('1. **Presentation Layer** - Controllers handle HTTP requests');
  lines.push('2. **Application Layer** - Services contain business logic');
  lines.push('3. **Domain Layer** - Models define data structures');
  lines.push('4. **Infrastructure Layer** - Repositories handle data access');
  lines.push('');
  lines.push('### Request Flow');
  lines.push('');
  lines.push('```');
  lines.push('HTTP Request');
  lines.push('    ↓');
  lines.push('Middleware (auth, logging, validation)');
  lines.push('    ↓');
  lines.push('Router → Controller');
  lines.push('    ↓');
  lines.push('Service (business logic)');
  lines.push('    ↓');
  lines.push('Repository (data access)');
  lines.push('    ↓');
  lines.push('Database / External Services');
  lines.push('    ↓');
  lines.push('Response');
  lines.push('```');
  lines.push('');
  lines.push('### Component Responsibilities');
  lines.push('');
  lines.push('| Component | Responsibility |');
  lines.push('|-----------|----------------|');
  lines.push('| Controller | Parse request, validate input, call service, format response |');
  lines.push('| Service | Business logic, coordination, transformations |');
  lines.push('| Repository | Database CRUD operations, queries |');
  lines.push('| Model | Data validation, schema definition |');
  lines.push('| Middleware | Cross-cutting concerns (auth, logging) |');
  lines.push('');

  // API Development section
  lines.push('## API Development');
  lines.push('');
  lines.push('### RESTful Conventions');
  lines.push('');
  lines.push('- Use **plural** nouns for resources: `/users`, `/products`');
  lines.push('- Use **HTTP methods** correctly:');
  lines.push('  - `GET` - Retrieve resource');
  lines.push('  - `POST` - Create resource');
  lines.push('  - `PUT` - Replace resource');
  lines.push('  - `PATCH` - Partial update');
  lines.push('  - `DELETE` - Remove resource');
  lines.push('- Use **status codes** appropriately:');
  lines.push('  - `200` - Success');
  lines.push('  - `201` - Created');
  lines.push('  - `400` - Bad request');
  lines.push('  - `401` - Unauthorized');
  lines.push('  - `404` - Not found');
  lines.push('  - `500` - Server error');
  lines.push('');
  lines.push('### Creating a New Endpoint');
  lines.push('');
  lines.push('```typescript');
  lines.push('// 1. Create controller: src/controllers/users.ts');
  lines.push('export async function getUser(req, res) {');
  lines.push('  const { id } = req.params;');
  lines.push('  const user = await userService.findById(id);');
  lines.push('  res.json(user);');
  lines.push('}');
  lines.push('');
  lines.push('// 2. Add route: src/routes/users.ts');
  lines.push("router.get('/users/:id', getUser);");
  lines.push('');
  lines.push('// 3. Add tests: tests/users.test.ts');
  lines.push("describe('GET /users/:id', () => {");
  lines.push("  it('returns user by id', async () => {");
  lines.push('    const user = await request.get("/users/1");');
  lines.push('    expect(user.status).toBe(200);');
  lines.push('  });');
  lines.push('});');
  lines.push('```');
  lines.push('');
  lines.push('### API Endpoints');
  lines.push('');

  if (analysis.apiEndpoints.length > 0) {
    lines.push('| Method | Endpoint | Description |');
    lines.push('|--------|----------|-------------|');
    for (const endpoint of analysis.apiEndpoints.slice(0, 15)) {
      lines.push(`| ${endpoint.method} | ${endpoint.path} | - |`);
    }
    if (analysis.apiEndpoints.length > 15) {
      lines.push(`| ... | And ${analysis.apiEndpoints.length - 15} more | |`);
    }
  } else {
    lines.push('No API endpoints detected. Add routes to `src/routes/`');
  }
  lines.push('');

  // Testing section
  lines.push('## Testing');
  lines.push('');
  lines.push(`### Testing Framework`);
  lines.push('');
  lines.push(`This project uses **${analysis.testSetup.framework}** for testing.`);
  lines.push('');
  lines.push('### Running Tests');
  lines.push('');
  lines.push('```bash');
  lines.push('# Run all tests');
  lines.push('npm test');
  lines.push('');
  lines.push('# Run with coverage report');
  lines.push('npm run test:coverage');
  lines.push('');
  lines.push('# Run in watch mode');
  lines.push('npm run test:watch');
  lines.push('');
  lines.push('# Run specific test file');
  lines.push('npm test -- users.test.ts');
  lines.push('```');
  lines.push('');
  lines.push('### Test Types');
  lines.push('');
  lines.push('| Type | Description | Location |');
  lines.push('|------|-------------|----------|');
  lines.push('| Unit | Test individual functions | `tests/unit` |');
  lines.push('| Integration | Test component interactions | `tests/integration` |');
  lines.push('| E2E | Test full user flows | `tests/e2e` |');
  lines.push('');
  lines.push('### Writing Tests');
  lines.push('');
  lines.push('```typescript');
  lines.push("describe('UserService', () => {");
  lines.push("  describe('findById', () => {");
  lines.push("    it('should return user when found', async () => {");
  lines.push('      // Arrange');
  lines.push('      const mockUser = { id: "1", name: "John" };');
  lines.push('      repository.findById.mockResolvedValue(mockUser);');
  lines.push('');
  lines.push('      // Act');
  lines.push('      const result = await service.findById("1");');
  lines.push('');
  lines.push('      // Assert');
  lines.push('      expect(result).toEqual(mockUser);');
  lines.push('    });');
  lines.push('');
    lines.push("    it('should throw error when not found', async () => {");
    lines.push('      // Arrange');
    lines.push('      repository.findById.mockResolvedValue(null);');
    lines.push('');
      lines.push('      // Act and Assert');
    lines.push('      await expect(service.findById("999")).rejects.toThrow(NotFoundError);');
      lines.push('    });');
  lines.push('  });');
  lines.push('});');
  lines.push('```');
  lines.push('');
  lines.push('### Coverage Requirements');
  lines.push('');
  lines.push('- Minimum: 80% line coverage');
  lines.push('- Critical paths: 100% coverage required');
  lines.push('');

  // Debugging section
  lines.push('## Debugging');
  lines.push('');
  lines.push('### VS Code Debugger');
  lines.push('');
  lines.push('1. Open the Debug panel (Ctrl+Shift+D)');
  lines.push('2. Select a debug configuration');
  lines.push('3. Set breakpoints in your code');
  lines.push('4. Press F5 to start debugging');
  lines.push('');
  lines.push('### Console Logging');
  lines.push('');
  lines.push('```javascript');
  lines.push('// Use structured logging');
  lines.push('logger.info("Operation completed", { userId, action });');
  lines.push('logger.error("Operation failed", { error: error.message });');
  lines.push('');
  lines.push('// Debug specific areas');
  lines.push('logger.debug("Variable state", { variable });');
  lines.push('```');
  lines.push('');
  lines.push('### Common Issues');
  lines.push('');
  lines.push('| Issue | Solution |');
  lines.push('|-------|----------|');
  lines.push('| Changes not reflected | Restart dev server |');
  lines.push('| Tests failing | Check mock setup |');
  lines.push('| Type errors | Run `npm run typecheck` |');
  lines.push('| Linting errors | Run `npm run lint:fix` |');
  lines.push('');

  // Deployment section
  lines.push('## Deployment');
  lines.push('');
  lines.push('### Environments');
  lines.push('');
  lines.push('| Environment | URL | Branch |');
  lines.push('|-------------|-----|-------|');
  lines.push('| Development | dev.project.com | `develop` |');
  lines.push('| Staging | staging.project.com | `main` |');
  lines.push('| Production | project.com | `release/*` |');
  lines.push('');
  lines.push('### Building for Production');
  lines.push('');
  lines.push('```bash');
  lines.push('# Build the application');
  lines.push('npm run build');
  lines.push('');
  lines.push('# Test production build locally');
  lines.push('npm run start:prod');
  lines.push('```');
  lines.push('');
  lines.push('### Docker Deployment');
  lines.push('');
  lines.push('```bash');
  lines.push('# Build image');
  lines.push(`docker build -t \${PROJECT_NAME}:latest .`);
  lines.push('');
  lines.push('# Run container');
  lines.push(`docker run -p 3000:3000 \${PROJECT_NAME}:latest`);
  lines.push('```');
  lines.push('');
  lines.push('### CI/CD Pipeline');
  lines.push('');
  lines.push('The pipeline runs on every push:');
  lines.push('');
  lines.push('1. Install dependencies');
  lines.push('2. Run linting');
  lines.push('3. Run type checking');
  lines.push('4. Run tests');
  lines.push('5. Build application');
  lines.push('6. Deploy to environment');
  lines.push('');

  // Troubleshooting section
  lines.push('## Troubleshooting');
  lines.push('');
  lines.push('### Installation Issues');
  lines.push('');
  lines.push('**Node version mismatch**');
  lines.push('```bash');
  lines.push('# Check Node version');
  lines.push('node -v');
  lines.push('# Use nvm to switch versions');
  lines.push('nvm use 18');
  lines.push('```');
  lines.push('');
  lines.push('**Dependencies not installing**');
  lines.push('```bash');
  lines.push('# Clear npm cache');
  lines.push('npm cache clean --force');
  lines.push('');
  lines.push('# Remove node_modules and reinstall');
  lines.push('rm -rf node_modules package-lock.json');
  lines.push('npm install');
  lines.push('```');
  lines.push('');
  lines.push('### Runtime Issues');
  lines.push('');
  lines.push('**Server wont start**');
  lines.push('- Check `.env` file is configured');
  lines.push('- Verify database is running');
  lines.push('- Check port is not already in use');
  lines.push('');
  lines.push('**Database connection failed**');
  lines.push('- Verify DATABASE_URL in `.env`');
  lines.push('- Ensure database server is running');
  lines.push('- Run migrations: `npm run db:migrate`');
  lines.push('');
  lines.push('### Getting Help');
  lines.push('');
  lines.push('- Check existing documentation');
  lines.push('- Search past issues on GitHub');
  lines.push('- Ask in team Slack channel');
  lines.push('- Contact: dev-team@company.com');

  return lines.join('\n') + '\n';
}

// CLI execution
if (process.argv[1] === import.meta.url) {
  const args = process.argv.slice(2);
  const options = {
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    projectRoot: args.find(arg => arg.startsWith('--project-root='))?.split('=')[1]
  };

  generateDeveloperGuide(options)
    .then(path => {
      console.log(`Developer guide generated at: ${path}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating developer guide:', error.message);
      process.exit(1);
    });
}