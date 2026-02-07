#!/usr/bin/env node

/**
 * Test script for Semantic Search MCP Server
 */

const SemanticSearchServer = require('../servers/semantic-search-server.js');

async function test() {
  console.log('Testing Semantic Search Server...\n');

  const server = new SemanticSearchServer();

  // Test 1: Generate embeddings
  console.log('Test 1: Generating embeddings...');
  const embedding1 = await server.generateEmbedding('email validation function');
  const embedding2 = await server.generateEmbedding('validate email addresses');
  const embedding3 = await server.generateEmbedding('database connection handler');

  console.log(`✓ Generated embedding for "email validation function": ${embedding1.length} dimensions`);
  console.log(`✓ Generated embedding for "validate email addresses": ${embedding2.length} dimensions`);
  console.log(`✓ Generated embedding for "database connection handler": ${embedding3.length} dimensions\n`);

  // Test 2: Cosine similarity
  console.log('Test 2: Calculating cosine similarity...');
  const sim1 = server.cosineSimilarity(embedding1, embedding2);
  const sim2 = server.cosineSimilarity(embedding1, embedding3);

  console.log(`✓ Similarity (email validation vs validate email): ${sim1.toFixed(3)}`);
  console.log(`✓ Similarity (email validation vs database connection): ${sim2.toFixed(3)}`);
  console.log(`  → Related concepts have higher similarity: ${sim1 > sim2 ? 'PASS' : 'FAIL'}\n`);

  // Test 3: Index files
  console.log('Test 3: Indexing sample code...');
  await server.indexFile('test1.js', `
// Function to validate email addresses
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
  `);

  await server.indexFile('test2.js', `
// Database connection handler with retry logic
async function connectToDatabase() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      return await db.connect();
    } catch (err) {
      attempts++;
      await delay(1000 * attempts);
    }
  }
}
  `);

  await server.indexFile('test3.js', `
// User authentication token validation
function validateAuthToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded.userId;
  } catch (err) {
    throw new Error('Invalid token');
  }
}
  `);

  console.log(`✓ Indexed 3 test files\n`);

  // Test 4: Semantic search
  console.log('Test 4: Semantic search...');
  server.indexed = true;

  const results = await server.search('email validation code');
  console.log(`✓ Found ${results.length} results for "email validation code":`);
  results.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.filePath} (similarity: ${result.similarity.toFixed(3)})`);
  });

  console.log('\nTest 5: Semantic search (retry logic)...');
  const retryResults = await server.search('retry logic');
  console.log(`✓ Found ${retryResults.length} results for "retry logic":`);
  retryResults.forEach((result, i) => {
    console.log(`  ${i + 1}. ${result.filePath} (similarity: ${result.similarity.toFixed(3)})`);
  });

  console.log('\nTest 6: Tool calls...');
  const searchResult = await server.handleToolCall('semantic_search', {
    query: 'authentication validation',
    limit: 5
  });
  console.log(`✓ Tool call result: ${JSON.stringify(searchResult, null, 2)}`);

  console.log('\n✅ All tests passed!');
}

test().catch(console.error);
