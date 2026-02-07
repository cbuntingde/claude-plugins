---
description: Automatically generate CI/CD pipelines for GitHub Actions, GitLab CI, or Jenkins based on project analysis
invocation: |
  This skill is invoked automatically when:
  - User asks to "create a pipeline", "setup CI/CD", "generate workflow"
  - User mentions GitHub Actions, GitLab CI, or Jenkins
  - User asks to "automate deployment" or "setup continuous integration"
  - User asks about "build automation" or "deployment automation"

examples:
  - "Create a GitHub Actions workflow for my Node.js app"
  - "Setup GitLab CI for this Python project"
  - "Generate a Jenkins pipeline with Docker support"
  - "I need a CI/CD pipeline for deployment to AWS"
  - "Setup automated testing and deployment"
---

# CI/CD Pipeline Generator Skill

Automatically generates production-ready CI/CD pipelines tailored to your project's technology stack, deployment needs, and team practices.

## Capabilities

This skill autonomously:

### Project Detection
- Analyzes project structure and configuration files
- Detects programming language and framework
- Identifies build tools and package managers
- Discovers test frameworks and configurations
- Finds Docker or Kubernetes configuration

### Pipeline Generation
- **GitHub Actions**: Creates `.github/workflows/*.yml` files
- **GitLab CI**: Creates `.gitlab-ci.yml` configuration
- **Jenkins**: Creates `Jenkinsfile` with declarative or scripted syntax
- **Multi-platform**: Generates pipelines for multiple platforms simultaneously

### Best Practices
- Implements caching strategies for faster builds
- Adds parallel job execution where beneficial
- Includes security scanning stages
- Configures proper artifact handling
- Sets up deployment automation
- Adds health checks and rollback procedures

### Deployment Integration
- **Cloud Platforms**: AWS, GCP, Azure, Heroku, Vercel, Netlify
- **Container Orchestration**: Kubernetes, Docker Swarm
- **Infrastructure as Code**: Terraform, CloudFormation integration
- **GitOps**: ArgoCD, Flux configuration

## How It Works

### 1. Automatic Detection

When you ask to create a CI/CD pipeline, this skill:

```bash
# Detects project type
package.json           → Node.js project
requirements.txt       → Python project
pom.xml               → Java/Maven project
build.gradle          → Java/Gradle project
go.mod                → Go project
Cargo.toml            → Rust project
composer.json         → PHP project
```

```bash
# Detects build tools
npm scripts           → npm/yarn/pnpm
pytest                → Python test runner
jest                  → JavaScript test runner
junit                 → Java test runner
```

```bash
# Detects deployment setup
Dockerfile            → Docker deployment
kubernetes/           → Kubernetes deployment
terraform/            → Infrastructure as Code
vercel.json           → Vercel deployment
```

### 2. Platform Selection

Chooses appropriate CI/CD platform based on:
- **Repository hosting**: GitHub → GitHub Actions, GitLab → GitLab CI
- **User preference**: Explicit mention of platform
- **Existing setup**: Detects existing pipeline files
- **Project requirements**: Complex needs → Jenkins, simple → GitHub/GitLab

### 3. Pipeline Architecture

Designs optimal pipeline structure:

```
┌─────────────────────────────────────────────────┐
│  1. Setup & Dependency Installation              │
│     - Cache dependencies                         │
│     - Install packages                           │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│  2. Build & Compile (Parallel)                   │
│     - Lint code                                  │
│     - Build artifacts                            │
│     - Compile assets                             │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│  3. Test (Parallel)                              │
│     - Unit tests                                 │
│     - Integration tests                          │
│     - Code coverage                              │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│  4. Security & Quality                           │
│     - SAST/SCA scanning                          │
│     - Dependency audit                           │
│     - Container scanning (if applicable)         │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│  5. Deploy (Conditional)                         │
│     - Deploy to staging                          │
│     - Run smoke tests                            │
│     - Deploy to production (on main branch)      │
└─────────────────────────────────────────────────┘
```

### 4. File Generation

Creates appropriate files:

**For GitHub Actions:**
```
.github/workflows/
├── ci.yml           # Continuous integration
├── cd.yml           # Continuous deployment
└── security.yml     # Security scanning
```

**For GitLab CI:**
```
.gitlab-ci.yml       # Complete pipeline definition
```

**For Jenkins:**
```
Jenkinsfile          # Pipeline definition
jenkins-pod.yaml     # Kubernetes agent config (if needed)
```

### 5. Optimization

Automatically applies optimizations:

- **Caching**: Dependencies based on lockfile hashes
- **Parallel Jobs**: Independent stages run concurrently
- **Matrix Builds**: Test across multiple versions when beneficial
- **Conditional Deployment**: Deploy only on specific branches
- **Resource Limits**: Prevent runaway builds

## Usage Examples

### Implicit Invocation

Simply ask for a pipeline:

```
"Create a CI/CD pipeline for this project"
"Setup GitHub Actions"
"Generate a GitLab CI configuration"
```

The skill will:
1. Analyze your project
2. Detect language, framework, build tools
3. Choose appropriate platform
4. Generate optimized pipeline files

### Explicit Requirements

Specify your needs:

```
"Create a GitHub Actions workflow that deploys to Vercel"
"Setup GitLab CI with Docker build and Kubernetes deployment"
"Generate a Jenkins pipeline for this Java Spring Boot app"
```

The skill will tailor the pipeline accordingly.

### Complex Scenarios

For advanced requirements:

```
"Create a pipeline that tests on Node 16, 18, and 20, then deploys to AWS"
"Setup CI/CD for a monorepo with 5 microservices"
"Generate a GitOps pipeline with ArgoCD"
```

The skill will invoke the `pipeline-architect` agent for complex designs.

## What Gets Generated

### GitHub Actions Example

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deployment commands
```

### GitLab CI Example

```yaml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:20
  dependencies:
    - build
  script:
    - npm test

deploy:production:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  only:
    - main
  script:
    - docker build -t myapp:${CI_COMMIT_SHORT_SHA} .
    - docker push myapp:${CI_COMMIT_SHORT_SHA}
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    tools {
        nodejs 'Node 20'
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results/*.xml'
                }
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './scripts/deploy.sh'
            }
        }
    }
}
```

## Integration Points

This skill integrates with:

### Commands
- `/github-actions` - Explicit GitHub Actions generation
- `/gitlab-ci` - Explicit GitLab CI generation
- `/jenkins-pipeline` - Explicit Jenkins pipeline generation

### Agents
- `pipeline-architect` - For complex architecture design

### File Operations
- Reads project files for analysis
- Creates new pipeline files
- Modifies existing configurations (with permission)

## Customization

The skill adapts to your needs:

### Language-Specific Patterns

**Node.js:**
```yaml
- npm ci (or yarn install, pnpm install)
- npm run build
- npm test (or jest, vitest)
```

**Python:**
```yaml
- pip install -r requirements.txt
- python -m pytest
- coverage report
```

**Java:**
```yaml
- mvn clean install (or gradle build)
- mvn test
- SonarQube analysis
```

**Go:**
```yaml
- go mod download
- go build
- go test
```

### Deployment Patterns

**Docker:**
```yaml
- docker build
- docker push
- Image tagging with commit SHA
```

**Kubernetes:**
```yaml
- kubectl apply
- helm upgrade
- ArgoCD sync (for GitOps)
```

**Serverless:**
```yaml
- serverless deploy
- SAM deploy
- Terraform apply
```

## Best Practices Applied

### Security
✅ No hardcoded secrets
✅ Minimal permissions principle
✅ Secret scanning integration
✅ Dependency vulnerability checks

### Performance
✅ Dependency caching
✅ Parallel job execution
✅ Incremental builds (when applicable)
✅ Artifact reuse between stages

### Reliability
✅ Retry logic for transient failures
✅ Timeout prevention
✅ Clear error messages
✅ Rollback on failure

### Maintainability
✅ Clear pipeline structure
✅ Comments for complex logic
✅ Version controlled configuration
✅ Modular, reusable components

## Complex Scenarios

For advanced requirements, this skill will:

### Monorepo Handling
- Detects monorepo structure
- Generates pipelines with change detection
- Builds only affected packages
- Uses workspace protocols

### Multi-Environment
- Creates separate pipelines for dev/staging/prod
- Implements promotion workflows
- Manages environment-specific variables
- Conditional deployment logic

### Multi-Cloud
- Generates pipelines for multiple clouds
- Abstraction layers for cloud-specific commands
- Consistent deployment experience
- Cloud redundancy strategies

### GitOps
- Creates Kubernetes manifests
- Configures ArgoCD/Flux
- Implements drift detection
- Automatic sync policies

## When to Use

✅ **Use this skill when:**
- Starting a new project and need CI/CD
- Migrating to a different CI/CD platform
- Improving existing pipeline setup
- Adding deployment automation
- Implementing testing automation

❌ **Don't use this skill for:**
- Simple one-off scripts (use shell commands directly)
- Non-automation tasks
- Tasks unrelated to CI/CD pipelines

## Limitations

- Generates best-effort configurations based on common patterns
- May require manual adjustments for highly specialized needs
- Assumes standard project structures
- Requires manual setup of credentials and secrets

## Next Steps

After pipeline generation:

1. **Review the generated files**
2. **Add required secrets** to your CI/CD platform
3. **Test the pipeline** on a feature branch
4. **Adjust** based on specific requirements
5. **Commit** the pipeline files
6. **Monitor** initial pipeline runs

## Example Output

When this skill completes, you'll have:

✅ Complete CI/CD pipeline configuration files
✅ Optimized for your specific project
✅ Ready to commit and deploy
✅ Following best practices and security standards
✅ With caching, parallelization, and deployment automation
