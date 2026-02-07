---
description: Generate detailed bundle analysis reports in various formats
---

# Export Report

Generate comprehensive bundle analysis reports in multiple formats for documentation, tracking, or sharing with teams.

## Usage

```
/export-report [path] [options]
```

### Arguments

- `path` (optional): Path to bundle or project. Defaults to current working directory.
- `--format <type>`: Report format - `html`, `markdown`, `json`, `csv`, or `pdf`. Default: `html`
- `--template <name>`: Report template - `full`, `summary`, `executive`, or `custom`. Default: `full`
- `--output <file>`: Output file path. Default: `bundle-report.{ext}`
- `--include <sections>`: Comma-separated sections to include. Default: `all`

### Options

- `-t, --title <text>`: Custom report title
- `-b, --baseline <path>`: Include baseline comparison
- `-h, --history <data>`: Include historical trend data
- `--exclude <sections>`: Sections to exclude from report
- `--theme <name>`: Color theme - `light`, `dark`, `auto`
- `--logo <path>`: Include company/project logo
- `--open`: Open report in browser/viewer after generation

## Examples

**Generate full HTML report:**
```
/export-report --format html --output reports/bundle-analysis.html
```

**Generate executive summary:**
```
/export-report --template executive --format pdf
```

**Generate markdown documentation:**
```
/export-report --format markdown --title "Q1 Bundle Analysis"
```

**Include historical trends:**
```
/export-report --history size-history.json --format html
```

**Generate CSV for spreadsheet analysis:**
```
/export-report --format csv --output bundle-data.csv
```

**Custom sections only:**
```
/export-report --include "overview,largest-deps,tree-shaking,optimizations"
```

## Report Sections

### Overview
- Total bundle size (raw, gzip, brotli)
- Module count and average size
- Build time and configuration
- Compression ratio

### Size Breakdown
- Top 50 largest modules (size & percentage)
- Size distribution histogram
- Third-party vs first-party split
- Chunk/partition breakdown

### Dependencies
- Largest third-party dependencies
- Dependency tree visualization
- Version information
- License summary

### Tree-Shaking Analysis
- Unused exports by module
- Dead code detection
- Side effect analysis
- Removal potential (size savings)

### Optimization Opportunities
- Code splitting suggestions
- Dynamic import candidates
- Library replacements (smaller alternatives)
- Compression improvements

### Performance Impact
- Load time estimates (3G, 4G, WiFi)
- Parse/evaluation time
- Memory usage estimates
- Critical path analysis

### Comparison (if baseline provided)
- Size changes (absolute & percentage)
- Added/removed modules
- Trends over time
- Regression warnings

### Recommendations
- Prioritized action items
- Quick wins vs. long-term improvements
- Cost-benefit analysis
- Implementation difficulty

## Report Templates

### Full Template
Comprehensive report with all sections, detailed analysis, and visualizations. Best for:
- Deep dive analysis
- Performance optimization projects
- Documentation

### Summary Template
Condensed report focusing on key metrics and top issues. Best for:
- Regular monitoring
- Team updates
- Quick status checks

### Executive Template
High-level overview with business impact and ROI. Best for:
- Management reporting
- Stakeholder updates
- Budget justifications

### Custom Template
User-defined sections and formatting. Best for:
- Specific use cases
- Team requirements
- Integration needs

## Output Formats

### HTML
Interactive web report with:
- Sortable tables
- Interactive charts (D3.js)
- Collapsible sections
- Print-friendly styling
- Dark/light theme support

### Markdown
Static documentation format with:
- GitHub-compatible tables
- Code blocks with syntax highlighting
- Mermaid diagrams for dependency trees
- Image placeholders for charts

### JSON
Machine-readable format with:
- Complete data structure
- Schema validation
- API integration support
- Programmatic processing

### CSV
Spreadsheet-compatible format with:
- Tabular data export
- Excel/Google Sheets compatible
- Pivot table ready
- Chart import capable

### PDF
Professional document with:
- Embedded charts and visualizations
- Print-optimized layout
- Page numbers and headers
- Company branding support

## Report Customization

### Custom Templates
Create custom templates in `.bundle-report/templates/`:

```handlebars
<!-- custom-template.html -->
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <style>{{{styles}}}</style>
</head>
<body>
  <h1>{{title}}</h1>
  {{#sections}}
    {{> section}}
  {{/sections}}
</body>
</html>
```

### Themes
Built-in themes:
- `light`: White background, dark text (default)
- `dark`: Dark background, light text
- `auto`: System preference detection

### Branding
```bash
/export-report --logo company-logo.png --title "ACME Corp Bundle Analysis"
```

## Automation

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit
npm run build
/export-report --format json --output .bundle-report.json
git add .bundle-report.json
```

### CI/CD Pipeline
```yaml
# GitHub Actions
- name: Build and analyze
  run: |
    npm run build
    /export-report --format html --output bundle-report.html

- name: Upload report
  uses: actions/upload-artifact@v3
  with:
    name: bundle-report
    path: bundle-report.html
```

### Scheduled Reports
```json
// package.json
{
  "scripts": {
    "weekly-report": "/export-report --format pdf --output reports/weekly-$(date +%Y-%m-%d).pdf"
  }
}
```

## Report Examples

### Executive Summary Sample
```
╔══════════════════════════════════════════════════════════╗
║          ACME APP - Bundle Size Analysis Report          ║
║              Generated: 2025-01-15 10:30:00              ║
╚══════════════════════════════════════════════════════════╝

OVERVIEW
───────────────────────────────────────────────────────────
Total Bundle Size:    287 KB  (↑ 12% from last week)
Gzipped Size:         72 KB   (↑ 8% from last week)
Module Count:         354     (↑ 15 new modules)

KEY FINDINGS
───────────────────────────────────────────────────────────
⚠️  New 22KB analytics library added (unoptimized)
⚠️  Lodash usage increased by 8KB (consider tree-shaking)
✅ Moment.js replaced with date-fns (-18KB)
⚠️  15% unused code detected in utils/

RECOMMENDED ACTIONS
───────────────────────────────────────────────────────────
1. Configure lodash ES module imports (Potential: -8KB)
2. Remove unused analytics features (Potential: -12KB)
3. Enable aggressive tree-shaking (Potential: -5KB)

TOTAL POTENTIAL SAVINGS: 25KB (8.7% reduction)

Estimated Load Time Impact:
  - Current: 2.8s (3G) | 0.9s (4G) | 0.4s (WiFi)
  - Optimized: 2.5s (3G) | 0.8s (4G) | 0.4s (WiFi)
```

## See Also

- `/analyze-bundle` - Perform bundle analysis
- `/compare-bundles` - Compare bundle sizes
- `/tree-shake` - Find tree-shaking opportunities
