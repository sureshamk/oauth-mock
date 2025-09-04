# Test Suite Documentation

This directory contains comprehensive tests for the Mock OAuth2 Server Lambda function.

## 📁 Directory Structure

```
tests/
├── README.md                 # This file
├── run-all.js               # Main test runner
├── lambda/                  # Lambda function tests
│   ├── test-lambda-local.js # Basic Lambda handler tests
│   ├── test-oauth2-flow.js  # Complete OAuth2 flow tests
│   └── test-all.js          # Comprehensive Lambda tests
├── localstack/              # LocalStack deployment tests
│   ├── test-localstack.js   # Full LocalStack testing
│   └── test-localstack-simple.js # Deployment verification
└── integration/             # Integration tests
    └── test-http-server.js  # HTTP server testing
```

## 🧪 Test Categories

### 1. **Lambda Tests** (`lambda/`)
Tests the Lambda function handler directly without external dependencies.

**Files:**
- `test-lambda-local.js` - Basic endpoint testing
- `test-oauth2-flow.js` - Complete OAuth2 authentication flow
- `test-all.js` - Comprehensive test suite

**Usage:**
```bash
# Run all Lambda tests
node tests/run-all.js lambda

# Run specific Lambda test
node tests/lambda/test-oauth2-flow.js
```

### 2. **LocalStack Tests** (`localstack/`)
Tests the Lambda function deployed in LocalStack (AWS service emulator).

**Files:**
- `test-localstack-simple.js` - Deployment verification (recommended)
- `test-localstack.js` - Full testing with invocation (may have container issues)

**Usage:**
```bash
# Start LocalStack first
docker-compose up localstack -d
./setup-localstack.sh

# Run LocalStack tests
node tests/run-all.js localstack
```

### 3. **Integration Tests** (`integration/`)
Tests the Lambda function through HTTP requests.

**Files:**
- `test-http-server.js` - HTTP server that wraps Lambda function

**Usage:**
```bash
# Start HTTP server
node tests/integration/test-http-server.js

# Test with curl (in another terminal)
curl http://localhost:9001/
curl http://localhost:9001/auth?client_id=test_client&redirect_uri=...
```

## 🚀 Running Tests

### Run All Tests
```bash
# From project root
node tests/run-all.js

# From tests directory
node run-all.js
```

### Run Specific Test Categories
```bash
# Lambda tests only
node tests/run-all.js lambda

# OAuth2 flow tests only
node tests/run-all.js oauth2

# LocalStack tests only
node tests/run-all.js localstack

# Integration tests only
node tests/run-all.js integration
```

### Run Individual Tests
```bash
# Lambda tests
node tests/lambda/test-lambda-local.js
node tests/lambda/test-oauth2-flow.js
node tests/lambda/test-all.js

# LocalStack tests
node tests/localstack/test-localstack-simple.js

# Integration tests
node tests/integration/test-http-server.js
```

## 📊 Test Results

The main test runner provides:
- ✅ Pass/Fail status for each test
- 📊 Summary statistics
- ⏱️ Execution time
- 🎯 Next steps recommendations

### Example Output
```
🚀 Starting Comprehensive Test Suite
============================================================

🧪 Running: Lambda Handler Tests
📁 File: /path/to/tests/lambda/test-lambda-local.js
============================================================
✅ Lambda Handler Tests - PASSED

🧪 Running: OAuth2 Flow Tests
📁 File: /path/to/tests/lambda/test-oauth2-flow.js
============================================================
✅ OAuth2 Flow Tests - PASSED

📊 Test Results Summary
============================================================
Total Tests: 5
Passed: 5
Failed: 0
Duration: 12.34s

🎉 All tests passed!
✅ Lambda function is ready for deployment
```

## 🔧 Test Configuration

### Environment Variables
Tests use the same environment variables as the main application:
- `PORT` - Server port (default: 9000)
- `NODE_ENV` - Environment (default: development)

### Mock Data
Tests use the same mock data as the main application:
- `config/users.json` - Mock user data
- `config/clients.json` - Mock OAuth2 client data

## 🚨 Troubleshooting

### LocalStack Issues
If LocalStack tests fail:
1. Ensure LocalStack is running: `docker-compose up localstack -d`
2. Deploy Lambda function: `./setup-localstack.sh`
3. Check LocalStack health: `curl http://localhost:4566/_localstack/health`

### Port Conflicts
If integration tests fail due to port conflicts:
1. Check if port 9001 is in use: `lsof -i :9001`
2. Kill the process or change the port in the test file

### Lambda Handler Issues
If Lambda tests fail:
1. Ensure all dependencies are installed: `npm install`
2. Check that `lambda.js` exists and exports the handler
3. Verify the handler function signature

## 📝 Adding New Tests

### 1. Create Test File
Create a new test file in the appropriate directory:
```javascript
/**
 * @fileoverview Description of the test
 */

// Test implementation
async function runTest() {
  // Test logic here
  console.log('✅ Test passed');
}

runTest().catch(console.error);
```

### 2. Add to Test Runner
Update `tests/run-all.js` to include your new test:
```javascript
const testSuites = [
  // ... existing tests
  {
    file: path.join(__dirname, 'your-category', 'your-test.js'),
    description: 'Your Test Description'
  }
];
```

### 3. Update Documentation
Add your test to this README file under the appropriate category.

## 🎯 Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Error Handling**: Always handle errors gracefully and provide clear error messages
3. **Mock Data**: Use consistent mock data across all tests
4. **Cleanup**: Clean up any resources created during tests
5. **Documentation**: Document what each test validates

## 🚀 Next Steps

After running tests successfully:
1. Deploy to AWS Lambda: `npm run deploy`
2. Use automated deployment: `./deploy.sh`
3. Test in production environment
4. Monitor CloudWatch logs for any issues
