# Glitch Projects

## Overview

This Google Apps Script project, "Glitch Projects," is a library of utility functions with a focus on data manipulation. It provides tools for converting between arrays of objects and a "JSON table" format, where all values are stored as JSON strings. The project also includes some functions for interacting with the Glitch platform.

## Functionality

The library provides a set of functions for data conversion and for interacting with Glitch.

### Core Features

- **`objectsToJsonTable(objects)`:** Converts an array of JavaScript objects into a two-dimensional array (a "JSON table"). The first row of the table contains the keys, and the subsequent rows contain the values. All values are converted to JSON strings.
- **`jsonTableToObjects(table)`:** The inverse of `objectsToJsonTable`. It converts a JSON table back into an array of JavaScript objects.
- **Glitch Integration:** The project includes functions like `fetchGlitchProjects` and `setGlitchLoginName`, which suggest that it can be used to interact with the Glitch platform.
- **Spreadsheet Integration:** The `setActiveSpreadsheetAsDefault` function allows you to set the active spreadsheet as the default for other operations.

### Code Examples

#### `objectsToJsonTable.js`
```javascript
/**
  Convert an array of objects into a table of JSON.
  ...
  @param {Array} array of objects
  @return {Rows} array of array of JSON
*/
function objectsToJsonTable(objects){
  // ... (implementation)
}
```

#### `jsonTableToObjects.js`
```javascript
function jsonTableToObjects(table) {
  var columns = [];
  for(var i in table[0]){
    var column = JSON.parse(table[0][i]);
    if(typeof column !== "string") throw "The top row should have JSON strings as property names.";
    columns.push(column);
  }//for
  
  var objects = [];
  for(var j=1; j<table.length; ++j){
    var object = {};
    for(k in table[j]){
      if(table[j][k] === null) continue;
      if(table[j][k] === "") continue;
      var value = JSON.parse(table[j][k]);
      object[columns[k]] = value;
    }//for
    objects.push(object);
  }//for
  return objects;
}//jsonTableToObjects
```

## Permissions

The `appsscript.json` file does not specify any special permissions or dependencies.

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

- **ID:** `AKfycbxG4Ld6hTSSueRSRG2pan53whK_8-EjBYXL-s3uB7s`
- **URL:** `https://script.google.com/macros/s/AKfycbxG4Ld6hTSSueRSRG2pan53whK_8-EjBYXL-s3uB7s/exec`
