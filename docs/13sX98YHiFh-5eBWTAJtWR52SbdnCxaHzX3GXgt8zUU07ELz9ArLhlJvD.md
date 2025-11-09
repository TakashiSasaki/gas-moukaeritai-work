# Str

## Overview

This Google Apps Script project, named "Str," is a library of utility functions. It provides various helper functions for string manipulation, date formatting, and hexadecimal conversions. The project is deployed as a web app and also appears to be intended for use as a library.

## Functionality

The script includes a `doGet` function, which suggests it can be used as a web app. The web app can execute a `test()` function if the `test` parameter is present in the URL. The core of the project is a collection of utility functions.

### Utility Functions

- **Date Formatting:**
  - `getYyyyMmDd(sep, dateObject)`: Formats a date object into a `YYYYMMDD` string with an optional separator.
- **Hexadecimal Conversion:**
  - `hexBytes(bytes)`: Converts an array of bytes into a hexadecimal string.
- **String Padding:**
  - `addLeadingZero(n)`: Adds a leading zero to a number if it's less than 10.
  - `padHead(c, len, str)`: Pads the beginning of a string with a specified character to a certain length.
- **Other Utilities:**
  - The project also contains functions like `repeat(c, N)` to repeat a character `N` times.

### Code Examples

#### `doGet.js`
```javascript
function doGet(e) {
  if(typeof e.parameter.test !== undefined) {
    return ContentService.createTextOutput(test());
  }
}
```

#### `getYyyyMmDd.js`
```javascript
/**
  @param {Date} d a Date object
  @param {String} sep a separator
  @return {String} date in YYMMDD format
*/
function getYyyyMmDd(sep, dateObject) {
  if(sep === undefined) {
    sep = "";
  }//if
  Assert.isString(sep);
  var a = getYyyyMmDdArray(dateObject);
  var result = a.join(sep);
  return result;
}//getYyyyMmDd
```

#### `hexBytes.js`
```javascript
function hexBytes(bytes) {
  Assert.numberArrayInRange(bytes, -128, 255);
  var hexStrings = [];
  for(var i=0; i<bytes.length; ++i){
    var byte = bytes[i];
    var hexString = hexByte(byte);
    hexStrings.push(hexString);
  }//for  
  var result = hexStrings.join("");
  return result;
}//hexBytes
```

## Permissions & Libraries

The `appsscript.json` file specifies that the web app is accessible to anyone, including anonymous users. It also lists two library dependencies: `Assert` and `Is`.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "Assert",
      "libraryId": "10lJqYuurUoouFS-aPsPs4HU2s--Xkm5vTu7QVZH4HwcAZgtCDU6ZltQN",
      "version": "28",
      "developmentMode": true
    }, {
      "userSymbol": "Is",
      "libraryId": "1ovfzNY0BUREXY5Ky0eX1HZaz3VxEoq3wyjwZuYg4L6m8H83Rjb8Q1yhw",
      "version": "10",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER"
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbxtIqTYinDNeC_gSQwpSijQm6QkSUD1RtNelJyoiegW`
  - **URL:** `https://script.google.com/macros/s/AKfycbxtIqTYinDNeC_gSQwpSijQm6QkSUD1RtNelJyoiegW/exec`
- **ID (Version 18):** `AKfycbxq3vGTmk3kCQ2Yc-Z4kBjlmWCdaoYA07aWQNXO2BU55e6ITBCG`
  - **URL:** `https://script.google.com/macros/s/AKfycbxq3vGTmk3kCQ2Yc-Z4kBjlmWCdaoYA07aWQNXO2BU55e6ITBCG/exec`
