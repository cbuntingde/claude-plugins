#!/usr/bin/env node
/**
 * GitHub Actions Pipeline Generator
 * Generates GitHub Actions workflow files for CI/CD pipelines
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    language: 'auto',
    packageManager: 'auto',
    testRunner: 'auto',
    type: 'auto',
    deploy: 'none',
    dockerRegistry: 'ghcr',
    cache: true,
    parallel: 'auto',
    matrix: null,
    environment: 'dev',
    branch: 'main',
    template: 'basic'
  };

  for (const arg of args) {
    if (arg.startsWith('--language=')) {
      options.language = arg.split('=')[1];
    } else if (arg.startsWith('--package-manager=')) {
      options.packageManager = arg.split('=')[1];
    } else if (arg.startsWith('--test-runner=')) {
      options.testRunner = arg.split('=')[1];
    } else if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1];
    } else if (arg.startsWith('--deploy=')) {
      options.deploy = arg.split('=')[1];
    } else if (arg.startsWith('--docker-registry=')) {
      options.dockerRegistry = arg.split('=')[1];
    } else if (arg === '--no-cache') {
      options.cache = false;
    } else if (arg.startsWith('--matrix=')) {
      options.matrix = arg.split('=')[1];
    } else if (arg.startsWith('--environment=')) {
      options.environment = arg.split('=')[1];
    } else if (arg.startsWith('--branch=')) {
      options.branch = arg.split('=')[1];
    } else if (arg.startsWith('--template=')) {
      options.template = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Detect project language from existing files
 */
function detectProjectLanguage(projectDir) {
  const indicators = [
    { file: 'package.json', lang: 'nodejs', pm: 'npm' },
    { file: 'requirements.txt', lang: 'python', pm: 'pip' },
    { file: 'pom.xml', lang: 'java', pm: 'maven' },
    { file: 'go.mod', lang: 'go', pm: 'go' },
    { file: 'Cargo.toml', lang: 'rust', pm: 'cargo' },
    { file: 'composer.json', lang: 'php', pm: 'composer' }
  ];

  for (const ind of indicators) {
    if (existsSync(join(projectDir, ind.file))) {
      return { language: ind.lang, packageManager: ind.pm };
    }
  }

  return { language: 'nodejs', packageManager: 'npm' };
}

/**
 * Get cache paths for package manager
 */
function getCachePaths(packageManager) {
  const paths = {
    npm: ['node_modules'],
    yarn: ['node_modules'],
    pnpm: ['node_modules'],
    pip: ['~/.cache/pip'],
    maven: ['~/.m2'],
    go: ['~/.cache/go-build'],
    cargo: ['~/.cargo'],
    composer: ['vendor']
  };
  return paths[packageManager] || ['node_modules'];
}

/**
 * Get lock file for package manager
 */
function getLockFile(packageManager) {
  const lockFiles = {
    npm: 'package-lock.json',
    yarn: 'yarn.lock',
    pnpm: 'pnpm-lock.yaml',
    pip: 'requirements.txt',
    maven: 'pom.xml',
    go: 'go.sum',
    cargo: 'Cargo.lock',
    composer: 'composer.lock'
  };
  return lockFiles[packageManager] || 'package-lock.json';
}

/**
 * Get test command for language
 */
function getTestCommand(language, packageManager) {
  const commands = {
    nodejs: 'npm test',
    python: 'pytest',
    java: 'mvn test',
    go: 'go test ./...',
    rust: 'cargo test',
    php: 'vendor/bin/phpunit'
  };
  return commands[language] || 'npm test';
}

/**
 * Get linter command for package manager
 */
function getLinterCommand(packageManager) {
  const commands = {
    npm: 'npx eslint .',
    yarn: 'yarn lint',
    pnpm: 'pnpm lint',
    pip: 'flake8 .',
    maven: 'mvn lint',
    go: 'gofmt -d .',
    cargo: 'cargo clippy -- -D warnings',
    composer: 'vendor/bin/phpcs .'
  };
  return commands[packageManager] || 'npm run lint';
}

/**
 * Get setup action for language
 */
function getSetupAction(language) {
  const actions = {
    nodejs: 'actions/setup-node@v4',
    python: 'actions/setup-python@v5',
    java: 'actions/setup-java@v4',
    go: 'actions/setup-go@v5',
    rust: 'actions-rs/toolchain@v1',
    php: 'shivammathur/setup-php@v2'
  };
  return actions[language] || 'actions/setup-node@v4';
}

/**
 * Escape special characters for YAML
 */
function escapeYAML(str) {
  return str.replace(/'/g, "''");
}

/**
 * Generate GitHub Actions workflow YAML
 */
function generateWorkflow(options) {
  const { language, packageManager, deploy, cache, matrix, environment, branch, template } = options;

  const lockFile = getLockFile(packageManager);
  const cacheKey = `${packageManager}-${language}`;
  const testCommand = getTestCommand(language, packageManager);
  const linterCommand = getLinterCommand(packageManager);
  const setupAction = getSetupAction(language);
  const cachePaths = getCachePaths(packageManager);

  let yaml = `name: CI/CD Pipeline

on:
  push:
    branches: [${branch}]
  pull_request:
    branches: [${branch}]

env:
  NODE_VERSION: '20'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup ${language}
        uses: ${setupAction}
        with:
          node-version: '20'

${cache ? `      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: |
            ${cachePaths.map(p => `            ${p}`).join('\n')}
          key: ${{ runner.os }}-${{ matrix.node-version }}-${cacheKey}-${{ hashFiles('${lockFile}') }}
          restore-keys: |
            ${{ runner.os }}-${{ matrix.node-version }}-${cacheKey}-
` : ''}
      - name: Install dependencies
        run: ${packageManager === 'npm' ? 'npm ci' :
              packageManager === 'pip' ? 'pip install -r requirements.txt' :
              packageManager === 'maven' ? 'mvn clean install -DskipTests' :
              packageManager === 'go' ? 'go mod download' :
              packageManager === 'cargo' ? 'cargo build --release' :
              packageManager === 'composer' ? 'composer install --no-interaction' :
              'yarn install --frozen-lockfile'}

  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
        include:
          - node-version: 20
            coverage: true
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup ${language}
        uses: ${setupAction}
        with:
          node-version: ${{ matrix.node-version }}

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: |
            ${cachePaths.map(p => `            ${p}`).join('\n')}
          key: ${{ runner.os }}-${{ matrix.node-version }}-${cacheKey}-${{ hashFiles('${lockFile}') }}
          restore-keys: |
            ${{ runner.os }}-${{ matrix.node-version }}-${cacheKey}-

      - name: Install dependencies
        run: ${packageManager === 'npm' ? 'npm ci' :
              packageManager === 'pip' ? 'pip install -r requirements.txt' :
              packageManager === 'maven' ? 'mvn dependency:go-offline' :
              'echo "Dependencies already cached"'}
${matrix ? `
      - name: Run tests
        run: ${testCommand}
` : `
      - name: Run tests
        run: ${testCommand}
`}
      - name: Upload coverage
        if: matrix.coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  lint:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup ${language}
        uses: ${setupAction}
        with:
          node-version: '20'

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: |
            ${cachePaths.map(p => `            ${p}`).join('\n')}
          key: ${{ runner.os }}-${cacheKey}-${{ hashFiles('${lockFile}') }}
          restore-keys: |
            ${{ runner.os }}-${cacheKey}-

      - name: Run linter
        run: ${linterCommand}`;

  // Add deploy job if deployment is configured
  if (deploy !== 'none') {
    yaml += `

  deploy:
    needs: [build, test, lint]
    runs-on: ubuntu-latest
    environment: ${environment}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup ${language}
        uses: ${setupAction}
        with:
          node-version: '20'`;

    if (deploy === 'vercel') {
      yaml += `

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'`;
    } else if (deploy === 'netlify') {
      yaml += `

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: './dist'
          production-branch: ${branch}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}`;
    } else if (deploy === 'aws') {
      yaml += `
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync ./dist s3://${{ secrets.AWS_S3_BUCKET }} --delete`;
    } else if (deploy === 'docker') {
      yaml += `

      - name: Login to container registry
        uses: docker/login-actions@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`;
    } else if (deploy === 'gcp') {
      yaml += `
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy my-service --image=gcr.io/${{ secrets.GCP_PROJECT_ID }}/my-service:${{ github.sha }} --region=us-central1`;
    }
  }

  yaml += `
`;
  return yaml;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(3);
  const options = parseArgs(args);
  const projectDir = process.cwd();

  console.log('GitHub Actions Pipeline Generator');
  console.log('==================================\n');

  // Detect project language if auto
  if (options.language === 'auto') {
    const detected = detectProjectLanguage(projectDir);
    options.language = detected.language;
    options.packageManager = detected.packageManager;
    console.log(`Detected project: ${options.language} (${options.packageManager})`);
  }

  console.log(`Template: ${options.template}`);
  console.log(`Deploy: ${options.deploy}`);
  console.log('');

  // Generate workflow
  const workflow = generateWorkflow(options);

  // Create .github/workflows directory
  const workflowsDir = join(projectDir, '.github', 'workflows');
  if (!existsSync(workflowsDir)) {
    mkdirSync(workflowsDir, { recursive: true });
  }

  // Write workflow file
  const workflowPath = join(workflowsDir, 'ci.yml');
  writeFileSync(workflowPath, workflow);

  console.log(`Generated: ${workflowPath}`);
  console.log('\nNext steps:');
  console.log('1. Review the generated workflow');
  console.log('2. Add required secrets in GitHub repository settings');
  console.log('3. Commit and push to trigger the workflow');
}

export default async function handler() {
  await main();
}

main().catch(console.error);