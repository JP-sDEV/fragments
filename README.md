# Fragments : v0.0.2

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

### `GET /v1/fragments/?expand=1`

-   **Description**: Protected route, only accessible if user is authenicated. Returns a list of Fragment ids that belong to current user.
-   **Access**: Protected
-   -   **Params**:
    -   expand: Optional, 1 to retrieve the Fragment metadata
-   **Response**:
    ```{
     "status": "ok",
     "fragments": [
         {
         "id": "4dcc65b6-9d57-453a-bd3a-63c107a51698",
         "created": "2021-11-08T01:08:20.269Z",
         "updated": "2021-11-08T01:08:20.271Z",
         "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
         "type": "text/plain",
         "size": 18
         },
         {
         "id": "30a84843-0cd4-4975-95ba-b96112aea189",
         "created": "2021-11-08T01:04:46.071Z",
         "updated": "2021-11-08T01:04:46.073Z",
         "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
         "type": "text/plain",
         "size": 300
         }
     ]
     }
    ```

### `GET /v1/fragments/:id.<.ext>`

-   **Description**: Protected route, only accessible if user is authenicated. Returns the Fragment data given its id.
-   **Params**:
    -   id: Required, Fragment id
    -   .ext: Optional, convert Fragment data to a supported extension
-   **Access**: Protected
-   **Response**:

    ```
    curl -i -u user1@email.com:password1 https://fragments-api.com/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698

    HTTP/1.1 200 OK
    Content-Type: text/plain
    Content-Length: 18

    This is a fragment
    ```

### `POST /v1/fragments`

-   **Description**: Protected route, only accessible if user is authenicated. Returns the Fragment metadata.
-   **Access**: Protected
-   **Response**:

    ```
    {
        "status": "ok",
        "fragment": {
            "id": "fdf71254-d217-4675-892c-a185a4f1c9b4",
            "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
            "created": "2021-11-02T15:09:50.403Z",
            "updated": "2021-11-02T15:09:50.403Z",
            "type": "text/plain",
            "size": 1024
            }
    }
    ```
