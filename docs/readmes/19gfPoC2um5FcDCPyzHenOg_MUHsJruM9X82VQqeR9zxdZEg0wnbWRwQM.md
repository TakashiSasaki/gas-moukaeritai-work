# Gmail Search Sheets

## Overview

This Google Apps Script project, "Gmail Search Sheets," is a Google Sheets add-on that turns your spreadsheet into a dynamic dashboard for your Gmail. Each sheet's name is used as a Gmail search query, and the add-on populates the sheet with the results of that search.

## Functionality

The add-on adds a "List Sheets" menu item to the Google Sheets UI. When clicked, it opens a sidebar that allows the user to interact with the add-on.

### Core Features

- **`onOpen(e)`:** Creates the add-on menu.
- **`listSheets()`:** Opens the main sidebar for the add-on.
- **`reloadSheet(sheetName)`:** This is the core function. It takes a sheet name, uses it as a query for the Gmail API, and populates the sheet with the results. It retrieves the date and subject of the last message in each thread and puts them in the sheet. The thread ID and snippet are added as notes to the cells.
- **`getThreadById(threadId)`:** Retrieves a specific thread from the Gmail API. It uses caching to avoid re-fetching the same thread multiple times. It also trims down the thread object to only include essential information, reducing the amount of data stored in the cache.

### Code Examples

#### `Code.js`
```javascript
function reloadSheet(sheetName){
  if(sheetName === undefined) sheetName = "is:inbox is:important";
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var threads = Gmail.Users.Threads.list(Session.getActiveUser().getEmail(), {q: sheetName, maxResults:1000});
  var values = [];
  var notes = [];
  for(var i=0; i<threads.threads.length; ++i){
    var threadId = threads.threads[i].id;
    var thread = getThreadById(threadId);
    var messages = thread.messages;
    var lastMessage = messages[messages.length-1];
    var subject = "";
    for(var j=0; j<lastMessage.payload.headers.length; ++j){
      var header = lastMessage.payload.headers[j];
      if(header.name === "Subject") {
        subject = header.value;
      }
    }
    var snippet = lastMessage.snippet;
    var internalDate = lastMessage.internalDate;
    values.push([internalDate, subject]);
    notes.push([threadId, snippet]); 
  }
  sheet.getRange(1,1,values.length,2).setValues(values).setNotes(notes);
}
```

#### `getThreadById.js`
```javascript
function getThreadById(threadId){
  var json = CacheService.getUserCache().get(threadId);
  if(typeof json === "string") {
    var object = JSON.parse(json);
    return object;
  } else {
    var thread = Gmail.Users.Threads.get(Session.getActiveUser().getEmail(), threadId);
    // ... (code to trim the thread object)
    var json = JSON.stringify(thread);
    try {
      CacheService.getUserCache().put(threadId, json, 21600);
    } catch(e){
      CacheService.getUserCache().remove(threadId);
    }
    return thread;
  }
}
```

## Permissions

The `appsscript.json` file indicates that the script uses the Gmail API.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": [{
      "userSymbol": "Gmail",
      "serviceId": "gmail",
      "version": "v1"
    }]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has one deployment:

- **ID:** `AKfycbyc2xL-4FaC2RXd5J_jM2bJuEQuPdUgOVifnVjrMWk8`
- **URL:** `https://script.google.com/macros/s/AKfycbyc2xL-4FaC2RXd5J_jM2bJuEQuPdUgOVifnVjrMWk8/exec`
