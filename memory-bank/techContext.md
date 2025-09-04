# Tech Context: Mock Google OAuth2 Server

## Technologies Used

- **Node.js:** The server is a Node.js application.
- **Express.js:** The `package.json` will likely show Express.js as the web framework.
- **EJS:** The `views/login.ejs` file indicates that EJS is used as the templating engine.
- **Docker:** The project uses Docker for containerization, with a `Dockerfile` to build the image and `docker-compose.yml` to manage the service.
- **Passport.js:** While not a direct dependency of the server, the project is designed to integrate with Passport.js on the client side.

## Development Setup

The primary development and execution environment is a Docker container. To run the server, a developer needs Docker and Docker Compose installed. The server is started with `docker-compose up`.

## Technical Constraints

- The server is designed for local development and testing only and is not suitable for production use.
- It does not implement the full OAuth2 specification, only the parts necessary for the described authentication flow.

## Dependencies

The project's dependencies are listed in the `package.json` file. These will include the web framework and any other libraries needed to run the server.
