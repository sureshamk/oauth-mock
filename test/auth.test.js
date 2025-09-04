const request = require('supertest');
const { expect } = require('chai');
const app = require('../index');

/**
 * @fileoverview Test suite for the mock OAuth2 server.
 */
describe('OAuth2 Server', () => {
  let code;
  let accessToken;
  /**
   * @description Test suite for the GET / endpoint.
   */
  describe('GET /', () => {
    /**
     * @description It should return 200 OK with the index page.
     */
    it('should return 200 OK with the index page', (done) => {
      request(app)
        .get('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('Mock OAuth2 Server');
          done();
        });
    });
  });

  /**
   * @description Test suite for the GET /clients endpoint.
   */
  describe('GET /clients', () => {
    /**
     * @description It should return 200 OK with the clients page.
     */
    it('should return 200 OK with the clients page', (done) => {
      request(app)
        .get('/clients')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('Clients');
          done();
        });
    });
  });

  /**
   * @description Test suite for the GET /users endpoint.
   */
  describe('GET /users', () => {
    /**
     * @description It should return 200 OK with the users page.
     */
    it('should return 200 OK with the users page', (done) => {
      request(app)
        .get('/users')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('Users');
          done();
        });
    });
  });

  /**
   * @description Test suite for the GET /auth endpoint.
   */
  describe('GET /auth', () => {
    /**
     * @description It should return 200 OK with login page.
     */
    it('should return 200 OK with login page', (done) => {
      request(app)
        .get('/auth?client_id=test_client&redirect_uri=https://app.demo.test/api/auth/google/callback')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('Login');
          done();
        });
    });

    /**
     * @description It should return 400 Bad Request for missing client_id.
     */
    it('should return 400 Bad Request for missing client_id', (done) => {
      request(app)
        .get('/auth?redirect_uri=https://app.demo.test/api/auth/google/callback')
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Missing client_id or redirect_uri');
          done();
        });
    });

    /**
     * @description It should return 400 Bad Request for invalid client_id.
     */
    it('should return 400 Bad Request for invalid client_id', (done) => {
      request(app)
        .get('/auth?client_id=invalid_client&redirect_uri=https://app.demo.test/api/auth/google/callback')
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid client_id');
          done();
        });
    });

    /**
     * @description It should return 400 Bad Request for invalid redirect_uri.
     */
    it('should return 400 Bad Request for invalid redirect_uri', (done) => {
      request(app)
        .get('/auth?client_id=test_client&redirect_uri=invalid_uri')
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid redirect_uri');
          done();
        });
    });
  });

  /**
   * @description Test suite for the GET /auth/callback endpoint.
   */
  describe('GET /auth/callback', () => {
    /**
     * @description It should redirect with a code.
     */
    it('should redirect with a code', (done) => {
      request(app)
        .get('/auth/callback?user_id=1&client_id=test_client&redirect_uri=https://app.demo.test/api/auth/google/callback')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          const redirectUrl = new URL(res.headers.location);
          code = redirectUrl.searchParams.get('code');
          expect(code).to.exist;
          done();
        });
    });
  });

  /**
   * @description Test suite for the POST /token endpoint.
   */
  describe('POST /token', () => {
    /**
     * @description It should return 400 Bad Request for invalid grant_type.
     */
    it('should return 400 Bad Request for invalid grant_type', (done) => {
      request(app)
        .post('/token')
        .send({ grant_type: 'invalid_grant' })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid grant_type');
          done();
        });
    });

    /**
     * @description It should return 400 Bad Request for invalid client_id or client_secret.
     */
    it('should return 400 Bad Request for invalid client_id or client_secret', (done) => {
      request(app)
        .post('/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'https://app.demo.test/api/auth/google/callback',
          client_id: 'invalid_client',
          client_secret: 'invalid_secret'
        })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid client_id or client_secret');
          done();
        });
    });

    /**
     * @description It should return 400 Bad Request for invalid redirect_uri.
     */
    it('should return 400 Bad Request for invalid redirect_uri', (done) => {
      request(app)
        .post('/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'invalid_uri',
          client_id: 'test_client',
          client_secret: 'test_secret'
        })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid redirect_uri');
          done();
        });
    });

    /**
     * @description It should return 400 Bad Request for invalid authorization code.
     */
    it('should return 400 Bad Request for invalid authorization code', (done) => {
      request(app)
        .post('/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          grant_type: 'authorization_code',
          code: 'invalid_code',
          redirect_uri: 'https://app.demo.test/api/auth/google/callback',
          client_id: 'test_client',
          client_secret: 'test_secret'
        })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid authorization code');
          done();
        });
    });

    /**
     * @description It should return an access token.
     */
    it('should return an access token', (done) => {
      request(app)
        .post('/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'https://app.demo.test/api/auth/google/callback',
          client_id: 'test_client',
          client_secret: 'test_secret'
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('access_token');
          accessToken = res.body.access_token;
          done();
        });
    });
  });

  /**
   * @description Test suite for the GET /userinfo endpoint.
   */
  describe('GET /userinfo', () => {
    /**
     * @description It should return 401 Unauthorized for missing Authorization header.
     */
    it('should return 401 Unauthorized for missing Authorization header', (done) => {
      request(app)
        .get('/userinfo')
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid access token');
          done();
        });
    });

    /**
     * @description It should return 401 Unauthorized for invalid token.
     */
    it('should return 401 Unauthorized for invalid token', (done) => {
      request(app)
        .get('/userinfo?access_token=invalid_token')
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.equal('Invalid access token');
          done();
        });
    });

    /**
     * @description It should return user information.
     */
    it('should return user information', (done) => {
      request(app)
        .get(`/userinfo?access_token=${accessToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('name');
          done();
        });
    });
  });
});
