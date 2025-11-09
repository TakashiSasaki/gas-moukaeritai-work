# Project: Base64 and Hex XOR Utility

This Google Apps Script project is a web application that provides utilities for exploring and performing XOR operations on Base64 and hexadecimal strings. It features interactive tables and API endpoints for these operations, making it a valuable tool for cryptographic or encoding-related tasks.

## Overview

The primary purpose of this project is to offer a visual and programmatic way to understand and apply XOR logic to different string encodings. It allows users to generate and view XOR lookup tables for single hexadecimal digits, and perform XOR operations on longer Base64 Web-Safe strings.

## Functionality

The core functionality is implemented across `doGet.js`, `index.html`, `base64WebSafeXor.js`, `hex.js`, and `makeXorTable.js`.

### Core Features

-   **`doGet(e)`**: This function serves as the entry point for the web application and dynamically serves content based on URL parameters:
    -   If the `hex` parameter is present, it performs an XOR operation on provided hexadecimal strings and returns the result as plain text.
    -   If `base64Alphabet` is present, it serves `base64Alphabet.html`.
    -   If `base64XorTable` is present, it serves `base64XorTable.html` with the Base64 XOR table.
    -   If `base64WebSafeXorTable` is present, it serves `base64WebSafeXorTable.html` with the Base64 Web-Safe XOR table.
    -   By default (no specific parameters), it serves `index.html` which displays the hexadecimal XOR and product tables.
-   **`base64WebSafeXor.js`**:
    -   `makeBase64WebSafeXorTable()`: Generates a lookup table for XOR operations on Base64 Web-Safe characters.
    -   `getBase64WebSafeXorTable()`: Retrieves the Base64 Web-Safe XOR table, utilizing `CacheService` for caching.
    -   `xorBase64WebSafeStrings(x, y)`: Performs a character-by-character XOR operation on two Base64 Web-Safe strings of equal length.
-   **`hex.js`**: Provides utility functions for converting between hexadecimal strings and byte arrays:
    -   `hexToInt8Array(hexString)`: Converts a hexadecimal string to an array of signed 8-bit integers.
    -   `int8ArrayToHex(int8Array)`: Converts an array of signed 8-bit integers to a hexadecimal string.
-   **`makeXorTable.js`**:
    -   `makeXorTable()`: Generates a lookup table for XOR operations on single hexadecimal digits (0-F). This table is also cached using `CacheService`.
    -   `makeProductTable()`: (Implied by `index.html`, but not explicitly provided in the excerpt) Likely generates a table for some form of "product" operation on hexadecimal digits.

### Code Examples

#### `doGet.js`

```javascript
function doGet(e) {
  Logger.log(e);
  if(e.parameters.hex) {
    var resultHex = xorHexStrings(e.parameters.hex);
    var textOutput = ContentService.createTextOutput(resultHex).setMimeType(ContentService.MimeType.TEXT);
    return textOutput;
  }
  if("base64Alphabet" in e.parameters){
    var htmlTemplate = HtmlService.createTemplateFromFile("base64Alphabet");
    var htmlOutput = htmlTemplate.evaluate().setTitle("base64Alphabet");
    return htmlOutput;
  }
  if("base64XorTable" in e.parameters) {
    var htmlTemplate = HtmlService.createTemplateFromFile("base64XorTable");
    htmlTemplate.base64XorTable = getBase64XorTable();
    var htmlOutput = htmlTemplate.evaluate();
    return htmlOutput;
  }
  if("base64WebSafeXorTable" in e.parameters) {
    var htmlTemplate = HtmlService.createTemplateFromFile("base64WebSafeXorTable");
    htmlTemplate.base64WebSafeXorTable = getBase64WebSafeXorTable();
    var htmlOutput = htmlTemplate.evaluate();
    return htmlOutput;
  }
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.xorTable = makeXorTable();
  htmlTemplate.productTable = makeProductTable();
  var htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}
```

#### `base64WebSafeXor.js`

```javascript
base64WebSafeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
base64WebSafeXorTable = undefined;

function getBase64WebSafeXorTable(){
  if(base64WebSafeXorTable !== undefined) {
    return base64WebSafeXorTable;
  }
  var jsonString = CacheService.getScriptCache().get("base64WebSafeXorTable");
  if(jsonString) {
    base64WebSafeXorWebSafeTable = JSON.parse(jsonString);
    return base64WebSafeXorWebSafeTable;
  }
  base64WebSafeXorWebSafeTable = makeBase64WebSafeXorTable();
  return base64WebSafeXorTable; 
}

function makeBase64WebSafeXorTable(){
  base64WebSafeXorTable = {};
  for(var i=0; i<256; i+=4) {
    for(var j=0; j<256; j+=4) {
      var xxxx = Utilities.base64EncodeWebSafe([i>=128?i-256:i]);
      var x = xxxx.slice(0,1);
      var yyyy = Utilities.base64EncodeWebSafe([j>=128?j-256:j]);
      var y = yyyy.slice(0,1);
      var zzzz = Utilities.base64EncodeWebSafe([(i^j)>=128?(i^j)-256:(i^j)]);
      var z = zzzz.slice(0,1);
      if(x in base64WebSafeXorTable) {
        base64WebSafeXorTable[x][y] = z;
      } else {
        base64WebSafeXorTable[x] = {}
        base64WebSafeXorTable[x][y] = z;
      }
    }
  }
  CacheService.getScriptCache().put("base64WebSafeXorTable", JSON.stringify(base64WebSafeXorTable), 21600);
  Logger.log(base64WebSafeXorTable);
  return base64WebSafeXorTable;  
}

function xorBase64WebSafeStrings(x,y){
  if(y === undefined) {
    if(x.length === 2) {
      return xorBase64WebSafeStrings(x[0], x[1]);
    }
    if(x.length === 1) {
      return x[0];
    }
    var z = xorBase64WebSafeStrings(x.slice(0, x.length-1));
    return xorBase64WebSafeStrings(z, x[x.length-1]);
  }
  base64WebSafeXorTable = getBase64WebSafeXorTable();
  x = x.replace(/=+$/, "");
  y = y.replace(/=+$/, "");
  z = "";
  if(x.length !== y.length) throw "x and y doesn't have the same length";
  for(var i=0; i<x.length; ++i) {
    var xor = base64WebSafeXorTable[x.slice(i,i+1)][y.slice(i,i+1)];
    z += xor;
  }
  return z;
}
```

## Web Interface (`index.html`, `base64Alphabet.html`, `base64XorTable.html`, `base64WebSafeXorTable.html`)

The project provides a web interface with several pages:

-   **`index.html`**: Displays interactive tables for XOR and "product" operations on single hexadecimal digits. It also shows their JSON representations and provides navigation links to other pages.
-   **`base64Alphabet.html`**: (Content not provided, but implied to display the Base64 alphabet).
-   **`base64XorTable.html`**: (Content not provided, but implied to display the Base64 XOR table).
-   **`base64WebSafeXorTable.html`**: (Content not provided, but implied to display the Base64 Web-Safe XOR table).
-   **Styling**: Includes inline CSS for table formatting and color-coding.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **Execution API**: `ANYONE` (the Execution API is accessible by anyone).
-   **Libraries**: Depends on the `StringUtility` library (Script ID: `1toCTzwoHcWb0VQGQ3aYO9QZpRY9P5f4g3Hn4K9FCWFIth7OJjW4jssP5`).

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Caching**: Utilizes `CacheService.getScriptCache()` to cache generated XOR tables for performance.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
