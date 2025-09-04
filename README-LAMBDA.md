# Mock OAuth2 Server - AWS Lambda Deployment

This document provides instructions for deploying the Mock OAuth2 Server to AWS Lambda using the Serverless Framework.

## Prerequisites

1. **AWS CLI** installed and configured with appropriate credentials
2. **Node.js** (version 18 or higher)
3. **Serverless Framework** installed globally:
   ```bash
   npm install -g serverless
   ```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy to AWS Lambda

```bash
# Deploy to dev stage
npm run deploy

# Deploy to production stage
npm run deploy:prod
```

### 3. Test Locally (Optional)

```bash
# Install serverless-offline plugin
npm install --save-dev serverless-offline

# Start local development server
serverless offline
```

## Configuration

### Environment Variables

The Lambda function uses the following environment variables:

- `NODE_ENV`: Set automatically by the serverless framework
- `PORT`: Not used in Lambda (handled by API Gateway)

### AWS Configuration

The `serverless.yml` file configures:

- **Runtime**: Node.js 18.x
- **Memory**: 512MB
- **Timeout**: 30 seconds
- **Region**: us-east-1 (configurable)
- **CORS**: Enabled for all endpoints

## Deployment Stages

### Development Stage
```bash
serverless deploy --stage dev
```

### Production Stage
```bash
serverless deploy --stage production
```

### Custom Stage
```bash
serverless deploy --stage staging
```

## API Endpoints

After deployment, your Lambda function will be available at:

```
https://[api-id].execute-api.[region].amazonaws.com/[stage]/
```

### Available Endpoints

- `GET /` - Home page with API documentation
- `GET /clients` - View registered OAuth clients
- `GET /users` - View registered users
- `GET /auth` - OAuth2 authorization endpoint
- `POST /token` - OAuth2 token endpoint
- `GET /userinfo` - OAuth2 userinfo endpoint
- `GET /auth/callback` - OAuth2 callback endpoint

## Integration with Passport.js

Update your Google Strategy configuration to use the Lambda endpoint:

```javascript
new GoogleStrategy({
  clientID: 'test_client',
  clientSecret: 'test_secret',
  callbackURL: 'http://localhost:3000/auth/google/callback',
  authorizationURL: 'https://[api-id].execute-api.[region].amazonaws.com/[stage]/auth',
  tokenURL: 'https://[api-id].execute-api.[region].amazonaws.com/[stage]/token',
  userProfileURL: 'https://[api-id].execute-api.[region].amazonaws.com/[stage]/userinfo'
}, verifyCallback);
```

## Monitoring and Logs

### CloudWatch Logs

Lambda function logs are automatically sent to CloudWatch. You can view them in the AWS Console or using AWS CLI:

```bash
# Get the log group name
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/mock-oauth2-server"

# View recent logs
aws logs tail /aws/lambda/mock-oauth2-server-dev-api --follow
```

### Metrics

Monitor your Lambda function using AWS CloudWatch metrics:
- Invocation count
- Duration
- Error rate
- Throttles

## Cost Optimization

### Lambda Configuration

- **Memory**: 512MB (adequate for OAuth2 operations)
- **Timeout**: 30 seconds (sufficient for most requests)
- **Concurrency**: Unlimited (handled automatically)

### Cost Considerations

- **Free Tier**: 1M requests per month
- **Pricing**: Pay per request and compute time
- **Cold Starts**: Minimal impact due to lightweight application

## Security

### IAM Permissions

The Lambda function has minimal IAM permissions:
- CloudWatch Logs access
- No additional AWS service access required

### OAuth2 Security

- Client validation
- Redirect URI validation
- Secure token generation
- Single-use authorization codes

## Troubleshooting

### Common Issues

1. **Cold Start Delays**
   - Normal for Lambda functions
   - Subsequent requests are faster

2. **Timeout Errors**
   - Increase timeout in serverless.yml
   - Check for long-running operations

3. **Memory Issues**
   - Increase memory allocation
   - Monitor memory usage in CloudWatch

4. **CORS Errors**
   - CORS is enabled by default
   - Check client-side configuration

### Debugging

Enable detailed logging by setting the log level:

```bash
serverless deploy --stage dev --verbose
```

## Cleanup

To remove the deployed resources:

```bash
# Remove all resources for a stage
serverless remove --stage dev

# Remove production resources
serverless remove --stage production
```

## Local Development

For local development without Lambda:

```bash
# Start the Express server directly
npm start

# Run tests
npm test
```

## File Structure

```
├── lambda.js              # Lambda handler
├── index.js               # Express application
├── serverless.yml         # Serverless configuration
├── package.json           # Dependencies and scripts
├── config/                # OAuth2 configuration
├── views/                 # EJS templates
├── public/                # Static assets
└── test/                  # Test files
```

## Support

For issues and questions:
1. Check CloudWatch logs for error details
2. Review serverless.yml configuration
3. Test locally with serverless-offline
4. Verify AWS credentials and permissions
