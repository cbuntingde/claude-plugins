#!/usr/bin/env node
/**
 * JWT Validation Script
 * Analyzes and generates secure JWT implementations
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * JWT validation and generation
 */
function jwtValidate(params = {}) {
  const scanPath = params.path || '.';
  const generate = params.fix || false;
  const algorithm = params.algorithm || 'RS256';
  const expiration = params.expiration || '15m';
  const refreshExpiration = params.refreshExpiration || '7d';
  const framework = params.framework || 'express';

  if (generate) {
    return generateJwtImplementation({ algorithm, expiration, refreshExpiration, framework });
  }

  return validateJwtImplementation(scanPath);
}

/**
 * Validate existing JWT implementation
 */
function validateJwtImplementation(scanPath) {
  const findings = [];
  const scanExtensions = ['.js', '.ts', '.jsx', '.tsx'];
  const skipDirs = new Set(['node_modules', 'vendor', '.git', '__pycache__', '.venv', 'venv', 'env', 'dist', 'build']);

  // JWT vulnerability patterns
  const jwtPatterns = [
    {
      type: 'Weak Algorithm - None',
      pattern: /algorithm\s*[:=]\s*['"]none['"]/g,
      severity: 'critical',
      fix: 'Use RS256 or ES256 instead of "none"'
    },
    {
      type: 'Weak Algorithm - HS256 with weak secret',
      pattern: /algorithm\s*[:=]\s*['"]hs256['"].*secret\s*[:=]\s*['"][^'']{1,31}['"]/gis,
      severity: 'critical',
      fix: 'Use minimum 256-bit secret or switch to RS256'
    },
    {
      type: 'JWT in URL query parameter',
      pattern: /(query|url|searchParams)\.(.*token|jwt)/gi,
      severity: 'high',
      fix: 'Pass JWT in Authorization header instead of URL'
    },
    {
      type: 'JWT in localStorage',
      pattern: /localStorage\.(get|set)Item\s*\(\s*['"]token['"]/gi,
      severity: 'high',
      fix: 'Store JWT in HttpOnly, Secure, SameSite cookies'
    },
    {
      type: 'Missing expiration',
      pattern: /jwt\.sign\s*\(\s*{[^}]*}\s*,\s*secret\s*(?![^}]*expiresIn)/g,
      severity: 'high',
      fix: 'Always set expiresIn option (recommended: 15m for access tokens)'
    },
    {
      type: 'Long expiration time',
      pattern: /expiresIn\s*[:=]\s*['"]\d+[hH]['"]|expiresIn\s*[:=]\s*['"]\d+[dD]/g,
      severity: 'medium',
      fix: 'Use short expiration for access tokens (5-15 minutes)'
    },
    {
      type: 'Missing claim validation',
      pattern: /jwt\.verify\s*\(\s*token\s*,\s*secret\s*(?!\s*{)/g,
      severity: 'medium',
      fix: 'Validate required claims (iss, aud, exp) in verify options'
    }
  ];

  function scanDirectory(dir, baseFindings = []) {
    if (!fs.existsSync(dir)) {
      return baseFindings;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!skipDirs.has(item)) {
          scanDirectory(fullPath, baseFindings);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (scanExtensions.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
              for (const vuln of jwtPatterns) {
                const matches = lines[i].match(vuln.pattern);

                if (matches) {
                  for (const match of matches) {
                    baseFindings.push({
                      file: fullPath,
                      line: i + 1,
                      type: vuln.type,
                      severity: vuln.severity,
                      code: lines[i].trim().substring(0, 100),
                      fix: vuln.fix
                    });
                  }
                }
              }
            }
          } catch (error) {
            // Skip unreadable files
          }
        }
      }
    }

    return baseFindings;
  }

  const rawFindings = scanDirectory(scanPath);

  const summary = {
    critical: rawFindings.filter(f => f.severity === 'critical').length,
    high: rawFindings.filter(f => f.severity === 'high').length,
    medium: rawFindings.filter(f => f.severity === 'medium').length,
    low: rawFindings.filter(f => f.severity === 'low').length
  };

  let outputText = '\n═════════════════════════════════════════════\n';
  outputText += '    JWT SECURITY VALIDATION REPORT\n';
  outputText += '═════════════════════════════════════════════\n\n';
  outputText += `Path: ${scanPath}\n`;
  outputText += `Total findings: ${rawFindings.length}\n`;
  outputText += `  Critical: ${summary.critical}\n`;
  outputText += `  High: ${summary.high}\n`;
  outputText += `  Medium: ${summary.medium}\n`;
  outputText += `  Low: ${summary.low}\n\n`;

  for (const finding of rawFindings) {
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    outputText += `${severityEmoji[finding.severity]} ${finding.severity.toUpperCase()}: ${finding.type}\n`;
    outputText += `   File: ${finding.file}:${finding.line}\n`;
    outputText += `   Code: ${finding.code}\n`;
    outputText += `   Fix: ${finding.fix}\n\n`;
  }

  outputText += '═════════════════════════════════════════════\n';

  return {
    success: true,
    text: outputText,
    summary,
    findings: rawFindings
  };
}

/**
 * Generate secure JWT implementation
 */
function generateJwtImplementation({ algorithm, expiration, refreshExpiration, framework }) {
  const generators = {
    express: generateExpressJwt,
    fastify: generateFastifyJwt,
    nestjs: generateNestJsJwt,
    koa: generateKoaJwt
  };

  const generator = generators[framework] || generators.express;
  return generator({ algorithm, expiration, refreshExpiration });
}

/**
 * Express JWT implementation
 */
function generateExpressJwt({ algorithm, expiration, refreshExpiration }) {
  const code = `// Secure JWT Implementation for Express
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
${algorithm === 'RS256' ? `const fs = require('fs');

// Load RSA keys for RS256
const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);` : `
// Generate strong secret key (minimum 256 bits)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');`}

/**
 * Generate access token
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    },
    ${algorithm === 'RS256' ? 'privateKey' : 'JWT_SECRET'},
    {
      algorithm: '${algorithm}',
      expiresIn: '${expiration}',
      issuer: process.env.JWT_ISSUER || 'https://api.example.com',
      audience: process.env.JWT_AUDIENCE || 'https://app.example.com',
      subject: payload.userId.toString(),
      jwtid: crypto.randomBytes(16).toString('hex')
    }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
    ${algorithm === 'RS256' ? 'privateKey' : 'JWT_SECRET'},
    {
      algorithm: '${algorithm}',
      expiresIn: '${refreshExpiration}',
      issuer: process.env.JWT_ISSUER || 'https://api.example.com',
      subject: userId.toString(),
      jwtid: crypto.randomBytes(16).toString('hex')
    }
  );
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ${algorithm === 'RS256' ? 'publicKey' : 'JWT_SECRET'}, {
      algorithms: ['${algorithm}'],
      issuer: process.env.JWT_ISSUER || 'https://api.example.com',
      audience: process.env.JWT_AUDIENCE || 'https://app.example.com'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not yet valid');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, ${algorithm === 'RS256' ? 'privateKey' : 'JWT_SECRET'}, {
      algorithms: ['${algorithm}'],
      issuer: process.env.JWT_ISSUER || 'https://api.example.com'
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Authentication middleware
 */
function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
}

// Token refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token is in blacklist (for logout)
    // Implementation depends on your session store

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      // Fetch user data from database
      email: decoded.email,
      role: decoded.role
    });

    // Optionally rotate refresh token
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // Store tokens in HttpOnly, Secure, SameSite cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate credentials (implement your authentication logic)
    const user = await validateCredentials(email, password);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Store in HttpOnly cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed'
    });
  }
});

// Logout endpoint (with token blacklist)
app.post('/auth/logout', authenticate, async (req, res) => {
  try {
    // Add tokens to blacklist (implement with Redis or similar)
    const jti = req.user.jti;
    await addToBlacklist(jti, req.user.exp);

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed'
    });
  }
});

// Apply authentication middleware
app.use('/api', authenticate);
`;

  return code;
}

/**
 * Fastify JWT implementation
 */
function generateFastifyJwt({ algorithm, expiration, refreshExpiration }) {
  return `// Secure JWT Implementation for Fastify
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register JWT plugin
await fastify.register(require('@fastify/jwt'), {
  secret: ${algorithm === 'RS256' ? '{ private: { key: privateKey, passphrase: process.env.JWT_KEY_PASSPHRASE }, public: { key: publicKey } }' : 'process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex")'},
  sign: {
    algorithm: '${algorithm}',
    expiresIn: '${expiration}',
    issuer: 'https://api.example.com',
    audience: 'https://app.example.com'
  },
  verify: {
    algorithms: ['${algorithm}'],
    issuer: 'https://api.example.com',
    audience: 'https://app.example.com'
  }
});

// Generate access token
fastify.post('/auth/login', async (request, reply) => {
  const { email, password } = request.body;

  // Validate credentials
  const user = await validateCredentials(email, password);

  if (!user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    });
  }

  const token = fastify.jwt.sign({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // Set HttpOnly cookie
  reply.setCookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  });

  return { success: true, token };
});

// Authentication hook
fastify.addHook('onRequest', async (request, reply) => {
  // Skip authentication for public routes
  if (request.routerPath.startsWith('/auth')) {
    return;
  }

  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or missing token'
    });
  }
});
`;
}

/**
 * NestJS JWT implementation
 */
function generateNestJsJwt({ algorithm, expiration, refreshExpiration }) {
  return `// Secure JWT Implementation for NestJS
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload, {
        algorithm: '${algorithm}',
        expiresIn: '${expiration}',
        issuer: 'https://api.example.com',
        audience: 'https://app.example.com',
        subject: user.id.toString()
      }),
      refresh_token: this.jwtService.sign(
        { userId: user.id, type: 'refresh' },
        {
          algorithm: '${algorithm}',
          expiresIn: '${refreshExpiration}',
          issuer: 'https://api.example.com',
          subject: user.id.toString()
        }
      )
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        issuer: 'https://api.example.com'
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userService.findById(payload.userId);

      return this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      algorithms: ['${algorithm}'],
      issuer: 'https://api.example.com',
      audience: 'https://app.example.com'
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}
`;
}

/**
 * Koa JWT implementation
 */
function generateKoaJwt({ algorithm, expiration, refreshExpiration }) {
  return `// Secure JWT Implementation for Koa
const jwt = require('jsonwebtoken');
const koaJwt = require('koa-jwt');
const crypto = require('crypto');

// JWT middleware
app.use(koaJwt({
  secret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  algorithms: ['${algorithm}'],
  issuer: 'https://api.example.com',
  audience: 'https://app.example.com'
}).unless({
  path: [/^\\/auth\\/login/, /^\\/auth\\/register/, /^\\/public/]
}));

// Error handling
app.use(async (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        error: 'Unauthorized',
        message: 'Invalid or missing token'
      };
    } else {
      throw err;
    }
  });
});

// Login endpoint
app.use(async (ctx) => {
  if (ctx.path === '/auth/login' && ctx.method === 'POST') {
    const { email, password } = ctx.request.body;

    // Validate credentials
    const user = await validateCredentials(email, password);

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        error: 'Unauthorized',
        message: 'Invalid credentials'
      };
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        algorithm: '${algorithm}',
        expiresIn: '${expiration}',
        issuer: 'https://api.example.com',
        audience: 'https://app.example.com'
      }
    );

    // Set HttpOnly cookie
    ctx.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    ctx.body = { success: true, token };
  }
});
`;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      params.path = args[++i];
    } else if (args[i] === '--fix') {
      params.fix = true;
    } else if (args[i] === '--algorithm' && args[i + 1]) {
      params.algorithm = args[++i];
    } else if (args[i] === '--expiration' && args[i + 1]) {
      params.expiration = args[++i];
    } else if (args[i] === '--refresh-expiration' && args[i + 1]) {
      params.refreshExpiration = args[++i];
    } else if (args[i] === '--framework' && args[i + 1]) {
      params.framework = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      params.output = args[++i];
    }
  }

  const result = jwtValidate(params);

  if (params.output && result.text) {
    fs.writeFileSync(params.output, result.text, 'utf8');
    console.log(`JWT validation report written to ${params.output}`);
  } else if (params.output && typeof result === 'string') {
    fs.writeFileSync(params.output, result, 'utf8');
    console.log(`JWT implementation written to ${params.output}`);
  } else if (result.text) {
    console.log(result.text);
  } else {
    console.log(result);
  }
}

module.exports = { jwtValidate };
