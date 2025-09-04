#!/bin/bash

# LocalStack Setup and Lambda Deployment Script

set -e

echo "🚀 Setting up LocalStack and deploying Lambda function"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to wait for LocalStack to be ready
wait_for_localstack() {
    echo -e "${YELLOW}⏳ Waiting for LocalStack to be ready...${NC}"
    
    for i in {1..30}; do
        if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ LocalStack is ready!${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Attempt $i/30 - LocalStack not ready yet...${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ LocalStack failed to start within 60 seconds${NC}"
    return 1
}

# Function to create IAM role
create_iam_role() {
    echo -e "${BLUE}📋 Creating IAM role for Lambda...${NC}"
    
    # Create trust policy
    cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create IAM role
    aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl iam create-role \
        --role-name lambda-role \
        --assume-role-policy-document file:///tmp/trust-policy.json

    # Attach basic execution role policy
    aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl iam attach-role-policy \
        --role-name lambda-role \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    echo -e "${GREEN}✅ IAM role created successfully${NC}"
}

# Function to create Lambda deployment package
create_lambda_package() {
    echo -e "${BLUE}📦 Creating Lambda deployment package...${NC}"
    
    # Create lambda-package directory
    mkdir -p lambda-package
    
    # Install dependencies
    npm install --production
    
    # Create zip file
    zip -r lambda-package/lambda.zip . \
        -x "node_modules/.cache/*" \
        -x "test/*" \
        -x ".nyc_output/*" \
        -x "coverage/*" \
        -x ".git/*" \
        -x ".vscode/*" \
        -x "*.md" \
        -x "Dockerfile*" \
        -x "docker-compose.yml" \
        -x ".dockerignore" \
        -x "memory-bank/*" \
        -x "mock-oauth2-server/*" \
        -x "lambda-package/*" \
        -x "setup-localstack.sh" \
        -x "test-localstack.js" \
        -x "test-*.js" \
        -x ".nyc_output/*"
    
    echo -e "${GREEN}✅ Lambda package created: lambda-package/lambda.zip${NC}"
}

# Function to deploy Lambda function
deploy_lambda() {
    echo -e "${BLUE}🚀 Deploying Lambda function...${NC}"
    
    # Check if function already exists
    if aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl lambda get-function --function-name mock-oauth2-server > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Lambda function already exists, updating...${NC}"
        
        aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl lambda update-function-code \
            --function-name mock-oauth2-server \
            --zip-file fileb://lambda-package/lambda.zip
    else
        echo -e "${BLUE}📋 Creating new Lambda function...${NC}"
        
        aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl lambda create-function \
            --function-name mock-oauth2-server \
            --runtime nodejs18.x \
            --role arn:aws:iam::000000000000:role/lambda-role \
            --handler lambda.handler \
            --zip-file fileb://lambda-package/lambda.zip \
            --timeout 30 \
            --memory-size 512
    fi
    
    echo -e "${GREEN}✅ Lambda function deployed successfully${NC}"
}

# Function to create API Gateway
create_api_gateway() {
    echo -e "${BLUE}🌐 Creating API Gateway...${NC}"
    
    # Create REST API
    API_ID=$(aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl apigateway create-rest-api \
        --name mock-oauth2-api \
        --description 'Mock OAuth2 Server API' \
        --query 'id' --output text)
    
    echo -e "${GREEN}✅ API Gateway created with ID: $API_ID${NC}"
    
    # Get root resource ID
    ROOT_ID=$(aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl apigateway get-resources \
        --rest-api-id $API_ID \
        --query 'items[?path==`/`].id' --output text)
    
    # Create proxy resource
    PROXY_ID=$(aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl apigateway create-resource \
        --rest-api-id $API_ID \
        --parent-id $ROOT_ID \
        --path-part '{proxy+}' \
        --query 'id' --output text)
    
    # Create methods for root resource
    aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $ROOT_ID \
        --http-method ANY \
        --authorization-type NONE
    
    # Create methods for proxy resource
    aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $PROXY_ID \
        --http-method ANY \
        --authorization-type NONE
    
    echo -e "${GREEN}✅ API Gateway methods created${NC}"
    
    # Save API ID for later use
    echo $API_ID > .api-id
}

# Function to test the deployment
test_deployment() {
    echo -e "${BLUE}🧪 Testing Lambda deployment...${NC}"
    
    # Test direct Lambda invocation
    echo -e "${YELLOW}📋 Testing direct Lambda invocation...${NC}"
    
    TEST_EVENT='{
        "httpMethod": "GET",
        "path": "/",
        "headers": {},
        "queryStringParameters": null,
        "body": null
    }'
    
    RESPONSE=$(aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl lambda invoke \
        --function-name mock-oauth2-server \
        --payload "$TEST_EVENT" \
        --cli-binary-format raw-in-base64-out \
        /tmp/lambda-response.json)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Lambda invocation successful${NC}"
        
        # Parse and display response
        STATUS_CODE=$(cat /tmp/lambda-response.json | jq -r '.statusCode')
        BODY_LENGTH=$(cat /tmp/lambda-response.json | jq -r '.body | length')
        
        echo -e "${BLUE}   Status Code: $STATUS_CODE${NC}"
        echo -e "${BLUE}   Body Length: $BODY_LENGTH characters${NC}"
    else
        echo -e "${RED}❌ Lambda invocation failed${NC}"
    fi
    
    # Test OAuth2 endpoint
    echo -e "${YELLOW}📋 Testing OAuth2 authorization endpoint...${NC}"
    
    OAUTH2_EVENT='{
        "httpMethod": "GET",
        "path": "/auth",
        "headers": {},
        "queryStringParameters": {
            "client_id": "test_client",
            "redirect_uri": "https://app.demo.test/api/auth/google/callback"
        },
        "body": null
    }'
    
    aws --endpoint-url=http://localhost:4566 --region=us-east-1 --no-verify-ssl lambda invoke \
        --function-name mock-oauth2-server \
        --payload "$OAUTH2_EVENT" \
        --cli-binary-format raw-in-base64-out \
        /tmp/oauth2-response.json
    
    if [ $? -eq 0 ]; then
        OAUTH2_STATUS=$(cat /tmp/oauth2-response.json | jq -r '.statusCode')
        echo -e "${GREEN}✅ OAuth2 endpoint test successful: $OAUTH2_STATUS${NC}"
    else
        echo -e "${RED}❌ OAuth2 endpoint test failed${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting LocalStack setup...${NC}"
    
    # Wait for LocalStack
    wait_for_localstack
    
    # Create IAM role
    create_iam_role
    
    # Create Lambda package
    create_lambda_package
    
    # Deploy Lambda function
    deploy_lambda
    
    # Create API Gateway
    create_api_gateway
    
    # Test deployment
    test_deployment
    
    echo -e "\n${GREEN}🎉 LocalStack setup completed successfully!${NC}"
    echo -e "\n${BLUE}📋 Available services:${NC}"
    echo -e "   • LocalStack: http://localhost:4566"
    echo -e "   • Lambda function: mock-oauth2-server"
    echo -e "   • API Gateway: mock-oauth2-api"
    echo -e "\n${BLUE}🧪 Run tests:${NC}"
    echo -e "   • node test-localstack.js"
    echo -e "\n${BLUE}🔧 Management:${NC}"
    echo -e "   • View logs: docker-compose logs localstack"
    echo -e "   • Stop services: docker-compose down"
}

# Run main function
main "$@"
