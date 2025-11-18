# Project: Public Key-Value Cache with MD5 Hashing

This Google Apps Script project is a web application that implements a public key-value store utilizing `CacheService.getScriptCache()`. It employs MD5 hashing with a "pepper" (a secret value) to generate unique namespaces and keys, providing a simple API for storing and retrieving data. The interactive web interface allows users to test these cache operations.

## Overview

The primary purpose of this project is to offer a publicly accessible, temporary key-value storage solution. It's designed for scenarios where data needs to be shared or persisted across different sessions or users for a limited time, with a focus on simple API interaction and a basic web-based testing interface.

## Functionality

The core functionality is implemented across `doGet.js`, `doPost.js`, `index.html`, `calculateMD5.js`, and `Code.js`.

### Core Features

-   **`doGet(e)`**: Serves the `index.html` file. It dynamically sets `clearNamespace` (from `e.pathInfo` or a default "defaultNamespace") and `hashedNamespace` (an MD5 hash of `pepper + clearNamespace + pepper`) for the web interface.
-   **`doPost(e)`**: Also serves `index.html` and dynamically sets `hashedNamespace` based on `e.pathInfo` or a default.
-   **`calculateMD5(string)`**: (Defined in `calculateMD5.js`) Computes the MD5 hash of a given string and returns it as a hexadecimal string. This is crucial for generating unique cache keys and namespaces.
-   **Key-Value Store Operations (in `Code.js`)**:
    -   `get(key, namespace)`: Retrieves a value from `CacheService.getScriptCache()` using an MD5 hash of `namespace + pepper + key` as the cache key.
    -   `getAll(keys, namespace)`: Retrieves multiple values from the cache.
    -   `put(key, value, namespace)`: Stores a key-value pair in the cache.
    -   `putAll(o, namespace)`: Stores multiple key-value pairs in the cache.
    -   `remove(key, namespace)`: Removes a key from the cache.
    -   `removeAll(keys, namespace)`: Removes multiple keys from the cache.
-   **API Endpoint Generation (in `Code.js`)**:
    -   `getBaseUrl()`: Returns the base URL of the deployed web app.
    -   `getPostEndpointPath(clearNamespace)` and `getGetEndpointPath(clearNamespace)`: Generate hashed endpoint paths for POST and GET requests, respectively, based on the `clearNamespace`.

### Code Examples

#### `doGet.js`

```javascript
function doGet(e) {
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  if(!e.pathInfo) {
    htmlTemplate.clearNamespace = "defaultNamespace";
    htmlTemplate.hashedNamespace = calculateMD5(pepper + htmlTemplate.clearNamespace + pepper);
  } else {
    htmlTemplate.clearNamespace = e.pathInfo.split("/")[0];
    htmlTemplate.hashedNamespace = calculateMD5(pepper + htmlTemplate.clearNamespace + pepper);
  }
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}
```

#### `calculateMD5.js`

```javascript
function calculateMD5(string) {
  // 文字列をUTF-8のバイト配列に変換
  var bytes = Utilities.newBlob(string).getBytes();

  // MD5ハッシュを計算
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes);

  // ハッシュ値を16進数の文字列に変換
  var hash = digest.reduce(function(str, chr) {
    var byte = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (byte.length == 1 ? '0' : '') + byte;
  }, '');
  return hash;
}
```

#### `Code.js` (Excerpt)

```javascript
const pepper = PropertiesService.getScriptProperties().getProperty("pepper");

/**
 * get
 */
function get(key, namespace) {
  const md5String = calculateMD5(namespace + pepper + key);
  return CacheService.getScriptCache().get(md5String);
}

function put(key, value, namespace) {
  const md5String = calculateMD5(namespace + pepper + key);
  return CacheService.getScriptCache().put(md5String, value);
}

function getBaseUrl(){  
  const url = ScriptApp.getService().getUrl();
  const m = url.match(/^http.*\/(dev|exec)/);
  return m[0];
}

function getPostEndpointPath(clearNamespace){
  return calculateMD5(pepper + getGetEndpointPath(clearNamespace) + pepper);
}

function getGetEndpointPath(clearNamespace){
  return calculateMD5(pepper + clearNamespace + pepper);
}
```

## Web Interface (`index.html` and `style.html`)

The `index.html` file provides an interactive web interface for the key-value store:

-   **Namespace Management**: Displays the "clear" and "hashed" namespaces.
-   **CRUD Operations**: Sections with input fields and buttons for `get`, `getAll`, `put`, `putAll`, `remove`, and `removeAll` operations. These buttons trigger corresponding server-side functions via `google.script.run`.
-   **Result Display**: A `textarea` to show the JSON results of API calls.
-   **Summary Information**: Displays the script ID, web app URL, and base URL.
-   **API Endpoints**: Dynamically generates and displays POST and GET endpoint URLs based on the selected namespace.
-   **Styling**: `style.html` provides basic CSS for the layout.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **Google Services**: Implicitly uses `CacheService` for data storage, `PropertiesService` for retrieving the "pepper", and `HtmlService` for the web interface.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`pepper`**: A secret string ("pepper") must be stored as a script property (`PropertiesService.getScriptProperties().getProperty("pepper")`). This pepper is crucial for the MD5 hashing algorithm used to generate unique namespaces and keys.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
