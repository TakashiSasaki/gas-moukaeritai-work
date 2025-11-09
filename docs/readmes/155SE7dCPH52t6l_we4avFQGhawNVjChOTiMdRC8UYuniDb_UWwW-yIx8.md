# Markdown in Sheet addon

## Overview

This Google Apps Script project is a Google Sheets add-on that renders markdown text from a spreadsheet. It uses the `marked.js` library to convert markdown into HTML and displays the result in a sidebar.

## Functionality

The add-on adds a menu item to the Google Sheets UI that allows users to show a sidebar. The sidebar then displays the rendered markdown from the active sheet.

### Core Features

- **`onOpen(e)`:** An `onOpen` simple trigger creates an add-on menu with an item to "showSidebar".
- **`showSidebar()`:** This function (in a separate file, not shown) would display a sidebar, likely with the content from `index.html`.
- **`render(sheet)`:** This function reads all the data from a given sheet, joins it into a single string, and then uses the `marked()` function (from `markedjs.js`) to convert the markdown text to HTML. It returns a JSON string containing the HTML, the current date, and the sheet name.
- **`doGet(e)`:** The `doGet` function serves the main `index.html` file for the sidebar, and also has a test page.

### Code Examples

#### `Code.js`
```javascript
function onInstall(e){
  onOpen(e);
}

function onOpen(e){
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createAddonMenu();
  menu.addItem("showSidebar", "showSidebar");
  menu.addToUi();
}
```

#### `render.js`
```javascript
function render(sheet) {
  if(sheet === undefined) {
     sheet = SpreadsheetApp.getActiveSheet();
  }//if
  var rows = sheet.getDataRange().getValues();
  var textLines = [];
  for(var i=0; i<rows.length; ++i){
    textLines.push(rows[i].join("\n"));
  }//for
  var text = textLines.join("\n");
  var html = marked(text);
  //html = "test";
  var date = new Date();
  var sheetName = sheet.getName();
  return JSON.stringify({
    html: html, 
    date: date,
    sheetName: sheetName});
}//reload
```

## Permissions

The `appsscript.json` file specifies that the web app access is restricted to the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
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

- **ID (HEAD):** `AKfycbx7jRVuS8qDFwALc2pfuxI8ZzIMjWAyEZU1WWDwWo3O`
  - **URL:** `https://script.google.com/macros/s/AKfycbx7jRVuS8qDFwALc2pfuxI8ZzIMjWAyEZU1WWDwWo3O/exec`
- **ID (Version 1):** `AKfycbxVjczfHJ6xR7moBtgeMAmkQ8CI1LmvwpR7489iUlzB9JlscpPO`
  - **URL:** `https://script.google.com/macros/s/AKfycbxVjczfHJ6xR7moBtgeMAmkQ8CI1LmvwpR7489iUlzB9JlscpPO/exec`
