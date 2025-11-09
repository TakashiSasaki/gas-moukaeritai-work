# Project: ContentService Test

This Google Apps Script project is a simple web application created to test and demonstrate the functionality of the `ContentService`.

## Overview

The project consists of a web app that, when accessed, returns a hardcoded JSON string. It serves as a minimal example of how to create a JSON API endpoint using Google Apps Script. It also includes a separate function for testing `UrlFetchApp`.

## Functionality

The script contains two primary functions:

-   **`doGet()`**: This is the main entry point for the web application. It uses `ContentService.createTextOutput()` to return a JSON response with the content `{'message':'hello v4'}`. The MIME type is set to `ContentService.MimeType.JSON`.
-   **`test()`**: A standalone function that uses `UrlFetchApp.fetch()` to make a request to `https://example.com/`. This function is likely used for testing network access or permissions and is not part of the web app's public endpoint.

```javascript
function doGet() {
  return ContentService.createTextOutput("{'message':'hello v4'}").setMimeType(ContentService.MimeType.JSON);
}

function test(){
  UrlFetchApp.fetch("https://example.com/");
}
```

## Web Interface

This project does not have an HTML-based web interface. It is designed to be accessed as an API endpoint that directly returns JSON data.

## Permissions

The web application is configured with the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including users not logged into a Google account).
-   **Google Services**: The `test()` function requires permissions for `UrlFetchApp` to make external HTTP requests.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.

## Deployments

The project has two deployments:

-   **Deployment 1**:
    -   **ID**: `AKfycbyK8QNnR7M6TSBxhI2EHjSkBP9BEZHcGYWeQFeQZXVv`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbyK8QNnR7M6TSBxhI2EHjSkBP9BEZHcGYWeQFeQZXVv/exec)
-   **Deployment 2 (Version 4)**:
    -   **ID**: `AKfycbw53bZLwRzvyDnK7xBArzfDnJ6ZcdZk7NAo9jl_UjxWAmPGS5QcX3QLsLPwa5p1DEHaMA`
    -   **Target**: `4`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbw53bZLwRzvyDnK7xBArzfDnJ6ZcdZk7NAo9jl_UjxWAmPGS5QcX3QLsLPwa5p1DEHaMA/exec)
