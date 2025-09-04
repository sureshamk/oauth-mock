# Product Context: Mock Google OAuth2 Server

## Problem Solved

During local development and testing of applications that use Google OAuth2 for authentication, developers often face challenges. They might need to set up and manage real Google API credentials, which can be cumbersome. Additionally, relying on an external service for local development can introduce flakiness and dependencies on internet connectivity.

This mock server solves these problems by providing a local, self-contained replacement for Google's OAuth2 service.

## How it Should Work

The mock server should be easy to start up using Docker. Developers can configure mock users and OAuth clients through simple JSON files. When a client application attempts to authenticate, it will be redirected to the mock server's login page, where the developer can "log in" as one of the mock users. The server will then guide the application through the standard OAuth2 flow, providing authorization codes, access tokens, and user information, just as the real Google service would.

## User Experience Goals

- **Simplicity:** The server should be simple to set up and run.
- **Configurability:** It should be easy to configure mock users and clients.
- **Realism:** The mock server should mimic the real Google OAuth2 flow closely enough that a client application like one using Passport.js requires minimal configuration changes to switch between the mock and real services.
