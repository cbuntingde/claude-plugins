#!/usr/bin/env node

/**
 * Generate Onboarding Documentation
 * Creates comprehensive onboarding documentation from codebase analysis.
 */

import { analyzeProjectForDocumentation } from '../index.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DEFAULT_OUTPUT_DIR = process.env.ONBOARDING_OUTPUT_DIR || './docs/onboarding';
const DEFAULT_ROLES = process.env.ONBOARDING_ROLES || 'developer';

/**
 * Generates comprehensive onboarding documentation.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated documentation path
 */
export async function generateOnboarding(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
  const roles = options.roles?.split(',') || DEFAULT_ROLES.split(',');

  const analysis = await analyzeProjectForDocumentation(projectRoot);
  const onboardingDoc = generateOnboardingDocument(analysis, roles);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, 'ONBOARDING.md');
  writeFileSync(outputPath, onboardingDoc);

  return outputPath;
}

/**
 * Generates the onboarding document content.
 * @param {Object} analysis - Project analysis
 * @param {string[]} roles - Target roles
 * @returns {string} Markdown content
 */
function generateOnboardingDocument(analysis, roles) {
  const lines = [];

  lines.push(`# ${analysis.name} - Onboarding Guide`);
  lines.push('');
  lines.push(`> Auto-generated on ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push('## Table of Contents');
  lines.push('');
  lines.push('- [Quick Start](#quick-start)');
  lines.push('- [Project Overview](#project-overview)');
  lines.push('- [Development Setup](#development-setup)');
  lines.push('- [Architecture](#architecture)');

  if (roles.includes('developer')) {
    lines.push('- [Developer Guide](#developer-guide)');
  }
  if (roles.includes('devops')) {
    lines.push('- [DevOps Guide](#devops-guide)');
  }
  if (roles.includes('qa')) {
    lines.push('- [QA Guide](#qa-guide)');
  }

  lines.push('- [Common Tasks](#common-tasks)');
  lines.push('- [Resources](#resources)');
  lines.push('');

  // Quick Start section
  lines.push('## Quick Start');
  lines.push('');
  lines.push('### Prerequisites');
  lines.push('');
  lines.push(`- **Language**: ${analysis.language}`);
  lines.push(`- **Framework**: ${analysis.framework}`);
  lines.push('- **Node.js**: 18+');
  lines.push('');
  lines.push('### 5-Minute Setup');
  lines.push('');
  lines.push('```bash');
  lines.push('# 1. Clone the repository');
  lines.push('git clone <repository-url>');
  lines.push(`cd ${analysis.name}`);
  lines.push('');
  lines.push('# 2. Install dependencies');
  lines.push('npm install');
  lines.push('');
  lines.push('# 3. Configure environment');
  lines.push('cp .env.example .env');
  lines.push('');
  lines.push('# 4. Start development server');
  lines.push('npm run dev');
  lines.push('```');
  lines.push('');
  lines.push('Once running, access the application at http://localhost:3000');
  lines.push('');

  // Project Overview section
  lines.push('## Project Overview');
  lines.push('');
  lines.push(`### What is ${analysis.name}?`);
  lines.push('');
  lines.push(`${analysis.name} is built with ${analysis.language} using the ${analysis.framework} framework.`);
  lines.push('');
  lines.push('### Key Features');
  lines.push('');
  lines.push('- API-first architecture');
  lines.push('- Modular component design');
  lines.push('- Comprehensive test coverage');
  lines.push('- CI/CD pipeline configured');
  lines.push('');
  lines.push('### Technology Stack');
  lines.push('');
  lines.push('| Category | Technology |');
  lines.push('|----------|------------|');
  lines.push(`| Language | ${analysis.language} |`);
  lines.push(`| Framework | ${analysis.framework} |`);
  lines.push('| API | REST |');
  lines.push(`| Testing | ${analysis.testSetup.framework} |`);
  lines.push('');
  lines.push('### Project Structure');
  lines.push('');
  lines.push('```');
  lines.push(`${analysis.name}/`);
  lines.push('├── src/                    # Source code');
  lines.push('├── tests/                  # Test files');
  lines.push('├── docs/                   # Documentation');
  lines.push('├── config/                 # Configuration files');
  lines.push('├── package.json           # Project manifest');
  lines.push('└── README.md             # Project README');
  lines.push('```');
  lines.push('');

  // Development Setup section
  lines.push('## Development Setup');
  lines.push('');
  lines.push('### System Requirements');
  lines.push('');
  lines.push('- Node.js 18 or higher');
  lines.push('- npm or yarn package manager');
  lines.push('- Git for version control');
  lines.push('');
  lines.push('### Installation');
  lines.push('');
  lines.push('```bash');
  lines.push('# Clone the repository');
  lines.push('git clone <repository-url>');
  lines.push(`cd ${analysis.name}`);
  lines.push('');
  lines.push('# Install dependencies');
  lines.push('npm install');
  lines.push('');
  lines.push('# Copy environment file');
  lines.push('cp .env.example .env');
  lines.push('');
  lines.push('# Verify installation');
  lines.push('npm run verify');
  lines.push('```');
  lines.push('');
  lines.push('### Environment Configuration');
  lines.push('');
  lines.push('Create a `.env` file based on `.env.example`:');
  lines.push('');
  lines.push('```env');
  lines.push('NODE_ENV=development');
  lines.push('PORT=3000');
  lines.push(`DATABASE_URL=postgresql://localhost:5432/${analysis.name}`);
  lines.push('REDIS_URL=redis://localhost:6379');
  lines.push('JWT_SECRET=your-secret-key');
  lines.push('```');
  lines.push('');
  lines.push('### Available Scripts');
  lines.push('');
  lines.push('| Script | Description |');
  lines.push('|--------|-------------|');
  lines.push('| `npm run dev` | Start development server |');
  lines.push('| `npm run build` | Build for production |');
  lines.push('| `npm run start` | Start production server |');
  lines.push('| `npm run test` | Run test suite |');
  lines.push('| `npm run lint` | Run ESLint |');
  lines.push('| `npm run format` | Format code with Prettier |');
  lines.push('');

  // Architecture section
  lines.push('## Architecture');
  lines.push('');
  lines.push('### High-Level Overview');
  lines.push('');
  lines.push('The application follows a layered architecture pattern:');
  lines.push('');
  lines.push('1. **Presentation Layer** - Controllers, Views, UI Components');
  lines.push('2. **Application Layer** - Services, Business Logic');
  lines.push('3. **Domain Layer** - Models, Entities, Business Rules');
  lines.push('4. **Infrastructure Layer** - Repositories, External Services');
  lines.push('');
  lines.push('### Directory Structure');
  lines.push('');
  lines.push('| Directory | Purpose |');
  lines.push('|-----------|---------|');
  lines.push('| `src/controllers` | HTTP request handlers |');
  lines.push('| `src/services` | Business logic |');
  lines.push('| `src/models` | Data models and entities |');
  lines.push('| `src/utils` | Helper functions |');
  lines.push('| `src/middleware` | Express middleware |');
  lines.push('| `src/routes` | Route definitions |');
  lines.push('| `src/config` | Configuration |');
  lines.push('');
  lines.push('### API Endpoints');
  lines.push('');

  if (analysis.apiEndpoints.length > 0) {
    lines.push('| Method | Endpoint | Description |');
    lines.push('|--------|----------|-------------|');
    for (const endpoint of analysis.apiEndpoints.slice(0, 10)) {
      lines.push(`| ${endpoint.method} | ${endpoint.path} | - |`);
    }
  } else {
    lines.push('No API endpoints detected in the codebase.');
  }
  lines.push('');

  lines.push('### Data Flow');
  lines.push('');
  lines.push('1. Client sends HTTP request');
  lines.push('2. Router matches endpoint to controller');
  lines.push('3. Controller validates input');
  lines.push('4. Controller calls service methods');
  lines.push('5. Service applies business logic');
  lines.push('6. Service calls repository for data access');
  lines.push('7. Repository interacts with database');
  lines.push('8. Response sent back to client');
  lines.push('');

  // Role-specific guides
  if (roles.includes('developer')) {
    lines.push('## Developer Guide');
    lines.push('');
    lines.push('### Coding Standards');
    lines.push('');
    lines.push(`- Follow ${analysis.language} best practices`);
    lines.push('- Use ESLint for code linting');
    lines.push('- Format code with Prettier');
    lines.push('- Write tests for all new features');
    lines.push('- Document public APIs with JSDoc');
    lines.push('');
    lines.push('### Adding New Features');
    lines.push('');
    lines.push('```bash');
    lines.push('# 1. Create feature branch');
    lines.push('git checkout -b feature/your-feature');
    lines.push('');
    lines.push('# 2. Implement the feature');
    lines.push('#    - Add controller');
    lines.push('#    - Add service');
    lines.push('#    - Add model (if needed)');
    lines.push('#    - Add routes');
    lines.push('');
    lines.push('# 3. Write tests');
    lines.push('npm test');
    lines.push('');
    lines.push('# 4. Verify linting');
    lines.push('npm run lint');
    lines.push('');
    lines.push('# 5. Commit and push');
    lines.push('git add .');
    lines.push('git commit -m "feat: add your feature"');
    lines.push('git push origin feature/your-feature');
    lines.push('```');
    lines.push('');
  }

  if (roles.includes('devops')) {
    lines.push('## DevOps Guide');
    lines.push('');
    lines.push('### Deployment Environments');
    lines.push('');
    lines.push('| Environment | URL | Purpose |');
    lines.push('|-------------|-----|---------|');
    lines.push(`| Development | dev.${analysis.name}.com | Development testing |`);
    lines.push(`| Staging | staging.${analysis.name}.com | Pre-production testing |`);
    lines.push(`| Production | ${analysis.name}.com | Live users |`);
    lines.push('');
    lines.push('### CI/CD Pipeline');
    lines.push('');
    lines.push('The project uses GitHub Actions for continuous integration and deployment:');
    lines.push('');
    lines.push('1. **Push to branch** - Run linting and tests');
    lines.push('2. **Pull request** - Build and integration tests');
    lines.push('3. **Merge to main** - Deploy to staging');
    lines.push('4. **Tag release** - Deploy to production');
    lines.push('');
    lines.push('### Building for Production');
    lines.push('');
    lines.push('```bash');
    lines.push('# Build the application');
    lines.push('npm run build');
    lines.push('');
    lines.push('# Build Docker image');
    lines.push(`docker build -t ${analysis.name}:latest .`);
    lines.push('');
    lines.push('# Run production build');
    lines.push('npm run start:production');
    lines.push('```');
    lines.push('');
  }

  if (roles.includes('qa')) {
    lines.push('## QA Guide');
    lines.push('');
    lines.push(`### Testing Framework`);
    lines.push('');
    lines.push(`The project uses ${analysis.testSetup.framework} for testing.`);
    lines.push('');
    lines.push('### Running Tests');
    lines.push('');
    lines.push('```bash');
    lines.push('# Run all tests');
    lines.push('npm test');
    lines.push('');
    lines.push('# Run tests with coverage');
    lines.push('npm run test:coverage');
    lines.push('');
    lines.push('# Run specific test file');
    lines.push('npm test -- path/to/test.spec.ts');
    lines.push('```');
    lines.push('');
    lines.push('### Code Coverage Requirements');
    lines.push('');
    lines.push('- Minimum: 80% line coverage');
    lines.push('- Critical paths: 100% coverage');
    lines.push('');
  }

  // Common Tasks section
  lines.push('## Common Tasks');
  lines.push('');
  lines.push('### Running the Application');
  lines.push('');
  lines.push('```bash');
  lines.push('# Development mode (with hot reload)');
  lines.push('npm run dev');
  lines.push('');
  lines.push('# Production mode');
  lines.push('npm run build && npm start');
  lines.push('```');
  lines.push('');
  lines.push('### Database Operations');
  lines.push('');
  lines.push('```bash');
  lines.push('# Run migrations');
  lines.push('npm run db:migrate');
  lines.push('');
  lines.push('# Seed database');
  lines.push('npm run db:seed');
  lines.push('');
  lines.push('# Reset database');
  lines.push('npm run db:reset');
  lines.push('```');
  lines.push('');
  lines.push('### Code Quality');
  lines.push('');
  lines.push('```bash');
  lines.push('# Check linting');
  lines.push('npm run lint');
  lines.push('');
  lines.push('# Format code');
  lines.push('npm run format');
  lines.push('');
  lines.push('# Type checking');
  lines.push('npm run typecheck');
  lines.push('```');
  lines.push('');
  lines.push('### Working with Git');
  lines.push('');
  lines.push('```bash');
  lines.push('# Create feature branch');
  lines.push('git checkout -b feature/your-feature');
  lines.push('');
  lines.push('# Commit changes');
  lines.push('git add .');
  lines.push('git commit -m "feat: description of changes"');
  lines.push('');
  lines.push('# Update from main');
  lines.push('git fetch origin');
  lines.push('git rebase origin/main');
  lines.push('```');
  lines.push('');

  // Resources section
  lines.push('## Resources');
  lines.push('');
  lines.push('### Documentation');
  lines.push('');
  lines.push('- [Project README](../README.md)');
  lines.push('- [API Documentation](API.md)');
  lines.push('- [Architecture Diagram](ARCHITECTURE.md)');
  lines.push('');
  lines.push('### External Links');
  lines.push('');
  lines.push(`- [${analysis.language} Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)`);
  lines.push(`- [${analysis.framework} Documentation](https://expressjs.com/)`);
  lines.push('- [Node.js Documentation](https://nodejs.org/docs/)');
  lines.push('');
  lines.push('### Getting Help');
  lines.push('');
  lines.push('- Check existing documentation');
  lines.push('- Search existing issues');
  lines.push('- Ask in team chat');
  lines.push(`- Contact: ${analysis.name} team`);
  lines.push('');
  lines.push('### Contributing');
  lines.push('');
  lines.push('See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.');
  lines.push('');

  return lines.join('\n') + '\n';
}

// CLI execution
if (process.argv[1] === import.meta.url) {
  const args = process.argv.slice(2);
  const options = {
    roles: args.find(arg => arg.startsWith('--roles='))?.split('=')[1],
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    projectRoot: args.find(arg => arg.startsWith('--project-root='))?.split('=')[1]
  };

  generateOnboarding(options)
    .then(path => {
      console.log(`Onboarding documentation generated at: ${path}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating onboarding documentation:', error.message);
      process.exit(1);
    });
}