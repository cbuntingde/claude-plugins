---
description: Generate GitHub Actions workflow files for CI/CD pipelines
usage: |
  /github-actions [options]
  /github-actions --language=nodejs --deploy=vercel
  /github-actions --language=python --deploy=docker
  /github-actions --template=monorepo
---

# GitHub Actions Generator

Generate GitHub Actions workflow files with best practices for CI/CD pipelines.

## What it does

Analyzes your project and creates optimized GitHub Actions workflow files for:
- **CI Pipelines**: Run tests, linting, and code quality checks on every push
- **CD Pipelines**: Deploy to cloud platforms (Vercel, Netlify, AWS, GCP, Azure)
- **Multi-stage**: Build, test, deploy with caching and parallel jobs
- **Matrix builds**: Test across multiple OS and language versions
- **Docker**: Build and push Docker images to registries

## Options

All options are optional - the generator will auto-detect from your project if not specified.

### Platform Options
- `--language <lang>`: Programming language (nodejs, python, java, go, rust, php)
- `--package-manager <mgr>`: Package manager (npm, yarn, pnpm, pip, cargo, maven)
- `--test-runner <runner>`: Test framework (jest, pytest, junit, go test)

### Pipeline Type
- `--type <type>`: Pipeline type - `ci`, `cd`, or `cicd` (default: auto-detect)

### Deployment Options
- `--deploy <target>`: Deployment target - `vercel`, `netlify`, `aws`, `gcp`, `azure`, `docker`, `none`
- `--docker-registry <registry>`: Docker registry - `ghcr`, `dockerhub`, `ecr`

### Build Features
- `--cache`: Enable dependency caching (default: true)
- `--parallel`: Run jobs in parallel (default: auto-detect)
- `--matrix <versions>`: Test across multiple versions (e.g., `node: [16, 18, 20]`)

### Environment
- `--environment <env>`: Deployment environment - `dev`, `staging`, `production`
- `--branch <branch>`: Branch to trigger on (default: main)

### Advanced
- `--template <template>`: Use a predefined template
  - `basic`: Simple test pipeline
  - `docker`: Docker build and push
  - `multi-stage`: Build, test, deploy pipeline
  - `monorepo`: Multi-package repository

## How it works

1. **Project Analysis**: Scans your project for:
   - `package.json`, `requirements.txt`, `pom.xml`, `go.mod`
   - Existing test scripts and configuration
   - Dockerfile or docker-compose.yml

2. **Template Selection**: Chooses the best workflow template based on:
   - Language and framework detected
   - Deployment platform specified
   - Project complexity

3. **Workflow Generation**: Creates `.github/workflows/` directory with:
   - `ci.yml` - Continuous integration pipeline
   - `cd.yml` - Continuous deployment pipeline (if specified)
   - Optimized with caching, parallel jobs, and best practices

4. **Best Practices Applied**:
   - Dependency caching for faster builds
   - Parallel job execution when possible
   - Semantic versioning in workflow names
   - Proper secrets and environment variable handling
   - Security scanning (CodeQL, dependabot integration)

## Output

Generated workflows include:
- ✅ Automated testing on every push/PR
- ✅ Linting and code quality checks
- ✅ Dependency caching
- ✅ Deployment to specified platform
- ✅ Status badges for README
- ✅ Detailed comments and documentation

## Examples

**Node.js project with Vercel deployment:**
```bash
/github-actions --language=nodejs --deploy=vercel
```

**Python project with Docker:**
```bash
/github-actions --language=python --test=pytest --deploy=docker
```

**Multi-version testing (Node 16, 18, 20):**
```bash
/github-actions --language=nodejs --matrix="node-version: [16, 18, 20]"
```

**Monorepo with multiple packages:**
```bash
/github-actions --template=monorepo
```

**Complete CI/CD with AWS deployment:**
```bash
/github-actions --type=cicd --language=python --deploy=aws --environment=production
```

## Generated Workflow Features

### Caching Strategy
- `actions/cache` for node_modules, pip packages, Go modules
- Cache key based on lockfile hash (package-lock.json, requirements.txt)
- Automatic cache invalidation on dependency changes

### Parallel Execution
- Test and lint jobs run in parallel
- Matrix builds for version compatibility
- Conditional job dependencies

### Deployment
- Automatic deployment on branch merge
- Environment-specific configurations
- Rollback support for major platforms
- Health check validation

### Security
- CodeQL analysis integration
- Dependabot compatibility
- Secret scanning support
- Minimal permissions principle

## Files Created

```
.github/
└── workflows/
    ├── ci.yml           # Continuous integration
    ├── cd.yml           # Continuous deployment (optional)
    └── security.yml     # Security scanning (optional)
```

## Integration

After generation:
1. Commit the workflow files to your repository
2. Push to GitHub to trigger workflows
3. Add required secrets in repository Settings > Secrets
4. Monitor workflow runs in Actions tab

## See Also

- `/gitlab-ci` - Generate GitLab CI pipelines
- `/jenkins-pipeline` - Generate Jenkins pipelines
- `/pipeline-architect` agent - Design custom CI/CD architectures
