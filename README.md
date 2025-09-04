# Mock Google OAuth2 Server

This is a mock Google OAuth2 server for integrating with Passport.js during local development and testing. It can be deployed both as a Docker container and as an AWS Lambda function.

## Prerequisites

- Docker and Docker Compose (for local deployment)
- AWS CLI and Serverless Framework (for Lambda deployment)
- Node.js (for local development)

## Quick Start

### Option 1: Docker Deployment (Recommended for Local Development)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mock-oauth2-server
   ```

2. **Run the server:**
   ```bash
   docker-compose up
   ```

The server will be running at `http://localhost:9000`.

### Option 2: AWS Lambda Deployment (Recommended for Production/Testing)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to AWS Lambda:**
   ```bash
   # Deploy to dev stage
   npm run deploy
   
   # Deploy to production stage
   npm run deploy:prod
   ```

3. **Use the automated deployment script:**
   ```bash
   ./deploy.sh [stage] [region] [verbose]
   ```

For detailed Lambda deployment instructions, see [README-LAMBDA.md](README-LAMBDA.md).

## Configuration

### Environment Variables

You can configure the server using a `.env` file in the `mock-oauth2-server` directory.

- `PORT`: The port the server will run on. Defaults to `9000`.

Example `.env` file:
```
PORT=9001
```

### Configuration Files

- **Mock Users:** `config/users.json`
- **OAuth Clients:** `config/clients.json`

## Endpoints

- **Authorization:** `/auth`
- **Token:** `/token`
- **UserInfo:** `/userinfo`
- **Home:** `/` (API documentation)
- **Clients:** `/clients` (View registered clients)
- **Users:** `/users` (View registered users)

## Passport.js Integration

### For Docker Deployment:
```javascript
new GoogleStrategy({
  clientID: 'mock-client-id',
  clientSecret: 'mock-secret',
  callbackURL: 'http://localhost:3000/auth/google/callback',
  authorizationURL: 'http://localhost:9000/auth',
  tokenURL: 'http://localhost:9000/token',
  userProfileURL: 'http://localhost:9000/userinfo'
}, verifyCallback);
```

### For Lambda Deployment:
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

## Testing

Run the test suite:
```bash
npm test
```

This includes tests for both the Express server and Lambda handler.

## Development

### Local Development
```bash
npm start
```

### Lambda Local Testing
```bash
# Install serverless-offline
npm install --save-dev serverless-offline

# Start local Lambda server
serverless offline
```

## Architecture

The application supports two deployment models:

1. **Docker Container**: Traditional Express.js server running in a container
2. **AWS Lambda**: Serverless function using serverless-http wrapper

Both deployments provide identical OAuth2 functionality and API endpoints.

## File Structure

```
├── index.js               # Express application
├── lambda.js              # Lambda handler
├── serverless.yml         # Serverless configuration
├── package.json           # Dependencies and scripts
├── deploy.sh              # Automated deployment script
├── config/                # OAuth2 configuration
├── views/                 # EJS templates
├── public/                # Static assets
├── test/                  # Test files
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── README-LAMBDA.md       # Lambda deployment guide
```

## Security Features

- OAuth2 client validation
- Redirect URI validation
- Secure token generation
- CORS support
- Single-use authorization codes

## Monitoring

### Docker Deployment
- Application logs in Docker container
- Standard Express.js logging

### Lambda Deployment
- CloudWatch logs
- AWS Lambda metrics
- API Gateway monitoring

## Support

For issues and questions:
1. Check the relevant logs (Docker or CloudWatch)
2. Run the test suite to verify functionality
3. Review configuration files
4. For Lambda issues, check AWS credentials and permissions
