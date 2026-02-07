---
description: Generate Jenkins Pipeline (Jenkinsfile) for CI/CD automation
usage: |
  /jenkins-pipeline [options]
  /jenkins-pipeline --language=nodejs
  /jenkins-pipeline --agent=docker --docker-images=node:20,python:3.11
  /jenkins-pipeline --agent=kubernetes --deploy=docker
  /jenkins-pipeline --cron="H 2 * * *"
---

# Jenkins Pipeline Generator

Generate Jenkins Pipeline files (`Jenkinsfile`) with declarative or scripted syntax for Jenkins CI/CD.

## What it does

Creates production-ready `Jenkinsfile` with:
- **Declarative Pipeline**: Modern, readable pipeline syntax
- **Scripted Pipeline**: Flexible, programmatic pipelines
- **Multi-branch**: Support for multi-branch pipelines
- **Docker Agents**: Containerized build environments
- **Parallel Stages**: Parallel execution for faster builds
- **Shared Libraries**: Integration with Jenkins shared libraries

## Options

### Pipeline Syntax
- `--syntax <type>`: Pipeline syntax - `declarative` (default) or `scripted`
- `--agent <type>`: Agent type - `any`, `docker`, `kubernetes`, `label`
- `--label <label>`: Agent label for specific nodes

### Build Configuration
- `--tools <tools>`: Required tools - `maven`, `gradle`, `nodejs`, `python`, `go`, `docker`
- `--docker-images <images>`: Docker images (comma-separated)
- `--env <vars>`: Environment variables (key=value pairs)

### Pipeline Stages
- `--stages <stages>`: Custom stages (default: build,test,deploy)
- `--parallel <stages>`: Stages to run in parallel

### Deployment
- `--deploy <target>`: Deployment target - `kubernetes`, `aws`, `azure`, `gcp`, `docker`, `ssh`
- `--namespace <namespace>`: Kubernetes namespace

### Advanced
- `--template <template>`: Predefined template
  - `basic`: Simple build and test
  - `docker`: Multi-stage Docker pipeline
  - `kubernetes`: K8s deployment with Helm
  - `microservices`: Multiple services
  - `monorepo`: Monorepo pipeline

### Options
- `--cron <schedule>`: Pipeline trigger (cron syntax)
- `--timeout <minutes>`: Pipeline timeout (default: 60)
- `--retry <count>`: Retry count for failed stages
- `--notifications`: Enable notifications (email, Slack)

## How it works

1. **Project Analysis**: Detects:
   - Build tools (Maven, Gradle, npm, pip)
   - Language and framework
   - Testing frameworks
   - Docker configuration

2. **Pipeline Design**: Creates:
   - Optimal stage structure
   - Agent configuration
   - Tool installations
   - Environment setup

3. **Generation**: Produces `Jenkinsfile` with:
   - Defined stages and steps
   - Post-build actions
   - Error handling
   - Notifications
   - Deployment logic

4. **Best Practices**:
   - Proper error handling and cleanup
   - Artifact archiving
   - Test reporting and publishing
   - Security scanning integration
   - Declarative syntax for readability

## Pipeline Features

### Declarative Syntax
```groovy
pipeline {
    agent any
    tools {
        maven 'Maven 3.8'
        jdk 'JDK 11'
    }
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }
    }
}
```

### Docker Agent
```groovy
agent {
    docker {
        image 'node:20'
        args '-v $HOME/.npm:/root/.npm'
    }
}
```

### Parallel Stages
```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit Tests') {
            steps { sh 'npm run test:unit' }
        }
        stage('Integration Tests') {
            steps { sh 'npm run test:integration' }
        }
    }
}
```

### Kubernetes Agent
```groovy
agent {
    kubernetes {
        yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          containers:
          - name: node
            image: node:20
            command:
            - cat
            tty: true
        '''
    }
}
```

## Output

Generated `Jenkinsfile` includes:
- ✅ Optimized pipeline structure
- ✅ Multi-stage build process
- ✅ Parallel execution support
- ✅ Docker/Kubernetes integration
- ✅ Test reporting
- ✅ Deployment automation
- ✅ Error handling and notifications
- ✅ Artifact management

## Examples

**Simple Node.js pipeline:**
```bash
/jenkins-pipeline --language=nodejs
```

**Docker-based pipeline:**
```bash
/jenkins-pipeline --agent=docker --docker-images=node:20,python:3.11
```

**Kubernetes deployment:**
```bash
/jenkins-pipeline --agent=kubernetes --deploy=kubernetes
```

**Parallel testing:**
```bash
/jenkins-pipeline --stages=build,test,deploy --parallel=test
```

**Scheduled pipeline:**
```bash
/jenkins-pipeline --cron="H 2 * * *"
```

**Complete CI/CD with notifications:**
```bash
/jenkins-pipeline --deploy=kubernetes --notifications --timeout=120
```

## Pipeline Templates

### Basic Template
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps { sh 'npm install' }
        }
        stage('Test') {
            steps { sh 'npm test' }
        }
    }
}
```

### Docker Multi-Stage Template
```groovy
pipeline {
    agent none
    stages {
        stage('Build') {
            agent { docker 'node:20' }
            steps {
                sh 'npm install && npm run build'
            }
        }
        stage('Test') {
            agent { docker 'node:20' }
            steps {
                sh 'npm test'
            }
        }
        stage('Package') {
            agent { docker 'docker:latest' }
            steps {
                sh 'docker build -t myapp:${BUILD_NUMBER} .'
            }
        }
    }
}
```

### Kubernetes Template
```groovy
pipeline {
    agent {
        kubernetes {
            yamlFile 'jenkins-pod.yaml'
        }
    }
    stages {
        stage('Build') {
            steps {
                container('node') {
                    sh 'npm install'
                }
            }
        }
        stage('Deploy') {
            steps {
                container('kubectl') {
                    sh 'kubectl apply -f k8s/'
                }
            }
        }
    }
}
```

## Integration Features

### Jenkins Shared Libraries
```groovy
@Library('shared-pipeline-library@main') _

pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                buildApp()
            }
        }
    }
}
```

### Build Parameters
```groovy
parameters {
    string(name: 'VERSION', defaultValue: '1.0')
    booleanParam(name: 'RUN_TESTS', defaultValue: true)
    choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'])
}
```

### Post-Build Actions
```groovy
post {
    always {
        junit 'target/surefire-reports/*.xml'
        archiveArtifacts artifacts: 'target/*.jar'
    }
    success {
        emailext subject: 'Build Success',
                 body: 'Build completed successfully',
                 to: '[email protected]'
    }
    failure {
        slackSend(color: 'danger', message: 'Build failed')
    }
}
```

### Credentials Management
```groovy
environment {
    AWS_CREDENTIALS = credentials('aws-creds')
    DOCKER_REGISTRY = credentials('docker-registry')
}
```

## Files Created

```
Jenkinsfile              # Main pipeline definition
jenkins-pod.yaml         # Kubernetes pod spec (if using K8s agent)
docker/                  # Docker files
├── Dockerfile
└── docker-compose.yml
k8s/                     # Kubernetes manifests
├── deployment.yaml
├── service.yaml
└── ingress.yaml
scripts/                 # Helper scripts
└── deploy.sh
```

## After Generation

1. **Commit** `Jenkinsfile` to your repository
2. **Create** Multibranch Pipeline job in Jenkins
3. **Configure** branch sources and scan triggers
4. **Add** required credentials in Jenkins credentials store
5. **Run** the pipeline and monitor in Blue Ocean UI

## Best Practices Applied

- **Declarative Syntax**: More readable and maintainable
- **Cron Triggers**: Scheduled builds and health checks
- **Timeouts**: Prevent hanging pipelines
- **Retry Logic**: Handle transient failures
- **Artifact Archiving**: Preserve build outputs
- **Test Reporting**: JUnit, coverage reports
- **Parallel Execution**: Faster pipeline runs
- **Docker Agents**: Consistent build environment
- **Kubernetes Integration**: Cloud-native builds
- **Security**: Credentials management, secret handling

## Integration with Jenkins Ecosystem

### Blue Ocean
- Modern UI for pipeline visualization
- Better pipeline editor
- Improved diagnostics

### Pipeline as Code
- Version controlled pipelines
- Code review for pipeline changes
- Audit trail

### Shared Libraries
- Reusable pipeline components
- Standardized practices across teams
- Centralized maintenance

### Plugins Integration
- Docker Pipeline plugin
- Kubernetes plugin
- Git plugin
- Credentials Binding plugin
- Timestamper plugin
- Workspace Cleanup plugin

## See Also

- `/github-actions` - Generate GitHub Actions workflows
- `/gitlab-ci` - Generate GitLab CI pipelines
- `/pipeline-architect` agent - Design custom CI/CD architectures
