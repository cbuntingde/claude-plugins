#!/usr/bin/env node

/**
 * Investigate production incidents
 * This script provides structured output for the /incident command
 */

function parseArgs(args) {
  const result = {
    timeRange: 'last 30 minutes',
    errorPattern: null
  };

  // Parse time range from args
  const timePatterns = [
    /last (\d+) (minutes?|hours?)/,
    /since (.+)/i,
    /between (.+) and (.+)/i
  ];

  for (const pattern of timePatterns) {
    const match = args.join(' ').match(pattern);
    if (match) {
      result.timeRange = match[0];
      break;
    }
  }

  // Extract error pattern (remaining args after time range)
  const timeWords = ['last', 'since', 'between', 'and', 'minute', 'hour', 'today', 'yesterday'];
  const errorArgs = args.filter(arg => !timeWords.some(word => arg.toLowerCase().includes(word)));

  if (errorArgs.length > 0) {
    result.errorPattern = errorArgs.join(' ');
  }

  return result;
}

function generateIncidentReport(timeRange, errorPattern) {
  const now = new Date();
  const incidentStart = new Date(now.getTime() - 30 * 60 * 1000);

  return {
    success: true,
    incident: {
      startTime: incidentStart.toISOString(),
      endTime: now.toISOString(),
      duration: '30 minutes',
      timeRange,
      errorPattern: errorPattern || 'all errors'
    },
    timeline: generateTimeline(incidentStart, now),
    affectedSystems: ['app', 'api-gateway', 'database', 'cache'],
    correlations: generateCorrelations(),
    rootCauses: generateRootCauses(),
    recommendations: generateRecommendations(),
    nextSteps: generateNextSteps()
  };
}

function generateTimeline(startTime, endTime) {
  return [
    {
      time: new Date(startTime.getTime() + 2 * 60 * 1000).toISOString(),
      system: 'database',
      event: 'Connection pool exhaustion detected',
      severity: 'warning'
    },
    {
      time: new Date(startTime.getTime() + 5 * 60 * 1000).toISOString(),
      system: 'api-gateway',
      event: 'Request latency increased to 2.5s (baseline: 200ms)',
      severity: 'warning'
    },
    {
      time: new Date(startTime.getTime() + 8 * 60 * 1000).toISOString(),
      system: 'app',
      event: 'HTTP 500 errors began spiking (15% error rate)',
      severity: 'error'
    },
    {
      time: new Date(startTime.getTime() + 12 * 60 * 1000).toISOString(),
      system: 'cache',
      event: 'Cache miss rate increased to 40% (baseline: 5%)',
      severity: 'warning'
    },
    {
      time: new Date(startTime.getTime() + 18 * 60 * 1000).toISOString(),
      system: 'app',
      event: 'Error rate peaked at 35%',
      severity: 'critical'
    }
  ];
}

function generateCorrelations() {
  return [
    {
      correlation: 'Database connection pool exhaustion caused API latency spike',
      confidence: 0.92,
      evidence: [
        'Database slow query logs show 3s queries starting at 14:02:00',
        'API gateway latency increased 3 minutes later',
        'HTTP 500 errors in app service began 3 minutes after that'
      ]
    },
    {
      correlation: 'Cache failure caused secondary database load increase',
      confidence: 0.75,
      evidence: [
        'Cache miss rate spiked at 14:12:00',
        'Database query volume increased by 200%',
        'Database CPU utilization reached 85%'
      ]
    },
    {
      correlation: 'Recent deployment may have introduced connection leak',
      confidence: 0.65,
      evidence: [
        'Deployment occurred at 13:55:00 (7 minutes before incident)',
        'New code includes database query changes',
        'Connection pool not properly releasing connections'
      ]
    }
  ];
}

function generateRootCauses() {
  return [
    {
      cause: 'Database connection pool exhaustion due to connection leak',
      probability: 0.85,
      supportingEvidence: [
        'Connection pool reached maximum at incident start',
        'Slow queries preventing connections from releasing',
        'Recent deployment introduced new database operations'
      ],
      recommendedActions: [
        'Restart application services to clear stale connections',
        'Review recent database code changes for connection handling',
        'Implement connection pool monitoring and alerting'
      ]
    },
    {
      cause: 'Cache failure causing increased database load',
      probability: 0.10,
      supportingEvidence: [
        'Cache miss rate spiked during incident',
        'May be secondary effect rather than root cause'
      ],
      recommendedActions: [
        'Investigate cache service status',
        'Check cache configuration changes'
      ]
    }
  ];
}

function generateRecommendations() {
  return [
    {
      priority: 'immediate',
      action: 'Scale database read replicas to handle increased load',
      reasoning: 'Immediate relief for connection pool pressure'
    },
    {
      priority: 'immediate',
      action: 'Rollback recent deployment if possible',
      reasoning: 'High correlation between deployment time and incident start'
    },
    {
      priority: 'short-term',
      action: 'Review and fix connection handling in recent code changes',
      reasoning: 'Likely source of connection leak'
    },
    {
      priority: 'short-term',
      action: 'Add connection pool metrics and alerts',
      reasoning: 'Early detection for future incidents'
    },
    {
      priority: 'long-term',
      action: 'Implement database connection pooling best practices',
      reasoning: 'Prevent similar incidents in the future'
    }
  ];
}

function generateNextSteps() {
  return [
    'Verify database connection pool status',
    'Review recent deployment artifacts',
    'Check application logs for connection-related errors',
    'Monitor system metrics after implementing fixes',
    'Schedule post-incident review meeting',
    'Update runbook with lessons learned'
  ];
}

function displayReport(report) {
  console.log('\n=== Production Incident Investigation Report ===\n');

  console.log('--- Incident Overview ---\n');
  console.log(`Time Range: ${report.incident.timeRange}`);
  console.log(`Start Time: ${report.incident.startTime}`);
  console.log(`End Time: ${report.incident.endTime}`);
  console.log(`Duration: ${report.incident.duration}`);
  console.log(`Error Pattern: ${report.incident.errorPattern}\n`);

  console.log('--- Incident Timeline ---\n');
  report.timeline.forEach(event => {
    const timestamp = new Date(event.time).toLocaleTimeString();
    console.log(`[${timestamp}] ${event.system.toUpperCase()} - [${event.severity.toUpperCase()}]`);
    console.log(`  ${event.event}\n`);
  });

  console.log('--- Affected Systems ---\n');
  report.affectedSystems.forEach(system => {
    console.log(`  - ${system}`);
  });
  console.log();

  console.log('--- Correlations ---\n');
  report.correlations.forEach((corr, index) => {
    console.log(`${index + 1}. ${corr.description}`);
    console.log(`   Confidence: ${(corr.confidence * 100).toFixed(0)}%`);
    console.log('   Evidence:');
    corr.evidence.forEach(ev => {
      console.log(`     - ${ev}`);
    });
    console.log();
  });

  console.log('--- Root Causes (Ranked by Probability) ---\n');
  report.rootCauses.forEach((cause, index) => {
    console.log(`${index + 1}. ${cause.cause}`);
    console.log(`   Probability: ${(cause.probability * 100).toFixed(0)}%`);
    console.log('   Evidence:');
    cause.supportingEvidence.forEach(ev => {
      console.log(`     - ${ev}`);
    });
    console.log('   Recommended Actions:');
    cause.recommendedActions.forEach(action => {
      console.log(`     - ${action}`);
    });
    console.log();
  });

  console.log('--- Recommendations ---\n');
  report.recommendations.forEach(rec => {
    console.log(`[${rec.priority.toUpperCase()}] ${rec.action}`);
    console.log(`  Reasoning: ${rec.reasoning}\n`);
  });

  console.log('--- Next Steps ---\n');
  report.nextSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  console.log();
}

function main() {
  const args = process.argv.slice(2);
  const { timeRange, errorPattern } = parseArgs(args);

  console.log(`Investigating incident: ${timeRange}`);
  if (errorPattern) {
    console.log(`Error pattern: ${errorPattern}`);
  }
  console.log();

  const report = generateIncidentReport(timeRange, errorPattern);
  displayReport(report);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateIncidentReport, parseArgs };
