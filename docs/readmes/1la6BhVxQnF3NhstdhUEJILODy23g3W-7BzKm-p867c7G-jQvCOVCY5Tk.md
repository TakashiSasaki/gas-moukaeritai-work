# Base32

## Overview

The "Base32" project is a Google Apps Script library that implements Base32 encoding and decoding. It supports several popular Base32 variants, including RFC 4648, Crockford, and Base32hex. The library provides `Encoder` and `Decoder` classes for processing data in a stream-like fashion, as well as convenience functions for one-shot encoding and decoding operations. The core logic of this library is adapted from the `speakeasyjs/base32.js` project by Kyle Drake.

## Functionality

The library offers robust Base32 encoding and decoding capabilities, with support for different alphabets and character mappings.

### Core Features

-   **`charmap(alphabet, mappings)`:** A utility function to generate character maps for Base32 alphabets, allowing for custom mappings or overrides.
-   **Supported Variants:**
    -   **RFC 4648:** The standard Base32 encoding (alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567").
    -   **Crockford:** A human-friendly Base32 encoding (alphabet: "0123456789ABCDEFGHJKMNPQRSTVWXYZ", with specific character mappings for 'O', 'I', 'L').
    -   **Base32hex:** Another variant (alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV").
-   **`Decoder(options)` Class:**
    -   Allows for decoding Base32 strings.
    -   `write(str)`: Decodes a string incrementally, updating the internal buffer and state.
    -   `finalize(str)`: Finishes the decoding process and returns the decoded byte array.
-   **`Encoder(options)` Class:**
    -   Allows for encoding byte arrays into Base32 strings.
    -   `write(buf)`: Encodes a byte array incrementally, updating the internal buffer and state.
    -   `finalize(buf)`: Finishes the encoding process and returns the encoded string.
-   **`encode(buf, options)` Function:** A convenience function for one-shot encoding of a byte array.
-   **`decode(str, options)` Function:** A convenience function for one-shot decoding of a Base32 string.

### Code Examples

#### `base32.js` (Snippet of `Decoder` and `Encoder` usage)

```javascript
// Create a new Decoder for RFC 4648
function Decoder (options) {
  this.buf = [];
  this.shift = 8;
  this.carry = 0;
  // ... initialization based on options.type ...
}

Decoder.prototype.write = function (str) {
  // ... decoding logic ...
  return this;
};

Decoder.prototype.finalize = function (str) {
  // ... finalization logic ...
  return this.buf;
};

// Create a new Encoder for RFC 4648
function Encoder (options) {
  this.buf = "";
  this.shift = 3;
  this.carry = 0;
  // ... initialization based on options.type ...
}

Encoder.prototype.write = function (buf) {
  // ... encoding logic ...
  return this;
};

Encoder.prototype.finalize = function (buf) {
  // ... finalization logic ...
  return this.buf;
};

// Convenience functions
function encode(buf, options) {
  return new Encoder(options).finalize(buf);
};

function decode(str, options) {
  return new Decoder(options).finalize(str);
};
```

#### `test.js` (Example usage from test file)

```javascript
function testDecodeRfc4648(){
  for(var i=0; i<testStrings.length; ++i){
    var str = base32Strings[i];
    var decoder = new Decoder({ type: "rfc4648" });
    var decoded = decoder.write(str).finalize();
    var decodedString = decoded.map(function(x){return String.fromCharCode(x)}).join("");
    if(decodedString !== testStrings[i]) throw "'" + str + "' should be decoded to '" + testStrings[i] + "'";
    Logger.log(str + " --> " + decodedString);
  }
}

function testEncodeCrockford(){
  for(var i=0; i<testStrings.length; ++i){
    var str = testStrings[i];
    var charArray = str.split("");
    var byteArray =charArray.map(function(x){return x.charCodeAt(0);});
    var encoder = new Encoder({ type: "crockford" });
    var encoded = encoder.write(byteArray).finalize();
    Logger.log(str + " --> " + encoded);
  }
}
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

-   **ID (HEAD):** `AKfycbwcHHESXTxFm9BItn2auCKespVEyDm-q71Wzz1I-7F1`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwcHHESXTxFm9BItn2auCKespVEyDm-q71Wzz1I-7F1/exec`
