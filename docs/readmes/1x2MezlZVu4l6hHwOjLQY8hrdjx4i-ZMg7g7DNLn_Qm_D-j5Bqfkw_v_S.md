# Project: Personal Memopad API

This Google Apps Script project is a web application that functions as a "Personal Memopad" API. It allows users to store and retrieve text data using a key (referred to as "title"). The API leverages a Google Sheet for persistent storage and `CacheService` for improved performance. The entire API is formally documented with an OpenAPI (Swagger) specification.

## Overview

The primary purpose of this project is to provide a simple, web-accessible key-value store for text snippets. It's designed to be a personal utility for quickly saving and retrieving notes or small pieces of information, exposed through a REST-like API.

## Functionality

The core functionality is implemented across `doGet.js`, `doPost.js`, `getSheet.js`, `read.js`, and `write.js`, with the API contract defined in `openapi.js`.

### Core Features

-   **OpenAPI Specification (`openapi.js`)**: Defines a comprehensive OpenAPI 3.1.0 specification for the "Personal Memopad" API, including:
    -   `/hello` (GET): Returns a simple "Hello, world!" message.
    -   `/getEmail` (GET): Returns the email address of the authenticated user.
    -   `/getActiveUserLocale` (GET): Returns the locale setting of the authenticated user.
    -   `/read` (GET): Reads data associated with a `title` from the cache or spreadsheet.
    -   `/write` (POST): Writes text data associated with a `title` to the spreadsheet and cache.
-   **`doGet(e)`**: Handles HTTP GET requests. It routes requests to specific endpoints (`/hello`, `/getEmail`, `/getActiveUserLocale`, `/read`) based on `e.pathInfo`. For `/read`, it calls the `read(title)` function. If no specific path is matched, it returns the full OpenAPI specification as a JSON response.
-   **`doPost(e)`**: Handles HTTP POST requests. For the `/write` endpoint, it calls the `write(title, payload)` function, where `payload` is the content from the request body. If no specific path is matched, it returns the OpenAPI specification as a JSON response.
-   **`getSheet()`**: Retrieves a Google Sheet based on a `SHEET_NAME` property stored in script properties. If the sheet does not exist, it creates a new one.
-   **`read(key)`**: Reads a value associated with a `key`. It first attempts to retrieve the value from `CacheService.getUserCache()`. If not found, it searches the associated Google Sheet. It uses `LockService` to prevent race conditions during spreadsheet access.
-   **`write(key, value)`**: Writes a `key-value` pair to the associated Google Sheet (appending a new row) and also stores it in `CacheService.getUserCache()`. It uses `LockService` to ensure data consistency.

### Code Examples

#### `doGet.js`

```javascript
function doGet(e) {
  try {
    console.log(e);

    // /hello パスでのリクエストに対する応答
    if (e.pathInfo === 'hello') {
      var output = JSON.stringify({ "response": { "result": "Hello, world!" } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // /getEmail パスでのリクエストに対する応答
    if (e.pathInfo === 'getEmail') {
      var output = JSON.stringify({ "response": { "result": Session.getActiveUser().getEmail() } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // ユーザーのロケールを取得
    if (e.pathInfo === "getActiveUserLocale") {
      var output = JSON.stringify({ "response": { "result": Session.getActiveUserLocale() } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // タイトルに対応するキャッシュデータを取得
    if (e.pathInfo === "read") {
      var title = e.parameter.title;
      var output = JSON.stringify({ "response": { "result": read(title) } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // その他のパスまたはパスなしのリクエストへのデフォルトの応答
    OPENAPI.servers[0].url = ScriptApp.getService().getUrl();
    var output = JSON.stringify(OPENAPI, undefined, 4);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var output = JSON.stringify({ "error": { "errorMessage": error.message, "errorType": "Exception" } });
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }//try-catch-clause
}//doGet
```

#### `doPost.js`

```javascript
function doPost(e) {
  try {
    if (e.pathInfo === "write") {
      var title = e.parameter.title;
      if (!title) {
        // title パラメータが無い場合のエラーメッセージ
        throw new Error("Missing 'title' parameter.");
      }
      var payload = e.postData.contents;
      var result = write(title, payload);
      var output = JSON.stringify({ "response": { "result": result } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // その他のパスまたはパスなしのリクエストへのデフォルトの応答
    OPENAPI.servers[0].url = ScriptApp.getService().getUrl();
    var output = JSON.stringify({ "response": { "result": OPENAPI } });
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var output = JSON.stringify({ "error": { "errorMessage": error.message, "errorType": "Exception" } });
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }
}//doPost
```

#### `read.js`

```javascript
/**
 * キーを指定して、ユーザーキャッシュまたはスプレッドシートから値を読み取ります。キャッシュに値が存在する場合は、その値を返します。存在しない場合は、スプレッドシートから値を検索し、見つかった値を返します。値が見つからない場合は、空文字列を返します。
 *
 * @param {string} [key="TESTKEY"] - ユーザーキャッシュまたはスプレッドシートから読み取るキー。デフォルトは "TESTKEY"。
 * @returns {string} キーに対応する値。値が見つからない場合は空文字列。
 * @throws {Error} ロックが取得できない場合にエラーをスローします。
 */
function read(key) {
  if (key === undefined) key = "TESTKEY";
  const cache = CacheService.getUserCache();
  let value = cache.get(key);

  if (value !== null) {
    cache.put(key, value, 21600);
    return value;
  }

  const lock = LockService.getUserLock();
  lock.waitLock(30000);  // 最大30秒待つ

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] === key) {
      value = data[i][1];
      break;
    }
  }

  lock.releaseLock();  // ロックを解除

  if (value === undefined) value = "";  // value が見つからなかった時には空文字列を返す

  return value;
}//read
```

## Web Interface

This project does not include any `.html` files that serve as a traditional user interface. It functions purely as an API endpoint that returns JSON data, including its own OpenAPI specification.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **OAuth Scopes**:
    -   `https://www.googleapis.com/auth/script.external_request`: For making external HTTP requests.
    -   `https://www.googleapis.com/auth/spreadsheets`: For reading from and writing to Google Sheets.
    -   `https://www.googleapis.com/auth/userinfo.email`: For retrieving the user's email address.
    -   `https://www.googleapis.com/auth/script.scriptapp`: For interacting with the script itself (e.g., getting its URL).

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`SHEET_NAME`**: The name of the Google Sheet used for persistent storage must be set as a script property (`PropertiesService.getScriptProperties()`).
-   **Caching**: Utilizes `CacheService.getUserCache()` for temporary storage of key-value pairs.
-   **Locking**: Employs `LockService.getUserLock()` to prevent race conditions during concurrent read/write operations to the spreadsheet.

## Deployments

The project is deployed as a web application. The `openapi.js` file includes a sample server URL: `https://script.google.com/macros/s/AKfycbwzSMu0kC9yr2c253w4g-gJIHFSWexQntjx9KqVm6AzbngyGPU9wmeTZPGFOT8FHtQV/exec`.
