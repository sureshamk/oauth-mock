# This Dockerfile sets up a lightweight Node.js 14 environment using the Alpine Linux base image.
# It installs production dependencies using npm ci for faster and more reliable builds.
# The application code is copied into the container, and port 9000 is exposed for incoming connections.
# The container starts the application using "node index.js".
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

EXPOSE 9000

CMD ["node", "index.js"]
