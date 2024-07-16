# Fragment Microservice 

## Stage 0: Install base dependencies 
FROM node:22.2.0-alpine3.20@sha256:04867ddd82db7d0691ee88947d81e32026dc993728311bba9e3ada30d1001ef3 AS dependencies

### Image Metadata
LABEL maintainer="Jon Pablo <japablo@myseneca.ca>"
LABEL description="Fragments node.js microservice"

### Working directory
WORKDIR /app

### Environment variables
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

### Install environment dependencies
COPY package.json package-lock.json ./
RUN npm install

################################################################################################################

## Stage 1: Build microservice
FROM node:22.2.0-alpine3.20@sha256:04867ddd82db7d0691ee88947d81e32026dc993728311bba9e3ada30d1001ef3 as build

WORKDIR /app 

# Copy generated dependencies from previous stage
COPY --from=dependencies /app /app

# Copy source code 
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

################################################################################################################

## Stage 2: Serve microservice
# Spin up Image
CMD ["npm", "start"]

# Run service on port 8080
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=15s --timeout=90s --start-period=15s --retries=3 \
    CMD ["sh", "-c", "curl --fail localhost:8080 || (echo 'Health check failed.' >&2 && exit 1)"]
