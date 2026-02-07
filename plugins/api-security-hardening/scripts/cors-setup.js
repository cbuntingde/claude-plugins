#!/usr/bin/env node
/**
 * CORS Setup Script
 * Generates secure CORS configuration for various frameworks
 */

const path = require('path');
const fs = require('fs');

/**
 * Generate CORS configuration
 */
function generateCorsConfig(params = {}) {
  const framework = params.framework || 'express';
  const origins = params.origins ? params.origins.split(',').map(o => o.trim()) : [];
  const credentials = params.credentials || false;
  const maxAge = params.maxAge || 86400;
  const exposedHeaders = params.exposedHeaders ? params.exposedHeaders.split(',').map(h => h.trim()) : [];

  const configs = {
    express: generateExpressCors,
    fastify: generateFastifyCors,
    nestjs: generateNestJSCors,
    koa: generateKoaCors,
    vanilla: generateVanillaCors
  };

  const generator = configs[framework] || configs.express;
  return generator({ origins, credentials, maxAge, exposedHeaders });
}

/**
 * Express CORS configuration
 */
function generateExpressCors({ origins, credentials, maxAge, exposedHeaders }) {
  const code = `// Secure CORS Configuration for Express
const cors = require('cors');

// Whitelist of allowed origins
const allowedOrigins = ${origins.length ? JSON.stringify(origins, null, 2) : '[\'https://example.com\', \'https://app.example.com\']'};

const corsOptions = {
  // Only allow requests from whitelisted origins
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }${credentials ? `,
  // Allow credentials (cookies, authorization headers)
  credentials: true,` : ''}

  // Expose specific headers to the browser
  exposedHeaders: ${exposedHeaders.length ? JSON.stringify(exposedHeaders) : '["Content-Range", "X-Content-Range"]'},

  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

  // Cache preflight response for 24 hours
  maxAge: ${maxAge},

  // Set to false for production (no preflight request caching bypass)
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Error handler for CORS errors
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'CORS not allowed' });
  } else {
    next(err);
  }
});
`;

  return code;
}

/**
 * Fastify CORS configuration
 */
function generateFastifyCors({ origins, credentials, maxAge, exposedHeaders }) {
  const code = `// Secure CORS Configuration for Fastify
const fastify = require('fastify')({ logger: true });

// Whitelist of allowed origins
const allowedOrigins = ${origins.length ? JSON.stringify(origins, null, 2) : '[\'https://example.com\', \'https://app.example.com\']'};

// Register CORS plugin
await fastify.register(require('@fastify/cors'), {
  // Origin validation function
  origin: function (origin, cb) {
    // Allow requests with no origin
    if (!origin) return cb(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  }${credentials ? `,
  // Allow credentials
  credentials: true,` : ''}

  // Exposed headers
  exposedHeaders: ${exposedHeaders.length ? JSON.stringify(exposedHeaders) : '["Content-Range", "X-Content-Range"]'},

  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

  // Preflight cache duration
  maxAge: ${maxAge}
});
`;

  return code;
}

/**
 * NestJS CORS configuration
 */
function generateNestJSCors({ origins, credentials, maxAge, exposedHeaders }) {
  const code = `// Secure CORS Configuration for NestJS
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with secure configuration
  app.enableCors({
    // Whitelist of allowed origins
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      const allowedOrigins = ${origins.length ? JSON.stringify(origins, null, 2) : '[\'https://example.com\', \'https://app.example.com\']'};

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }${credentials ? `,
    // Allow credentials
    credentials: true,` : ''}

    // Exposed headers
    exposedHeaders: ${exposedHeaders.length ? JSON.stringify(exposedHeaders) : '["Content-Range", "X-Content-Range"]'},

    // Allowed methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

    // Preflight cache duration
    maxAge: ${maxAge}
  });

  await app.listen(3000);
}
bootstrap();
`;

  return code;
}

/**
 * Koa CORS configuration
 */
function generateKoaCors({ origins, credentials, maxAge, exposedHeaders }) {
  const code = `// Secure CORS Configuration for Koa
const Koa = require('koa');
const cors = require('@koa/cors');

const app = new Koa();

// Whitelist of allowed origins
const allowedOrigins = ${origins.length ? JSON.stringify(origins, null, 2) : '[\'https://example.com\', \'https://app.example.com\']'};

// CORS middleware
app.use(cors({
  // Origin validation
  origin: function (ctx) {
    const requestOrigin = ctx.get('Origin');

    // Allow requests with no origin
    if (!requestOrigin) return '*';

    if (allowedOrigins.indexOf(requestOrigin) !== -1) {
      return requestOrigin;
    }

    return allowedOrigins[0];
  }${credentials ? `,
  // Allow credentials
  credentials: true,` : ''}

  // Exposed headers
  exposeHeaders: ${exposedHeaders.length ? JSON.stringify(exposedHeaders) : '["Content-Range", "X-Content-Range"]'},

  // Allowed methods
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

  // Preflight cache duration
  maxAge: ${maxAge}
}));

app.listen(3000);
`;

  return code;
}

/**
 * Vanilla Node.js CORS configuration
 */
function generateVanillaCors({ origins, credentials, maxAge, exposedHeaders }) {
  const code = `// Secure CORS Configuration for Vanilla Node.js (http module)
const http = require('http');
const url = require('url');

// Whitelist of allowed origins
const allowedOrigins = ${origins.length ? JSON.stringify(origins, null, 2) : '[\'https://example.com\', \'https://app.example.com\']'};

const server = http.createServer((req, res) => {
  const requestOrigin = req.headers.origin;

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    // Check origin
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else if (!requestOrigin) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

${credentials ? `    // Allow credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
` : ''}
`    // Exposed headers
    res.setHeader('Access-Control-Expose-Headers', ${exposedHeaders.length ? JSON.stringify(exposedHeaders.join(', ')) : '\'Content-Range, X-Content-Range\''});

    // Allowed methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    // Allowed headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Preflight cache duration
    res.setHeader('Access-Control-Max-Age', ${maxAge.toString()});

    res.writeHead(204);
    res.end();
    return;
  }

  // Handle actual requests
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else if (!requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

${credentials ? `  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
` : ''}
`  // Exposed headers
  res.setHeader('Access-Control-Expose-Headers', ${exposedHeaders.length ? JSON.stringify(exposedHeaders.join(', ')) : '\'Content-Range, X-Content-Range\''});

  // Your request handling logic here
  res.writeHead(200);
  res.end('Hello World');
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
    } else if (args[i] === '--origins' && args[i + 1]) {
      params.origins = args[++i];
    } else if (args[i] === '--credentials') {
      params.credentials = true;
    } else if (args[i] === '--max-age' && args[i + 1]) {
      params.maxAge = parseInt(args[++i]);
    } else if (args[i] === '--exposed-headers' && args[i + 1]) {
      params.exposedHeaders = args[++i];
    }
  }

  const config = generateCorsConfig(params);

  if (params.output) {
    fs.writeFileSync(params.output, config, 'utf8');
    console.log(`CORS configuration written to ${params.output}`);
  } else {
    console.log(config);
  }
}

module.exports = { generateCorsConfig };
