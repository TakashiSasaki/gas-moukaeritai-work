# Snippets (Unicode Utility Library)

## Overview

The "Snippets" project is a Google Apps Script utility library focused on advanced Unicode character handling. Its primary purpose is to facilitate the conversion of UCS-4 (32-bit Unicode) hexadecimal representations into UTF-16 strings and to correctly generate surrogate pairs for Unicode code points that fall outside the Basic Multilingual Plane (BMP). This library is particularly useful when dealing with supplementary characters in JavaScript environments, which natively use UTF-16.

## Functionality

The library provides two core functions for Unicode manipulation:

### Core Features

-   **`ucs4HexToUtf16String(hexstring)`:**
    -   Takes a hexadecimal string (e.g., "1F600" for a grinning face emoji) representing one or more UCS-4 characters.
    -   Parses the hexadecimal values.
    -   For each UCS-4 code point, it determines if a surrogate pair is needed (i.e., if the code point is greater than `0xFFFF`).
    -   Constructs and returns the corresponding UTF-16 string.
-   **`surrogatePair(codepoint)`:**
    -   Takes an integer `codepoint` representing a Unicode character.
    -   If the `codepoint` is within the BMP (`<= 0xFFFF`), it returns an array containing just the `codepoint`.
    -   If the `codepoint` is outside the BMP (`> 0xFFFF`), it calculates and returns an array containing the high and low surrogate values required to represent that character in UTF-16.

### Code Examples

#### `unicode.js`

```javascript
/**
 * @param {string} hexstring hexadecial representation of a UCS-4 character
 * @return {string} UTF-16 string for the given one UCS-4 character
 */
function ucs4HexToUtf16String(hexstring) {
  var m = hexstring.match(/[0-9A-F]+/g);
  if (m == null) return undefined;
  var s = "";
  for (var i = 0; i < m.length; ++i) {
    var l = parseInt(m[i], 16);
    var surrogate_pair = surrogatePair(l);
    for (var j = 0; j < surrogate_pair.length; ++j) {
      s += String.fromCharCode(surrogate_pair[j]);
    }
  }
  return s;
}

/**
 * @param {int} codepoint codepoint of a UCS-4 character
 * @return {string[]}
 */
function surrogatePair(codepoint) {
  //D800	<Non Private Use High Surrogate, First>
  //DB7F	<Non Private Use High Surrogate, Last>
  //DB80	<Private Use High Surrogate, First>
  //DBFF	<Private Use High Surrogate, Last>
  //DC00	<Low Surrogate, First>
  //DFFF	<Low Surrogate, Last>
  if (codepoint <= 0xffff) return [codepoint];
  var high = Math.floor((codepoint - 0x10000) / 1024) + 0xd800;
  var low = (codepoint - 0x10000) % 1024 + 0xdc00;
  return [high, low];
}
```

## Permissions

The `appsscript.json` file indicates no specific library dependencies or special permissions are required for this library.

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

-   **ID (HEAD):** `AKfycbycZLrpOKbyvKQvYj4GvJOpxs-2kLPakZSuOQMBHcc`
    -   **URL:** `https://script.google.com/macros/s/AKfycbycZLrpOKbyvKQvYj4GvJOpxs-2kLPakZSuOQMBHcc/exec`
