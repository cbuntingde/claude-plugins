# QA Assistant

Comprehensive quality assurance and production readiness checks for code projects. This plugin identifies breaking changes, validates production requirements, analyzes code quality, and scans for security vulnerabilities.

## Description

QA Assistant performs automated quality gate checks before code reaches production. It identifies potential issues that could cause deployments to fail or create maintenance burden, coordinating with multiple static analysis tools to provide a comprehensive view of code quality.

## Installation

Clone the plugin to your plugins directory:

```bash
cd /path/to/.claude/plugins
git clone https://github.com/cbuntingde/claude-plugins-dev.git
```

Enable the plugin in Claude Code settings:

```json
{
  "enabledPlugins": {
    "qa-assistant@dev-plugins": true
  }
}
```

Restart Claude Code to activate the plugin.

## Usage

### Run All Quality Checks

```bash
/qa-check
```

This executes all available checks:
- Breaking change detection
- Production readiness validation
- Code quality analysis
- Security scanning
- Configuration checks

### Specific Checks

```bash
/detect-breakage
```

Detects code patterns that could cause breaking changes in production.

```bash
/check-production-ready
```

Verifies project meets all production deployment requirements.

```bash
/analyze-quality
```

Evaluates code quality metrics including complexity, maintainability, and technical debt.

```bash
/scan-for-security-issues
```

Identifies security vulnerabilities and potential attack vectors.

## Configuration

No external configuration required. The plugin analyzes the current project's package.json and configuration files.

### Environment Variables

Optional project-level configuration:

```bash
export QA_ASSISTANT_DEEP_SCAN=true
export QA_ASSISTANT_COVERAGE_THRESHOLD=80
export QA_ASSISTANT_REPORT_FORMAT=json
```

### Custom Check Thresholds (package.json)

```json
{
  "qa-assistant": {
    "coverageThreshold": 75,
    "complexityLimit": 10,
    "lineLengthLimit": 120
  }
}
```

## Checks Performed

### Breaking Changes

- Mixed ES modules/CommonJS patterns
- Deprecated Promise syntax
- var declaration usage
- Export/import compatibility

### Production Readiness

- ESLint/TypeScript configuration
- Test coverage validation
- Security audit execution
- Environment variable handling
- Error handling patterns
- Logging configuration

### Code Quality

- Nesting depth analysis
- Line length violations
- Large file detection
- Function count per file
- Comment ratio evaluation
- Complexity metrics

### Security

- Hardcoded secrets detection
- SQL injection risk analysis
- Command injection checks
- Path traversal validation
- Deprecated API usage
- Buffer overflow detection

## Output

All checks produce detailed reports with severity levels:

- **Error**: Blocks deployment, requires immediate fix
- **Warning**: Performance impact, refactor recommended
- **Info**: Observations for optimization

Reports include:
- Files affected
- Issue descriptions
- Recommended actions
- Code locations with line numbers

## Examples

### Before a PR

```bash
/detect-breakage
# Review output for breaking change markers
/check-production-ready
# Address any production issues
/add-commit
```

### Before Release

```bash
/qa-check
# Run all checks
# Address high-severity issues
```

### CI Integration

```bash
# In CI pipeline
/check-production-ready --accept-failures=true
/analyze-quality --output=ci
```

## Thresholds

| Metric | Warning | Error |
|--------|---------|-------|
| Coverage | < 70% | < 50% |
| Line length | > 120 | > 150 |
| Nesting depth | > 8 | > 10 |
| Vulnerabilities | > 9 | > 0 |

## Security Considerations

- No code execution occurs outside analysis
- Results are non-destructive
- All checks are read-only
- Local npm audit results are displayed but not modified

## Troubleshooting

### No package.json Found

Ensure you're running the command from the project root directory.

### NPM Audit Fails

The check passes if no high-severity vulnerabilities are found. Run `npm audit fix` to resolve.

### Coverage Not Calculated

Verify `npm test` is configured in package.json and works locally.

## Dependencies

None (uses standard Node.js APIs and npm audit).

## Contributing

Improvements welcome. Check PR guidelines before submitting.

## License

MIT

## Author

cbuntingde (cbuntingde@gmail.com)

## Support

Report issues at: https://github.com/cbuntingde/claude-plugins-dev/issues