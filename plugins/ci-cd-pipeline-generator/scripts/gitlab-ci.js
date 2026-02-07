#!/usr/bin/env node
/**
 * GitLab CI Pipeline Generator
 * Generates .gitlab-ci.yml files for CI/CD pipelines
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
    template: 'basic',
    deploy: 'none',
    docker: false,
    kubernetes: false,
    reviewApps: false,
    environment: 'production'
  };

  for (const arg of args) {
    if (arg.startsWith('--language=')) {
      options.language = arg.split('=')[1];
    } else if (arg.startsWith('--template=')) {
      options.template = arg.split('=')[1];
    } else if (arg.startsWith('--deploy=')) {
      options.deploy = arg.split('=')[1];
    } else if (arg === '--docker') {
      options.docker = true;
    } else if (arg === '--kubernetes' || arg.startsWith('--deploy=kubernetes')) {
      options.kubernetes = true;
      options.deploy = 'kubernetes';
    } else if (arg === '--review-apps') {
      options.reviewApps = true;
    } else if (arg.startsWith('--environment=')) {
      options.environment = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Detect project language
 */
function detectProjectLanguage(projectDir) {
  const indicators = [
    { file: 'package.json', lang: 'nodejs' },
    { file: 'requirements.txt', lang: 'python' },
    { file: 'pom.xml', lang: 'java' },
    { file: 'go.mod', lang: 'go' },
    { file: 'Cargo.toml', lang: 'rust' }
  ];

  for (const ind of indicators) {
    if (existsSync(join(projectDir, ind.file))) {
      return ind.lang;
    }
  }

  return 'nodejs';
}

/**
 * Get image for language
 */
function getLanguageImage(lang) {
  const images = {
    nodejs: 'node:20',
    python: 'python:3.11',
    java: 'maven:3.9-eclipse-temurin-17',
    go: 'golang:1.21',
    rust: 'rust:1.74'
  };
  return images[lang] || 'node:20';
}

/**
 * Get install command for language
 */
function getInstallCommand(language) {
  const commands = {
    nodejs: 'npm ci',
    python: 'pip install -r requirements.txt',
    java: 'mvn dependency:resolve',
    go: 'go mod download',
    rust: 'cargo fetch'
  };
  return commands[language] || 'npm ci';
}

/**
 * Get test command for language
 */
function getTestCommand(language) {
  const commands = {
    nodejs: 'npm test',
    python: 'pytest',
    java: 'mvn test',
    go: 'go test ./...',
    rust: 'cargo test'
  };
  return commands[language] || 'npm test';
}

/**
 * Generate GitLab CI configuration YAML
 */
function generateGitlabCI(options) {
  const { language, template, deploy, docker, kubernetes, reviewApps, environment } = options;
  const image = getLanguageImage(language);
  const installCmd = getInstallCommand(language);
  const testCmd = getTestCommand(language);

  let yaml = `stages:
  - build
  - test
  - security
  - deploy

variables:
  FF_GITLAB_REGISTRY_HELPER_IMAGE: "true"
  DOCKER_DRIVER: "overlay2"
  DOCKER_TLS_CERTDIR: "/certs"

# Dependency cache configuration
cache:
  key: ${'$CI_COMMIT_REF_SLUG'}
  paths:
    - node_modules/
    - .m2/
    - ~/.cache/pip/

.${' '}build_template:
  stage: build
  script:
    - echo "Building ${language} application..."
    - ${installCmd}
    - echo "Build completed"
  artifacts:
    paths:
      - dist/
      - build/
    expire_in: 1 hour
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_BRANCH == "develop"
    - if: $CI_MERGE_REQUEST_IID

.${' '}test_template:
  stage: test
  script:
    - echo "Running tests for ${language}..."
    - ${testCmd}
  coverage: '/All tests passed|OK/'
  artifacts:
    reports:
      junit: test-results.xml
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_MERGE_REQUEST_IID

# Build job
build:
  extends: .build_template
  image: ${image}

# Test jobs
test:
  extends: .test_template
  image: ${image}
  parallel: 3

# Lint job
lint:
  stage: test
  image: ${image}
  script:
    - echo "Running linter..."
    - |
      case "${language}" in
        nodejs) npx eslint . ;;
        python) flake8 . ;;
        java) mvn checkstyle:check ;;
        go) gofmt -l . ;;
        *) echo "No linter configured" ;;
      esac
  allow_failure: true

# Security scanning jobs
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml

trivy:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --exit-code 1 --severity HIGH,CRITICAL .
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_MERGE_REQUEST_IID
`;

  // Add Docker build if configured
  if (docker || deploy === 'docker') {
    yaml += `
# Docker build job
build_docker:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_TAG
`;
  }

  // Add Kubernetes deployment if configured
  if (deploy === 'kubernetes' || kubernetes) {
    yaml += `
# Kubernetes deployment
deploy_kubernetes:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - echo "Deploying to Kubernetes..."
    - mkdir -p ~/.kube
    - echo "$KUBE_CONFIG" | base64 -d > ~/.kube/config
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n $KUBE_NAMESPACE
    - kubectl rollout status deployment/app -n $KUBE_NAMESPACE
  environment:
    name: ${environment}
    url: https://$APP_DOMAIN
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  variables:
    KUBE_CONFIG: ${'$KUBECONFIG_BASE64'}
`;
  }

  // Add deployment jobs for other platforms
  if (deploy !== 'none' && deploy !== 'kubernetes') {
    yaml += `
# Deployment job
deploy:
  stage: deploy
  image: ${image}
  script:
    - echo "Deploying to ${deploy}..."
`;

    if (deploy === 'heroku') {
      yaml += `    - apt-get update -qq
    - curl https://cli-assets.heroku.com/install.sh | sh
    - heroku auth:login
    - git push https://heroku:$HEROKU_API_KEY@git.heroku.com/$HEROKU_APP_NAME.git $CI_COMMIT_SHA:main
`;
    } else if (deploy === 'vercel') {
      yaml += `    - npx vercel --token=$VERCEL_TOKEN --prod
`;
    } else if (deploy === 'netlify') {
      yaml += `    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist --token=$NETLIFY_TOKEN
`;
    }

    yaml += `  environment:
    name: ${environment}
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
`;
  }

  // Add review apps if configured
  if (reviewApps) {
    yaml += `
# Review apps
review:
  stage: deploy
  image: ${image}
  script:
    - echo "Deploying review app for branch $CI_COMMIT_REF_NAME..."
    - echo "Review app URL: https://$CI_COMMIT_REF_SLUG.$CI_PROJECT_NAME.gitlab.io"
  environment:
    name: review/$CI_COMMIT_REF_NAME
    url: https://$CI_COMMIT_REF_SLUG.$CI_PROJECT_NAME.gitlab.io
  rules:
    - if: $CI_COMMIT_BRANCH != "main" && $CI_COMMIT_BRANCH != "develop"
      when: manual
`;
  }

  return yaml;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(3);
  const options = parseArgs(args);
  const projectDir = process.cwd();

  console.log('GitLab CI Pipeline Generator');
  console.log('=============================\n');

  // Detect language
  if (options.language === 'auto') {
    options.language = detectProjectLanguage(projectDir);
    console.log(`Detected project: ${options.language}`);
  }

  console.log(`Template: ${options.template}`);
  console.log(`Deploy: ${options.deploy}\n`);

  // Generate config
  const config = generateGitlabCI(options);

  // Write file
  const configPath = join(projectDir, '.gitlab-ci.yml');
  writeFileSync(configPath, config);

  console.log(`Generated: ${configPath}`);
  console.log('\nNext steps:');
  console.log('1. Review the generated configuration');
  console.log('2. Configure CI/CD variables in GitLab settings');
  console.log('3. Push to trigger the pipeline');
}

export default async function handler() {
  await main();
}

main().catch(console.error);