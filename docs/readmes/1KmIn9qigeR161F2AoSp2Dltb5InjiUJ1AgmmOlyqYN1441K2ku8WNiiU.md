# Snippets For DriveApp

## Overview

The "Snippets For DriveApp" project is a Google Apps Script web application designed to facilitate the searching, filtering, and viewing of XML files stored in Google Drive. It presents a user-friendly interface with multiple tabs, allowing users to search for files by name, display the results in an interactive table powered by Google Charts, and view basic information about the script itself. A key feature is its ability to parse selected XML files and present their content in a tabular format.

## Functionality

The project provides a web-based interface for interacting with Google Drive files, particularly XML documents.

### Core Features

-   **`doGet()`:** This function serves as the web application's entry point, rendering the main `index.html` template with a responsive viewport and setting the page title.
-   **File Search and Filtering (`filter.html`):**
    -   Users can input a part of a file name to search for XML files in their Google Drive.
    -   Search results (file name, ID, last updated date, and parent folders) are displayed in a Google Charts `Table` visualization.
    -   `getFileIdsByMatchingTitle(searchString, limit)`: A server-side function that performs the Drive search and returns matching file metadata.
-   **XML File Parsing (`getXmlFileAsTable.js`):**
    -   `getXmlFileAsTable(fileId)`: Takes a Google Drive file ID, retrieves the file as XML, parses it using `XmlService`, and converts its content into a 2D array (table format).
-   **Script Information Display (`info.html`):**
    -   Displays the email of the active user, the script ID, and the service URL of the deployed web app.
-   **Tabbed User Interface (`index.html`):** The main page uses a CSS-driven tabbed layout to organize the "filter" and "info" sections.

### Code Examples

#### `doGet.js`

```javascript
function doGet() {
  return HtmlService.createTemplateFromFile("index").evaluate()
  .addMetaTag("viewport", "width=device-width, initial-scale=1")
  .setTitle("Snippets For DriveApp");
}
```

#### `getMatchingFiles.js`

```javascript
function getFileIdsByMatchingTitle(searchString, limit){
  if(searchString === undefined){
    searchString = "test";
  }
  if(limit === undefined) {
    limit = 10;
  }
  var files = DriveApp.searchFiles('title contains "' + searchString + '"');
  var values = [];
  while(files.hasNext()){
    var file = files.next();
    var parents = file.getParents();
    var parentNames = [];
    while(parents.hasNext()){
      var parent = parents.next();
      parentNames.push(parent.getName());
    }
    values.push([file.getName(), file.getId(), file.getLastUpdated().toString(), parentNames]);
    if(values.length >= limit) break;
  }
  return values;
}
```

#### `getXmlFileAsTable.js`

```javascript
function getXmlFileAsTable(fileId) {
  var file = DriveApp.getFileById(fileId);
  var blob = file.getAs("application/xml");
  var xml = blob.getDataAsString();
  var document = XmlService.parse(xml);
  var contents = document.getAllContent();
  var rows = [];
  for(var i=0; i<contents.length; ++i){
    var content = contents[i];
    DataManipulation.expandXmlContent(content, rows); // Assumes DataManipulation library is available
  }
  var nMaxColumns = 0;
  for(var i=0; i<rows.length; ++i){
    nMaxColumns = Math.max(nMaxColumns, rows[i].length);
  }
  for(var i=0; i<rows.length; ++i){
    for(var j=rows[i].length; j<nMaxColumns; ++j){
      rows[i].push(null);
    }//for j
  }//for i
  return rows;
}
```

## Permissions

The `appsscript.json` file indicates that the web application is configured to execute as the user accessing it and is accessible only by that user. It does not specify any explicit library dependencies.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "webapp": {
    "access": "MYSELF",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbxBlRdNyvugILCRzDttaRYjfg4rCP9_4I0XcBtIReU`
    -   **URL:** `https://script.google.com/macros/s/AKfycbxBlRdNyvugILCRzDttaRYjfg4rCP9_4I0XcBtIReU/exec`
-   **ID (Version 1 - web app meta-version):** `AKfycbzRpCLwcID55XEjOryn-n5rEJNjHbzZnOvCAUaE7vy0rToO66A`
    -   **URL:** `https://script.google.com/macros/s/AKfycbzRpCLwcID55XEjOryn-n5rEJNjHbzZnOvCAUaE7vy0rToO66A/exec`
