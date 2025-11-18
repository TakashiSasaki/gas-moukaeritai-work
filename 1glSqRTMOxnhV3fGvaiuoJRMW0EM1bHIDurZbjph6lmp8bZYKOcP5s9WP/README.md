# WebClipboard

## Overview

The "WebClipboard" project is a minimalist Google Apps Script web application. Its primary function is to serve a simple text response, "hello," when accessed via its deployed URL. It is configured as a web app that executes as the user who deployed it and is accessible to anyone, including anonymous users.

## Functionality

The project contains a single `doGet` function, which is the entry point for web app requests.

### Core Features

-   **`doGet()`:** This function is triggered when the web application receives an HTTP GET request. It returns a `ContentService.TextOutput` containing the string "hello".

### Code Examples

#### `Code.js`

```javascript
function doGet() {
  return ContentService.createTextOutput("hello");
}
```

## Permissions

The `appsscript.json` file specifies the web app's execution and access settings. It runs as the user who deployed it and is publicly accessible.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbwHP-tWzpjYee9Eh9wzHaTx37kURn50HBH8WBJSWJuW`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwHP-tWzpjYee9Eh9wzHaTx37kURn50HBH8WBJSWJuW/exec`
-   **ID (Version 1):** `AKfycby6Xt2wSr-UyZGB_N4Gyhww4tXrjUUUNM1lXPYSHekOLnhD9leOXdlp1EsNxM9GcUlYKg`
    -   **URL:** `https://script.google.com/macros/s/AKfycby6Xt2wSr-UyZGB_N4Gyhww4tXrjUUUNM1lXPYSHekOLnhD9leOXdlp1EsNxM9GcUlYKg/exec`
