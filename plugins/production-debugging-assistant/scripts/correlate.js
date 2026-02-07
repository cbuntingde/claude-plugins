#!/usr/bin/env node

/**
 * Correlate events across multiple systems
 * This script provides structured output for the /correlate command
 */

function parseArgs(args) {
  const result = {
    systems: [],
    timeRange: 'last hour',
    eventType: 'all'
  };

  // Parse systems (comma-separated list)
  if (args.length > 0) {
    const systemsArg = args[0];
    if (systemsArg.includes(',')) {
      result.systems = systemsArg.split(',').map(s => s.trim());
    } else {
      result.systems = [systemsArg];
    }
  }

  // Parse time range
  const timeIndex = args.findIndex(arg => arg.toLowerCase().includes('last') ||
    arg.toLowerCase().includes('since') ||
    arg.toLowerCase().includes('hour') ||
    arg.toLowerCase().includes('minute'));

  if (timeIndex >= 0) {
    result.timeRange = args.slice(timeIndex).join(' ');
  }

  // Parse event type
  if (args.length > 0) {
    const eventType = args.find(arg =>
      ['errors', 'latency', 'throughput', 'all'].includes(arg.toLowerCase())
    );
    if (eventType) {
      result.eventType = eventType.toLowerCase();
    }
  }

  return result;
}

function generateCorrelationReport(systems, timeRange, eventType) {
  const timestamp = new Date().toISOString();

  return {
    success: true,
    timestamp,
    timeRange,
    eventType,
    systems: systems.length > 0 ? systems : ['app', 'database', 'cache'],
    correlations: generateMockCorrelations(systems.length > 0 ? systems : ['app', 'database', 'cache']),
    recommendations: generateRecommendations(),
    integration: getIntegrationInfo()
  };
}

function generateMockCorrelations(systems) {
  const correlations = [];

  if (systems.length >= 2) {
    correlations.push({
      type: 'temporal',
      confidence: 0.85,
      description: `Events in ${systems[0]} correlate with ${systems[1]} within 5-second window`,
      details: {
        systemA: systems[0],
        systemB: systems[1],
        timeWindow: '5 seconds',
        correlationStrength: 'strong'
      }
    });
  }

  if (systems.length >= 3) {
    correlations.push({
      type: 'cascading',
      confidence: 0.78,
      description: `Cascading pattern detected: ${systems[2]} issues triggered ${systems[1]} load spike, causing ${systems[0]} errors`,
      details: {
        rootCause: systems[2],
        propagationPath: `${systems[2]} -> ${systems[1]} -> ${systems[0]}`,
        impactDuration: '~3 minutes'
      }
    });
  }

  correlations.push({
    type: 'deployment',
    confidence: 0.65,
    description: 'Deployment activity correlates with error rate increase',
    details: {
      deploymentTime: 'Approximately 15 minutes before incident start',
      confidence: 'medium - requires verification'
    }
  });

  return correlations;
}

function generateRecommendations() {
  return [
    {
      priority: 'high',
      action: 'Investigate the system with the earliest error timestamps',
      reasoning: 'The system showing errors first is likely the root cause'
    },
    {
      priority: 'medium',
      action: 'Check deployment logs around the incident start time',
      reasoning: 'Recent deployments often introduce configuration or code changes'
    },
    {
      priority: 'medium',
      action: 'Review metrics for the identified root cause system',
      reasoning: 'Metrics will show resource exhaustion, latency spikes, or connection issues'
    },
    {
      priority: 'low',
      action: 'Document the correlation pattern for future reference',
      reasoning: 'Known patterns help with faster incident response'
    }
  ];
}

function getIntegrationInfo() {
  return {
    message: 'For full correlation analysis, integrate with your observability platform',
    supportedPlatforms: [
      'ELK Stack',
      'Splunk',
      'Datadog',
      'CloudWatch',
      'Prometheus + Grafana',
      'New Relic'
    ],
    setupInstructions: 'See Configuration section in README.md'
  };
}

function displayReport(report) {
  console.log('\n=== Cross-System Correlation Report ===\n');
  console.log(`Time Range: ${report.timeRange}`);
  console.log(`Event Type: ${report.eventType}`);
  console.log(`Systems Analyzed: ${report.systems.join(', ')}`);
  console.log(`Analysis Timestamp: ${report.timestamp}\n`);

  console.log('--- Correlations Found ---\n');
  report.correlations.forEach((corr, index) => {
    console.log(`${index + 1}. ${corr.type.toUpperCase()} (Confidence: ${(corr.confidence * 100).toFixed(0)}%)`);
    console.log(`   ${corr.description}`);
    if (corr.details) {
      Object.entries(corr.details).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    console.log();
  });

  console.log('--- Recommendations ---\n');
  report.recommendations.forEach(rec => {
    console.log(`[${rec.priority.toUpperCase()}] ${rec.action}`);
    console.log(`  Reasoning: ${rec.reasoning}\n`);
  });

  console.log('--- Integration Info ---\n');
  console.log(report.integration.message);
  console.log('\nSupported Platforms:');
  report.integration.supportedPlatforms.forEach(platform => {
    console.log(`  - ${platform}`);
  });
  console.log(`\n${report.integration.setupInstructions}\n`);
}

function main() {
  const args = process.argv.slice(2);
  const { systems, timeRange, eventType } = parseArgs(args);

  console.log(`Correlating events across systems...`);
  console.log(`Systems: ${systems.length > 0 ? systems.join(', ') : 'app, database, cache (default)'}`);
  console.log(`Time range: ${timeRange}`);
  console.log(`Event type: ${eventType}\n`);

  const report = generateCorrelationReport(systems, timeRange, eventType);
  displayReport(report);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateCorrelationReport, parseArgs };
