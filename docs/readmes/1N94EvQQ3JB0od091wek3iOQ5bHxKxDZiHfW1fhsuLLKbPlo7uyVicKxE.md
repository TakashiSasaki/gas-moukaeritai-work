# Project: 1N94EvQQ3JB0od091wek3iOQ5bHxKxDZiHfW1fhsuLLKbPlo7uyVicKxE

## Project Overview and Purpose

This Google Apps Script project provides a robust caching mechanism built on top of `CacheService.getScriptCache()`. It offers functionalities to store, retrieve, and manage various types of data (objects, strings, sequences of strings) within the script's cache. The project seems to be a utility library designed to simplify cache interactions for other Google Apps Script projects, providing methods for clearing cache entries, managing sequences of data, and stashing/unstashing objects.

## Core Functionality

The core functionality revolves around the `Cache` library (ID: `1NYN_AoEoGoZIOKurCE2dSWFMzpBTeZFczQ-q_F4d-mvQ2XK6rdtz3Zev`) which this project depends on. This project acts as a wrapper or an extension, providing convenient functions to interact with that underlying `Cache` library.

### `Code.js`

This script serves as the main entry point for cache operations, exposing functions that delegate to the external `Cache` library.

*   **`clear(keyString)`**: Clears a cache entry associated with `keyString`.
*   **`getSequence(keyString, beginIndex, endIndex)`**: Retrieves a sequence of strings from the cache.
*   **`putSequence(keyString, stringArray)`**: Stores a sequence of strings in the cache.
*   **`stash(object, keyPropertyName)`**: Stores an object in the cache, using a specified property as the key.
*   **`unstash(object)`**: Retrieves an object from the cache.

```javascript
cache = CacheService.getScriptCache();

/**
  @param {String} keyString
  @returns {void}
*/
function clear(keyString) {
  Cache.clear(cache, keyString);
}

/**
  @param {String} keyString
  @param {Integer=} beginIndex 0-origin
  @param {Integer=} endIndex 0-origin
  @returns {String[]}
*/
function getSequence(keyString, beginIndex, endIndex){
  var stringArray = Cache.getSequence(cache, keyString, beginIndex, endIndex);
  return stringArray;
}

/**
  @param {String} keyString
  @param {String[]} a list of strings
  @return {void}
*/
function putSequence(keyString, stringArray){
  Cache.putSequence(cache, keyString, stringArray);
}

/**
  @param {Object} object
  @param {String} keyPropertyName
  @return {void}
*/
function stash(object, keyPropertyName) {
  Cache.stash(cache, object, keyPropertyName)
}

/**
  @param {Object} object
  @return {void}
*/
function unstash(object){
  Cache.unstash(cache, object);
}
```

### `append.js`

Provides a function to append a single string to a cached sequence.

*   **`append(keyString, string)`**: Appends a `string` to the sequence identified by `keyString`.

```javascript
/**
  @param {String} keyString
  @param {String} string
  @returns {Integer} current sequence length
*/
function append(keyString, string) {
  var length = Cache.append(cache, keyString, string);
  return length;
}
```

### `appendSequence.js`

Provides a function to append an array of strings to a cached sequence.

*   **`appendSequence(keyString, stringArray)`**: Appends an array of `stringArray` to the sequence identified by `keyString`.

```javascript
/**
  @param {String} keyString
  @param {String} stringArray
  @returns {Integer} current sequence length
*/
function appendSequence(keyString, stringArray){
  var length =Cache.appendSequence(cache, keyString, stringArray);
  return length;
}
```

### `put.js`

Offers functions to store and retrieve arbitrary data in the cache.

*   **`put(any, keyString)`**: Stores `any` data in the cache, optionally using `keyString`.
*   **`get(keyString)`**: Retrieves data from the cache using `keyString`.

```javascript
/**
  @param {Any} any
  @param {Stirng=} keyString key string
  @return {String} key string
*/
function put(any, keyString){
  keyString = Cache.put(cache, any, keyString);
  return keyString;
}

/**
  @param {String} keyString
  @returns {Any}
*/
function get(keyString) {
  var any = Cache.get(cache, keyString)
  return any;
}
```

### `putAll.js`

Provides functions for batch operations to store and retrieve multiple items in the cache.

*   **`putAll(anyArray, keyStringArray)`**: Stores an array of data `anyArray` in the cache, optionally using `keyStringArray` for keys.
*   **`getAll(keyStringArray)`**: Retrieves an array of data from the cache using `keyStringArray`.

```javascript
/**
  @param {Any[]} anyArray
  @param {String[]=} keyStringArray
  @returns {String[]} Array of key strings
*/
function putAll(anyArray, keyStringArray){
  keyStringArray = Cache.putAll(cache, anyArray, keyStringArray)
  return keyStringArray;
}

/**
  @param {String[]} keyStringArray
  @return {Any[]} Array of objects
*/
function getAll(keyStringArray){
  var anyArray = Cache.getAll(cache, keyStringArray);
  return anyArray;
}
```

### `testAll.js`

This script contains a utility function `testAll()` to execute all functions within the global scope that start with "test" (excluding `testAll` itself and functions ending with `__`). This is likely used for running unit tests or sanity checks within the Google Apps Script environment.

```javascript
global = this;

function testAll(){
  for(var i in global) {
    if(typeof global[i] !== "object") continue;
    for(var j in global[i]) {
      if(typeof global[i][j] != "function") continue;
      if(j.match(/^testAll$/)) continue;
      if(j.match(/__$/)) continue;
      if(!j.match(/^test/)) continue;
      Logger.log("testAll -> %s.%s", i, j);
      global[i][j]();
      Logger.log("testAll <- %s.%s", i, j);      
    }
  }
}
```

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Dependencies:**
    *   **Libraries:**
        *   `Cache` (ID: `1NYN_AoEoGoZIOKurCE2dSWFMzpBTeZFczQ-q_F4d-mvQ2XK6rdtz3Zev`, Version: `65`, Development Mode: `true`) - This indicates a strong dependency on an external Google Apps Script library named "Cache".

## Deployments

The project has the following deployment:

*   **Deployment ID:** `AKfycbw1PNb-IZ83NwzPtXm5Xhu1kwnVvOHdZswosnr2NNt0`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbw1PNb-IZ83NwzPtXm5Xhu1kwnVvOHdZswosnr2NNt0/exec`
