/**
 * @fileoverview HTTP Server for Local Lambda Testing
 * This creates a simple HTTP server that wraps the Lambda function for testing
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { handler } = require('./lambda');

const PORT = 9001;

// Convert HTTP request to Lambda event
function httpToLambdaEvent(req, body) {
  const parsedUrl = url.parse(req.url, true);
  
  return {
    httpMethod: req.method,
    path: parsedUrl.pathname,
    headers: req.headers,
    queryStringParameters: parsedUrl.query,
    body: body,
    isBase64Encoded: false
  };
}

// Convert Lambda response to HTTP response
function lambdaToHttpResponse(res, lambdaResponse) {
  // Set status code
  res.statusCode = lambdaResponse.statusCode || 200;
  
  // Set headers
  if (lambdaResponse.headers) {
    Object.keys(lambdaResponse.headers).forEach(key => {
      res.setHeader(key, lambdaResponse.headers[key]);
    });
  }
  
  // Handle redirects
  if (lambdaResponse.headers && lambdaResponse.headers.location) {
    res.writeHead(lambdaResponse.statusCode, {
      'Location': lambdaResponse.headers.location
    });
    res.end();
    return;
  }
  
  // Set content type if not already set
  if (!res.getHeader('content-type') && lambdaResponse.body) {
    if (typeof lambdaResponse.body === 'object') {
      res.setHeader('content-type', 'application/json');
    } else if (lambdaResponse.body.includes('<html')) {
      res.setHeader('content-type', 'text/html; charset=utf-8');
    }
  }
  
  // Send response body
  if (lambdaResponse.body) {
    if (typeof lambdaResponse.body === 'object') {
      res.end(JSON.stringify(lambdaResponse.body));
    } else {
      res.end(lambdaResponse.body);
    }
  } else {
    res.end();
  }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`\n🌐 ${req.method} ${req.url}`);
  
  let body = '';
  
  // Collect request body
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    try {
      // Convert HTTP request to Lambda event
      const event = httpToLambdaEvent(req, body);
      
      // Call Lambda handler
      const lambdaResponse = await handler(event, {});
      
      // Convert Lambda response to HTTP response
      lambdaToHttpResponse(res, lambdaResponse);
      
      console.log(`✅ Response: ${lambdaResponse.statusCode}`);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      res.statusCode = 500;
      res.setHeader('content-type', 'text/plain');
      res.end('Internal Server Error');
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 HTTP Server for Lambda Testing');
  console.log('=' .repeat(50));
  console.log(`📍 Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`  • GET  http://localhost:${PORT}/ - Home page`);
  console.log(`  • GET  http://localhost:${PORT}/clients - View clients`);
  console.log(`  • GET  http://localhost:${PORT}/users - View users`);
  console.log(`  • GET  http://localhost:${PORT}/auth - OAuth2 authorization`);
  console.log(`  • POST http://localhost:${PORT}/token - OAuth2 token exchange`);
  console.log(`  • GET  http://localhost:${PORT}/userinfo - OAuth2 user info`);
  console.log(`  • GET  http://localhost:${PORT}/auth/callback - OAuth2 callback`);
  console.log('');
  console.log('🔧 Test OAuth2 flow:');
  console.log(`  1. Visit: http://localhost:${PORT}/auth?client_id=test_client&redirect_uri=https://app.demo.test/api/auth/google/callback`);
  console.log(`  2. Select a user to simulate login`);
  console.log(`  3. Check the callback URL for authorization code`);
  console.log('');
  console.log('⏹️  Press Ctrl+C to stop the server');
  console.log('=' .repeat(50));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
