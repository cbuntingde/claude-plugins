// Example React component with various WCAG issues for testing
// This file intentionally contains accessibility issues for demonstration

import React from 'react';

export function SampleComponent() {
  return (
    <div>
      {/* CRITICAL: Missing alt text */}
      <img src="logo.png" />

      {/* SERIOUS: Low contrast - assuming dark gray on white */}
      <p style={{ color: '#888' }}>This text has low contrast</p>

      {/* SERIOUS: Button without accessible name */}
      <button onClick={() => alert('clicked')}>
        <span>☰</span>
      </button>

      {/* MODERATE: Skipped heading level */}
      <h2>Section Title</h2>
      <h4>Subsection Title</h4>

      {/* CRITICAL: Form input without label */}
      <input type="text" placeholder="Enter your name" />

      {/* MINOR: Generic link text */}
      <a href="/about">Click here</a>

      {/* SERIOUS: Empty alt text on informative image */}
      <img src="chart.png" alt="" />

      {/* MODERATE: Missing lang attribute */}
      <html>
        <body>
          <h1>Welcome</h1>
        </body>
      </html>
    </div>
  );
}
