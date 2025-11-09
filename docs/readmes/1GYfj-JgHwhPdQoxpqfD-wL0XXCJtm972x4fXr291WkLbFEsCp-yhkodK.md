# StringEx

## Overview

The "StringEx" project is a Google Apps Script library that extends string manipulation capabilities beyond the native JavaScript `String` object. It introduces a custom `StringEx_` object with methods designed for more advanced string processing, including handling Unicode characters for operations like chopping strings into fixed-length segments and extracting unique characters.

## Functionality

The library provides a `StringEx_` constructor and several methods that operate on `StringEx_` instances.

### Core Features

-   **`StringEx_(s)`:** A constructor that creates a new `StringEx_` object, wrapping a given string `s`.
-   **`create(s)`:** A factory function to easily create `StringEx_` instances.
-   **`createSequence(beginCodepoint, endCodepoint)`:** Generates a `StringEx_` object containing a sequence of characters from a specified Unicode codepoint range.
-   **`chop(length)`:** This method, added to `StringEx_.prototype`, divides the wrapped string into an array of substrings, each of a specified `length`. It correctly handles Unicode surrogate pairs (e.g., emoji, CJK characters) to ensure that characters are not split incorrectly.
-   **`uniq()`:** This method, added to `StringEx_.prototype`, returns a new string containing only the unique characters from the wrapped string, preserving their original order of appearance.

### Code Examples

#### `StringEx.js`

```javascript
function StringEx_(x){
  if(x === undefined) {
    this.string = "";
  } else {
    this.string = x;
  }
}//StringEx

StringEx_.prototype.toString = function (){
  return this.string;
}//toString

/**
  @param {stirng?}
  @return {StringEx}
*/
function create(s){
  return new StringEx_(s);
}//create

/**
  @param {Number} beginCodepoint
  @param {Number} endCodepoint
  @return {StringEx}
*/
function createSequence(beginCodepoint, endCodepoint){
  var s = "";
  for(var i=beginCodepoint; i<=endCodepoint; ++i){
    s+=String.prototype.fromCharCode(i);
  }//for
  return create(s);
}//createSequence
```

#### `chop.js`

```javascript
/**
  @param {Number} length of each chunk
  @return {string[]}
*/
function chop(length) {
  throw "chop: create an instance first.";
}//chop

StringEx_.prototype.chop = function(length){
  var regexp = new RegExp('(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]){1,' + length + '}', 'g');
  var m = this.string.match(regexp);
  return m || [];
}//chop
```

#### `uniq.js`

```javascript
/**
  @return {string}
*/
function uniq(){
  throw "uniq: create an instance first.";
}

StringEx_.prototype.uniq = function() {
  var result = "";
  for(var i=0; i<this.string.length; ++i){
    if(result.indexOf(this.string[i])<0){
      result+=this.string[i];
    }//if
  }//for 
  return result;
}//uniq
```

## Permissions

The `appsscript.json` file indicates no special dependencies or permissions are required for this library.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has one deployment:

-   **ID (HEAD):** `AKfycby18sjoSVF5F0l-V05w0Z4-G8v2QhTslcGp9NGW3CY`
    -   **URL:** `https://script.google.com/macros/s/AKfycby18sjoSVF5F0l-V05w0Z4-G8v2QhTslcGp9NGW3CY/exec`
