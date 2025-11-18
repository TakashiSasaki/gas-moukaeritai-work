# Project: 1LXZ33F_GXt5lZLQj-0qTirlr2jG-D0nBn6A8SX2RyqD4bBOEZTRT_sz7

## Project Overview and Purpose

This Google Apps Script project, named "Datastore" or "Journal", appears to be designed for managing and persisting data to Google Spreadsheets. It implements a caching mechanism, tracks "dirty" (modified) data, and provides functionality to flush these changes from a cache/journal into designated Google Sheets. It also includes utilities for managing Google Spreadsheet files and folders within Google Drive, as well as base64 encoding/decoding. The project exposes a web application interface for users to interact with the linked spreadsheets.

## Core Functionality

### `Cache.js`
This script implements a caching layer using Google Apps Script's `CacheService.getUserCache()`. It provides methods for storing, retrieving, and removing data from the user-specific cache. It also interacts with the `Dirty` module to mark cached items as modified.

```javascript
"use strict";
/**
  @constructor
  @return {Cache}
*/
function Cache() {
  if(!Cache.userCache) {
    Cache.userCache = CacheService.getUserCache();
  }
  return Object.seal(this);
}//Cache

/**
  @param {String} k
  @param {String} v
  @return {void}
*/
Cache.prototype.write = function(k, v){
  Assert.isString(k).isString(v);
  var dirty = new Dirty();
  dirty.setDirty(k, (new Date()).getTime());
  Cache.userCache.put(k, v, 21600);
}//Cache.prototype.put

// ... (other methods like put, get, getAll, removeAll)
```

### `Dirty.js`
This module is responsible for tracking "dirty" items, i.e., data that has been modified and needs to be written to a persistent store (Google Sheets). It uses the `Cache` service to store keys of dirty items along with their write/read timestamps and associated spreadsheet/sheet numbers.

```javascript
"use strict";
/** 'Dirty' tracks dirty items.
  @constructor
  @return {Dirty}
*/
function Dirty() {
  Assert.arrayLength(Dirty.allDirtyKeys, 4096);
  this.cache = new Cache();
  return Object.seal(this);
}//Dirty

Dirty.prototype.clean = function(){
  this.cache.removeAll(Dirty.allDirtyKeys);
}//Dirty.prototype.clean

/**
  @param {Number} ssNumber
  @param {Number} sheetNumber
  @return {Array}
*/
Dirty.prototype.getDirty = function(ssNumber, sheetNumber) {
  // ... (implementation)
}

/**
  @param {Array} keys
  @return {void}
*/
Dirty.prototype.setDirty = function(key, writeDateTime, readDateTime){
  // ... (implementation)
}
// ... (other methods like getDirtyAll, count)
```

### `Journal.js`
The `Journal` script orchestrates the process of flushing dirty data from the cache to Google Spreadsheets. It utilizes the `Dirty` and `Cache` modules to identify modified items and the `Sht` module to append these changes to the appropriate sheets.

```javascript
"use strict";
/**
  @constructor
  @return {Journal}
*/
function Journal() {
  this.dirty = new Dirty();
  this.cache = new Cache();
  this.sht = new Sht(64,0); // Journal sheet
  var sealed = Object.seal(this);
  return sealed;
}//Journal

Journal.prototype.flush = function(){
  var dirtyKeysAll = this.dirty.getDirtyAll();
  var rangeValues = [];
  for(var ssNumber = 0; ssNumber<64; ++ssNumber){
    for(var sheetNumber = 0; sheetNumber<64; ++sheetNumber){
      var dirtyItems = dirtyKeysAll[ssNumber][sheetNumber];
      if(dirtyItems === undefined) continue;
      for(var i=0; i<dirtyItems.length; ++i){
        var dirtyItem = dirtyItems[i];
        Assert.arrayLength(dirtyItem, 5);
        var k = dirtyItem[0];
        Assert.isString(k);
        var value = this.cache.get(k);
        Assert.isString(value);
        dirtyItem.push(value);
        Assert.arrayLength(dirtyItem, 6);
        rangeValues.push(dirtyItem);
      }//for
    }//for sheetNumber
  }//for ssNumber

  this.sht.append(rangeValues);
  this.dirty.clean();
}//Journal.flush
```

### `Sht.js`
This script provides an abstraction for interacting with Google Spreadsheets and individual sheets. It can open spreadsheets by ID, retrieve or create sheets by name (numbered 0-63), and append data to them. It relies on `Up` to fetch spreadsheet IDs.

```javascript
/**
  @constructor
  @return {Sht}
*/
function Sht(ssNumber, sheetNumber) {
  // ... (constructor logic to get/create spreadsheet and sheet)
}

/**
  @param {Array} array of array
  @return {void}
*/
Sht.prototype.append = function(values){
  Assert.sheet(this.sheet);
  Assert.isArray(values);
  Assert.isTrue(values.length > 0);
  Assert.isArray(values[0]);
  var width = values[0].length;
  var lastRow = this.sheet.getLastRow();
  var range = this.sheet.getRange(lastRow+1, 1, values.length, width);
  range.setValues(values);
}//Sht.prototype.append
```

### `SsFile.js`
Manages individual Google Spreadsheet files. It uses the Drive API (v2) to create, remove, find, register, and rename spreadsheet files.

```javascript
/**
  @constructor
  @param {String} ssNameStem
  @param {String} dateString
  @param {Number} ssNumber
  @return {SsFile}
*/
function SsFile(ssNameStem, dateString, ssNumber) {
  // ... (constructor logic)
}

/**
  @return {String} Spreadsheet ID
*/
SsFile.prototype.create = function (){
  // ... (implementation to create a new spreadsheet)
}

/**
  @return {void}
*/
SsFile.prototype.remove = function(){
  // ... (implementation to remove a spreadsheet)
}
// ... (other methods like find, isRegistered, register, rename)
```

### `SsFolder.js`
Manages Google Drive folders specifically for organizing spreadsheets. It uses the Drive API (v2) to find, create, remove folders, and add spreadsheet files to them.

```javascript
/**
  @param {String} ssNameStem
  @param {String} dateString
  @return {SsFolder}
*/
function SsFolder(ssNameStem, dateString) {
  // ... (constructor logic)
}

/**
  @return {void}
*/
SsFolder.prototype.find =  function(){
  // ... (implementation to find a folder)
}

/**
  @return {void}
*/
SsFolder.prototype.create = function() {
  // ... (implementation to create a folder)
}

/**
  @param {SsFile} ssFile
  @return {void}
*/
SsFolder.prototype.add = function(ssFile) {
  // ... (implementation to add a file to a folder)
}
```

### `Up.js`
A utility for managing user properties, which are key-value pairs stored by the script for the current user. This is used to store and retrieve spreadsheet IDs.

```javascript
/**
  `Up` represents user properties.
  @constructor
*/
function Up() {
  // ... (constructor logic)
}

/**
  @param {String} key
  @return {String}
*/
Up.prototype.get = function(key){
  // ... (implementation to get a property)
}

/**
  @param {String} key
  @param {String} value
  @return {void}
*/
Up.prototype.put = function(key, value){
  // ... (implementation to set a property)
}
```

### `base64CharToInt.js` and `base64IntToChar.js`
These are helper functions for converting between base64 characters and their corresponding integer values (0-63).

```javascript
function base64CharToInt(c){
  Assert.stringLength(c, 1);
  var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".indexOf(c);
  Assert.numberInRange(i, 0, 63);
  return i;
}//base64CharToInt

function base64IntToChar(i){
  Assert.numberInRange(i, 0, 63);
  var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".slice(i,i+1);
  Assert.stringLength(c, 1);
  return c;
}//base64IntToChar
```

### `doGet.js`
This is the entry point for the web application. It serves the `index.html` file.

```javascript
function doGet() {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Datastore");
  return htmlOutput;
}//doGet
```

### `writeToSheet.js`
This script reads journal entries from a dedicated "journal" sheet, processes them (potentially splitting a digest string), and then writes the processed data to other specified sheets based on spreadsheet and sheet numbers embedded in the journal entries.

```javascript
function writeToSheet(digestSeparator) {
  // ... (implementation)
}
```

## Web Interface

The project includes a web interface defined in `index.html`. This interface displays the active user's email address and provides clickable links to 64 individual spreadsheets (numbered 0-63) and a dedicated "Journal" spreadsheet (numbered 64). The interface uses `mini.css` for a minimal design.

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <link rel="stylesheet" 
      href="https://cdnjs.cloudflare.com/ajax/libs/mini.css/3.0.1/mini-default.min.css">
    <style>
      /* ... (styling) ... */
    </style>
  </head>
  <body>
    <label>Active User
    <input readonly="1" value="<?=Session.getActiveUser().getEmail()?>">
    </label>
    <div><span>Spreadsheets</span>
    <? for(var ssNumber=0; ssNumber<64; ++ssNumber) {?>
    <a role="button" target="_blank" 
          href="https://docs.google.com/spreadsheets/d/<?=PropertiesService.getUserProperties().getProperty("ss"+ ssNumber);?>/edit">
          <?=ssNumber;?>
    </a>
    <? }//for?>
    <a role="button" target="ss<?=ssNumber?>" 
          href="https://docs.google.com/spreadsheets/d/<?=PropertiesService.getUserProperties().getProperty("ss64");?>/edit">
          64 (Journal)
    </a></div>
  </body>
</html>
```

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Web App Access:** `ANYONE` - The web application can be accessed by anyone.
*   **Web App Execution:** `USER_ACCESSING` - The script runs under the identity of the user accessing the web app.
*   **Advanced Google Services:**
    *   `Drive API (v2)`: Enabled, allowing the script to interact with Google Drive for managing spreadsheets and folders.
*   **Libraries:**
    *   `Str` (ID: `13sX98YHiFh-5eBWTAJtWR52SbdnCxaHzX3GXgt8zUU07ELz9ArLhlJvD`, Version: `10`)
    *   `Is` (ID: `1ovfzNY0BUREXY5Ky0eX1HZaz3VxEoq3wyjwZuYg4L6m8H83Rjb8Q1yhw`, Version: `10`)
    *   `Assert` (ID: `10lJqYuurUoouFS-aPsPs4HU2s--Xkm5vTu7QVZH4HwcAZgtCDU6ZltQN`, Version: `27`)

## Configuration

The project uses `PropertiesService.getUserProperties()` (managed by the `Up.js` module) to store configuration data, specifically the IDs of the Google Spreadsheets it interacts with. Users would need to configure these properties, typically by setting keys like "ss0", "ss1", ..., "ss64" with the corresponding Spreadsheet IDs.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbz2nrQV1jYJdGyVpBwGC28ab1AK-cnSvJaoEVewZ6Ia`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbz2nrQV1jYJdGyVpBwGC28ab1AK-cnSvJaoEVewZ6Ia/exec`

*   **Deployment ID:** `AKfycbyQvhgOh_W_5Jxedba6cFc9cHdlpVjN57NCogO5RZYNoTXNiCvL`
    *   **Target Version:** `18`
    *   **Description:** `web app meta-version`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbyQvhgOh_W_5Jxedba6cFc9cHdlpVjN57NCogO5RZYNoTXNiCvL/exec`
