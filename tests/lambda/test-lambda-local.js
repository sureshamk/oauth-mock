/**
 * @fileoverview Local Lambda testing script
 * This script tests the Lambda handler directly without serverless-offline
 */

const { handler } = require('../../lambda');

// Test cases
const testCases = [
  {
    name: 'GET / - Home page',
    event: {
      httpMethod: 'GET',
      path: '/',
      headers: {},
      queryStringParameters: null,
      body: null
    }
  },
  {
    name: 'GET /auth - Authorization endpoint',
    event: {
      httpMethod: 'GET',
      path: '/auth',
      headers: {},
      queryStringParameters: {
        client_id: 'test_client',
        redirect_uri: 'https://app.demo.test/api/auth/google/callback'
      },
      body: null
    }
  },
  {
    name: 'GET /clients - Clients page',
    event: {
      httpMethod: 'GET',
      path: '/clients',
      headers: {},
      queryStringParameters: null,
      body: null
    }
  },
  {
    name: 'GET /users - Users page',
    event: {
      httpMethod: 'GET',
      path: '/users',
      headers: {},
      queryStringParameters: null,
      body: null
    }
  },
  {
    name: 'POST /token - Invalid request',
    event: {
      httpMethod: 'POST',
      path: '/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      queryStringParameters: null,
      body: 'grant_type=authorization_code&code=invalid_code&client_id=test_client&client_secret=test_secret&redirect_uri=https://app.demo.test/api/auth/google/callback'
    }
  },
  {
    name: 'GET /userinfo - Invalid token',
    event: {
      httpMethod: 'GET',
      path: '/userinfo',
      headers: {},
      queryStringParameters: {
        access_token: 'invalid_token'
      },
      body: null
    }
  }
];

async function runTests() {
  console.log('🧪 Testing Lambda Function Locally\n');
  console.log('=' .repeat(50));

  for (const testCase of testCases) {
    try {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log('-'.repeat(40));
      
      const result = await handler(testCase.event, {});
      
      console.log(`✅ Status Code: ${result.statusCode}`);
      console.log(`📄 Headers: ${JSON.stringify(result.headers || {}, null, 2)}`);
      console.log(`📝 Body Length: ${result.body ? result.body.length : 0} characters`);
      
      if (result.body && result.body.length < 200) {
        console.log(`📄 Body Preview: ${result.body.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Lambda testing completed!');
}

// Run the tests
runTests().catch(console.error);
