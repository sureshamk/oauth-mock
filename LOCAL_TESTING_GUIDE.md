# Local Lambda Testing Guide

This guide provides multiple ways to test the Mock OAuth2 Server Lambda function locally before deploying to AWS.

## 🧪 Testing Methods

### 1. **Direct Lambda Handler Testing** (Recommended)

Test the Lambda handler directly without HTTP overhead:

```bash
# Basic endpoint tests
node test-lambda-local.js

# Complete OAuth2 flow test
node test-oauth2-flow.js

# Comprehensive test suite
node test-all.js
```

**Benefits:**
- Fast execution
- Detailed logging
- Complete OAuth2 flow simulation
- Error case testing

### 2. **HTTP Server Testing** (Real HTTP Requests)

Test with actual HTTP requests like a real client:

```bash
# Start HTTP server
node test-http-server.js

# Test endpoints (in another terminal)
curl http://localhost:9001/
curl http://localhost:9001/auth?client_id=test_client&redirect_uri=https://app.demo.test/api/auth/google/callback
curl http://localhost:9001/clients
curl http://localhost:9001/users
```

**Benefits:**
- Real HTTP requests
- Browser testing possible
- Network-level testing
- CORS verification

### 3. **Unit Testing** (Automated)

Run the automated test suite:

```bash
npm test
```

**Benefits:**
- Automated validation
- CI/CD integration
- Code coverage reporting
- Regression testing

## 🔄 Complete OAuth2 Flow Testing

### Manual Testing with curl

```bash
# Step 1: Get authorization code
curl -v "http://localhost:9001/auth/callback?user_id=1&client_id=test_client&redirect_uri=https://app.demo.test/api/auth/google/callback&state=test123"

# Step 2: Extract authorization code from Location header
# Example: code=vs0m39p8kpo

# Step 3: Exchange code for access token
curl -X POST "http://localhost:9001/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=vs0m39p8kpo&client_id=test_client&client_secret=test_secret&redirect_uri=https://app.demo.test/api/auth/google/callback"

# Step 4: Get user information
curl "http://localhost:9001/userinfo?access_token=fxs7h1ogyth"
```

### Automated Flow Testing

```bash
# Run the complete OAuth2 flow test
node test-oauth2-flow.js
```

This script automatically:
1. Tests authorization endpoint
2. Simulates user selection
3. Generates authorization code
4. Exchanges code for access token
5. Retrieves user information
6. Tests error cases

## 📋 Available Endpoints

| Endpoint | Method | Description | Test Command |
|----------|--------|-------------|--------------|
| `/` | GET | Home page with API docs | `curl http://localhost:9001/` |
| `/clients` | GET | View registered clients | `curl http://localhost:9001/clients` |
| `/users` | GET | View registered users | `curl http://localhost:9001/users` |
| `/auth` | GET | OAuth2 authorization | `curl "http://localhost:9001/auth?client_id=test_client&redirect_uri=..."` |
| `/auth/callback` | GET | OAuth2 callback | `curl "http://localhost:9001/auth/callback?user_id=1&..."` |
| `/token` | POST | OAuth2 token exchange | `curl -X POST "http://localhost:9001/token" -d "..."` |
| `/userinfo` | GET | OAuth2 user info | `curl "http://localhost:9001/userinfo?access_token=..."` |

## 🔧 Test Configuration

### Mock Data

**Users** (`config/users.json`):
```json
[
  {
    "id": 1,
    "name": "Test User",
    "emails": [{ "value": "jhon@example.com" }],
    "email_verified": true
  }
]
```

**Clients** (`config/clients.json`):
```json
[
  {
    "client_id": "test_client",
    "client_secret": "test_secret",
    "redirect_uris": ["https://app.demo.test/api/auth/google/callback"]
  }
]
```

### Environment Variables

```bash
# Optional: Set custom port for HTTP server
PORT=9001

# Optional: Set environment
NODE_ENV=development
```

## 🚨 Error Testing

### Invalid Client ID
```bash
curl "http://localhost:9001/auth?client_id=invalid_client&redirect_uri=..."
# Expected: 400 Bad Request
```

### Invalid Access Token
```bash
curl "http://localhost:9001/userinfo?access_token=invalid_token"
# Expected: 401 Unauthorized
```

### Invalid Authorization Code
```bash
curl -X POST "http://localhost:9001/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=invalid_code&..."
# Expected: 400 Bad Request
```

## 📊 Test Results Interpretation

### Successful Response Indicators

- **Status Code**: 200 for successful operations
- **CORS Headers**: Present in all responses
- **Content Type**: Correct for each endpoint
- **Response Body**: Contains expected data

### Error Response Indicators

- **Status Code**: 400 for client errors, 401 for auth errors
- **Error Message**: Clear, descriptive error text
- **No Sensitive Data**: Error responses don't leak information

## 🔍 Debugging

### Enable Detailed Logging

The Lambda handler includes comprehensive logging:

```javascript
// Request logging
console.log('Lambda request:', {
  path: request.path,
  method: request.method,
  query: request.query,
  headers: request.headers
});

// Response logging
console.log('Lambda response:', {
  statusCode: response.statusCode,
  headers: response.headers
});
```

### Common Issues

1. **CORS Errors**: Check that CORS headers are present
2. **Token Issues**: Verify token format and expiration
3. **Redirect Issues**: Check redirect URI validation
4. **Content Type**: Ensure proper Content-Type headers

## 🎯 Testing Checklist

### Before Deployment

- [ ] All endpoints return correct status codes
- [ ] OAuth2 flow completes successfully
- [ ] Error cases handled properly
- [ ] CORS headers present
- [ ] Security validations working
- [ ] Mock data accessible
- [ ] Logging functional
- [ ] Performance acceptable

### Integration Testing

- [ ] Passport.js integration works
- [ ] Client applications can authenticate
- [ ] Token exchange successful
- [ ] User information retrieved
- [ ] Error handling graceful

## 🚀 Next Steps

After successful local testing:

1. **Deploy to AWS Lambda**:
   ```bash
   npm run deploy
   ```

2. **Use automated deployment**:
   ```bash
   ./deploy.sh dev us-east-1
   ```

3. **Test in AWS environment**:
   - Verify API Gateway endpoints
   - Check CloudWatch logs
   - Test with real client applications

## 📝 Test Files Summary

| File | Purpose | Usage |
|------|---------|-------|
| `test-lambda-local.js` | Basic endpoint testing | `node test-lambda-local.js` |
| `test-oauth2-flow.js` | Complete OAuth2 flow | `node test-oauth2-flow.js` |
| `test-http-server.js` | HTTP server testing | `node test-http-server.js` |
| `test-all.js` | Comprehensive testing | `node test-all.js` |
| `test/lambda.test.js` | Unit tests | `npm test` |

## 🎉 Success Criteria

Your Lambda function is ready for deployment when:

- ✅ All test scripts pass
- ✅ OAuth2 flow completes end-to-end
- ✅ Error cases return appropriate responses
- ✅ CORS headers are present
- ✅ Security validations work
- ✅ Performance is acceptable
- ✅ Logging provides useful information

The local testing environment provides a complete simulation of the AWS Lambda environment, ensuring your deployment will work correctly in production.
