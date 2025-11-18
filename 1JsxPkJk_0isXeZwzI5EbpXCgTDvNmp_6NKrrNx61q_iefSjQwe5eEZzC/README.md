# JsonTable

## Overview

The "JsonTable" project is a Google Apps Script library that provides a flexible and extensible framework for creating and managing tabular data structures. It builds upon a base `NamedTableConstructor` to offer specialized table types, including `ExtendableTableConstructor`, `JsonTableConstructor`, `BnsTableConstructor` (Boolean, Number, String), and `NsTableConstructor` (Number, String). The library is designed to work with 2D arrays as its underlying data store, allowing for structured access and manipulation of data using named keys and fields.

## Functionality

The library offers a hierarchy of table constructors, each adding specific functionalities:

### Core Features

-   **`NamedTableConstructor(values, iKeyColumn, iFieldRow)`:** The base constructor. It initializes a table with named keys (rows) and named fields (columns) from a 2D array. It enforces unique keys and fields and provides basic `set` and `get` methods.
-   **`ExtendableTableConstructor(values, iKeyColumn, iFieldRow)`:** Extends `NamedTableConstructor` by adding methods to dynamically add new keys (rows) and new fields (columns) to the table.
    -   `addNewKey(key)`: Adds a new row with the specified key.
    -   `addNewField(field)`: Adds a new column with the specified field.
-   **`JsonTableConstructor(values, iKeyColumn, iFieldRow)`:** Extends `ExtendableTableConstructor` to handle JSON-formatted values. It can convert the table to and from a JavaScript object structure, automatically parsing and stringifying JSON values.
    -   `getAsObject()`: Returns the table data as a JavaScript object.
    -   `setByObject(o)`: Populates the table from a JavaScript object, adding new keys/fields as needed.
-   **`BnsTableConstructor(values, iKeyColumn, iFieldRow)`:** (Boolean, Number, String) Extends `ExtendableTableConstructor`. This constructor provides intelligent `get` and `set` methods that automatically parse/stringify JSON, numbers, and booleans, and handle empty strings as `null`.
-   **`NsTableConstructor(values, iKeyColumn, iFieldRow)`:** (Number, String) Extends `BnsTableConstructor`. This constructor further refines value handling, specifically converting string representations of "TRUE", "True", "true", "FALSE", "False", "false" to their boolean equivalents during `get` operations, and storing booleans as "TRUE" or "FALSE" strings during `set` operations.

### Code Examples

#### `NamedTableConstructor.js`

```javascript
function NamedTableConstructor(values, iKeyColumn, iFieldRow){
  // ... constructor logic ...
}

NamedTableConstructor.prototype.set = function(key,field,value){
  // ... implementation ...
};

NamedTableConstructor.prototype.get = function(key,field){
  // ... implementation ...
};
```

#### `ExtendableTableConstructor.js`

```javascript
function ExtendableTableConstructor(values, iKeyColumn, iFieldRow) {
  // ... constructor logic ...
}

ExtendableTableConstructor.prototype.addNewKey = function(key){
  // ... implementation ...
};

ExtendableTableConstructor.prototype.addNewField = function(field){
  // ... implementation ...
};
```

#### `JsonTableConstructor.js`

```javascript
function JsonTableConstructor(values, iKeyColumn, iFieldRow) {
  // ... constructor logic ...
}

JsonTableConstructor.prototype.getAsObject = function(){
  // ... implementation ...
};

JsonTableConstructor.prototype.setByObject = function(o){
  // ... implementation ...
};
```

#### `BnsTableConstructor.js`

```javascript
function BnsTableConstructor(values, iKeyColumn, iFieldRow){
  // ... constructor logic ...
}

BnsTableConstructor.prototype.get = function(key, field){
  // ... implementation ...
};

BnsTableConstructor.prototype.set = function(key, field, value) {
  // ... implementation ...
};
```

#### `NsTableConstructor.js`

```javascript
function NsTableConstructor(values, iKeyColumn, iFieldRow){
  // ... constructor logic ...
}

NsTableConstructor.prototype.set = function(key, field, value){
  // ... implementation ...
};

NsTableConstructor.prototype.get = function(key, field) {
  // ... implementation ...
};
```

## Permissions

The `appsscript.json` file indicates no special dependencies or permissions are required for this library.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "exceptionLogging": "STACKDRIVER"
}
```

## Deployments

The project has one deployment:

-   **ID (HEAD):** `AKfycbzOVg_yg1ZshX78ofDX_is6UT5sBxA2PDA_5d6WKM0`
    -   **URL:** `https://script.google.com/macros/s/AKfycbzOVg_yg1ZshX78ofDX_is6UT5sBxA2PDA_5d6WKM0/exec`
