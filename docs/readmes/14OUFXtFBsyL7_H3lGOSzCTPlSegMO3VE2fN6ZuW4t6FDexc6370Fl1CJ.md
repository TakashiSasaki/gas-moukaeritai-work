# Web Clipboard Writer

## Overview

This Google Apps Script project, "Web Clipboard Writer," functions as a web-based key-value store. It uses Google Apps Script's `CacheService` as a backend to store data. The service is exposed as a web app that can be interacted with via `GET` and `POST` requests.

A unique feature of this project is its use of NI (Named Information) URIs to create namespaces for the stored data. These NI URIs are generated from a combination of an email, a salt, and a date.

## Functionality

The web app provides an interface to store and retrieve data. It can return data in either HTML or JSON format.

### Core Features

- **`doGet(e)`:** Handles `GET` requests. It can be used to retrieve the keys associated with a given NI URI. It can also be used to generate an NI URI from an email, salt, and date.
- **`doPost(e)`:** Handles `POST` requests. It is used to store a value associated with a key under a given NI URI.
- **`put(niUri, key, value)`:** The core function for storing data. It takes an NI URI, a key, and a value, and stores them in the `ScriptCache`.
- **`get(niUri, key)`:** The core function for retrieving data. It takes an NI URI and a key, and returns the corresponding value from the `ScriptCache`.
- **URI and Hash Computations:** The project includes several functions for computing NI URIs, Tag URIs, and MD5 hashes.

### Code Examples

#### `doGet.js`
```javascript
function doGet(e) {
  // ... (logic to handle GET requests, generate NI URIs, and retrieve keys)
}
```

#### `doPost.js`
```javascript
function doPost(e) {
  // ... (logic to handle POST requests and store data)
}
```

#### `put.js`
```javascript
function put(niUri, key, value) {
  if(!Is.niUri(niUri)) throw "put: niUri is mandatory.";
  if(typeof key !== "string") throw "put: key is mandatory.";
  if(typeof value !== "string") throw "put: value is mandatory.";

  var keys = getKeys(niUri);
  var putAt = (new Date()).getTime();
  keys[key] = putAt;
  CacheService.getScriptCache().put(niUri, JSON.stringify(keys), 21600);
  CacheService.getScriptCache().put(niUri + "#" + key, value, 21600);
  return putAt;
}//put
```

#### `get.js`
```javascript
function get(niUri, key) {
  if(!Is.niUri(niUri)) throw "get: niUri should be NI URI.";
  if(typeof key !== "string") throw "get: key is mandatory.";
  var value = CacheService.getScriptCache().get(niUri + "#" + key);
  if(value === null) {
    var keys = getKeys(niUri);  
    delete keys.key;
    CacheService.getScriptCache().put(niUri, JSON.stringify(keys));
  }//if
  return value;
}//get
```

## Permissions & Libraries

The `appsscript.json` file indicates that the web app is accessible to anyone, including anonymous users. It also uses the `Html`, `Assert`, and `Is` libraries.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "Html",
      "libraryId": "1jiI5HqUgUVyI4LA4gFueiux_mHjFuKlgJIVYY4EjRwIx0MAWqi5-Eyef",
      "version": "5",
      "developmentMode": true
    }, {
      "userSymbol": "Assert",
      "libraryId": "10lJqYuurUoouFS-aPsPs4HU2s--Xkm5vTu7QVZH4HwcAZgtCDU6ZltQN",
      "version": "31",
      "developmentMode": true
    }, {
      "userSymbol": "Is",
      "libraryId": "1ovfzNY0BUREXY5Ky0eX1HZaz3VxEoq3wyjwZuYg4L6m8H83Rjb8Q1yhw",
      "version": "19",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  },
  "executionApi": {
    "access": "ANYONE"
  },
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbz2BbGaug7HXHvK3clmNrqntzvBG2xFm32O0KZDNHc`
  - **URL:** `https://script.google.com/macros/s/AKfycbz2BbGaug7HXHvK3clmNrqntzvBG2xFm32O0KZDNHc/exec`
- **ID (Version 75):** `AKfycbz2Cu276-_R_zlS_fO1yN35FHUI9_I7MrPYfEHgTjMw6iWo1YU`
  - **URL:** `https://script.google.com/macros/s/AKfycbz2Cu276-_R_zlS_fO1yN35FHUI9_I7MrPYfEHgTjMw6iWo1YU/exec`
