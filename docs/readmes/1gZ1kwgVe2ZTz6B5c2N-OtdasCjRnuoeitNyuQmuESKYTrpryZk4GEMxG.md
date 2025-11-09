# Spreadsheet Helper

## Overview

This Google Apps Script project, "Spreadsheet Helper," is a library designed to simplify interactions with Google Sheets. It provides a collection of utility functions for retrieving data by column name, appending rows, logging messages, and clearing duplicated rows. Additionally, it includes clipboard-related functions for caching and retrieving data using the user cache service.

## Functionality

The library offers various functions to streamline common Google Sheets operations and data management.

### Core Features

- **`getValuesByColumnName(sheet, column_name)`:** Retrieves all values from a specified column in a given sheet, identified by its header name.
- **`getValuesByColumnNames(sheet, column_names)`:** Retrieves values from multiple specified columns in a given sheet.
- **`appendRows(rows)`:** Appends a 2D array of values as new rows to the active sheet.
- **`appendLog(message)`:** Appends a log message (with a timestamp) as a new row to the active sheet.
- **`clearDuplicatedRows()`:** Identifies and clears duplicated rows within the currently selected range in a sheet.
- **Clipboard Functions:**
    - `getClipboardValues()`: Retrieves cached values from the user cache.
    - `getClipboardHeader()`: Retrieves cached header information from the user cache.

### Code Examples

#### `getValuesByColumnName.js`
```javascript
/*
  シートの一行目は絡むヘッダとする。
  指定されたカラム名のカラムのデータを二次元配列として取得する。
*/
function getValuesByColumnName(sheet, column_name) {
  // ... (implementation)
}
```

#### `rows.js`
```javascript
function appendRows(rows) {
  if(rows === undefined) {
    rows = JSON.parse(CacheService.getUserCache().get("values"));
  }
  var sheet = SpreadsheetApp.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var newRange = sheet.getRange(dataRange.getHeight()+1, 1, rows.length, rows[0].length);
  newRange.setValues(rows);
}

function clearDuplicatedRows() {
  var range = SpreadsheetApp.getActiveRange();
  var values = range.getValues();
  var hashValues = values.map(function(x){
    var jsonString = JSON.stringify(x);
    var byteArray = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, jsonString);
    var hashString = Utilities.base64Encode(byteArray);
    Logger.log(hashString);
    return hashString;
  });
  Logger.log(hashValues);
  for(var i=0; i<hashValues.length; ++i) {
    for(var j=i+1; j<hashValues.length; ++j) {
      if(hashValues[i]===hashValues[j]) values[j] = values[0].map(function(){return null});
    }
  }
  range.setValues(values);
}
```

## Permissions

The `appsscript.json` file specifies dependencies on `DriveAppUtilityLibrary` and `AddonHelper`. The web app access is restricted to the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "DriveAppUtilityLibrary",
      "libraryId": "1ziQa1RNI42ExDuN7tt5nxa_Cz19yEVCCeeevNU-gFcSwIqJzcThOBno8",
      "version": "7",
      "developmentMode": true
    }, {
      "userSymbol": "AddonHelper",
      "libraryId": "1ryBTdV-IJH57QxJefgX334JWuJ7KHLjpT43v45VAqwAmFSKqkXkMFnAY",
      "version": "3",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "MYSELF",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbxNYTKmwM0mpsPlv0sKai5ev_Az9GxqLCOmZps5GIbF`
  - **URL:** `https://script.google.com/macros/s/AKfycbxNYTKmwM0mpsPlv0sKai5ev_Az9GxqLCOmZps5GIbF/exec`
- **ID (Version 2):** `AKfycbw18Ou5V505eY4TDIWmOCSTbr8KyuR8J2fkyzMlWzp86HjkO1l6`
  - **URL:** `https://script.google.com/macros/s/AKfycbw18Ou5V505eY4TDIWmOCSTbr8KyuR8J2fkyzMlWzp86HjkO1l6/exec`
