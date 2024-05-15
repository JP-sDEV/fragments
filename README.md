# Fragments : v0.0.1

## Description:

Back-end microservice for a Node Server.

## Installation:

1. Clone the repository:

    ```bash
    git clone git@github.com:JP-sDEV/fragments.git
    ```

2. Navigate into the project directory:

    ```bash
    cd fragments
    ```

3. Install project dependencies:
    ```bash
     npm install
    ```

## Usage:

To run the server locally: `npm start`

The server will start on `port: 8080` by default.

## Scripts:

-   `npm start`
    -   Starts the server locally.
-   `npm run dev`
    -   Starts the server in development mode with [`nodemon`](https://github.com/remy/nodemon), restarts the server when changes are detected.
-   `npm run debug`

    -   Starts the server in debug mode with [`nodemon`](https://github.com/remy/nodemon), responds to the Node debugger tool in Visual Studio Code.

-   `npm run lint`
    -   Checks for syntax errors, code styling and possible bugs using [ESLint](https://eslint.org/).

## API Endpoints:

### `GET /`

-   **Description**: Check if server is running with error(s)
-   **Access**: Public
-   **Response**:
    ```
      {
          status: 'ok',
          author,
          githubUrl: 'https://github.com/JP-sDEV/fragments',
          version,
      }
    ```

### `GET /v1/fragments`

-   **Description**: Protected route, only accessible if user is authorized
-   **Access**: Protected
-   **Response**:
    ```
      {
          status: 'ok',
          fragments: []
      }
    ```
