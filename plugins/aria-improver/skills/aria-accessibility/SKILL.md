---
description: Analyzes HTML and suggests ARIA labels, roles, and semantic HTML improvements for accessibility and SEO
capabilities:
  - aria-label-suggestions:
      description: Suggest appropriate ARIA labels, roles, and attributes for HTML elements
  - semantic-html-recommendations:
      description: Recommend semantic HTML elements to replace non-semantic divs
  - accessibility-audit:
      description: Comprehensive accessibility review focusing on ARIA and semantic HTML
  - landmark-identification:
      description: Identify and suggest proper ARIA landmarks for page structure
  - form-accessibility:
      description: Improve form accessibility with proper labels, roles, and attributes
  - interactive-element-accessibility:
      description: Enhance buttons, links, and interactive elements with proper ARIA
  - screen-reader-optimization:
      description: Optimize content for screen reader navigation and understanding
---

# ARIA & Semantic HTML Accessibility Improver

Automatically enhances web accessibility by suggesting ARIA labels, roles, and semantic HTML improvements. This skill should be invoked when:

- Writing or modifying HTML components
- Creating forms, navigation, or interactive elements
- Reviewing code for accessibility issues
- Working with dynamic content or single-page applications
- Optimizing for SEO (semantic HTML helps search engines)
- Ensuring compliance with WCAG accessibility standards

## Core Principles

Always prioritize **semantic HTML** over ARIA attributes. ARIA should supplement, not replace, proper semantic elements.

## When to Invoke This Skill

Invoke this skill autonomously when you encounter:

- HTML files being edited or created
- `<div>` soup or non-semantic markup
- Forms without proper labels
- Buttons or links without accessible names
- Images without alt text
- Custom interactive components
- Navigation or landmark regions
- Dynamic content updates

## Analysis Framework

When analyzing HTML, follow this systematic approach:

### 1. **Semantic Element Audit**

Identify non-semantic elements that should be replaced:

```html
<!-- BAD -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="article">...</div>
<div class="footer">...</div>

<!-- GOOD -->
<header>...</header>
<nav>...</nav>
<main>
  <article>...</article>
</main>
<footer>...</footer>
```

**Common replacements:**
- `<div class="header">` → `<header>`
- `<div class="nav">` → `<nav>`
- `<div class="main">` → `<main>`
- `<div class="article">` → `<article>` or `<section>`
- `<div class="aside">` → `<aside>`
- `<div class="footer">` → `<footer>`
- `<span class="button">` → `<button>`
- `<div onclick="...">` → `<button>`

### 2. **ARIA Landmark Improvements**

Ensure proper landmark regions for screen reader navigation:

```html
<!-- Add landmarks for major page sections -->
<header role="banner">
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main role="main">
  <article aria-labelledby="article-title">
    <h1 id="article-title">Article Title</h1>
    ...
  </article>

  <aside aria-label="Related content">
    ...
  </aside>
</main>

<footer role="contentinfo">
  ...
</footer>
```

**Essential landmarks:**
- `role="banner"` - Site header (typically only one per page)
- `role="navigation"` - Navigation regions
- `role="main"` - Main content area
- `role="complementary"` - Sidebars/aside content
- `role="contentinfo"` - Footer with copyright/contact info
- `role="search"` - Search functionality

### 3. **Form Accessibility**

Every form input needs an accessible label:

```html
<!-- BAD -->
<input type="text" placeholder="Name">

<!-- GOOD -->
<label for="name-input">Full Name</label>
<input id="name-input" type="text" name="name">

<!-- OR (when visible label isn't desired) -->
<input
  type="text"
  name="search"
  aria-label="Search site"
  placeholder="Search...">

<!-- Form groups -->
<fieldset>
  <legend>Choose your preferences</legend>
  <label>
    <input type="radio" name="pref" value="email">
    Email notifications
  </label>
  <label>
    <input type="radio" name="pref" value="sms">
    SMS notifications
  </label>
</fieldset>

<!-- Required fields -->
<label for="email">
  Email <span aria-label="required">*</span>
</label>
<input id="email" type="email" required aria-required="true">

<!-- Error messaging -->
<div role="alert" aria-live="assertive">
  Please enter a valid email address
</div>
```

### 4. **Interactive Elements**

Ensure buttons and links have accessible names:

```html
<!-- BAD -->
<div class="button" onclick="submitForm()">Submit</div>
<button aria-label="Click to submit"></button>
<a href="#" onclick="return false;">Read more</a>

<!-- GOOD -->
<button type="submit">Submit</button>
<button aria-label="Close dialog">
  <span aria-hidden="true">&times;</span>
</button>
<a href="/article/full">Read more about this topic</a>

<!-- Icon buttons need aria-label -->
<button aria-label="Delete item">
  <svg aria-hidden="true">...</svg>
</button>
```

### 5. **Image Accessibility**

All images need alt text:

```html
<!-- Informative images -->
<img src="chart.png" alt="Bar chart showing 50% increase in sales">

<!-- Decorative images -->
<img src="decoration.svg" alt="" role="presentation">

<!-- Functional images -->
<input type="image" src="search.png" alt="Search">

<!-- Complex images -->
<img src="complex-chart.png" alt="Long description...">
<div role="img" aria-labelledby="chart-desc">
  <img src="chart.png" alt="">
  <p id="chart-desc">Detailed description of the chart...</p>
</div>
```

### 6. **Dynamic Content**

Announce content changes to screen readers:

```html
<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  Status updates appear here
</div>

<!-- For urgent updates -->
<div role="alert" aria-live="assertive">
  Error: Form submission failed
</div>

<!-- Loading states -->
<div aria-live="polite" aria-busy="true">
  Loading your data...
</div>
```

### 7. **Custom Components**

Properly ARIA-enable custom widgets:

```html
<!-- Custom dropdown -->
<div role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="dropdown-label">
  <button aria-label="Choose option">Select</button>
  <ul role="listbox" aria-labelledby="dropdown-label">
    <li role="option">Option 1</li>
    <li role="option">Option 2</li>
  </ul>
</div>

<!-- Custom tabs -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel2">Tab 2</button>
</div>
<div role="tabpanel" id="panel1">...</div>
<div role="tabpanel" id="panel2" hidden>...</div>

<!-- Modal/Dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog Title</h2>
  <p>Dialog content...</p>
  <button aria-label="Close dialog">Close</button>
</div>
```

### 8. **Hidden Content**

Properly hide content visually vs from screen readers:

```html
<!-- Visually hidden but available to screen readers -->
<span class="visually-hidden">Important context</span>

<style>
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>

<!-- Hide from screen readers but visible visually -->
<div aria-hidden="true">
  Decorative content
</div>
```

### 9. **Tables**

Make tables accessible:

```html
<table>
  <caption>Monthly sales figures</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Sales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>$10,000</td>
    </tr>
  </tbody>
</table>
```

### 10. **Lists and Navigation**

```html
<!-- Navigation should be lists -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Laptop</li>
  </ol>
</nav>
```

## Suggested Improvements Template

When suggesting improvements, structure them like this:

```markdown
## Accessibility Improvements Found

### 1. [Issue Type]
**Current:**
\`\`\`html
[current code]
\`\`\`

**Issue:** [Explain why this is problematic]

**Suggested Fix:**
\`\`\`html
[improved code]
\`\`\`

**Benefits:** [Accessibility and SEO benefits]

---

### 2. [Next Issue]
...
```

## Common Issues to Flag

- Missing alt text on images
- Forms without proper labels
- `<div>` used as buttons
- Links with "click here" text
- Missing skip links for keyboard navigation
- Color used as the only indicator
- Auto-playing media without controls
- Low contrast ratios
- Missing form error association
- Custom widgets without proper ARIA

## Output Format

When invoked, provide:

1. **Priority Issues** - Critical accessibility problems
2. **Semantic Improvements** - Better HTML element choices
3. **ARIA Enhancements** - Missing or incorrect ARIA attributes
4. **Code Examples** - Before/after comparisons
5. **Benefits Explanation** - Why each change matters

## Integration with Development Workflow

This skill should be invoked:
- During code review
- When creating new components
- During refactoring
- Before deploying to production
- When optimizing for SEO

Remember: **Good accessibility is good design**. These improvements help everyone, not just users with disabilities.
