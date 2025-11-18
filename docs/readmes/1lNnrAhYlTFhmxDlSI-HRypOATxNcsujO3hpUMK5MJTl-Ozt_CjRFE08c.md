# CsvParser

## Overview

The "CsvParser" project is a Google Apps Script library and web application designed for parsing CSV (Comma Separated Values) and TSV (Tab Separated Values) data. It provides a client-side interface (`index.html`) where users can input text, which is then processed by a `CsvParser` module. A notable feature of this project is its custom module loading mechanism (`require.js`, `require.js.html`), which facilitates the inclusion and management of external JavaScript libraries, such as `Encoding.js` for character encoding conversions. The project aims to offer robust parsing capabilities for structured text data within the Google Apps Script environment.

## Functionality

The project provides both a web interface for interactive parsing and a set of server-side functions for programmatic use.

### Core Features

-   **`doGet()` (Web App Entry Point):** There are two `doGet` functions. The one in `doget.js` serves the `index.html` file, setting the title to "csvParser". The one in `doGet.js` (root) seems to be a placeholder returning an empty JavaScript content type.
-   **`index.html`:** A simple web interface with a `textarea` where users can paste or type CSV/TSV data. An `onChange` event triggers `detectEncodingAndAlert()`, which uses `CsvParser.csvDocument()` to parse the input and displays the result in an alert.
-   **`loadCsvParser()` / `load()`:** Functions that dynamically load the `CsvParser.js` content into a script tag, likely for client-side execution.
-   **`require.js` / `require.js.html`:** A custom CommonJS-like `require` implementation that allows for modular code organization. It's used to load the `Encoding.js` library, which provides extensive character encoding detection and conversion functionalities (e.g., UTF-8, SJIS, EUC-JP, UTF-16, ASCII, JIS, UNICODE, and various case conversions for Japanese characters).
-   **`tsv.js`:** Contains functions specifically for TSV parsing:
    -   `tsvSeparator(text)`: Returns the TSV separator (default is tab).
    -   `tsvField(text)`: Processes a single TSV field.
    -   `tsvDocument(tsvString)`: Parses a complete TSV string into a 2D array.
-   **`helloWorld.js`:** A simple placeholder function `myFunction()`.
-   **`test.js`:** Contains a `test()` function that demonstrates the usage of `CsvParser` for both CSV document parsing and TSV field processing.

### Code Examples

#### `doget.js` (Web App Entry Point)

```javascript
function doGet() {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("csvParser");
  return htmlOutput;
}
```

#### `index.html` (Client-side parsing example)

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
  </head>
  <body>
    <div>
      <textarea onChange="detectEncodingAndAlert()" id="textarea"></textarea>
    </div>
  <?!=getCsvParser()?>
  <script>
    function detectEncodingAndAlert(){
      var textarea = document.getElementById("textarea");
      var text = textarea.value;
      alert(JSON.stringify(CsvParser.csvDocument(text)));
    }
  </script>
  </body>
</html>
```

#### `tsv.js` (TSV parsing functions)

```javascript
/**
  @param {string} text
  @returns {string}
*/
function tsvSeparator(text) {
  if(text === undefined) text = "\t";
  
  var x = require("CsvParser");
  var result = x.tsvSeparator(text);
  return result;
}

/**
  @param {string} text
  @returns {string}
*/
function tsvField(text) {
  if(text === undefined) text = "abc";
  var x = require("CsvParser");
  Logger.log(typeof x.tsvField);
  var result = x.tsvField(text);
  Logger.log(result);
  return result;
}

/**
  @param tsvString {string}
  @return {[[string|number|boolean|null]]}
*/
function tsvDocument(tsvString){
  var csvParser = require("CsvParser");
  var result = csvParser.tsvDocument(x);
  return result;
}
```

## Permissions

The `appsscript.json` file indicates no specific library dependencies. The web application is configured to execute as the user who deployed it and is accessible by anyone anonymously.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbwXw1G-wqBlOd9vNgQm9CxBQw4FJyiV9d3NB9SlA9s1`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwXw1G-wqBlOd9vNgQm9CxBQw4FJyiV9d3NB9SlA9s1/exec`
-   **ID (Version 9 - web app meta-version):** `AKfycbxjRHum2GkmTSgxgXtdDgdm2rCVUmYuoypMuYL_1iJwe2cdlQEm`
    -   **URL:** `https://script.google.com/macros/s/AKfycbxjRHum2GkmTSgxgXtdDgdm2rCVUmYuoypMuYL_1iJwe2cdlQEm/exec`
