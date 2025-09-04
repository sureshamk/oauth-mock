/**
 * @fileoverview A mock OAuth2 server for testing purposes.
 *
 * This server provides the following endpoints:
 * - /auth: The authorization endpoint.
 * - /token: The token endpoint.
 * - /userinfo: The userinfo endpoint.
 * - /auth/callback: The callback endpoint for the mock application.
 *
 * It uses a simple in-memory store for authorization codes and access tokens.
 * The clients and users are loaded from the `config` directory.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const port = process.env.PORT || 9000;

const clients = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/clients.json'), 'utf8'));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/users.json'), 'utf8'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const authorizationCodes = new Map();

/**
 * @route GET /
 * @description Renders the home page.
 * @access Public
 */
app.get('/', (req, res) => {
  res.render('index');
});

/**
 * @route GET /clients
 * @description Renders the clients page.
 * @access Public
 */
app.get('/clients', (req, res) => {
  res.render('clients', { clients });
});

/**
 * @route GET /users
 * @description Renders the users page.
 * @access Public
 */
app.get('/users', (req, res) => {
  res.render('users', { users });
});

/**
 * @route GET /auth
 * @description The authorization endpoint.
 * @access Public
 */
app.get('/auth', (req, res) => {
  const { client_id, redirect_uri, state } = req.query;

  if (!client_id || !redirect_uri) {
    return res.status(400).send('Missing client_id or redirect_uri');
  }

  const client = clients.find(c => c.client_id === client_id);
  if (!client) {
    return res.status(400).send('Invalid client_id');
  }

  if (!client.redirect_uris.includes(redirect_uri)) {
    return res.status(400).send('Invalid redirect_uri');
  }

  res.render('login', {
    users,
    clientId: client_id,
    redirectUri: redirect_uri,
    state: state
  });
});

/**
 * @route GET /userinfo
 * @description The userinfo endpoint.
 * @access Public
 */
app.get('/userinfo', (req, res) => {
  const authHeader = req.headers.authorization;

  console.log('Received /userinfo request');
  console.log('Authorization header:', authHeader);

 
  const token = req.query.access_token;
  console.log('Extracted token:', token);
  console.log('Current accessTokens:', Array.from(accessTokens.entries()));
  const tokenData = accessTokens.get(token);

  if (!tokenData) {
    console.log('Invalid access token:', token);
    return res.status(401).send('Invalid access token');
  }

  const user = users.find(u => u.id.toString() === tokenData.userId);
  if (!user) {
    console.log('User not found for userId:', tokenData.userId);
    return res.status(404).send('User not found');
  }

  const [given_name, family_name] = user.name.split(' ');

  console.log('Returning user info for:', user.id);
  console.log('Returning user info for:', user);

  res.json(user);
});

/**
 * @route GET /auth/callback
 * @description The callback endpoint for the mock application.
 * @access Public
 */
app.get('/auth/callback', (req, res) => {
  const { user_id, client_id, redirect_uri, state } = req.query;
  const code = Math.random().toString(36).substring(2, 15);

  authorizationCodes.set(code, { userId: user_id.toString(), clientId: client_id });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', code);
  if (state) {
    redirectUrl.searchParams.set('state', state);
  }

  res.redirect(redirectUrl.toString());
});

const accessTokens = new Map();

/**
 * @route POST /token
 * @description The token endpoint.
 * @access Public
 */
app.post('/token', (req, res) => {
  const { code, client_id, client_secret, redirect_uri, grant_type } = req.body;

  console.log('Received /token request:', req.body);

  if (grant_type !== 'authorization_code') {
    console.log('Invalid grant_type:', grant_type);
    return res.status(400).send('Invalid grant_type');
  }

  const client = clients.find(c => c.client_id === client_id && c.client_secret === client_secret);
  if (!client) {
    console.log('Invalid client_id or client_secret:', client_id, client_secret);
    return res.status(400).send('Invalid client_id or client_secret');
  }

  if (!client.redirect_uris.includes(redirect_uri)) {
    console.log('Invalid redirect_uri:', redirect_uri);
    return res.status(400).send('Invalid redirect_uri');
  }

  const authCode = authorizationCodes.get(code);
  if (!authCode || authCode.clientId !== client_id) {
    console.log('Invalid authorization code:', code);
    return res.status(400).send('Invalid authorization code');
  }

  authorizationCodes.delete(code);

  const accessToken = Math.random().toString(36).substring(2, 15);
  accessTokens.set(accessToken, { userId: authCode.userId });

  console.log('Issued access token:', accessToken, 'for user:', authCode.userId);

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    id_token: 'mock_id_token'
  });
});

// Only start the server if this file is run directly (not imported as a module)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Mock OAuth2 server listening at http://localhost:${port}`);
  });
}

module.exports = app;
