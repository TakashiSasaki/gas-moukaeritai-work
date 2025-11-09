# Unicode Normalization Sandbox

## Overview

The "Unicode Normalization Sandbox" is a Google Apps Script web application designed to explore and test different Unicode normalization forms (NFD, NFKD). It provides a user interface with buttons that, when clicked, perform normalization operations on various Unicode character ranges, including specific blocks like Hangul and surrogate pairs. The results of these normalizations are then saved to a Google Spreadsheet, allowing for detailed inspection and analysis of how characters decompose or compose under different normalization rules. The project leverages external libraries for spreadsheet management and HTML templating.

## Functionality

The project serves as an interactive tool for understanding Unicode normalization within the Google Apps Script environment.

### Core Features

-   **`doGet()`:** The entry point for the web application. It initializes a Google Spreadsheet (using `SpreadsheetLibrary`), sets it as active, and then renders `index.html` using `HtmlTemplateLibrary`. The HTML output is then returned as the web app's content.
-   **`save(sheet_name, values)`:** A server-side function that takes a sheet name and a 2D array of values. It acquires a script lock, gets the singleton spreadsheet, and then writes the provided `values` to a sheet named `sheet_name`. If the sheet does not exist, it creates it. It also clears existing content and formats, and sets the first row as frozen.
-   **`deleteAllSheets()`:** A server-side function to clear all sheets within the active spreadsheet. It acquires a script lock and iterates through all sheets, attempting to delete each one.
-   **Client-side Normalization (`index.html`):** The HTML interface contains numerous buttons. Each button triggers a client-side JavaScript function (e.g., `decompose`, `nfd`, `nfkd`, `nfdHangul`, `nfkdHangul`, `nfdSurrogate`, `nfkdSurrogate`) that:
    -   Iterates through a specific range of Unicode code points.
    -   Applies `String.prototype.normalize("NFD")` or `String.prototype.normalize("NFKD")`.
    -   Collects data (code point, original character, normalized character).
    -   Calls the server-side `save()` function to write the results to a Google Spreadsheet.
-   **Unicode Ranges:** The buttons cover various Unicode ranges (e.g., `0x0000-0x0fff`, `0x1000-0x1fff`, up to `0xf000-0xffff`), as well as specific handling for Hangul characters (`0xac00-0xd7ff`) and surrogate pairs.

### Code Examples

#### `Code.js`

```javascript
function doGet() {
  var spreadsheet = SpreadsheetLibrary.getSingletonSpreadsheet();
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  HtmlTemplateLibrary.addGoogleSpreadsheetEdit(spreadsheet.getId(), "Unicode Normalization Sandbox");
  HtmlTemplateLibrary.addHtmlOutput(HtmlService.createTemplateFromFile("index").evaluate(), "button");
  return HtmlTemplateLibrary.getHtmlOutput("Unicode Normalization Sandbox");
}

function save(sheet_name, values) {
  LockService.getScriptLock().waitLock(10000);
  var spreadsheet = SpreadsheetLibrary.getSingletonSpreadsheet();
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheet_name);
  if(!sheet) {
    var sheet = spreadsheet.insertSheet(sheet_name);
  }
  sheet.clear();
  sheet.clearFormats();
  sheet.setFrozenRows(1);
  var range = sheet.getRange(1, 1, values.length, values[0].length);
  range.setValues(values);
}

function deleteAllSheets(){
  LockService.getScriptLock().waitLock(10000);
  var spreadsheet = SpreadsheetLibrary.getSingletonSpreadsheet();
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  for(var i=0; i<sheets.length; ++i) {
    try{
      spreadsheet.deleteSheet(sheets[i]);
    } catch(e) {
    }
  }
}
```

#### `index.html` (Client-side `decompose` function snippet)

```html
<script>
function decompose(normalization_type, start, end) {
  var values = [["charCode", "uCharCode", "char", "uNormalizedCharCode", "normalizedChar"]];
  for(var i=start; i<=end; ++i) {
    var c = String.fromCharCode(i);
    if(c.length === c.normalize(normalization_type).length) continue;
    var x = [i, escape(c), "'"+c, escape(c.normalize(normalization_type)), "'"+c.normalize(normalization_type)];
    values.push(x);
  }
  if(values.length === 1) return;
  google.script.run.withFailureHandler(function(x){
    alert("failed to write to the sheet. : " + x);
  }).withSuccessHandler(function(x){
    //alert("succeeded to write to the sheet. : " + x);
  }).save(normalization_type + start/0x1000, values);
}
</script>
```

## Permissions

The `appsscript.json` file specifies dependencies on `SpreadsheetLibrary` and `HtmlTemplateLibrary`. The web application is configured to execute as the user accessing it and is accessible by anyone.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "SpreadsheetLibrary",
      "libraryId": "1LSYokZ_LmtIkXv-URsN99givIHlIkDNHwQjkLAo6JkzwLvsbagpdbTaE",
      "version": "4",
      "developmentMode": true
    }, {
      "userSymbol": "HtmlTemplateLibrary",
      "libraryId": "1XB8G6BUwfRJsR9KyHOaEX8F1D2k3hmP0tB5Zec6cKoXNwx4hA4turlAj",
      "version": "31",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER"
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbw1Eqea8v8ILJy01ro2wmLZsrvtvnHRlTRIDtJZjw`
    -   **URL:** `https://script.google.com/macros/s/AKfycbw1Eqea8v8ILJy01ro2wmLZsrvtvnHRlTRIDtJZjw/exec`
-   **ID (Version 6 - web app meta-version):** `AKfycbzVXHmCamcn2ib_PQbWxmq8i8I_usAmoOPAUOJlEHAunojV0Q`
    -   **URL:** `https://script.google.com/macros/s/AKfycbzVXHmCamcn2ib_PQbWxmq8i8I_usAmoOPAUOJlEHAunojV0Q/exec`
