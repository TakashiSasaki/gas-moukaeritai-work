# Table

## Overview

This Google Apps Script project, named "Table," is a library for working with tabular data. It provides a `Table` object that can convert between an array of objects and a 2D array (an array of arrays), which is a common format for working with data in Google Sheets.

## Functionality

The library allows you to create a `Table` object, append data to it, and then convert it to either a 2D array or an array of objects.

### Core Features

- **`createTable(header)`:** Creates a new `Table` object. You can optionally provide a header row (an array of strings).
- **`append(object)`:** Appends a new row to the table using an object. The object's keys should correspond to the header row.
- **`asTable()`:** Converts the `Table` object into a 2D array, including the header row.
- **`asObjects()`:** Converts the `Table` object into an array of objects.

### Code Examples

#### `Table_.js` (Constructor)
```javascript
function Table_(header) {
  this.objects = [];
  if(header !== undefined){
    this.table = [header];
  } else {
    this.table = [[]];
  }//if
  return this;
}//Table_
```

#### `toTable.js`
```javascript
Table_.prototype.toTable = function(){
  if(this.table[0].length === 0) {
    var propertyNames = {};
    for(var i=0; i<this.objects.length; ++i){
      for(var j=0; j<Object.keys(this.objects[i]).length; ++j){
        propertyNames[Object.keys(this.objects[i])[j]] = 1;
      }//for j
    }//for i
    this.table[0] = Object.keys(propertyNames);
  }//if

  for(var i=0; i<this.objects.length; ++i){
    var row = [];
    for(var j=0; j<this.table[0].length; ++j){
      row.push(this.objects[i][this.table[0][j]]);
    }//for j
    this.table.push(row);
  }//for i
  this.objects = [];
  return this;
}//toTable
```

#### `toObjects.js`
```javascript
Table_.prototype.toObjects = function(){
  for(var i=1; i<this.table.length; ++i){
    var o = {};
    for(var j=0; j<this.table[0].length; ++j){
      o[this.table[0][j]] = this.table[i][j];
    }//for j
    this.objects.push(o);
  }//for i
  this.table = [this.table[0]];
  return this;
}//toObjects
```

## Permissions

The `appsscript.json` file does not specify any explicit OAuth scopes or library dependencies.

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

- **ID:** `AKfycby2mosA_4wLFwNQDvc7M5dd160_XcJtZuh0iu1OPA9N`
- **URL:** `https://script.google.com/macros/s/AKfycby2mosA_4wLFwNQDvc7M5dd160_XcJtZuh0iu1OPA9N/exec`
