---
description: Generate a deployment strategy interactively
---

# Generate Deployment Strategy

Generate a comprehensive deployment strategy for your application.

## Usage

```
/generate-deployment
```

## What it does

This command guides you through creating a production-ready deployment strategy by:

1. **Analyzing your project**
   - Detects application type (web, API, microservice, etc.)
   - Identifies infrastructure (Kubernetes, Docker, cloud platforms)
   - Reviews existing deployment configurations

2. **Gathering requirements**
   - Downtime tolerance
   - Rollback requirements
   - Traffic percentage for canary deployments
   - Health check endpoints
   - Monitoring integration preferences

3. **Recommending strategy**
   - Suggests blue/green, canary, rolling, or other patterns
   - Explains trade-offs for each approach
   - Considers your infrastructure and team capabilities

4. **Generating artifacts**
   - Infrastructure-as-code templates
   - Pipeline configurations (CI/CD)
   - Health check specifications
   - Traffic routing rules
   - Monitoring and alerting setup
   - Rollback procedures

## Deployment Strategies

### Blue/Green
- **Best for**: Zero-downtime deployments, quick rollbacks
- **How it works**: Maintain two identical production environments; switch traffic when ready
- **Pros**: Instant rollback, no traffic mixing, comprehensive testing
- **Cons**: Double infrastructure cost, database migration complexity

### Canary
- **Best for**: Gradual rollouts, testing with real traffic, reducing blast radius
- **How it works**: Route percentage of traffic to new version; gradually increase
- **Pros**: Early error detection, gradual exposure, cost-effective
- **Cons**: Slower rollout, more complex monitoring, both versions running simultaneously

### Rolling
- **Best for**: Resource-constrained environments, simple applications
- **How it works**: Replace instances one-by-one; maintain availability
- **Pros**: Resource efficient, simple to understand
- **Cons**: Slower rollout, no quick rollback, mixed versions during deployment

### Shadow
- **Best for**: Testing new version without affecting users
- **How it works**: Deploy new version alongside production; copy real traffic but don't serve users
- **Pros**: Real traffic testing, zero user impact
- **Cons**: Double resource usage, no production traffic served by new version

## Output Files

The command generates a `deployment-strategy/` directory with:

```
deployment-strategy/
├── README.md                    # Strategy overview and implementation guide
├── kubernetes/                  # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── terraform/                   # Infrastructure templates
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── pipelines/                   # CI/CD configurations
│   ├── github-actions.yml
│   ├── gitlab-ci.yml
│   └── jenkinsfile
├── monitoring/                  # Observability setup
│   ├── prometheus-rules.yaml
│   ├── grafana-dashboards.json
│   └── alerts.yaml
└── scripts/                     # Automation scripts
    ├── deploy.sh
    ├── rollback.sh
    └── health-check.sh
```

## Examples

### Generate a blue/green deployment for Kubernetes
```
/generate-deployment
> Strategy: blue/green
> Infrastructure: kubernetes
> Application: web-api
```

### Generate a canary deployment with Istio
```
/generate-deployment
> Strategy: canary
> Service mesh: istio
> Initial traffic: 5%
```

### Generate with custom configuration
```
/generate-deployment
> Strategy: canary
> Traffic increment: 10%
> Auto-rollback on error rate > 1%
```

## Tips

- Run this command in your project root directory for best results
- Have your infrastructure provider and container runtime ready
- Review the generated strategy before implementing in production
- Always test in staging environments first
- Keep rollback procedures documented and tested
