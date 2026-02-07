#!/usr/bin/env node
/**
 * CSRF Protection Script
 * Generates CSRF protection middleware and utilities
 */

const crypto = require('crypto');

/**
 * Generate CSRF protection code
 */
function generateCsrfProtection(params = {}) {
  const framework = params.framework || 'express';
  const strategy = params.strategy || 'sync';
  const cookieName = params.cookieName || '_csrf';
  const headerName = params.headerName || 'x-csrf-token';
  const ignoreMethods = params.ignoreMethods ? params.ignoreMethods.split(',') : ['GET', 'HEAD', 'OPTIONS'];

  const generators = {
    express: generateExpressCsrf,
    fastify: generateFastifyCsrf,
    nestjs: generateNestJSCsrf,
    koa: generateKoaCsrf,
    vanilla: generateVanillaCsrf
  };

  const generator = generators[framework] || generators.express;
  return generator({ strategy, cookieName, headerName, ignoreMethods });
}

/**
 * Express CSRF protection
 */
function generateExpressCsrf({ strategy, cookieName, headerName, ignoreMethods }) {
  const code = `// CSRF Protection for Express
const crypto = require('crypto');

/**
 * Generate cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * CSRF token validation middleware
 */
function csrfProtection(options = {}) {
  const cookieName = options.cookieName || '${cookieName}';
  const headerName = options.headerName || '${headerName}';
  const ignoreMethods = options.ignoreMethods || ${JSON.stringify(ignoreMethods)};
  const ${strategy === 'double-submit' ? 'secret = crypto.randomBytes(32).toString("base64");' : ''}

  return (req, res, next) => {
    // Skip CSRF validation for safe methods
    if (ignoreMethods.includes(req.method)) {
      // Generate and set token for safe methods
      const token = generateCsrfToken();
      res.cookie(cookieName, token${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });
      req.csrfToken = token;
      return next();
    }

    // Validate CSRF token for state-changing operations
    const token = req.headers[headerName.toLowerCase()] || req.body?.[headerName];
    const cookieToken = req.signedCookies?.[cookieName] || req.cookies?.[cookieName];

    if (!token || !cookieToken || token !== cookieToken) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed'
      });
    }

    // Regenerate token after successful validation
    const newToken = generateCsrfToken();
    res.cookie(cookieName, newToken${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
    req.csrfToken = newToken;

    next();
  };
}

// Apply CSRF protection
app.use(csrfProtection());

// Include CSRF token in responses for HTML routes
app.get('/form', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Secure Form</title>
      <script>
        // Get CSRF token from cookie and add to headers
        function getCsrfToken() {
          return document.cookie
            .split('; ')
            .find(row => row.startsWith('${cookieName}='))
            ?.split('=')[1];
        }

        // Fetch with CSRF token
        async function submitForm(data) {
          const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              '${headerName}': getCsrfToken()
            },
            body: JSON.stringify(data),
            credentials: 'include'
          });
          return response.json();
        }
      </script>
    </head>
    <body>
      <form id="secureForm">
        <input type="hidden" name="${headerName}" value="\${req.csrfToken}">
        <input type="text" name="username" placeholder="Username">
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  \`);
});
`;

  return code;
}

/**
 * Fastify CSRF protection
 */
function generateFastifyCsrf({ strategy, cookieName, headerName, ignoreMethods }) {
  const code = `// CSRF Protection for Fastify
const crypto = require('crypto');
const fp = require('fastify-plugin');

/**
 * Generate cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * CSRF protection plugin
 */
async function csrfProtection(fastify, options) {
  const cookieName = options.cookieName || '${cookieName}';
  const headerName = options.headerName || '${headerName}';
  const ignoreMethods = options.ignoreMethods || ${JSON.stringify(ignoreMethods)};

  fastify.addHook('onRequest', async (request, reply) => {
    // Skip CSRF validation for safe methods
    if (ignoreMethods.includes(request.routerMethod)) {
      const token = generateCsrfToken();
      reply.setCookie(cookieName, token${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
        httpOnly: true,
        secure: fastify.config.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 3600 // 1 hour
      });
      request.csrfToken = token;
      return;
    }

    // Validate CSRF token
    const token = request.headers[headerName.toLowerCase()] || request.body?.[headerName];
    const cookieToken = request.cookies?.[cookieName];

    if (!token || !cookieToken || token !== cookieToken) {
      return reply.code(403).send({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed'
      });
    }

    // Regenerate token
    const newToken = generateCsrfToken();
    reply.setCookie(cookieName, newToken${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
      httpOnly: true,
      secure: fastify.config.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600
    });
    request.csrfToken = newToken;
  });
}

// Register plugin
await fastify.register(fp(csrfProtection), {
  cookieName: '${cookieName}',
  headerName: '${headerName}'
});
`;

  return code;
}

/**
 * NestJS CSRF protection
 */
function generateNestJSCsrf({ strategy, cookieName, headerName, ignoreMethods }) {
  const code = `// CSRF Protection for NestJS
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly cookieName = '${cookieName}';
  private readonly headerName = '${headerName}';
  private readonly ignoreMethods = ${JSON.stringify(ignoreMethods)};

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF validation for safe methods
    if (this.ignoreMethods.includes(req.method)) {
      const token = this.generateToken();
      res.cookie(this.cookieName, token${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000
      });
      (req as any).csrfToken = token;
      return next();
    }

    // Validate CSRF token
    const token = req.headers[this.headerName.toLowerCase()] || (req.body as any)?.[this.headerName];
    const cookieToken = (req.signedCookies as any)?.[this.cookieName] || (req.cookies as any)?.[this.cookieName];

    if (!token || !cookieToken || token !== cookieToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    // Regenerate token
    const newToken = this.generateToken();
    res.cookie(this.cookieName, newToken${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
    (req as any).csrfToken = newToken;

    next();
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }
}

// In module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .exclude('health',)
      .forRoutes('*');
  }
}
`;

  return code;
}

/**
 * Koa CSRF protection
 */
function generateKoaCsrf({ strategy, cookieName, headerName, ignoreMethods }) {
  const code = `// CSRF Protection for Koa
const crypto = require('crypto');
const Router = require('@koa/router');

const router = new Router();

/**
 * Generate cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * CSRF middleware
 */
async function csrfMiddleware(ctx, next) {
  const cookieName = '${cookieName}';
  const headerName = '${headerName}';
  const ignoreMethods = ${JSON.stringify(ignoreMethods)};

  // Skip CSRF validation for safe methods
  if (ignoreMethods.includes(ctx.method)) {
    const token = generateCsrfToken();
    ctx.cookies.set(cookieName, token${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
    ctx.state.csrfToken = token;
    return next();
  }

  // Validate CSRF token
  const token = ctx.get(headerName.toLowerCase()) || ctx.request.body?.[headerName];
  const cookieToken = ctx.cookies.get(cookieName);

  if (!token || !cookieToken || token !== cookieToken) {
    ctx.status = 403;
    ctx.body = { error: 'Invalid CSRF token' };
    return;
  }

  // Regenerate token
  const newToken = generateCsrfToken();
  ctx.cookies.set(cookieName, newToken${strategy === 'double-submit' ? ', { signed: true }' : ''}, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000
  });
  ctx.state.csrfToken = newToken;

  await next();
}

app.use(csrfMiddleware);
`;

  return code;
}

/**
 * Vanilla Node.js CSRF protection
 */
function generateVanillaCsrf({ strategy, cookieName, headerName, ignoreMethods }) {
  const code = `// CSRF Protection for Vanilla Node.js
const http = require('http');
const crypto = require('crypto');
const { parse } = require('cookie');

/**
 * Generate cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Set CSRF cookie
 */
function setCsrfCookie(res, token) {
  const cookieValue = \`${cookieName}=\${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600\`;
  res.setHeader('Set-Cookie', cookieValue);
  return token;
}

/**
 * Parse cookies from request
 */
function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return {};
  return parse(cookieHeader);
}

const server = http.createServer((req, res) => {
  const ignoreMethods = ${JSON.stringify(ignoreMethods)};
  const cookies = parseCookies(req);

  // Skip CSRF validation for safe methods
  if (ignoreMethods.includes(req.method)) {
    const token = generateCsrfToken();
    setCsrfCookie(res, token);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(\`
      <!DOCTYPE html>
      <html>
      <body>
        <form method="POST" action="/submit">
          <input type="hidden" name="${headerName}" value="\${token}">
          <input type="text" name="username">
          <button type="submit">Submit</button>
        </form>
        <script>
          // Get CSRF token for fetch requests
          function getCsrfToken() {
            return document.cookie
              .split('; ')
              .find(row => row.startsWith('${cookieName}='))
              ?.split('=')[1];
          }

          // Example fetch with CSRF token
          async function submitData(data) {
            await fetch('/api/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                '${headerName}': getCsrfToken()
              },
              body: JSON.stringify(data),
              credentials: 'include'
            });
          }
        </script>
      </body>
      </html>
    \`);
    return;
  }

  // Validate CSRF token for state-changing operations
  const token = req.headers[headerName.toLowerCase()];
  const cookieToken = cookies[cookieName];

  if (!token || !cookieToken || token !== cookieToken) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid CSRF token' }));
    return;
  }

  // Regenerate token
  const newToken = generateCsrfToken();
  setCsrfCookie(res, newToken);

  // Handle request
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true }));
});

server.listen(3000);
`;

  return code;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--framework' && args[i + 1]) {
      params.framework = args[++i];
    } else if (args[i] === '--strategy' && args[i + 1]) {
      params.strategy = args[++i];
    } else if (args[i] === '--cookie-name' && args[i + 1]) {
      params.cookieName = args[++i];
    } else if (args[i] === '--header-name' && args[i + 1]) {
      params.headerName = args[++i];
    } else if (args[i] === '--ignore-methods' && args[i + 1]) {
      params.ignoreMethods = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      params.output = args[++i];
    }
  }

  const code = generateCsrfProtection(params);

  if (params.output) {
    const fs = require('fs');
    fs.writeFileSync(params.output, code, 'utf8');
    console.log(`CSRF protection written to ${params.output}`);
  } else {
    console.log(code);
  }
}

module.exports = { generateCsrfProtection };
