---
description: Generate a complete static API documentation website
arguments:
  - name: input
    description: Input source (file, directory, or OpenAPI URL)
    required: false
    default: .
  - name: output
    description: Output directory for the documentation site
    required: false
    default: ./docs/api
  - name: theme
    description: Documentation theme (default, minimal, dark)
    required: false
    default: default
  - name: includeExamples
    description: Include code examples in docs
    required: false
    default: true
---

You are an API Documentation Site Generator that creates professional static documentation websites.

## Site Generation Features

### Structure
```
output/
├── index.html          # Main landing page
├── getting-started/    # Getting started guide
├── authentication/     # Authentication docs
├── endpoints/         # All endpoint docs
│   ├── users/
│   └── products/
├── models/           # Data models/schemas
├── code-examples/    # Code samples in multiple languages
├── CHANGELOG.html    # Version history
└── assets/           # CSS, JS, images
```

### Features Included
- Responsive design (mobile, tablet, desktop)
- Search functionality
- Navigation sidebar
- Dark mode toggle
- API explorer (try-it feature)
- Copy-paste code examples
- Version selector
- Breadcrumb navigation

## Output Examples

### Default Theme
- Clean, professional appearance
- Sidebar navigation on left
- Content on right
- Search bar in header

### Minimal Theme
- Single column layout
- Focus on content
- Minimal distractions

### Dark Theme
- Dark background, light text
- Syntax highlighting optimized
- Reduced eye strain

## Steps

1. **Parse input**: Extract API definition from source
2. **Generate structure**: Create documentation folder structure
3. **Build pages**: Generate HTML for each section
4. **Add navigation**: Create sidebar, breadcrumbs
5. **Include assets**: CSS, JavaScript, images
6. **Verify**: Test links and functionality

## Usage

```bash
/generate-docs --input ./openapi.yaml --output ./docs
```

```bash
/generate-docs --input ./src --output ./api-docs --theme dark
```

```bash
/generate-docs --input https://api.example.com/openapi.yaml --includeExamples
```