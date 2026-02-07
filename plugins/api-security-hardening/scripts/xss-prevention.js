#!/usr/bin/env node
/**
 * XSS Prevention Script
 * Generates XSS prevention middleware and utilities
 */

const path = require('path');
const fs = require('fs');

/**
 * Generate XSS prevention code
 */
function generateXssPrevention(params = {}) {
  const framework = params.framework || 'express';
  const cspLevel = params.cspLevel || 'moderate';
  const sanitizeInput = params.sanitizeInput !== false;
  const encodeOutput = params.encodeOutput !== false;
  const frontend = params.frontend || 'vanilla';

  const generators = {
    express: generateExpressXss,
    fastify: generateFastifyXss,
    nestjs: generateNestJsXss,
    koa: generateKoaXss,
    vanilla: generateVanillaXss
  };

  const generator = generators[framework] || generators.express;
  return generator({ cspLevel, sanitizeInput, encodeOutput, frontend });
}

/**
 * Generate CSP header based on level
 */
function getCspHeader(level) {
  const cspPolicies = {
    strict: [
      "default-src 'self'",
      "script-src 'self' 'nonce-{nonce}'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests"
    ],
    moderate: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "media-src 'self' https:",
      "object-src 'none'",
      "frame-src 'self'"
    ],
    permissive: [
      "default-src 'self' *",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *",
      "style-src 'self' 'unsafe-inline' *",
      "img-src 'self' data: *"
    ]
  };

  return cspPolicies[level] || cspPolicies.moderate;
}

/**
 * Express XSS prevention
 */
function generateExpressXss({ cspLevel, sanitizeInput, encodeOutput, frontend }) {
  const cspHeader = getCspHeader(cspLevel);
  const noncePlaceholder = cspLevel === 'strict' ? "'nonce-{nonce}'" : '';

  let code = `// XSS Prevention for Express
const crypto = require('crypto');
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');
`;

  if (sanitizeInput) {
    code += `
/**
 * Input sanitization middleware
 */
function sanitizeInput(req, res, next) {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Trim and escape HTML entities
      return validator.escape(obj.trim());
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitize(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}

app.use(sanitizeInput);
`;
  }

  if (encodeOutput) {
    code += `
/**
 * Output encoding utilities
 */
const outputEncoder = {
  /**
   * Encode for HTML context
   */
  html: (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Encode for JavaScript context
   */
  js: (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\\\\/g, '\\\\\\\\')
      .replace(/'/g, "\\\\'")
      .replace(/"/g, '\\\\"')
      .replace(/\\n/g, '\\\\n')
      .replace(/\\r/g, '\\\\r')
      .replace(/\\t/g, '\\\\t')
      .replace(/\\f/g, '\\\\f');
  },

  /**
   * Encode for URL context
   */
  url: (str) => {
    if (typeof str !== 'string') return str;
    return encodeURIComponent(str);
  }
};
`;
  }

  code += `
/**
 * CSP middleware
 */
function cspMiddleware(req, res, next) {
  // Generate nonce for inline scripts (strict mode)
  const nonce = ${cspLevel === 'strict' ? 'crypto.randomBytes(16).toString("base64")' : 'null'};

  // Build CSP header
  const cspDirectives = ${JSON.stringify(cspHeader)}.join('; ');
  const cspHeaderValue = ${cspLevel === 'strict' ? 'cspDirectives.replace("{nonce}", nonce)' : 'cspDirectives'};

  // Set security headers
  res.setHeader('Content-Security-Policy', cspHeaderValue);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Make nonce available to views
  res.locals.nonce = nonce;

  next();
}

app.use(cspMiddleware);
`;

  if (frontend === 'react') {
    code += `
/**
 * React safe rendering utilities
 */
import React from 'react';

// Safe HTML component using DOMPurify
export function SafeHtml({ html, tagName = 'div' }) {
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload']
  });

  return React.createElement(tagName, {
    dangerouslySetInnerHTML: { __html: sanitized }
  });
}

// Safe text component (no HTML)
export function SafeText({ content }) {
  return <span>{String(content)}</span>;
}
`;
  } else if (frontend === 'vue') {
    code += `
/**
 * Vue safe rendering utilities
 */
import { createApp } from 'vue';

// Global directive for safe HTML
app.directive('safe-html', {
  mounted(el, binding) {
    const sanitized = DOMPurify.sanitize(binding.value, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onclick']
    });
    el.innerHTML = sanitized;
  },
  updated(el, binding) {
    const sanitized = DOMPurify.sanitize(binding.value, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onclick']
    });
    el.innerHTML = sanitized;
  }
});
`;
  } else if (frontend === 'angular') {
    code += `
/**
 * Angular safe HTML pipe
 */
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // First sanitize with DOMPurify
    const sanitized = DOMPurify.sanitize(value, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onclick']
    });
    // Then bypass Angular's sanitization (input is already safe)
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }
}
`;
  }

  return code;
}

/**
 * Fastify XSS prevention
 */
function generateFastifyXss({ cspLevel, sanitizeInput, encodeOutput, frontend }) {
  const cspHeader = getCspHeader(cspLevel);

  let code = `// XSS Prevention for Fastify
const crypto = require('crypto');
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

// Add onRequest hook for input sanitization
${sanitizeInput ? `
fastify.addHook('onRequest', async (request, reply) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') return validator.escape(obj.trim());
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (request.body) request.body = sanitize(request.body);
  if (request.query) request.query = sanitize(request.query);
  if (request.params) request.params = sanitize(request.params);
});
` : ''}

// Add onSend hook for security headers
fastify.addHook('onSend', async (request, reply, payload) => {
  const nonce = ${cspLevel === 'strict' ? 'crypto.randomBytes(16).toString("base64")' : 'null'};
  const cspDirectives = ${JSON.stringify(cspHeader)}.join('; ');
  const cspHeaderValue = ${cspLevel === 'strict' ? 'cspDirectives.replace("{nonce}", nonce)' : 'cspDirectives'};

  reply.header('Content-Security-Policy', cspHeaderValue);
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  return payload;
});
`;

  return code;
}

/**
 * NestJS XSS prevention
 */
function generateNestJsXss({ cspLevel, sanitizeInput, encodeOutput, frontend }) {
  const cspHeader = getCspHeader(cspLevel);

  let code = `// XSS Prevention for NestJS
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import * as validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class XssProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
${sanitizeInput ? `
    // Sanitize input
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') return validator.escape(obj.trim());
      if (Array.isArray(obj)) return obj.map(sanitize);
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitize(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
` : ''}
    // Set security headers
    const nonce = ${cspLevel === 'strict' ? 'crypto.randomBytes(16).toString("base64")' : 'null'};
    const cspDirectives = ${JSON.stringify(cspHeader)}.join('; ');
    const cspHeaderValue = ${cspLevel === 'strict' ? 'cspDirectives.replace("{nonce}", nonce)' : 'cspDirectives'};

    res.setHeader('Content-Security-Policy', cspHeaderValue);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  }
}
`;

  return code;
}

/**
 * Koa XSS prevention
 */
function generateKoaXss({ cspLevel, sanitizeInput, encodeOutput, frontend }) {
  const cspHeader = getCspHeader(cspLevel);

  let code = `// XSS Prevention for Koa
const crypto = require('crypto');
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

// XSS protection middleware
async function xssProtectionMiddleware(ctx, next) {
${sanitizeInput ? `
  // Sanitize input
  const sanitize = (obj) => {
    if (typeof obj === 'string') return validator.escape(obj.trim());
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (ctx.request.body) ctx.request.body = sanitize(ctx.request.body);
  if (ctx.request.query) ctx.request.query = sanitize(ctx.request.query);
` : ''}
  // Set security headers
  const nonce = ${cspLevel === 'strict' ? 'crypto.randomBytes(16).toString("base64")' : 'null'};
  const cspDirectives = ${JSON.stringify(cspHeader)}.join('; ');
  const cspHeaderValue = ${cspLevel === 'strict' ? 'cspDirectives.replace("{nonce}", nonce)' : 'cspDirectives'};

  ctx.set('Content-Security-Policy', cspHeaderValue);
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.set('X-Frame-Options', 'DENY');
  ctx.set('X-XSS-Protection', '1; mode=block');
  ctx.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  await next();
}

app.use(xssProtectionMiddleware);
`;

  return code;
}

/**
 * Vanilla Node.js XSS prevention
 */
function generateVanillaXss({ cspLevel, sanitizeInput, encodeOutput, frontend }) {
  const cspHeader = getCspHeader(cspLevel);

  return `// XSS Prevention for Vanilla Node.js
const http = require('http');
const crypto = require('crypto');
const url = require('url');

const server = http.createServer((req, res) => {
  // Set security headers
  const nonce = ${cspLevel === 'strict' ? 'crypto.randomBytes(16).toString("base64")' : 'null'};
  const cspDirectives = ${JSON.stringify(cspHeader)}.join('; ');
  const cspHeaderValue = ${cspLevel === 'strict' ? 'cspDirectives.replace("{nonce}", nonce)' : 'cspDirectives'};

  res.setHeader('Content-Security-Policy', cspHeaderValue);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle request
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(\`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Secure Page</title>
      <script nonce="\${nonce || ''}">
        // Safe inline script with nonce
        console.log('Page loaded securely');
      </script>
    </head>
    <body>
      <h1>Secure Page</h1>
      <div id="content"></div>
      <script nonce="\${nonce || ''}">
        // Always use textContent instead of innerHTML with user input
        function setContent(text) {
          document.getElementById('content').textContent = text;
        }
      </script>
    </body>
    </html>
  \`);
});

server.listen(3000);
`;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--framework' && args[i + 1]) {
      params.framework = args[++i];
    } else if (args[i] === '--csp' && args[i + 1]) {
      params.cspLevel = args[++i];
    } else if (args[i] === '--sanitize-input') {
      params.sanitizeInput = true;
    } else if (args[i] === '--encode-output') {
      params.encodeOutput = true;
    } else if (args[i] === '--frontend' && args[i + 1]) {
      params.frontend = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      params.output = args[++i];
    }
  }

  const code = generateXssPrevention(params);

  if (params.output) {
    fs.writeFileSync(params.output, code, 'utf8');
    console.log(`XSS prevention written to ${params.output}`);
  } else {
    console.log(code);
  }
}

module.exports = { generateXssPrevention };
