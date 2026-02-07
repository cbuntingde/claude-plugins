#!/usr/bin/env node
/**
 * Generate deployment strategy configurations
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";

const OUTPUT_DIR = "deployment-strategy";

const STRATEGIES = {
  "blue-green": {
    name: "Blue/Green",
    description: "Zero-downtime deployments with instant rollback",
    pros: ["Instant rollback", "No traffic mixing", "Comprehensive testing"],
    cons: ["Double infrastructure cost", "Database migration complexity"],
  },
  canary: {
    name: "Canary",
    description: "Gradual rollouts with traffic shifting",
    pros: ["Early error detection", "Gradual exposure", "Cost-effective"],
    cons: ["Both versions running", "Complex monitoring", "Slower rollout"],
  },
  rolling: {
    name: "Rolling",
    description: "Resource-efficient incremental deployments",
    pros: ["Resource efficient", "Simple to understand"],
    cons: ["No quick rollback", "Mixed versions", "Slower rollout"],
  },
  shadow: {
    name: "Shadow",
    description: "Test new version without affecting users",
    pros: ["Real traffic testing", "Zero user impact"],
    cons: ["Double resource usage", "No production traffic served"],
  },
};

const INFRASTRUCTURE = {
  kubernetes: {
    name: "Kubernetes",
    files: ["deployment.yaml", "service.yaml", "ingress.yaml", "hpa.yaml"],
  },
  docker: {
    name: "Docker",
    files: ["docker-compose.yml", "Dockerfile"],
  },
  aws: {
    name: "AWS",
    files: ["main.tf", "variables.tf", "outputs.tf"],
  },
  gcp: {
    name: "GCP",
    files: ["main.tf", "variables.tf", "outputs.tf"],
  },
  azure: {
    name: "Azure",
    files: ["main.tf", "variables.tf", "outputs.tf"],
  },
};

/**
 * Generate Kubernetes manifests for blue/green deployment
 */
function generateKubernetesBlueGreen(config) {
  const { appName, image, port, replicas } = config;

  return {
    "deployment.yaml": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}-blue
  labels:
    app: ${appName}
    version: blue
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${appName}
      version: blue
  template:
    metadata:
      labels:
        app: ${appName}
        version: blue
    spec:
      containers:
      - name: ${appName}
        image: ${image}
        ports:
        - containerPort: ${port}
        env:
        - name: VERSION
          value: "blue"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}-green
  labels:
    app: ${appName}
    version: green
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${appName}
      version: green
  template:
    metadata:
      labels:
        app: ${appName}
        version: green
    spec:
      containers:
      - name: ${appName}
        image: ${image}
        ports:
        - containerPort: ${port}
        env:
        - name: VERSION
          value: "green"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5`,
    "service.yaml": `apiVersion: v1
kind: Service
metadata:
  name: ${appName}-blue
  labels:
    app: ${appName}
spec:
  type: ClusterIP
  selector:
    app: ${appName}
    version: blue
  ports:
  - port: 80
    targetPort: ${port}
---
apiVersion: v1
kind: Service
metadata:
  name: ${appName}-green
  labels:
    app: ${appName}
spec:
  type: ClusterIP
  selector:
    app: ${appName}
    version: green
  ports:
  - port: 80
    targetPort: ${port}`,
    "ingress.yaml": `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${appName}
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "0"
spec:
  ingressClassName: nginx
  rules:
  - host: ${appName}.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${appName}-blue
            port:
              number: 80`,
    "hpa.yaml": `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${appName}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${appName}-blue
  minReplicas: ${replicas}
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`,
  };
}

/**
 * Generate Kubernetes manifests for canary deployment
 */
function generateKubernetesCanary(config) {
  const { appName, image, port, replicas, initialTraffic } = config;

  return {
    "deployment.yaml": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}-canary
  labels:
    app: ${appName}
    version: canary
spec:
  replicas: ${Math.max(1, Math.floor(replicas * (initialTraffic / 100)))}
  selector:
    matchLabels:
      app: ${appName}
      version: canary
  template:
    metadata:
      labels:
        app: ${appName}
        version: canary
    spec:
      containers:
      - name: ${appName}
        image: ${image}
        ports:
        - containerPort: ${port}
        env:
        - name: VERSION
          value: "canary"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}-production
  labels:
    app: ${appName}
    version: production
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${appName}
      version: production
  template:
    metadata:
      labels:
        app: ${appName}
        version: production
    spec:
      containers:
      - name: ${appName}
        image: ${image}
        ports:
        - containerPort: ${port}
        env:
        - name: VERSION
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5`,
    "service.yaml": `apiVersion: v1
kind: Service
metadata:
  name: ${appName}
  labels:
    app: ${appName}
spec:
  type: ClusterIP
  selector:
    app: ${appName}
  ports:
  - port: 80
    targetPort: ${port}`,
    "istio-virtualservice.yaml": `apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ${appName}
spec:
  hosts:
  - ${appName}
  http:
  - route:
    - destination:
        host: ${appName}
        subset: production
      weight: ${100 - initialTraffic}
    - destination:
        host: ${appName}
        subset: canary
      weight: ${initialTraffic}
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: ${appName}
spec:
  host: ${appName}
  subsets:
  - name: production
    labels:
      version: production
  - name: canary
    labels:
      version: canary`,
    "hpa.yaml": `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${appName}-canary
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${appName}-canary
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`,
  };
}

/**
 * Generate GitHub Actions pipeline for deployment
 */
function generateGitHubActionsPipeline(config) {
  const { strategy, appName, environment } = config;

  return `name: Deploy to ${environment}

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      strategy:
        description: 'Deployment strategy'
        required: true
        default: '${strategy}'
        type: choice
        options:
        - blue-green
        - canary
        - rolling
      environment:
        description: 'Target environment'
        required: true
        default: '${environment}'
        type: choice
        options:
        - production
        - staging

env:
  APP_NAME: ${appName}
  STRATEGY: \${{ github.event.inputs.strategy || '${strategy}' }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image: \${{ steps.build.outputs.image }}
    steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: \${{ github.event.inputs.environment || '${environment}' }}
    steps:
    - uses: actions/checkout@v4

    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/\${{ env.APP_NAME }} \\
          *=ghcr.io/\${{ github.repository }}:\${{ github.sha }} \\
          -n \${{ github.event.inputs.environment || '${environment}' }}

    - name: Wait for deployment
      run: |
        kubectl rollout status deployment/\${{ env.APP_NAME }} \\
          -n \${{ github.event.inputs.environment || '${environment}' }}

  ${strategy === "canary" ? `canary:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
    - name: Wait for canary period
      run: sleep 300

    - name: Check health
      run: |
        HEALTH=\$(curl -s https://\${{ env.APP_NAME }}.example.com/health)
        if [ "\$HEALTH" != "ok" ]; then
          echo "Canary health check failed, rolling back"
          kubectl rollout undo deployment/\${{ env.APP_NAME }} -n production
          exit 1
        fi

    - name: Promote canary
      run: |
        kubectl set image deployment/\${{ env.APP_NAME }} \\
          *=ghcr.io/\${{ github.repository }}:\${{ github.sha }} \\
          -n production` : ""}
`;
}

/**
 * Generate deployment README
 */
function generateReadme(config) {
  const { strategy, appName, infrastructure } = config;

  return `# ${appName} - Deployment Strategy

## Overview

This deployment strategy uses **${STRATEGIES[strategy].name}** deployment approach.

${STRATEGIES[strategy].description}

### Pros
${STRATEGIES[strategy].pros.map((p) => `- ${p}`).join("\n")}

### Cons
${STRATEGIES[strategy].cons.map((c) => `- ${c}`).join("\n")}

## Infrastructure

Target platform: **${INFRASTRUCTURE[infrastructure].name}**

## Quick Start

### Prerequisites

- kubectl configured with cluster access
- Docker installed
- Container registry credentials

### Deploy

\`\`\`bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/

# Verify deployment
kubectl get pods -l app=${appName}
\`\`\`

### Rollback

\`\`\`bash
# For blue/green: switch traffic back
kubectl apply -f kubernetes/ingress.yaml

# For rolling: rollback deployment
kubectl rollout undo deployment/${appName}

# For canary: undo canary traffic shift
\`\`\`

## Monitoring

### Health Endpoints

- **Health**: \`/health\` - Kubernetes liveness probe
- **Ready**: \`/ready\` - Kubernetes readiness probe

### Metrics

- Prometheus metrics available at: \`/metrics\` (if enabled)
- Grafana dashboard: \`monitoring/grafana-dashboards.json\`

## Files

\`\`\`
deployment-strategy/
├── README.md                    # This file
├── kubernetes/
│   ├── deployment.yaml          # Deployment manifests
│   ├── service.yaml             # Service definitions
│   ├── ingress.yaml             # Ingress configuration
│   └── hpa.yaml                 # Horizontal Pod Autoscaler
├── pipelines/
│   └── github-actions.yml       # CI/CD pipeline
├── monitoring/
│   └── prometheus-rules.yaml    # Prometheus alerting rules
└── scripts/
    ├── deploy.sh                # Deployment script
    ├── rollback.sh              # Rollback script
    └── health-check.sh          # Health check script
\`\`\`

## Next Steps

1. Review generated files and customize as needed
2. Test in staging environment
3. Update configuration for production
4. Configure monitoring and alerting
5. Document runbooks for incidents
`;
}

/**
 * Generate deployment scripts
 */
function generateScripts(config) {
  const { strategy, appName } = config;

  return {
    "deploy.sh": `#!/bin/bash
# Deployment script for ${appName}

set -e

NAMESPACE=\${1:-default}
TAG=\${2:-latest}

echo "Deploying ${appName} with ${strategy} strategy..."

# Build and push Docker image
docker build -t ${appName}:$TAG .
docker tag ${appName}:$TAG \${REGISTRY}/${appName}:$TAG
docker push \${REGISTRY}/${appName}:$TAG

# Update image in deployment
kubectl set image deployment/${appName} *=${appName}:$TAG -n $NAMESPACE

# Wait for rollout
echo "Waiting for deployment to complete..."
kubectl rollout status deployment/${appName} -n $NAMESPACE

echo "Deployment complete!"
`,
    "rollback.sh": `#!/bin/bash
# Rollback script for ${appName}

set -e

NAMESPACE=\${1:-default}

echo "Rolling back ${appName}..."

${strategy === "blue-green" ? `# For blue/green: switch service selector
kubectl apply -f kubernetes/service.yaml
kubectl patch service ${appName} -n $NAMESPACE -p '{"spec":{"selector":{"version":"blue"}}}'` : strategy === "canary" ? `# For canary: reduce canary traffic to 0
kubectl apply -f kubernetes/istio-virtualservice.yaml` : `# For rolling: rollback to previous version
kubectl rollout undo deployment/${appName} -n $NAMESPACE`}

echo "Rollback complete!"
`,
    "health-check.sh": `#!/bin/bash
# Health check script for ${appName}

set -e

ENDPOINT=\${1:-http://localhost:80/health}
TIMEOUT=\${2:-30}

echo "Checking health at $ENDPOINT..."

for i in $(seq 1 $TIMEOUT); do
  if curl -sf "$ENDPOINT" > /dev/null 2>&1; then
    echo "Health check passed!"
    exit 0
  fi
  echo "Waiting for service... ($i/$TIMEOUT)"
  sleep 1
done

echo "Health check failed!"
exit 1
`,
  };
}

/**
 * Generate Prometheus alerting rules
 */
function generatePrometheusRules(config) {
  const { appName } = config;

  const yaml = `groups:
- name: ${appName}-alerts
  rules:
  - alert: DeploymentFailure
    expr: kube_deployment_status_replicas_unavailable{deployment="${appName}"} > 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "${appName} deployment has unavailable replicas"
      description: "Deployment ${"$"}{{ $labels.deployment }} has ${"$"}{{ $value }} unavailable replicas"

  - alert: HighErrorRate
    expr: rate(http_requests_total{app="${appName}",status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected for ${appName}"
      description: "Error rate is ${"$"}{{ $value | percentage }}"

  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{app="${appName}"}[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected for ${appName}"
      description: "P95 latency is ${"$"}{{ $value }}s"
`;
  return yaml;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  let strategy = "blue-green";
  let infrastructure = "kubernetes";
  let appName = "myapp";
  let image = "myapp:latest";
  let port = 8080;
  let replicas = 3;
  let initialTraffic = 5;
  let environment = "production";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--strategy" || arg === "-s") {
      strategy = args[++i];
    } else if (arg === "--infrastructure" || arg === "-i") {
      infrastructure = args[++i];
    } else if (arg === "--name" || arg === "-n") {
      appName = args[++i];
    } else if (arg === "--image") {
      image = args[++i];
    } else if (arg === "--port" || arg === "-p") {
      port = parseInt(args[++i], 10);
    } else if (arg === "--replicas" || arg === "-r") {
      replicas = parseInt(args[++i], 10);
    } else if (arg === "--traffic" || arg === "-t") {
      initialTraffic = parseInt(args[++i], 10);
    } else if (arg === "--env" || arg === "-e") {
      environment = args[++i];
    }
  }

  const config = {
    strategy,
    infrastructure,
    appName,
    image,
    port,
    replicas,
    initialTraffic,
    environment,
  };

  console.log("=".repeat(50));
  console.log("Deployment Strategy Generator");
  console.log("=".repeat(50));
  console.log("");
  console.log(`Strategy: ${STRATEGIES[strategy].name}`);
  console.log(`Infrastructure: ${INFRASTRUCTURE[infrastructure].name}`);
  console.log(`Application: ${appName}`);
  console.log("");

  // Create output directory
  const outputPath = join(process.cwd(), OUTPUT_DIR);
  mkdirSync(outputPath, { recursive: true });
  mkdirSync(join(outputPath, "kubernetes"), { recursive: true });
  mkdirSync(join(outputPath, "pipelines"), { recursive: true });
  mkdirSync(join(outputPath, "monitoring"), { recursive: true });
  mkdirSync(join(outputPath, "scripts"), { recursive: true });

  // Generate Kubernetes manifests
  if (infrastructure === "kubernetes") {
    console.log("Generating Kubernetes manifests...");
    let manifests;

    if (strategy === "canary") {
      manifests = generateKubernetesCanary(config);
    } else {
      manifests = generateKubernetesBlueGreen(config);
    }

    for (const [filename, content] of Object.entries(manifests)) {
      writeFileSync(join(outputPath, "kubernetes", filename), content);
    }
  }

  // Generate pipeline
  console.log("Generating CI/CD pipeline...");
  const pipeline = generateGitHubActionsPipeline(config);
  writeFileSync(join(outputPath, "pipelines", "github-actions.yml"), pipeline);

  // Generate monitoring
  console.log("Generating monitoring configurations...");
  const prometheusRules = generatePrometheusRules(config);
  writeFileSync(join(outputPath, "monitoring", "prometheus-rules.yaml"), prometheusRules);

  // Generate scripts
  console.log("Generating deployment scripts...");
  const scripts = generateScripts(config);
  for (const [filename, content] of Object.entries(scripts)) {
    writeFileSync(join(outputPath, "scripts", filename), content);
  }

  // Generate README
  console.log("Generating documentation...");
  const readme = generateReadme(config);
  writeFileSync(join(outputPath, "README.md"), readme);

  console.log("");
  console.log("=".repeat(50));
  console.log(`Generated deployment strategy in: ${OUTPUT_DIR}/`);
  console.log("=".repeat(50));
  console.log("");
  console.log("Next steps:");
  console.log("1. Review generated files");
  console.log("2. Customize configuration for your environment");
  console.log("3. Test in staging");
  console.log("4. Deploy to production");
}

main().catch((error) => {
  console.error("Error generating deployment strategy:", error.message);
  process.exit(1);
});