/**
 * @fileoverview AWS Lambda handler for the mock OAuth2 server.
 *
 * This file wraps the Express.js application to make it compatible with AWS Lambda.
 * It uses serverless-http to handle the conversion between Lambda events and HTTP requests.
 */

const serverless = require('serverless-http');
const app = require('./index');

// Export the Lambda handler
exports.handler = serverless(app, {
  // Configure serverless-http options
  request: (request, event, context) => {
    // Log incoming requests for debugging
    console.log('Lambda request:', {
      path: request.path,
      method: request.method,
      query: request.query,
      headers: request.headers
    });
    return request;
  },
  response: (response, event, context) => {
    // Log responses for debugging
    console.log('Lambda response:', {
      statusCode: response.statusCode,
      headers: response.headers
    });
    return response;
  }
});
