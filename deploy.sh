#!/bin/bash

# Mock OAuth2 Server - Lambda Deployment Script
# This script automates the deployment process to AWS Lambda

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
STAGE=${1:-dev}
REGION=${2:-us-east-1}
VERBOSE=${3:-false}

echo -e "${BLUE}🚀 Starting deployment of Mock OAuth2 Server to AWS Lambda${NC}"
echo -e "${BLUE}Stage: ${STAGE}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials are not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo -e "${YELLOW}⚠️  Serverless Framework is not installed globally. Installing...${NC}"
    npm install -g serverless
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm test
echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# Deploy to AWS Lambda
echo -e "${YELLOW}🚀 Deploying to AWS Lambda...${NC}"

if [ "$VERBOSE" = "true" ]; then
    serverless deploy --stage $STAGE --region $REGION --verbose
else
    serverless deploy --stage $STAGE --region $REGION
fi

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""

# Get the API Gateway URL
echo -e "${BLUE}📋 Getting deployment information...${NC}"
API_URL=$(serverless info --stage $STAGE --region $REGION --verbose | grep "endpoints:" -A 1 | tail -n 1 | awk '{print $2}')

if [ -n "$API_URL" ]; then
    echo -e "${GREEN}🌐 API Gateway URL: ${API_URL}${NC}"
    echo ""
    echo -e "${BLUE}📝 Available endpoints:${NC}"
    echo -e "  • ${API_URL}/ - Home page"
    echo -e "  • ${API_URL}/clients - View clients"
    echo -e "  • ${API_URL}/users - View users"
    echo -e "  • ${API_URL}/auth - OAuth2 authorization"
    echo -e "  • ${API_URL}/token - OAuth2 token"
    echo -e "  • ${API_URL}/userinfo - OAuth2 userinfo"
    echo -e "  • ${API_URL}/auth/callback - OAuth2 callback"
    echo ""
    echo -e "${BLUE}🔧 For Passport.js integration, update your configuration:${NC}"
    echo -e "authorizationURL: '${API_URL}/auth'"
    echo -e "tokenURL: '${API_URL}/token'"
    echo -e "userProfileURL: '${API_URL}/userinfo'"
else
    echo -e "${YELLOW}⚠️  Could not retrieve API Gateway URL. Check the deployment output above.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment script completed!${NC}"
