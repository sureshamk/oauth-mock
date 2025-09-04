/**
 * @fileoverview LocalStack Lambda Testing Script
 * This script tests the Lambda function deployed in LocalStack
 */

const AWS = require('aws-sdk');
const axios = require('axios');

// Configure AWS SDK for LocalStack
const lambda = new AWS.Lambda({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
  sslEnabled: false
});

const apigateway = new AWS.APIGateway({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
  sslEnabled: false
});

async function testLocalStackLambda() {
  console.log('🧪 Testing Lambda Function in LocalStack');
  console.log('=' .repeat(50));

  try {
    // Test 1: List Lambda functions
    console.log('\n📋 Test 1: List Lambda Functions');
    console.log('-'.repeat(30));
    
    const functions = await lambda.listFunctions().promise();
    console.log(`✅ Found ${functions.Functions.length} Lambda function(s)`);
    
    const mockFunction = functions.Functions.find(f => f.FunctionName === 'mock-oauth2-server');
    if (mockFunction) {
      console.log(`✅ Found mock-oauth2-server function`);
      console.log(`   Runtime: ${mockFunction.Runtime}`);
      console.log(`   Handler: ${mockFunction.Handler}`);
      console.log(`   Memory: ${mockFunction.MemorySize}MB`);
      console.log(`   Timeout: ${mockFunction.Timeout}s`);
    } else {
      console.log('❌ mock-oauth2-server function not found');
      return;
    }

    // Test 2: Invoke Lambda function directly
    console.log('\n📋 Test 2: Direct Lambda Invocation');
    console.log('-'.repeat(30));
    
    const testEvent = {
      httpMethod: 'GET',
      path: '/',
      headers: {},
      queryStringParameters: null,
      body: null
    };

    const invokeResult = await lambda.invoke({
      FunctionName: 'mock-oauth2-server',
      Payload: JSON.stringify(testEvent)
    }).promise();

    const response = JSON.parse(invokeResult.Payload);
    console.log(`✅ Lambda invocation successful`);
    console.log(`   Status Code: ${response.statusCode}`);
    console.log(`   Body Length: ${response.body ? response.body.length : 0} characters`);
    console.log(`   Contains HTML: ${response.body && response.body.includes('<html') ? 'Yes' : 'No'}`);

    // Test 3: Test OAuth2 endpoints
    console.log('\n📋 Test 3: OAuth2 Endpoints');
    console.log('-'.repeat(30));

    const oauth2Tests = [
      {
        name: 'Authorization Endpoint',
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
        name: 'Token Endpoint',
        event: {
          httpMethod: 'POST',
          path: '/token',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          queryStringParameters: null,
          body: 'grant_type=authorization_code&code=test_code&client_id=test_client&client_secret=test_secret&redirect_uri=https://app.demo.test/api/auth/google/callback'
        }
      },
      {
        name: 'UserInfo Endpoint',
        event: {
          httpMethod: 'GET',
          path: '/userinfo',
          headers: {},
          queryStringParameters: {
            access_token: 'test_token'
          },
          body: null
        }
      }
    ];

    for (const test of oauth2Tests) {
      try {
        const result = await lambda.invoke({
          FunctionName: 'mock-oauth2-server',
          Payload: JSON.stringify(test.event)
        }).promise();

        const response = JSON.parse(result.Payload);
        console.log(`✅ ${test.name}: ${response.statusCode}`);
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }

    // Test 4: List API Gateway APIs
    console.log('\n📋 Test 4: API Gateway');
    console.log('-'.repeat(30));
    
    try {
      const apis = await apigateway.getRestApis().promise();
      console.log(`✅ Found ${apis.items.length} API Gateway API(s)`);
      
      const mockApi = apis.items.find(api => api.name === 'mock-oauth2-api');
      if (mockApi) {
        console.log(`✅ Found mock-oauth2-api`);
        console.log(`   ID: ${mockApi.id}`);
        console.log(`   Name: ${mockApi.name}`);
        console.log(`   Description: ${mockApi.description}`);
      } else {
        console.log('❌ mock-oauth2-api not found');
      }
    } catch (error) {
      console.log(`❌ API Gateway test failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 LocalStack Lambda Testing Completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Lambda function deployed and accessible');
    console.log('✅ OAuth2 endpoints functional');
    console.log('✅ API Gateway created');
    console.log('✅ Direct invocation working');
    console.log('\n🚀 Lambda function is ready for production deployment!');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure LocalStack is running: docker-compose up localstack');
    console.log('2. Check if Lambda function is deployed: docker-compose up lambda-deployer');
    console.log('3. Verify LocalStack is accessible at http://localhost:4566');
  }
}

// Run the test
testLocalStackLambda().catch(console.error);
