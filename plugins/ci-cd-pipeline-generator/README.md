# CI/CD Pipeline Generator

Generates production-ready CI/CD pipelines for GitHub Actions, GitLab CI, and Jenkins.

## Description

Analyzes your project and creates optimized CI/CD pipeline configurations with:
- Automatic project language detection
- Multi-platform support (GitHub Actions, GitLab CI, Jenkins)
- Dependency caching for faster builds
- Security scanning integration
- Container and Kubernetes deployment support

## Installation

### Install from Directory

```bash
claude plugin install /path/to/ci-cd-pipeline-generator
```

### Install to Project Scope

```bash
claude plugin install /path/to/ci-cd-pipeline-generator --scope project
```

### Install to Local Scope

```bash
claude plugin install /path/to/ci-cd-pipeline-generator --scope local
```

## Usage

### GitHub Actions

```bash
/github-actions
/github-actions --language=nodejs --deploy=vercel
/github-actions --template=monorepo
```

### GitLab CI

```bash
/gitlab-ci
/gitlab-ci --language=python --deploy=kubernetes
/gitlab-ci --review-apps
```

### Jenkins Pipeline

```bash
/jenkins-pipeline
/jenkins-pipeline --agent=kubernetes --deploy=docker
/jenkins-pipeline --cron="H 2 * * *"
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `CI_CD_DEFAULT_PLATFORM` | Default CI/CD platform | `github-actions` |
| `CI_CD_TEMPLATE_DIR` | Custom template directory | Built-in templates |
| `CI_CD_VERBOSE` | Enable verbose output | `false` |

## Generated Files

### GitHub Actions
```
.github/workflows/ci.yml
```

### GitLab CI
```
.gitlab-ci.yml
```

### Jenkins
```
Jenkinsfile
jenkins/pod-template.yaml (if k8s agent)
```

## Requirements

- Node.js 18+
- Git repository with project files (package.json, requirements.txt, etc.)

## Security

- Never commit secrets to pipeline files
- Use environment-specific secrets in CI/CD platform settings
- Review generated pipelines before production use

## License

MIT License - see LICENSE file for details