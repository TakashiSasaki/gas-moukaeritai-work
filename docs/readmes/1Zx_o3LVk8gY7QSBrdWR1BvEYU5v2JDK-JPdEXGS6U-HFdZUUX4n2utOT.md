# Project: Simple Key-Value Cache Web App

This Google Apps Script project is a web application that provides a basic key-value cache service using Google Apps Script's `CacheService.getScriptCache()`. It allows storing and retrieving string values via HTTP GET requests, with the URL's `pathInfo` acting as the key and the `queryString` as the value. A web interface is provided for testing this cache functionality.

## Overview

The primary purpose of this project is to offer a straightforward, publicly accessible, and temporary key-value storage mechanism. It can be used for simple data sharing, temporary state management, or as a demonstration of `CacheService` functionality through a web app.

## Functionality

The core functionality is implemented in `Code.js`, with the user interface defined in `index.html`.

### Core Features

-   **`doGet(e)`**: This function serves as the entry point for the web application.
    -   If `e.pathInfo` is provided in the URL:
        -   If `e.queryString` is also present, it stores the `e.queryString` value in `CacheService.getScriptCache()` using `e.pathInfo` as the key. It returns a text output confirming the storage.
        -   If `e.queryString` is not present, it attempts to retrieve a value from the cache using `e.pathInfo` as the key. It returns the cached value or a "not found" message.
    -   If `e.pathInfo` is not provided, it serves the `index.html` file, which acts as a testing interface.

### Code Examples

#### `Code.js`

```javascript
function doGet(e) {
    var key = e.pathInfo;
    var cache = CacheService.getScriptCache();

    if (key) {
        // クエリ文字列が提供されている場合はキャッシュに保存
        if (e.queryString) {
            cache.put(key, e.queryString);
            return ContentService.createTextOutput("クエリが保存されました: " + key);
        } else {
            // クエリ文字列がない場合はキャッシュから値を取得して返す
            var cachedValue = cache.get(key);
            if (cachedValue) {
                return ContentService.createTextOutput("キャッシュからの値: " + cachedValue);
            } else {
                return ContentService.createTextOutput("キャッシュに値が見つかりませんでした。");
            }
        }
    } else {
        // pathInfoが提供されていない場合はindex.htmlを返す
        var htmlTemplate = HtmlService.createTemplateFromFile("index");
        var htmlOutput = htmlTemplate.evaluate();
        return htmlOutput;
    }
}
```

## Web Interface (`index.html`)

The `index.html` file provides a simple web interface for testing the cache service:

-   **URL Inputs**: Input fields for `execUrl` (the deployed web app URL) and `devUrl` (the development URL).
-   **Key and Value Inputs**: Input fields for `pathInfo` (which will be used as the cache key) and `queryString` (which will be used as the value to store).
-   **"doGet" Button**: Triggers a client-side JavaScript function that constructs a full URL from the inputs and makes an HTTP GET request using the `fetch` API.
-   **Result Display**: Text areas to display the constructed request URL, the response from the web app, and the HTTP status.
-   **Client-side Scripting**: JavaScript handles the button click event, constructs the request URL, performs the `fetch` call, and updates the display with the response.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **Google Services**: Implicitly uses `CacheService` for data storage and `HtmlService` for the web interface.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: No external libraries are explicitly listed in `appsscript.json`.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
