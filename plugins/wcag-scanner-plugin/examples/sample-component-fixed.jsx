// Example React component with WCAG issues fixed
// This demonstrates the corrected, accessible version

import React from 'react';

export function SampleComponentFixed() {
  return (
    <div>
      {/* FIXED: Alt text added */}
      <img src="logo.png" alt="Company Logo" />

      {/* FIXED: Increased contrast for better readability */}
      <p style={{ color: '#333' }}>This text has good contrast</p>

      {/* FIXED: Button has aria-label for screen readers */}
      <button
        onClick={() => alert('clicked')}
        aria-label="Open menu"
      >
        <span aria-hidden="true">☰</span>
      </button>

      {/* FIXED: Proper heading hierarchy */}
      <h2>Section Title</h2>
      <h3>Subsection Title</h3>

      {/* FIXED: Form input with proper label */}
      <label htmlFor="name-input">Enter your name</label>
      <input
        id="name-input"
        type="text"
        placeholder="Enter your name"
      />

      {/* FIXED: Descriptive link text */}
      <a href="/about">Read about our company</a>

      {/* FIXED: Meaningful alt text on informative image */}
      <img src="chart.png" alt="Sales data chart showing 25% increase" />

      {/* FIXED: Lang attribute added */}
      <html lang="en">
        <body>
          <h1>Welcome</h1>
        </body>
      </html>
    </div>
  );
}
