#!/usr/bin/env node
/**
 * Jenkins Pipeline Generator
 * Generates Jenkinsfile and Jenkins configurations
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
    agent: 'docker',
    dockerImages: 'node:20',
    deploy: 'none',
    kubernetes: false,
    cron: null,
    template: 'basic',
    environment: 'production'
  };

  for (const arg of args) {
    if (arg.startsWith('--language=')) {
      options.language = arg.split('=')[1];
    } else if (arg.startsWith('--agent=')) {
      options.agent = arg.split('=')[1];
    } else if (arg.startsWith('--docker-images=')) {
      options.dockerImages = arg.split('=')[1];
    } else if (arg.startsWith('--deploy=')) {
      options.deploy = arg.split('=')[1];
    } else if (arg === '--kubernetes') {
      options.kubernetes = true;
      options.agent = 'kubernetes';
    } else if (arg.startsWith('--cron=')) {
      options.cron = arg.split('=')[1];
    } else if (arg.startsWith('--template=')) {
      options.template = arg.split('=')[1];
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
    { file: 'go.mod', lang: 'go' }
  ];

  for (const ind of indicators) {
    if (existsSync(join(projectDir, ind.file))) {
      return ind.lang;
    }
  }

  return 'nodejs';
}

/**
 * Get install command for language
 */
function getInstallCommand(language) {
  const commands = {
    nodejs: 'npm ci',
    python: 'pip install -r requirements.txt',
    java: 'mvn clean install -DskipTests',
    go: 'go mod download'
  };
  return commands[language] || 'npm install';
}

/**
 * Get test command for language
 */
function getTestCommand(language) {
  const commands = {
    nodejs: 'npm test',
    python: 'pytest -v',
    java: 'mvn test',
    go: 'go test ./... -v'
  };
  return commands[language] || 'npm test';
}

/**
 * Get linter command for language
 */
function getLinterCommand(language) {
  const commands = {
    nodejs: 'npx eslint .',
    python: 'flake8 .',
    java: 'mvn checkstyle:check',
    go: 'go fmt ./...'
  };
  return commands[language] || 'echo "No linter configured"';
}

/**
 * Generate Jenkinsfile
 */
function generateJenkinsfile(options) {
  const { language, agent, dockerImages, deploy, kubernetes, cron, template, environment } = options;
  const installCmd = getInstallCommand(language);
  const testCmd = getTestCommand(language);
  const linterCmd = getLinterCommand(language);
  const images = dockerImages.split(',');
  const primaryImage = images[0] || 'node:20';

  let jenkinsfile = `pipeline {
  agent {
    kubernetes {
      cloud 'kubernetes'
      namespace 'jenkins'
      defaultContainer 'jnlp'
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          name: jenkins-agent
        spec:
          containers:
          - name: jnlp
            image: jenkins/inbound-agent:latest
            resources:
              requests:
                memory: "512Mi"
                cpu: "250m"
              limits:
                memory: "1Gi"
                cpu: "500m"
          - name: ${language}
            image: ${primaryImage}
            command:
              - cat
            tty: true
            resources:
              requests:
                memory: "1Gi"
                cpu: "500m"
              limits:
                memory: "2Gi"
                cpu: "1000m"
'''
    }
  }

  environment {
    DOCKER_REGISTRY = 'docker.io'
    APP_NAME = '${'$CI_JOB_NAME' ?: 'myapp'}'
    BUILD_NUMBER = '${'$BUILD_NUMBER'}'
    COMMIT_SHA = '${'$GIT_COMMIT'}'
  }

  triggers {
${cron ? `    cron('${cron}')` : ''}
    pollSCM('H/5 * * * *')
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 1, unit: 'HOURS')
    disableConcurrentBuilds()
    skipDefaultCheckout()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/main']],
          userRemoteConfigs: [[url: '${'$GIT_URL' ?: 'https://github.com/example/repo.git'}']]
        ])
      }
    }

    stage('Install Dependencies') {
      steps {
        container('${language}') {
          sh '''
            echo "Installing dependencies..."
            node --version || true
            ${installCmd}
          '''
        }
      }
    }

    stage('Build') {
      steps {
        container('${language}') {
          sh '''
            echo "Building application..."
            npm run build || npm run compile || echo "No build step"
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'dist/**,build/**', fingerprint: true, allowEmpty: true
        }
      }
    }

    stage('Test') {
      steps {
        container('${language}') {
          sh '''
            echo "Running tests..."
            ${testCmd}
          '''
        }
      }
      post {
        always {
          junit '**/test-results/*.xml, **/reports/junit/*.xml', allowEmptyReports: true
          publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'coverage',
            reportFiles: 'index.html',
            reportName: 'Coverage Report'
          ])
        }
      }
    }

    stage('Lint') {
      steps {
        container('${language}') {
          sh '''
            echo "Running linter..."
            ${linterCmd}
          '''
        }
      }
      post {
        always {
          recordIssues(
            tools: [eslint(pattern: '**/eslint-report.xml', reportEncoding: 'UTF-8')],
            qualityGates: [[threshold: 1, type: 'TOTAL', unstable: true]]
          )
        }
      }
    }

    stage('Security Scan') {
      steps {
        container('aquasec/trivy:latest') {
          sh '''
            echo "Running security scan..."
            trivy fs --exit-code 1 --severity HIGH,CRITICAL .
          '''
        }
      }
    }
`;

  // Add deploy stage
  if (deploy !== 'none') {
    jenkinsfile += `
    stage('Deploy to ${deploy}') {
      environment {
        DEPLOY_ENV = '${environment}'
      }
      steps {
        echo "Deploying to ${deploy} in \\${DEPLOY_ENV} environment..."
`;

    if (deploy === 'docker') {
      jenkinsfile += `        container('docker') {
          sh '''
            docker login -u \\$DOCKER_USER -p \\$DOCKER_PASS \\$DOCKER_REGISTRY
            docker build -t \\$DOCKER_REGISTRY/\\$APP_NAME:\\$BUILD_NUMBER .
            docker push \\$DOCKER_REGISTRY/\\$APP_NAME:\\$BUILD_NUMBER
          '''
        }`;
    } else if (deploy === 'kubernetes') {
      jenkinsfile += `        container('kubectl') {
          sh '''
            mkdir -p ~/.kube
            echo "$KUBECONFIG" | base64 -d > ~/.kube/config
            kubectl set image deployment/\\$APP_NAME \\$APP_NAME=\\$DOCKER_REGISTRY/\\$APP_NAME:\\$BUILD_NUMBER -n \\$KUBE_NAMESPACE
            kubectl rollout status deployment/\\$APP_NAME -n \\$KUBE_NAMESPACE
          '''
        }`;
    } else if (deploy === 'aws') {
      jenkinsfile += `        sh '''
          aws ecr get-login-password | docker login --username AWS --password-stdin \\$AWS_ACCOUNT.dkr.ecr.\\$AWS_REGION.amazonaws.com
          docker build -t \\$AWS_ACCOUNT.dkr.ecr.\\$AWS_REGION.amazonaws.com/\\$APP_NAME:\\$BUILD_NUMBER .
          docker push \\$AWS_ACCOUNT.dkr.ecr.\\$AWS_REGION.amazonaws.com/\\$APP_NAME:\\$BUILD_NUMBER
          aws ecs update-service --cluster \\$ECS_CLUSTER --service \\$ECS_SERVICE --force-new-deployment
        '''`;
    } else if (deploy === 'heroku') {
      jenkinsfile += `        sh '''
          git remote add heroku https://heroku:\\$HEROKU_API_KEY@git.heroku.com/\\$HEROKU_APP_NAME.git
          git push heroku \\$GIT_COMMIT:main
        '''`;
    }

    jenkinsfile += `
      }
      post {
        success {
          echo "Deployment to ${deploy} completed successfully!"
        }
        failure {
          echo "Deployment to ${deploy} failed!"
        }
      }
    }
`;
  }

  jenkinsfile += `
  }

  post {
    success {
      echo 'Build completed successfully!'
      emailext (
        subject: "Build Success: \\${currentBuild.fullDisplayName}",
        body: "The build completed successfully. Check the build logs for details.",
        recipientProviders: [[$class: 'RequesterRecipientProvider']]
      )
    }
    failure {
      echo 'Build failed!'
      emailext (
        subject: "Build Failed: \\${currentBuild.fullDisplayName}",
        body: "The build failed. Check the logs for details: \\${BUILD_URL}",
        recipientProviders: [[$class: 'RequesterRecipientProvider']]
      )
    }
    unstable {
      echo 'Build is unstable!'
    }
    always {
      cleanWs(cleanWhenAborted: true, cleanWhenFailure: true, cleanWhenNotBuilt: true, cleanWhenSuccess: true)
    }
  }
}`;

  return jenkinsfile;
}

/**
 * Generate Jenkins Kubernetes pod template
 */
function generateKubernetesPodTemplate(options) {
  const { dockerImages } = options;
  const images = dockerImages.split(',');

  return `apiVersion: v1
kind: Pod
metadata:
  name: jenkins-agent
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
    resources:
      requests:
        memory: "512Mi"
        cpu: "250m"
      limits:
        memory: "1Gi"
        cpu: "500m"
  - name: ${images[0] || 'node:20'}
    image: ${images[0] || 'node:20'}
    command:
      - cat
    tty: true
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "1000m"
  - name: docker
    image: docker:24
    command:
      - cat
    tty: true
    volumeMounts:
      - name: docker-sock
        mountPath: /var/run/docker.sock
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
      - cat
    tty: true
  - name: trivy
    image: aquasec/trivy:latest
    command:
      - cat
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
      type: Socket`;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(3);
  const options = parseArgs(args);
  const projectDir = process.cwd();

  console.log('Jenkins Pipeline Generator');
  console.log('==========================\n');

  // Detect language
  if (options.language === 'auto') {
    options.language = detectProjectLanguage(projectDir);
    console.log(`Detected project: ${options.language}`);
  }

  console.log(`Agent: ${options.agent}`);
  console.log(`Deploy: ${options.deploy}`);
  if (options.cron) console.log(`Schedule: ${options.cron}`);
  console.log('');

  // Generate Jenkinsfile
  const jenkinsfile = generateJenkinsfile(options);

  // Write Jenkinsfile
  const jenkinsfilePath = join(projectDir, 'Jenkinsfile');
  writeFileSync(jenkinsfilePath, jenkinsfile);
  console.log(`Generated: ${jenkinsfilePath}`);

  // Generate k8s pod template if using kubernetes agent
  if (options.agent === 'kubernetes' || options.kubernetes) {
    const k8sDir = join(projectDir, 'jenkins');
    mkdirSync(k8sDir, { recursive: true });

    const podTemplate = generateKubernetesPodTemplate(options);
    const podPath = join(k8sDir, 'pod-template.yaml');
    writeFileSync(podPath, podTemplate);
    console.log(`Generated: ${podPath}`);
  }

  console.log('\nNext steps:');
  console.log('1. Configure Jenkins credentials for your CI/CD platform');
  console.log('2. Set up Kubernetes cluster (if using k8s agent)');
  console.log('3. Create Jenkins job pointing to Jenkinsfile in repository');
  console.log('4. Run the pipeline to verify');
}

export default async function handler() {
  await main();
}

main().catch(console.error);