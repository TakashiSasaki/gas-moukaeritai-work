# Web Clipboard Reader

## Overview

This Google Apps Script project, "Web Clipboard Reader," is a library that provides a simple key-value store. It uses another library, `WebClipboardWriter`, to handle the actual data storage. The project includes functions for getting, putting, and removing data, as well as for computing hashes to create unique identifiers for the data.

## Functionality

The library provides a simple interface for storing and retrieving data, with the actual storage being handled by the `WebClipboardWriter` library.

### Core Features

- **`get(salt, date, key)`:** Retrieves a value from the store. It uses a `salt` and `date` to compute a `tagUriMd5` hash, which is then used as the key for the `WebClipboardWriter.get()` function.
- **`put(salt, date, key, value)`:** Stores a key-value pair in the store. It also uses a `salt` and `date` to compute a `tagUriMd5` hash.
- **`remove(salt, key)`:** Removes a key-value pair from the store. It uses a `salt` and the user's email to compute a `saltEmailHash`.
- **`removeAll(salt)`:** Removes all key-value pairs associated with a given `salt`.

### Code Examples

#### `get.js`
```javascript
/*
  @param {string} salt
  @param {string} date
  @param {string} key
  @return {string} value
*/
function get(salt, date, key) {
  if(salt === undefined) throw "get: salt is mandatory.";
  if(date === undefined) throw "get: date is mandatory.";
  if(key === undefined) throw "get: key is mandatory.";
  var tagUriMd5 = computeTagUriMd5(salt, date);
  var value = WebClipboardWriter.get(tagUriMd5, key);
  return value;
}//get
```

#### `put.js`
```javascript
function put(salt, date, key, value){
  console.log("Web Clipboard Readre/put.gs: salt=" + salt + ", date=" + date + ", key=" + key + ", value=" + value);
  if(salt === undefined) throw "put: salt is mandatory.";
  if(date === undefined) throw "put: date is mandatory.";
  if(key === undefined) throw "put; key is mandatory.";
  if(value === undefined) throw "put: value is mandatory.";
  var tagUriMd5 = computeTagUriMd5(salt, date);
  console.log("Web Clipboard Reader/put.gs: tagUriMd5=" + tagUriMd5); 
  var putAt = WebClipboardWriter.put(tagUriMd5, key, value);
  return putAt;
}//put
```

## Permissions

The `appsscript.json` file specifies a dependency on the `WebClipboardWriter` library and that the web app is accessible to anyone and executes as the user accessing the app.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "WebClipboardWriter",
      "libraryId": "14OUFXtFBsyL7_H3lGOSzCTPlSegMO3VE2fN6ZuW4t6FDexc6370Fl1CJ",
      "version": "75",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbzI6PusT18Fa_w_yGNn-4rLjf7GGezjEZnK29JyQ30`
  - **URL:** `https://script.google.com/macros/s/AKfycbzI6PusT18Fa_w_yGNn-4rLjf7GGezjEZnK29JyQ30/exec`
- **ID (Version 10):** `AKfycby-47xUJtYqeE5PlOFZ8L7Ac91RvkdQAR2VJC4DFRfxB3JMcPQ`
  - **URL:** `https://script.google.com/macros/s/AKfycby-47xUJtYqeE5PlOFZ8L7Ac91RvkdQAR2VJC4DFRfxB3JMcPQ/exec`
