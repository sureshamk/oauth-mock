# System Patterns: Mock Google OAuth2 Server

## System Architecture

The system is a monolithic Node.js application running inside a Docker container. It exposes a set of HTTP endpoints that simulate the Google OAuth2 API.

The architecture can be broken down into the following components:

- **Web Server:** An Express.js server that handles incoming HTTP requests.
- **Routing:** The server has routes defined for the OAuth2 endpoints (`/auth`, `/token`, `/userinfo`) and a login page.
- **View Engine:** EJS is used to render the login page.
- **Configuration:** The server's behavior is configured through JSON files located in the `config/` directory. This includes the list of mock users and OAuth clients.
- **Containerization:** The entire application is packaged and run as a Docker container, ensuring a consistent environment.

## Key Technical Decisions

- **Configuration via JSON:** Using JSON files for configuration makes it easy for developers to add or modify mock users and clients without changing the code.
- **Docker for Portability:** The use of Docker simplifies the setup process and ensures that the server runs consistently across different development machines.
- **Standard Web Technologies:** The use of Node.js, Express.js, and EJS is a common and well-understood stack for building web applications.

## Design Patterns in Use

- **Model-View-Controller (MVC) variant:** The application follows a loose MVC-like pattern.
    - **Model:** The data is represented by the JSON configuration files.
    - **View:** The EJS login page is the view.
    - **Controller:** The Express.js route handlers act as controllers, processing requests and interacting with the model and view.
- **Dependency Injection (via configuration):** The server's dependencies (users, clients) are "injected" through configuration files rather than being hardcoded.
