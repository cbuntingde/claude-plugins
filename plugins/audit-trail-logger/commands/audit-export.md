# Audit Export

Export the audit trail log in various formats for compliance reporting and archival.

## Usage

```
/audit-export [--format json|csv|txt] [--compress]
```

### Options

- `--format json` - Export as JSON array (default)
- `--format csv` - Export as CSV spreadsheet
- `--format txt` - Export as formatted text report
- `--compress` - Compress the export file with gzip

### Examples

Export as JSON:
```
/audit-export --format json
```

Export as CSV for spreadsheet analysis:
```
/audit-export --format csv
```

Export as compressed JSON for archival:
```
/audit-export --format json --compress
```

Export as human-readable text report:
```
/audit-export --format txt
```

## Output

Export files are saved to `${CLAUDE_PLUGIN_ROOT}/data/exports/` with the naming pattern:
- `audit_export_YYYYMMDD_HHMMSS.json`
- `audit_export_YYYYMMDD_HHMMSS.csv`
- `audit_export_YYYYMMDD_HHMMSS.txt`

When using `--compress`, `.gz` is appended to the filename.

## Security

- Export files are created with restrictive permissions (600)
- Export directory is within the plugin data directory
- All exported data is sanitized and validated
