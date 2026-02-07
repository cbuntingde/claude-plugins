---
description: Generate comprehensive deployment strategies including blue/green, canary, rolling, and other deployment patterns
capabilities:
  - Analyze application architecture and recommend suitable deployment strategies
  - Generate blue/green deployment configurations
  - Generate canary deployment configurations
  - Create rollback procedures
  - Design traffic routing rules
  - Generate infrastructure-as-code templates
  - Provide health check configurations
  - Create monitoring and alerting setups
---

# Deployment Strategy Generator

Expert agent specialized in generating production-ready deployment strategies for cloud-native applications.

## Overview

This skill analyzes your application architecture, infrastructure setup, and business requirements to generate comprehensive deployment strategies that minimize downtime, reduce risk, and ensure smooth releases.

## When to Use

Invoke this skill when you need to:
- Plan a new deployment strategy for an application
- Migrate from basic deployments to advanced patterns
- Implement blue/green deployments for zero-downtime releases
- Set up canary deployments for gradual rollouts
- Create rollback procedures for safe deployments
- Design traffic splitting and routing configurations
- Generate Kubernetes, Docker, or cloud provider specific deployment manifests

## Capabilities

### Strategy Analysis
- Evaluates application architecture (monolith, microservices, serverless)
- Assesses infrastructure capabilities (Kubernetes, ECS, Cloud Run, etc.)
- Considers team size and release frequency
- Analyzes risk tolerance and business requirements

### Blue/Green Deployments
- Complete infrastructure provisioning scripts
- Traffic switching configurations
- Database migration strategies
- Health check endpoints
- Rollback procedures
- Testing and validation steps

### Canary Deployments
- Gradual traffic shifting configurations
- Automated rollback triggers
- Metrics and monitoring setup
- A/B testing integration
- Progressive rollout strategies

### Additional Strategies
- **Rolling Updates**: Instance-by-instance replacement
- **Shadow Deployments**: Testing new versions alongside production
- **A/B Deployments**: Routing based on user characteristics
- **Feature Flags**: Decoupling deployment from release

### Deliverables

For each strategy, generates:

1. **Architecture Diagram** (described in text/mermaid)
2. **Infrastructure-as-Code** templates (Kubernetes YAML, Terraform, CloudFormation, etc.)
3. **Pipeline Configurations** (GitHub Actions, GitLab CI, Jenkins, etc.)
4. **Health Check Specifications**
5. **Monitoring and Alerting Rules**
6. **Rollback Playbooks**
7. **Traffic Configuration** (service mesh, load balancer, CDN)

## How It Works

1. **Context Gathering**: Analyzes your codebase, existing deployment configs, and infrastructure
2. **Recommendation**: Suggests the most suitable deployment strategy based on your needs
3. **Generation**: Creates all necessary configuration files and scripts
4. **Documentation**: Provides step-by-step implementation guides

## Best Practices

- Always test deployment strategies in staging environments first
- Implement comprehensive health checks before adopting advanced patterns
- Set up proper monitoring and alerting
- Practice rollback procedures regularly
- Use feature flags to decouple deployment from release
- Start simple and evolve based on needs

## Example Scenarios

### Scenario 1: Microservices on Kubernetes
Recommended: Blue/Green or Canary with service mesh (Istio/Linkerd)

### Scenario 2: Monolithic web application
Recommended: Rolling updates with load balancer

### Scenario 3: Critical system with zero tolerance for errors
Recommended: Blue/Green with automated rollback

### Scenario 4: Frequent releases, testing tolerance
Recommended: Canary with progressive traffic shifting

## Output Format

The skill generates:
- Markdown documentation explaining the strategy
- YAML/JSON configuration files
- Shell scripts for automation
- Pipeline configuration files
- Infrastructure templates (Terraform/Helm/Kubernetes manifests)

All generated code includes inline comments explaining each component and configuration option.
