#!/usr/bin/env node

/**
 * Quick Start Guide Generator
 * Creates condensed getting started guide for new team members.
 */

import { analyzeProjectForDocumentation } from '../index.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DEFAULT_OUTPUT_DIR = process.env.ONBOARDING_OUTPUT_DIR || './docs/onboarding';

/**
 * Generates a quick start guide.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated guide path
 */
export async function generateQuickStart(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;

  const analysis = await analyzeProjectForDocumentation(projectRoot);
  const quickStartDoc = generateQuickStartDocument(analysis);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = join(outputDir, 'QUICK_START.md');
  writeFileSync(outputPath, quickStartDoc);

  return outputPath;
}

/**
 * Generates the quick start document content.
 * @param {Object} analysis - Project analysis
 * @returns {string} Markdown content
 */
function generateQuickStartDocument(analysis) {
  const lines = [];

  lines.push(`# ${analysis.name} - Quick Start Guide`);
  lines.push('');
  lines.push('> **Time to complete**: 5 minutes | **Prerequisites**: Node.js 18+, Git');
  lines.push('');
  lines.push('## 1. Get the Code');
  lines.push('');
  lines.push('```bash');
  lines.push(`git clone <repository-url>`);
  lines.push(`cd ${analysis.name}`);
  lines.push('```');
  lines.push('');
  lines.push('## 2. Install Dependencies');
  lines.push('');
  lines.push('```bash');
  lines.push('npm install');
  lines.push('```');
  lines.push('');
  lines.push('## 3. Set Up Environment');
  lines.push('');
  lines.push('```bash');
  lines.push('cp .env.example .env');
  lines.push('```');
  lines.push('');
  lines.push('Edit `.env` with your local settings.');
  lines.push('');
  lines.push('## 4. Start Development Server');
  lines.push('');
  lines.push('```bash');
  lines.push('npm run dev');
  lines.push('```');
  lines.push('');
  lines.push('Application will be available at: **http://localhost:3000**');
  lines.push('');
  lines.push('## 5. Verify Setup');
  lines.push('');
  lines.push('```bash');
  lines.push('# Run tests');
  lines.push('npm test');
  lines.push('');
  lines.push('# Check linting');
  lines.push('npm run lint');
  lines.push('```');
  lines.push('');
  lines.push('## Key Commands');
  lines.push('');
  lines.push('| Command | Description |');
  lines.push('|---------|-------------|');
  lines.push('| `npm run dev` | Start dev server |');
  lines.push('| `npm test` | Run tests |');
  lines.push('| `npm run build` | Build for production |');
  lines.push('| `npm run lint` | Check code quality |');
  lines.push('');
  lines.push('## Project Structure');
  lines.push('');
  lines.push('```');
  lines.push('src/');
  lines.push('├── controllers/   # Request handlers');
  lines.push('├── services/      # Business logic');
  lines.push('├── models/        # Data models');
  lines.push('├── routes/        # API routes');
  lines.push('├── middleware/    # Custom middleware');
  lines.push('└── utils/         # Helper functions');
  lines.push('```');
  lines.push('');
  lines.push('## Common Tasks');
  lines.push('');
  lines.push('- **Add new endpoint**: Create in controllers/, add route in routes/');
  lines.push('- **Run tests**: `npm test`');
  lines.push('- **Debug**: Use VS Code Debug panel');
  lines.push('- **Database**: `npm run db:migrate`');
  lines.push('');
  lines.push('## Getting Help');
  lines.push('');
  lines.push('- Full documentation: [docs/onboarding/ONBOARDING.md](./ONBOARDING.md)');
  lines.push('- API docs: [docs/API.md](./API.md)');
  lines.push('- Ask in team chat');
  lines.push('');
  lines.push('---');
  lines.push(`*Generated for ${analysis.name} on ${new Date().toISOString().split('T')[0]}*`);

  return lines.join('\n') + '\n';
}

// CLI execution
if (process.argv[1] === import.meta.url) {
  const args = process.argv.slice(2);
  const options = {
    output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
    projectRoot: args.find(arg => arg.startsWith('--project-root='))?.split('=')[1]
  };

  generateQuickStart(options)
    .then(path => {
      console.log(`Quick start guide generated at: ${path}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating quick start guide:', error.message);
      process.exit(1);
    });
}