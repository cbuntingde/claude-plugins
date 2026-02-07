---
description: Automatically identifies orphaned, unused, and zombie files in the codebase
model: auto
trigger: "When scanning for unused files, orphaned assets, or zombie configuration files"
---

# Zombie File Detector

Autonomously identifies files that are not referenced or used anywhere in the codebase.

## Detection Capabilities

### File Types Detected

#### Unused Source Files
- `.js`, `.ts`, `.py`, `.java` files not imported anywhere
- Orphaned modules without entry points
- Abandoned feature files

#### Unused Assets
- Images (`.png`, `.jpg`, `.svg`, `.gif`)
- Fonts (`.woff`, `.woff2`, `.ttf`)
- Stylesheets (`.css`, `.scss`, `.less`)
- Static files not referenced in HTML/templates

#### Zombie Configuration
- `package.json` dependencies not imported
- Config files for disabled features
- Environment configs for non-existent environments
- Build configs for unused build targets

#### Orphaned Tests
- Test files for deleted source files
- Test files for non-existent modules
- Unused test utilities and fixtures

#### Deprecated Files
- Old file formats (`.jsx` → `.tsx`)
- Legacy naming conventions
- Backup/temp files left behind

## Analysis Process

1. **Index All Files**: Create complete file inventory
2. **Scan References**: Search all source files for references
3. **Check Imports**: Parse import/require statements
4. **Verify Assets**: Check HTML/templates for asset references
5. **Cross-Reference**: Match files against usage patterns
6. **Report Findings**: Categorize by type and safety

## Output Example

```
Zombie Files Report
===================

Total Files Scanned: 1,247
Zombie Files Found: 12

Unused Source (3):
├── src/utils/old-helper.js
├── src/features/abandoned-module.js
└── lib/deprecated-parser.js

Unused Assets (5):
├── public/images/legacy-logo.png
├── public/fonts/old-font.woff
└── static/unused-icon.svg

Zombie Config (2):
├── config/old-environment.json
└── webpack.deprecated.config.js

Orphaned Tests (2):
├── tests/deleted-module.test.js
└── tests/legacy-feature.spec.js

Safe to Remove: 10
Requires Review: 2
```

## Safety Classification

| Category | Description | Safe to Remove |
|----------|-------------|----------------|
| **Unused Source** | Never imported/required | Yes (verify no dynamic refs) |
| **Unused Assets** | Not referenced anywhere | Yes |
| **Zombie Config** | Config for disabled features | Yes (verify) |
| **Orphaned Tests** | Tests for deleted code | Yes |
| **Deprecated Files** | Old formats/versions | Yes |

## False Positive Prevention

The detector accounts for:
- Dynamic imports (`import()` with variables)
- String-based requires
- Template references
- Build-time inclusions
- Conditional loading