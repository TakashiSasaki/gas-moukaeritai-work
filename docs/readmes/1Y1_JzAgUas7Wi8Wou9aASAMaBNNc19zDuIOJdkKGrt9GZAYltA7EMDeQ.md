# Project: Google Sheets Utility Library

This Google Apps Script project is a utility library designed to enhance Google Sheets functionality. It provides functions for managing spreadsheets and individual sheets, as well as a custom function to extract specific data from JSON strings stored within cell notes.

## Overview

The primary purpose of this library is to offer reusable tools that simplify common tasks related to Google Sheets, such as accessing spreadsheets, listing and renaming sheets, and processing structured data embedded in cell notes.

## Functionality

The library's functionality is distributed across `getActiveOrSavedSpreadsheet.js`, `getSheetNames.js`, `renameSheet.js`, and `JSON_PARSE_NOTE.js`.

### Core Features

-   **`getActiveOrSavedSpreadsheet(properties, key)`**: This function retrieves a Google Spreadsheet object. It first attempts to get the currently active spreadsheet. If no spreadsheet is active, it looks for a spreadsheet ID stored in `PropertiesService` (using the provided `properties` object and `key`, defaulting to "spreadsheetId"). If a saved ID is found, it opens that spreadsheet; otherwise, it throws an error.
-   **`getSheetNames(spreadsheet)`**: Takes a `spreadsheet` object (or uses the active spreadsheet if none is provided) and returns an array containing the names of all sheets within that spreadsheet.
-   **`renameSheet(oldName, newName, spreadsheet)`**: Renames a sheet within a specified `spreadsheet` (or the active spreadsheet). After renaming, it sets the renamed sheet as the active sheet and moves it to the first position in the spreadsheet.
-   **`JSON_PARSE_NOTE(key)`**: This is a custom function (`@customfunction`) designed to be used directly within Google Sheets cells. It reads notes from cells in a specified range (starting from the active cell's row and column 1), attempts to parse each note as a JSON string, and then extracts the value associated with the provided `key`. The extracted values are returned as a 2D array, suitable for display in a sheet. This function is particularly useful for working with structured data stored in cell notes.

### Code Examples

#### `getActiveOrSavedSpreadsheet.js`

```javascript
function getActiveOrSavedSpreadsheet(properties, key) {
  //properties = PropertiesService.getScriptProperties();
  if(key === undefined) {
    key = "spreadsheetId";
  }
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if(spreadsheet === null){
    var spreadsheetId = properties.getProperty("spreadsheetId");
    if(spreadsheetId === null){
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if(spreadsheet === null) {
        throw "Neither active spreadsheet or saved spreadsheet ID.";
      }//if
      properties.setProperty("~~~spreadsheetId~~~", spreadsheet.getId());
      return spreadsheet;
    }//if
  }//if
  return spreadsheet;
}
```

#### `getSheetNames.js`

```javascript
function getSheetNames(spreadsheet) {
  if(spreadsheet === undefined) {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheets = spreadsheet.getSheets();
  var sheetNames = [];
  for(var i in sheets){
    sheetNames.push(sheets[i].getName());
  }//for
  return sheetNames;
}//getSheetNames
```

#### `renameSheet.js`

```javascript
function renameSheet(oldName, newName, spreadsheet){
  if(spreadsheet === undefined) {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheet = spreadsheet.getSheetByName(oldName);
  sheet.setName(newName);
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
  SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(1);
  return getSheetNames();
}//renameSheet
```

#### `JSON_PARSE_NOTE.js`

```javascript
/** @customfunction*/
function JSON_PARSE_NOTE(key) {
  LockService.getDocumentLock().waitLock(10000);
  var maxRows =  SpreadsheetApp.getActiveSheet().getMaxRows();
  var row =  SpreadsheetApp.getActiveRange().getRow();
  var column = SpreadsheetApp.getActiveRange().getColumn();
  var sourceRange = SpreadsheetApp.getActiveSheet().getRange(row, 1, maxRows-row+1, 1);
  var sourceNotes = sourceRange.getNotes();
  var targetRange = SpreadsheetApp.getActiveSheet().getRange(row, column, maxRows-row+1, 1);
  var targetValues = [];
  for(var i=0; i<= sourceNotes.length; ++i){
    var note = sourceNotes[i];
    try {
      var object = JSON.parse(note);
      var value = object[key];
    } catch (e){
      var value = e;
    }
    if(key.match(/^\".+\"$/)) {
      var json = JSON.stringify(object[JSON.parse(key)]);
      var value = json;
    }
    targetValues.push([value]);
  }
  return targetValues;
}//JSON_PARSE_NOTE
```

## Web Interface

This project does not include any `.html` files and therefore does not provide a web interface. It is designed to be used programmatically as a library or through its custom function within Google Sheets.

## Permissions

The `appsscript.json` file specifies no explicit OAuth scopes or library dependencies. As a standalone script/library, it will run with the permissions granted to the project that uses it. Its functionality implicitly requires access to `SpreadsheetApp` and `PropertiesService`.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`spreadsheetId`**: The ID of a default spreadsheet can be stored in `PropertiesService` using the key "spreadsheetId".

## Deployments

This project is intended to be deployed as a Google Apps Script library, to be included and used by other projects, or as a standalone script providing custom functions to Google Sheets. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
