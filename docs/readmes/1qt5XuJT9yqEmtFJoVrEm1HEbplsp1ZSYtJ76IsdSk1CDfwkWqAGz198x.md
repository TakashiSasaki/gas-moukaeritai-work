# Project: Echo API

This Google Apps Script project implements a simple "Echo API" as a web application. It is designed to receive HTTP GET and POST requests and return the received request parameters (event object `e`) as a JSON response. The project includes an OpenAPI (Swagger) specification for its API endpoints.

## Overview

The primary purpose of this project is to provide a basic API endpoint that echoes back the request it receives. This can be useful for testing webhooks, understanding how Google Apps Script web apps handle different request types, or as a minimal example for building more complex APIs.

## Functionality

The core functionality is implemented in `Code.js`, with the API specification defined in `OPENAPI.js`.

### Core Features

-   **`doGet(e)`**: Handles HTTP GET requests. It sets the `method` property of the event object `e` to "GET" and returns the `e` object as a JSON string with the MIME type `application/json; charset=utf-8`.
-   **`doPost(e)`**: Handles HTTP POST requests. Similar to `doGet`, it sets the `method` property of `e` to "POST" and returns the `e` object as a JSON string with the appropriate MIME type.
-   **OpenAPI Specification**: The `OPENAPI.js` file contains a complete OpenAPI 3.0.3 definition for the Echo API, detailing the `/echo` endpoint, its GET and POST methods, expected parameters (e.g., `param` in query), and the structure of the JSON responses.

### Code Examples

#### `Code.js`

```javascript
/*
MIMEタイプは application/json; charset=utf-8 で返っているっぽい。
*/

function doGet(e) {
  e.method = "GET";
  return ContentService.createTextOutput(JSON.stringify(e, undefined, 4))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  e.method = "POST";
  return ContentService.createTextOutput(JSON.stringify(e, undefined, 4))
    .setMimeType(ContentService.MimeType.JSON);
}
```

#### `OPENAPI.js` (Excerpt)

```javascript
const OPENAPI =
{
  "openapi": "3.0.3",
  "info": {
    "title": "Echo API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://script.google.com/macros/s/AKfycbwtkfh8j8KYzya2-qzGqyPY8CkMk_7q57io0k1abpvZY9mxoOG_h0U4FrQ54pMR-aum/exec"
    }
  ],
  "paths": {
    "/echo": {
      "get": {
        "summary": "Echo API",
        "description": "任意のパラメータを受け取ります。",
        "operationId": "getEcho",
        "parameters": [
          {
            "name": "param",
            "in": "query",
            "description": "任意のパラメータ",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "成功したレスポンス",
            "content": {
              "application/json; charset=utf-8": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "エコーメッセージ"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Echo API",
        "description": "任意のパラメータを受け取ります。",
        "operationId": "postEcho",
        "parameters": [
          {
            "name": "param",
            "in": "query",
            "description": "任意のパラメータ",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "成功したレスポンス",
            "content": {
              "application/json; charset=utf-8": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "エコーメッセージ"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Web Interface

This project does not have a traditional HTML-based web interface for user interaction. It functions purely as an API endpoint that returns JSON data.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: No external libraries or advanced services are explicitly listed in `appsscript.json`.

## Deployments

The project is deployed as a web application. The `OPENAPI.js` file includes a sample server URL: `https://script.google.com/macros/s/AKfycbwtkfh8j8KYzya2-qzGqyPY8CkMk_7q57io0k1abpvZY9mxoOG_h0U4FrQ54pMR-aum/exec`.
