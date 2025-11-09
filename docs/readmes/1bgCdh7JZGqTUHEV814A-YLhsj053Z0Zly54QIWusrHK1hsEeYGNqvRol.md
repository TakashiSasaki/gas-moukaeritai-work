# Project: String Utility Library

This Google Apps Script project is a utility library providing a collection of functions for string manipulation, character handling, encoding, and data lookup. It is designed to be used by other Google Apps Script projects to extend their capabilities in these areas.

## Overview

The primary purpose of this library is to offer a set of reusable tools for common data processing tasks that are not natively available or are cumbersome to implement in Google Apps Script. This includes converting data formats, handling character sets, and performing spreadsheet-like lookups.

## Functionality

The library's functionality is distributed across several `.js` files, each focusing on a specific utility.

### Core Features

-   **`bytesToHex.js`**: Provides functions for converting byte arrays and individual integers to their hexadecimal string representations.
    -   `toHexStringFromInteger(integer)`: Converts an integer to a 2-character hexadecimal string.
    -   `toHexStringFromByteArray(byteArray)`: Converts an array of integers (bytes) to a concatenated hexadecimal string.
    -   `toHexString(integerArrayOrInt)`: A polymorphic function that converts either a single integer or an array of integers to a hexadecimal string.
-   **`encodeURIComponent_ShiftJIS.js`**: Contains `encodeURIComponent_Shift_JIS(x)`, a function to URL-encode a string `x` using the Shift_JIS character encoding. This is particularly useful when interacting with Japanese web services that expect this specific encoding.
-   **`uniqueChar.js`**: Offers `uniqueChars(string_or_array)`, a function that removes duplicate characters from a given string. It can also process a multidimensional array of strings, returning an array of strings with unique characters for each input string.
-   **`vLookupAll.js`**: Implements `vLookupAll(key, arrayNM, index)`, a function similar to Excel's VLOOKUP. Unlike the standard VLOOKUP, it returns *all* matching values from the specified `index` column in `arrayNM` where the first column matches `key`.

### Code Examples

#### `bytesToHex.js`

```javascript
/**
  @param {Integer[] or Integer} array of integer or a single integer value
  @return {String}
*/
function toHexString(integerArrayOrInt){
  if(typeof integerArrayOrInt === "number"){
    var string = toHexStringFromInteger(integerArrayOrInt);
    return string;
  }
  if(typeof integerArrayOrInt === "object"){
    var string = toHexStringFromByteArray(integerArrayOrInt);
    return string;
  }
}
```

#### `encodeURIComponent_ShiftJIS.js`

```javascript
function encodeURIComponent_Shift_JIS(x) {
  var blob = Utilities.newBlob("", "text/plain");
  blob.setDataFromString(x, "Shift_JIS");
  Logger.log(blob.getBytes().length);
  var s = "";
  for(var i=0; i<blob.getBytes().length; ++i){
    var b = blob.getBytes()[i];
    var n = new Number(b);
    if(n<0) n+=256;
    Logger.log(n);
    var high = Math.floor(n/16);
    var low = Math.floor(n % 16);
    Logger.log(high);
    s += "%" + "0123456789ABCDEF".slice(high,high+1);
    s += "0123456789ABCDEF".slice(low,low+1);
  }
  Logger.log(s);
  return s;
}
```

#### `uniqueChar.js`

```javascript
/*
  uniqueChars removes duplicate characters in given string.
  It accepts a multidimensional array of strings as well.
  
  @param {String} string_or_array
  @return {String}
*/
function uniqueChars(string_or_array){
  if(arguments.length === 0){
    testUniqueChars_();
    return;
  }
  if(toString.call(string_or_array)==="[object String]"){
    var chars = string_or_array;
    var result="";
    for(var i=0; i<chars.length; ++i){
      if(result.indexOf(chars[i])<0){
        result+=chars[i];
      }//if
    }//for
    return result;
  }
  if(toString.call(string_or_array)==="[object Array]"){
    var results = [];
    for(var i=0; i<string_or_array.length; ++i){
      var result = uniqueChars(string_or_array[i]);
      results.push(result);
    }
    return results;
  }
}
```

#### `vLookupAll.js`

```javascript
/**
  Like VLOOKUP function except that it returns all rows.
  
  @param key {Number or String} the value to find in the first column
  @param arrayNM {Array} array of N rows and M columns
  @param index {Number} the column index to get values in given array
  @return {Array} Horizontal array of found values
*/
function vLookupAll(key, arrayNM, index) {
  if(arguments.length===0) {
    testVLookupAll_();
    return;
  }
  var results = [];
  for(var i=0; i<arrayNM.length; ++i){
    if(arrayNM[i][0]===key){
      results.push(arrayNM[i][index-1]);
    }
  }
  return results;
}
```

## Web Interface

This project does not include any `.html` files and therefore does not provide a web interface. It is designed to be used programmatically as a library within other Google Apps Script projects.

## Permissions

The `appsscript.json` file specifies no explicit OAuth scopes or library dependencies. As a standalone script/library, it will run with the permissions granted to the project that uses it.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: No external libraries are explicitly listed in `appsscript.json`.

## Deployments

This project is intended to be deployed as a Google Apps Script library. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
