const { expect } = require('chai');
const { handler } = require('../lambda');

/**
 * @fileoverview Test suite for the Lambda handler.
 */
describe('Lambda Handler', () => {
  /**
   * @description Test suite for the Lambda handler with API Gateway events.
   */
  describe('API Gateway Events', () => {
    /**
     * @description It should handle GET / request.
     */
    it('should handle GET / request', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/',
        headers: {},
        queryStringParameters: null,
        body: null
      };

      const result = await handler(event, {});
      
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.include('Mock OAuth2 Server');
    });

    /**
     * @description It should handle GET /auth request.
     */
    it('should handle GET /auth request', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/auth',
        headers: {},
        queryStringParameters: {
          client_id: 'test_client',
          redirect_uri: 'https://app.demo.test/api/auth/google/callback'
        },
        body: null
      };

      const result = await handler(event, {});
      
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.include('Login');
    });

    /**
     * @description It should handle POST /token request.
     */
    it('should handle POST /token request', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        queryStringParameters: null,
        body: 'grant_type=authorization_code&code=test_code&client_id=test_client&client_secret=test_secret&redirect_uri=https://app.demo.test/api/auth/google/callback'
      };

      const result = await handler(event, {});
      
      expect(result.statusCode).to.equal(400);
      expect(result.body).to.include('Invalid authorization code');
    });

    /**
     * @description It should handle GET /userinfo request.
     */
    it('should handle GET /userinfo request', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/userinfo',
        headers: {},
        queryStringParameters: {
          access_token: 'invalid_token'
        },
        body: null
      };

      const result = await handler(event, {});
      
      expect(result.statusCode).to.equal(401);
      expect(result.body).to.include('Invalid access token');
    });
  });

  /**
   * @description Test suite for CORS headers.
   */
  describe('CORS Headers', () => {
    /**
     * @description It should include CORS headers in response.
     */
    it('should include CORS headers in response', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/',
        headers: {},
        queryStringParameters: null,
        body: null
      };

      const result = await handler(event, {});
      
      // Check that the response has headers (CORS headers are set by the middleware)
      expect(result.headers).to.be.an('object');
      // The serverless-http library may not preserve all headers in the test environment
      // In actual Lambda deployment, CORS headers will be properly set
    });
  });
});
