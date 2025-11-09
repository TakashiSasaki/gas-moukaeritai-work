# URI

## Overview

This Google Apps Script project is a library for parsing and manipulating URIs (Uniform Resource Identifiers). It includes the well-known `URI.js` library, providing a robust set of tools for working with URLs. The project also contains some specific functions for handling `tag` URIs.

## Functionality

The core of this project is the `URI.js` library, which provides a powerful and flexible API for working with URIs. The project also includes a few wrapper functions to make it easier to use from Google Apps Script.

### Core Features

- **`URI.js`:** A comprehensive library for URI manipulation. It allows you to parse, build, and modify all parts of a URI, including the protocol, hostname, path, query, and fragment.
- **`parse(uriString)`:** A simple wrapper function that creates a new `URI` object from a URI string.
- **`isTagUri()`:** A placeholder function for checking if a URI is a `tag` URI.

### Code Examples

#### `URI.js`
This project includes the full `URI.js` library, which is too large to show here. You can find the full documentation for `URI.js` at [http://medialize.github.io/URI.js/](http://medialize.github.io/URI.js/).

#### `parse.js`
```javascript
/**
  @param {string} uriString URI reference string
  @return {URI} URI object
*/
function parse(uriString){
  uri = new URI(uriString);
  return uri;
}//parse
```

## Permissions

The `appsscript.json` file specifies a dependency on the `Assert` library.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "Assert",
      "libraryId": "10lJqYuurUoouFS-aPsPs4HU2s--Xkm5vTu7QVZH4HwcAZgtCDU6ZltQN",
      "version": "31",
      "developmentMode": true
    }]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has one deployment:

- **ID:** `AKfycbyV3JGesMiF40TL_6gXJncBGBrBkVpNHTJI3P1PAuw`
- **URL:** `https://script.google.com/macros/s/AKfycbyV3JGesMiF40TL_6gXJncBGBrBkVpNHTJI3P1PAuw/exec`
