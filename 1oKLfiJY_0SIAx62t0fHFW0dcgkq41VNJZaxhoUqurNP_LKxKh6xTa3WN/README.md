# Project: 1oKLfiJY_0SIAx62t0fHFW0dcgkq41VNJZaxhoUqurNP_LKxKh6xTa3WN

## Project Overview and Purpose

This Google Apps Script project provides SHA-1 hash computation functionalities, specifically designed to work with UTF-8 encoded strings and byte arrays. It includes a custom SHA-1 implementation (`sha1.js`) and utility functions to convert various data types to `Uint8Array` for consistent hashing. The project also features several test functions to verify the correctness of the SHA-1 implementation against Google Apps Script's built-in `Utilities.computeDigest` function. It appears to be a utility library for cryptographic hashing within the Google Apps Script environment.

## Core Functionality

The project's core functionality is to compute SHA-1 hashes of various inputs.

### SHA-1 Computation (`sha1.js`, `computeSha1.js`)

*   **`sha1` object (in `sha1.js`)**: This is a custom implementation of the SHA-1 algorithm. It provides methods to compute SHA-1 hashes in hexadecimal (`hex`), decimal (`dec`), and binary (`bin`) formats. It handles padding and rounds according to the SHA-1 specification.
*   **`computeSha1Hex(blob)`**: Computes the SHA-1 hash of a given `Blob` or array of integers and returns it as a hexadecimal string. It uses the `toUint8Array` function to ensure consistent input format for the `sha1.hex` method.
*   **`computeSha1Uint8Array(blob)`**: Computes the SHA-1 hash and returns it as an array of unsigned 8-bit integers.
*   **`computeSha1Blob(blob)`**: Computes the SHA-1 hash and returns it as a `Blob`.

```javascript
// Excerpt from sha1.js (core SHA-1 implementation)
sha1 = new function() {
  var blockLen = 64;
  var state = [ 0x67452301 , 0xefcdab89 , 0x98badcfe , 0x10325476 , 0xc3d2e1f0 ];
  // ... (internal functions for padding, rounds, etc.) ...
  this.hex = function(_data) { return toHex( getMD(_data) ); }
  this.dec = function(_data) { return getMD(_data); }
  this.bin = function(_data) { return pack( getMD(_data) ); }
}

// Excerpt from computeSha1.js
/**
  @param {Blob} blob or array
  @return {String}
*/
function computeSha1Hex(blob) {
  var uint8Array = toUint8Array(blob);
  var hexString = sha1.hex(uint8Array);
  return hexString;
}
```

### Data Type Conversion (`toUint8Array.js`)

*   **`toUint8Array(blob)`**: Converts a Google Apps Script `Blob` object or a standard JavaScript array of integers into an array of unsigned 8-bit integers (`Uint8Array`). This is crucial for ensuring that the SHA-1 algorithm receives data in the correct format, especially when dealing with signed bytes from `getBytes()`.

```javascript
/**
  @param {Blob} blob or array of int
  @return {Array}
*/
function toUint8Array(blob) {
  if(Is_.blob(blob)){ // Assumes Is_.blob is from a linked library
    var int8Array = blob.getBytes();
    return int8Array.map(function(x){return x<0 ? x+256: x;});
  } else {
    var array = blob;
    return array.map(function(x){return x<0 ? x+256: x;});
  }
}
```

### Test Functions (`computeHonjitsu.js`, `computeKonnichiha.js`, `computeKonnichiwa.js`, `test.js`)

The project includes several test functions to validate the SHA-1 implementation.

*   **`computeHonjitsu()`**: Computes the SHA-1 hash of the UTF-8 encoded Japanese phrase "本日は晴天なり" and asserts its correctness against `Utilities.computeDigest`.
*   **`computeKonnichiha()`**: Computes the SHA-1 hash of the UTF-8 encoded Japanese phrase "こんにちは" and asserts its correctness.
*   **`computeKonnichiwa()`**: Computes the SHA-1 hash of the UTF-8 encoded Japanese phrase "こんにちわ" and asserts its correctness.
*   **`test()`**: A general test runner function that iterates through all functions in the global scope and executes any function that has a `.test()` method.

```javascript
// Excerpt from computeHonjitsu.js
/*
  @return {string} hex sha1 of UTF-8 encoded 本日は晴天なり
*/
function computeHonjitsu() {
  var utf8Bytes = Utilities.newBlob("本日は晴天なり").getBytes();
  Assert_.equal(utf8Bytes.length, 21); // Assumes Assert_.equal is from a linked library
  var gasSha1 = Str.hexBytes(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, "本日は晴天なり", Utilities.Charset.UTF_8)); // Assumes Str.hexBytes is from a linked library
  Assert_.equal(gasSha1, "6b4016472030307a38f6ca23f76572ae0bed338f");
  var sha1 = computeSha1Hex(utf8Bytes);
  Assert_.equal(gasSha1, sha1);
  return sha1;  
}

// Excerpt from test.js
function test(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(typeof this[i]["test"] === "function"){
        Logger.log("Running the test for " + i);
        this[i]["test"]();
      }
    }
  }
}
```

## Permissions

The `appsscript.json` manifest file specifies the following settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Dependencies:**
    *   **Libraries:**
        *   `Assert_` (ID: `10lJqYuurUoouFS-aPsPs4HU2s--Xkm5vTu7QVZH4HwcAZgtCDU6ZltQN`, Version: `15`, Development Mode: `true`) - Likely an assertion library for testing.
        *   `Str` (ID: `13sX98YHiFh-5eBWTAJtWR52SbdnCxaHzX3GXgt8zUU07ELz9ArLhlJvD`, Version: `8`, Development Mode: `true`) - Likely a string utility library, possibly containing `hexBytes` for converting byte arrays to hex strings.
        *   `Is_` (ID: `1ovfzNY0BUREXY5Ky0eX1HZaz3VxEoq3wyjwZuYg4L6m8H83Rjb8Q1yhw`, Version: `9`, Development Mode: `true`) - Likely a type-checking utility library, used for `Is_.blob`.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbwg3kDWPTPnwTSQzn8hDkDcy2CeuxeL0jglRgOseI4`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbwg3kDWPTPnwTSQzn8hDkDcy2CeuxeL0jglRgOseI4/exec`
