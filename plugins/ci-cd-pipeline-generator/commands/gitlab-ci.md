---
description: Generate GitLab CI/CD pipeline configuration files
usage: |
  /gitlab-ci [options]
  /gitlab-ci --language=nodejs
  /gitlab-ci --language=python --deploy=kubernetes
  /gitlab-ci --template=docker
  /gitlab-ci --review-apps
---

# GitLab CI Generator

Generate GitLab CI/CD pipeline configuration (`.gitlab-ci.yml`) with optimized stages and jobs.

## What it does

Creates comprehensive `.gitlab-ci.yml` files for GitLab CI/CD with:
- **Multi-stage Pipelines**: Build, test, deploy, and monitoring stages
- **Docker Integration**: Build and push to GitLab Container Registry
- **Auto DevOps**: Integration with GitLab's Auto DevOps features
- **Environments**: Support for dev, staging, production environments
- **Caching**: Efficient dependency and build caching
- **Artifacts**: Preserve build artifacts between stages

## Options

All options are optional - auto-detection from your project is the default.

### Pipeline Configuration
- `--stages <stages>`: Custom stages (default: build,test,deploy)
- `--image <image>`: Default Docker image for jobs
- `--services <services>`: Docker services (docker:dind, postgres, redis)

### Language & Testing
- `--language <lang>`: Programming language (nodejs, python, java, go, ruby)
- `--package-manager <mgr>`: Package manager (npm, yarn, pip, maven, bundle)
- `--test-runner <runner>`: Test framework (jest, pytest, junit, rspec)

### Deployment
- `--deploy <target>`: Deployment platform - `aws`, `gcp`, `azure`, `heroku`, `kubernetes`, `gitlab-pages`
- `--environment <env>`: Environment names (dev,staging,production)
- `--review-apps`: Enable GitLab Review Apps

### Build Features
- `--cache`: Enable caching (default: true)
- `--artifacts`: Configure artifact retention
- `--parallel <number>`: Number of parallel jobs

### Advanced
- `--template <template>`: Predefined template
  - `basic`: Simple build and test
  - `docker`: Docker build and push
  - `microservices`: Multiple services pipeline
  - `monorepo`: Monorepo with multiple packages
  - `auto-devops`: GitLab Auto DevOps compatible

## How it works

1. **Project Analysis**: Detects:
   - Language and framework from project files
   - Existing test configuration
   - Docker setup
   - Deployment requirements

2. **Pipeline Architecture**: Designs:
   - Optimal stage sequence
   - Job dependencies and DAG structure
   - Caching strategy
   - Artifact handling

3. **Configuration Generation**: Creates `.gitlab-ci.yml` with:
   - Defined stages and global variables
   - Job definitions with scripts
   - Cache and artifact configuration
   - Deployment jobs
   - Environment management

4. **Best Practices**:
   - `.only` and `.except` rules for branch/control
   - YAML anchors for reusable configuration
   - `needs:` keyword for DAG pipelines
   - Integration with GitLab features (Merge Requests, Issues)

## Pipeline Features

### Caching Strategy
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .cache/
  policy: pull-push
```

### Artifacts
- Test reports and coverage
- Build artifacts for deployment
- Documentation
- Retention policies per job

### Environments
- Dynamic environment URLs
- Manual deployment actions
- Environment-specific variables
- Rollback capabilities

### Docker Integration
- Kaniko for faster builds
- GitLab Container Registry
- Multi-stage Docker builds
- Image tagging strategies

## Output

Generated `.gitlab-ci.yml` includes:
- ✅ Optimized stage structure
- ✅ Dependency caching
- ✅ Parallel job execution
- ✅ Test reporting
- ✅ Deployment automation
- ✅ Integration badges

## Examples

**Basic Node.js pipeline:**
```bash
/gitlab-ci --language=nodejs
```

**Docker-based Python pipeline:**
```bash
/gitlab-ci --language=python --template=docker
```

**Kubernetes deployment:**
```bash
/gitlab-ci --deploy=kubernetes --environment=production
```

**Monorepo with multiple services:**
```bash
/gitlab-ci --template=monorepo
```

**Review Apps enabled:**
```bash
/gitlab-ci --review-apps --deploy=heroku
```

## Pipeline Structure Example

```yaml
stages:
  - build
  - test
  - deploy
  - monitor

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  KUBECONFIG: /tmp/kubeconfig

# Build stage
build:
  stage: build
  image: node:20
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# Test stage
test:unit:
  stage: test
  dependencies:
    - build
  script:
    - npm run test:unit
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# Deploy stage
deploy:staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - kubectl apply -f k8s/
  only:
    - main
```

## Integration with GitLab Features

### Merge Requests
- Pipelines run on MR creation
- Results show in MR widget
- Discussion integration with test failures

### Security
- Secret Detection
- Container Scanning
- SAST (Static Application Security Testing)
- Dependency Scanning

### Auto DevOps
- Compatible with GitLab Auto DevOps
- Can override specific jobs
- Leverage built-in deployments

### Monitoring
- Integration with GitLab Monitoring
- Performance metrics
- Error tracking

## Files Created

```
.gitlab-ci.yml           # Main pipeline configuration
docker/                  # Docker files (if using Docker)
├── Dockerfile
└── docker-compose.yml
k8s/                     # Kubernetes manifests (if using K8s)
├── deployment.yaml
└── service.yaml
scripts/                 # Helper scripts
└── deploy.sh
```

## After Generation

1. **Commit** `.gitlab-ci.yml` to your repository
2. **Push** to GitLab to trigger the pipeline
3. **Configure** CI/CD variables in Settings > CI/CD
4. **Monitor** pipeline runs in CI/CD > Pipelines
5. **Adjust** based on specific requirements

## Best Practices Applied

- **IDempotent Jobs**: Jobs can be rerun safely
- **Fail Fast**: Failed stages stop dependent jobs
- **Resource Limits**: Prevent runaway jobs
- **Timeouts**: Default timeouts for all jobs
- **Retry**: Transient failure handling
- **Parallelization**: Independent jobs run in parallel
- **DAG Pipelines**: Use `needs:` for non-linear dependencies

## See Also

- `/github-actions` - Generate GitHub Actions workflows
- `/jenkins-pipeline` - Generate Jenkins pipelines
- `/pipeline-architect` agent - Design custom CI/CD architectures
