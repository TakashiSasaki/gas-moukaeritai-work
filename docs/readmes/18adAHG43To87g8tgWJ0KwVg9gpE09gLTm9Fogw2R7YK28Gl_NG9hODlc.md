# PubCache

## Overview

This Google Apps Script project, "PubCache," is a public key-value store implemented as a web app. It uses Google's `CacheService` to store data for a limited time (up to 6 hours). The service is accessible via a web interface and also through a simple REST-like API.

## Functionality

The project provides a set of functions to interact with the cache, as well as a web interface to make it easy for users to store and retrieve data.

### Core Features

- **`doGet(e)`:** The main entry point for the web app. It serves the `index.html` page, a `readme.html` page, or retrieves a value from the cache based on the URL parameters.
- **`put(key, value, expirationInSeconds)`:** Stores a value in the cache with a given key.
- **`get(key)`:** Retrieves a value from the cache.
- **`remove(key)`:** Removes a value from the cache.
- **Web Interface (`index.html`):** A simple UI for generating keys, saving, and loading data from the cache. It also displays the API endpoint URL for the current key.

### Code Examples

#### `Code.js`
```javascript
/**
 * 指定されたキーに対応する値をキャッシュから取得します。
 * 値の取得に成功した場合、そのキーの有効期限は自動的にリセットされます。
 * @param {string} key 取得したいデータのキー。
 * @returns {string|null} キーに対応する値。見つからない場合はnullを返します。
 */
function get(key) {
  if (!_isValidKey(key)) {
    return null;
  }
  const cache = CacheService.getScriptCache();
  const value = cache.get(key);

  if (value !== null) {
    // 値の取得に成功した場合、有効期限をリセットするために再保存する
    cache.put(key, value, MAX_EXPIRATION);
  }
  return value;
}

/**
 * キーと値のペアをキャッシュに保存します。
 * @param {string} key 保存するデータのキー。
 * @param {string} value 保存するデータ。
 * @param {integer} expirationInSeconds (任意) 有効期限(秒)。1から21600まで。デフォルトは21600秒。
 */
function put(key, value, expirationInSeconds) {
  if (!_isValidKey(key) || typeof value !== 'string') {
    return;
  }
  const expiration = (expirationInSeconds > 0 && expirationInSeconds <= MAX_EXPIRATION)
    ? expirationInSeconds
    : MAX_EXPIRATION;

  const cache = CacheService.getScriptCache();
  cache.put(key, value, expiration);
}
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone, including anonymous users, and executes as the user who deployed it.

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

- **ID (HEAD):** `AKfycbxgTaCiZBJyloXUTX1-09VjIK_FIRNO1jdG9tHpIDOr`
  - **URL:** `https://script.google.com/macros/s/AKfycbxgTaCiZBJyloXUTX1-09VjIK_FIRNO1jdG9tHpIDOr/exec`
- **ID (Version 4):** `AKfycbySWM-zP6L4yiypXCK4_o8IZHEeM02l1MGnzIrXB0utA3Q92_P89sp0z4E9uMH3RdvRUg`
  - **URL:** `https://script.google.com/macros/s/AKfycbySWM-zP6L4yiypXCK4_o8IZHEeM02l1MGnzIrXB0utA3Q92_P89sp0z4E9uMH3RdvRUg/exec`
