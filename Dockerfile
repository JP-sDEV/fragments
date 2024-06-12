# Fragment Microservice Environment
# Node Version 22.2.0, same as development environment
FROM node:22.2.0

# Image Metadata
LABEL maintainer="Jon Pablo <japablo@myseneca.ca>"
LABEL description="Fragments node.js microservice"

#Environment Variables
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Image Working Directory
WORKDIR /app

# Setup App Dependencies
COPY package.json package-lock.json ./

RUN npm install

COPY ./src ./src

# Copy HTPASSWD file for Basic Auth
COPY ./tests/.htpasswd ./tests/.htpasswd

# Spin up Image
CMD npm start

# Run service on port 8080
EXPOSE 8080
