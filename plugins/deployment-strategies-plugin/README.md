# Deployment Strategies Plugin

A Claude Code plugin for generating production-ready deployment strategies including blue/green, canary, rolling, and shadow deployments.

## Description

Generates infrastructure-as-code templates, CI/CD pipelines, monitoring configurations, and automation scripts for modern deployment patterns. Supports Kubernetes, Docker, and major cloud platforms (AWS, GCP, Azure).

**Deployment strategies supported:**
- **Blue/Green**: Zero-downtime deployments with instant rollback
- **Canary**: Gradual rollouts with traffic shifting and automated rollback
- **Rolling**: Resource-efficient incremental deployments
- **Shadow**: Test new versions without affecting users

## Installation

```bash
claude plugin install deployment-strategies-plugin@dev-plugins
```

## Usage

### Generate deployment strategy

Run the script from your project directory:

```bash
node plugins/deployment-strategies-plugin/scripts/generate-deployment.js [options]
```

**Command options:**

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--strategy` | `-s` | Strategy type (blue-green, canary, rolling, shadow) | blue-green |
| `--infrastructure` | `-i` | Platform (kubernetes, docker, aws, gcp, azure) | kubernetes |
| `--name` | `-n` | Application name | myapp |
| `--image` | - | Docker image and tag | myapp:latest |
| `--port` | `-p` | Container port | 8080 |
| `--replicas` | `-r` | Number of replicas | 3 |
| `--traffic` | `-t` | Initial canary traffic percentage | 5 |
| `--env` | `-e` | Target environment (production, staging) | production |

**Examples:**

```bash
# Blue/green deployment for Kubernetes
node plugins/deployment-strategies-plugin/scripts/generate-deployment.js \
  --strategy blue-green \
  --infrastructure kubernetes \
  --name myapp

# Canary deployment with 10% initial traffic
node plugins/deployment-strategies-plugin/scripts/generate-deployment.js \
  --strategy canary \
  --traffic 10 \
  --replicas 5

# AWS deployment with custom configuration
node plugins/deployment-strategies-plugin/scripts/generate-deployment.js \
  --infrastructure aws \
  --name api-service \
  --env production
```

### Use as a skill

Invoke automatically during architecture reviews, deployment planning, or infrastructure design tasks.

### Use as an agent

For complex deployment architecture design, Claude can invoke the deployment architect agent to analyze requirements and recommend strategies.

## Configuration

Generated files are created in `deployment-strategy/` directory:

```
deployment-strategy/
├── README.md                    # Implementation guide
├── kubernetes/                  # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── pipelines/                   # CI/CD configurations
│   └── github-actions.yml
├── monitoring/                  # Observability setup
│   └── prometheus-rules.yaml
└── scripts/                     # Automation scripts
    ├── deploy.sh
    ├── rollback.sh
    └── health-check.sh
```

### Customization

Edit generated files to match your environment:
- Update container registry URLs
- Configure health check endpoints
- Adjust resource limits and requests
- Set environment-specific variables
- Modify replica counts and autoscaling thresholds

## Security

- Validate all user inputs before applying to infrastructure
- Never commit secrets or credentials to generated files
- Use environment variables for sensitive configuration
- Review generated manifests for security settings
- Implement network policies and RBAC for Kubernetes
- Enable TLS/SSL for all ingress endpoints
- Scan container images for vulnerabilities
- Rotate secrets regularly

### Best practices

- Test in staging environments before production
- Implement health checks before using advanced strategies
- Set up monitoring and alerting before deploying
- Practice rollback procedures regularly
- Use infrastructure-as-code with version control

## Strategy Comparison

| Strategy | Downtime | Rollback | Cost | Complexity |
|----------|----------|----------|------|------------|
| Blue/Green | None | Instant | High | Medium |
| Canary | None | Gradual | Medium | High |
| Rolling | Minimal | Slow | Low | Low |
| Shadow | None | N/A | High | High |

## Requirements

- Node.js 18+ for script execution
- kubectl configured for Kubernetes deployments
- Docker installed for container operations
- Target infrastructure access (cloud platform or cluster)

## Troubleshooting

**Deployment fails to start:**
- Verify container registry credentials
- Check resource quotas in cluster
- Validate image names and tags

**Health checks failing:**
- Ensure `/health` and `/ready` endpoints exist
- Check probe intervals and timeouts
- Review application logs for errors

**Rollback issues:**
- Test rollback procedures in staging
- Verify previous deployment still exists
- Check service selector labels

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, use the [GitHub issue tracker](https://github.com/cbuntingde/claude-plugins/issues).
