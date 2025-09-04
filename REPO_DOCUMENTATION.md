# Documentation for mock-oauth2-server v1.0.0

This document provides a summary of the `mock-oauth2-server` repository.

## Project Overview

The `mock-oauth2-server` is a Node.js application that provides a mock Google OAuth2 server for local development and testing. It is designed to be used with client applications that use Passport.js for authentication.

## Key Features

- **Mock OAuth2 Server:** Simulates the Google OAuth2 authentication flow.
- **Configurable:** Mock users and OAuth clients can be configured through JSON files.
- **Dockerized:** The application is containerized using Docker for easy setup and deployment.
- **Endpoints:** Provides the necessary OAuth2 endpoints: `/auth`, `/token`, and `/userinfo`.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS
- **Containerization:** Docker
- **Testing:** Mocha, Chai, Supertest

## Getting Started

1. **Prerequisites:** Docker and Docker Compose must be installed.
2. **Run the server:**
   ```bash
   docker-compose up
   ```
   The server will be available at `http://localhost:9000`.

## Project Structure

- `config/`: Contains JSON files for configuring mock users and clients.
- `views/`: Contains the EJS template for the login page.
- `test/`: Contains the test suite for the application.
- `index.js`: The main entry point for the application.
- `Dockerfile`: Defines the Docker image for the application.
- `docker-compose.yml`: Defines the Docker service for the application.
- `memory-bank/`: Contains detailed documentation about the project.

This documentation was generated automatically. For more detailed information, please refer to the files in the `memory-bank/` directory.
