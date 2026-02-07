#!/usr/bin/env node

/**
 * Semantic Code Search MCP Server
 *
 * Provides semantic search capabilities using vector embeddings
 * to understand natural language queries about code.
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

// Security constants
const MAX_OUTPUT_SIZE = 10 * 1024 * 1024; // 10MB max response size
const MAX_FILES = 10000; // Maximum files to index
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max individual file size
const MAX_LIMIT = 1000; // Maximum limit for search results

/**
 * Validate root path to prevent path traversal
 */
function validateRootPath(rootPath, baseDir = process.cwd()) {
  const resolved = path.resolve(baseDir, rootPath);
  const baseResolved = path.resolve(baseDir);

  // Prevent traversal outside base directory
  if (!resolved.startsWith(baseResolved)) {
    throw new Error('Access denied: root path is outside allowed scope');
  }

  return path.normalize(resolved);
}

class SemanticSearchServer extends EventEmitter {
  constructor() {
    super();
    this.index = new Map();
    this.embeddingCache = new Map();
    this.indexed = false;
  }

  async initialize() {
    console.error('Semantic Search Server initializing...');
    // In production, load or create the index here
    this.emit('ready');
  }

  /**
   * Generate a simple embedding for text
   * In production, use actual embedding models like:
   * - OpenAI embeddings
   * - Cohere embeddings
   * - Local models (sentence-transformers)
   */
  async generateEmbedding(text) {
    // Simple hash-based embedding for demo
    // Replace with actual embedding service in production
    const words = text.toLowerCase().split(/\W+/);
    const vector = new Array(384).fill(0); // Standard embedding size

    words.forEach((word, i) => {
      for (let j = 0; j < word.length; j++) {
        const idx = (word.charCodeAt(j) + i * 7) % 384;
        vector[idx] += 1 / (i + 1);
      }
    });

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map(v => v / magnitude);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Index a code file
   */
  async indexFile(filePath, content) {
    const embedding = await this.generateEmbedding(content);
    this.index.set(filePath, {
      embedding,
      content,
      path: filePath,
      timestamp: Date.now()
    });
  }

  /**
   * Search the index semantically
   */
  async search(query, options = {}) {
    const { limit = 10, threshold = 0.3 } = options;
    const queryEmbedding = await this.generateEmbedding(query);

    const results = [];

    for (const [filePath, data] of this.index.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);

      if (similarity >= threshold) {
        results.push({
          filePath,
          content: data.content,
          similarity,
          context: this.extractContext(data.content, query)
        });
      }
    }

    // Sort by similarity and limit results
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Extract relevant context from content
   */
  extractContext(content, query) {
    const lines = content.split('\n');
    const queryWords = query.toLowerCase().split(/\W+/);

    // Find most relevant lines
    const scores = lines.map((line, i) => {
      const lineLower = line.toLowerCase();
      let score = 0;
      queryWords.forEach(word => {
        if (lineLower.includes(word)) score += 1;
      });
      return { line, score, index: i };
    });

    // Get top scoring lines
    scores.sort((a, b) => b.score - a.score);
    const topLines = scores.slice(0, 5).map(s => ({
      number: s.index + 1,
      content: s.line,
      score: s.score
    }));

    return {
      lines: topLines,
      summary: this.generateSummary(content)
    };
  }

  /**
   * Generate a summary of code content
   */
  generateSummary(content) {
    const lines = content.split('\n');
    const functions = lines.filter(l => l.match(/^\s*(function|const|let|var|class)\s+\w+/));
    const comments = lines.filter(l => l.match(/^\s*\/\//));

    return {
      functionCount: functions.length,
      commentCount: comments.length,
      lineCount: lines.length,
      hasFunctions: functions.length > 0,
      hasComments: comments.length > 0
    };
  }

  /**
   * Handle MCP tool calls
   */
  async handleToolCall(name, args) {
    switch (name) {
      case 'semantic_search':
        return await this.semanticSearch(args);

      case 'index_codebase':
        return await this.indexCodebase(args);

      case 'get_index_status':
        return await this.getIndexStatus();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * Semantic search tool
   */
  async semanticSearch({ query, limit = 10, threshold }) {
    console.error(`Searching for: ${query}`);

    // Validate and clamp limit parameter
    const safeLimit = Math.min(Math.max(limit || 10, 1), MAX_LIMIT);

    if (!this.indexed || this.index.size === 0) {
      return {
        success: false,
        message: 'Index not built. Use /semantic-index first.',
        results: []
      };
    }

    const results = await this.search(query, { limit: safeLimit, threshold });

    return {
      success: true,
      query,
      resultCount: results.length,
      results: results.map(r => ({
        filePath: r.filePath,
        similarity: Math.round(r.similarity * 1000) / 1000,
        relevance: this.getRelevanceLabel(r.similarity),
        context: r.context,
        preview: this.getPreview(r.content)
      }))
    };
  }

  /**
   * Index codebase tool
   */
  async indexCodebase({ rootPath, force }) {
    // Validate rootPath to prevent path traversal
    const validatedRootPath = validateRootPath(rootPath || '.');
    console.error(`Indexing codebase at: ${validatedRootPath}`);

    try {
      const files = await this.walkDirectory(validatedRootPath);
      let indexed = 0;

      for (const file of files) {
        try {
          // Check file size before reading
          const stats = await fs.stat(file);
          if (stats.size > MAX_FILE_SIZE) {
            console.error(`Skipping large file: ${file}`);
            continue;
          }
          const content = await fs.readFile(file, 'utf-8');
          await this.indexFile(file, content);
          indexed++;
        } catch (err) {
          console.error(`Failed to index ${file}: ${err.message}`);
        }
      }

      this.indexed = true;

      return {
        success: true,
        message: `Successfully indexed ${indexed} files`,
        indexed,
        totalFiles: files.length,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
        error: err.toString()
      };
    }
  }

  /**
   * Get index status
   */
  async getIndexStatus() {
    return {
      success: true,
      indexed: this.indexed,
      fileCount: this.index.size,
      lastUpdated: Math.max(...Array.from(this.index.values()).map(f => f.timestamp))
    };
  }

  /**
   * Walk directory recursively
   */
  async walkDirectory(dir, extensions = ['.js', '.ts', '.py', '.go', '.java', '.jsx', '.tsx']) {
    const files = [];
    let fileCount = 0;

    async function walk(currentPath) {
      // Check file count limit
      if (fileCount >= MAX_FILES) {
        console.error('Max file count reached, stopping traversal');
        return;
      }

      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        // Skip node_modules and common ignore patterns
        if (entry.name === 'node_modules' ||
            entry.name === '.git' ||
            entry.name === 'dist' ||
            entry.name === 'build') {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
            fileCount++;
          }
        }
      }
    }

    await walk(dir);
    return files;
  }

  /**
   * Get relevance label
   */
  getRelevanceLabel(similarity) {
    if (similarity > 0.8) return 'high';
    if (similarity > 0.6) return 'medium';
    return 'low';
  }

  /**
   * Get preview of content
   */
  getPreview(content, maxLength = 200) {
    const lines = content.split('\n').slice(0, 10);
    let preview = lines.join('\n');
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength) + '...';
    }
    return preview;
  }
}

// MCP Server protocol implementation
class MCPServer {
  constructor(server) {
    this.server = server;
    this.stdin = process.stdin;
    this.stdout = process.stdout;
  }

  start() {
    let buffer = '';

    this.stdin.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim()) {
          this.handleMessage(JSON.parse(line));
        }
      }
    });

    this.server.initialize();
    this.sendNotification('notifications/initialized', {
      capabilities: this.getCapabilities()
    });
  }

  getCapabilities() {
    return {
      tools: {
        semantic_search: {
          description: 'Search codebase using semantic understanding',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Natural language search query'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
                default: 10
              },
              threshold: {
                type: 'number',
                description: 'Minimum similarity threshold (0-1)',
                default: 0.3
              }
            },
            required: ['query']
          }
        },
        index_codebase: {
          description: 'Build semantic index for the codebase',
          inputSchema: {
            type: 'object',
            properties: {
              rootPath: {
                type: 'string',
                description: 'Root directory to index'
              },
              force: {
                type: 'boolean',
                description: 'Force complete rebuild',
                default: false
              }
            }
          }
        },
        get_index_status: {
          description: 'Get current index status',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      }
    };
  }

  async handleMessage(message) {
    const { id, method, params } = message;

    try {
      let result;

      switch (method) {
        case 'tools/call':
          result = await this.server.handleToolCall(params.name, params.arguments);
          break;

        case 'initialize':
          result = { status: 'ready' };
          break;

        default:
          throw new Error(`Unknown method: ${method}`);
      }

      this.sendResponse(id, result);
    } catch (err) {
      this.sendError(id, err);
    }
  }

  sendResponse(id, result) {
    this.write({
      jsonrpc: '2.0',
      id,
      result
    });
  }

  sendError(id, error) {
    this.write({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: error.message
      }
    });
  }

  sendNotification(method, params) {
    this.write({
      jsonrpc: '2.0',
      method,
      params
    });
  }

  write(data) {
    this.stdout.write(JSON.stringify(data) + '\n');
  }
}

// Start the server
const searchServer = new SemanticSearchServer();
const mcpServer = new MCPServer(searchServer);
mcpServer.start();

console.error('Semantic Search MCP Server running...');
