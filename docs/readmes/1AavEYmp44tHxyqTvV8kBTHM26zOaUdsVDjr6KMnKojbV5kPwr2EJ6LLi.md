# Google日本語入力ユーザー辞書ユーティリティ (Google Japanese Input User Dictionary Utility)

## Overview

This Google Apps Script project is a Google Sheets add-on designed to help manage user dictionaries for Google's Japanese Input method. It uses a spreadsheet as an interface to organize and update dictionary files, which can be in `.zip` or `.txt` format.

## Functionality

The add-on provides a sidebar and a menu in the Google Sheets UI to manage the user dictionaries.

### Core Features

- **`onOpen(e)`:** This function runs when the spreadsheet is opened. It creates an add-on menu with several options and opens a sidebar. It also stores the ID of the active spreadsheet in `UserProperties`.
- **`getUserDictionarySheetNames()`:** This function retrieves the names of all sheets in the spreadsheet that appear to be user dictionary files (i.e., their names end in `.zip` or `.txt`, or look like an email address).
- **Dictionary Management:** The add-on includes functions to update zip files, update the contents of zipped files, and update the dictionary itself. The implementations of these functions are not shown in the provided files, but the menu items suggest this functionality.
- **Drive Integration:** The `appsscript.json` file indicates that the script uses the Google Drive API, likely to read and write the dictionary files.

### Code Examples

#### `onOpen.js`
```javascript
function onOpen(e){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if(spreadsheet) {
    var spreadsheet_id = spreadsheet.getId();
    PropertiesService.getUserProperties().setProperty("spreadsheet_id", spreadsheet_id);
  }
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createAddonMenu();
  menu.addItem("onOpen", "onOpen");
  menu.addItem("updateZipFiles", "updateZipFiles");
  menu.addItem("updateZippedContents", "updateZippedContents");
  menu.addItem("updateDictionary", "updateDictionary");
  menu.addItem("getSheetId", "getSheetId");
  menu.addToUi();
  var html_template = HtmlService.createTemplateFromFile("sidebar");
  var html_output = html_template.evaluate();
  html_output.setTitle("Google日本語入力ユーザー辞書ユーティリティ");
  ui.showSidebar(html_output);
}
```

#### `getUserDictionarySheetNames.js`
```javascript
function getUserDictionarySheetNames(){
  var spreadsheet_id = PropertiesService.getUserProperties().getProperty("spreadsheet_id");
  var spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
  var sheets = spreadsheet.getSheets();
  var sheet_names = [];
  for(var i=0; i<sheets.length; ++i){
    var sheet_name = sheets[i].getName();
    if(sheet_name.match("\.zip$") || sheet_name.match("\.txt$") || sheet_name.match("^.+@.+$")) {
      sheet_names.push(sheet_name);
    }
  }
  return sheet_names;
}
```

## Permissions

The `appsscript.json` file indicates that the script uses the Google Drive API. The web app access is restricted to the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": [{
      "userSymbol": "Drive",
      "serviceId": "drive",
      "version": "v2"
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

- **ID (HEAD):** `AKfycbyzDwK7XYgRjraGu_ra_LOHp2s2utKiGFDFPfNeLH4`
  - **URL:** `https://script.google.com/macros/s/AKfycbyzDwK7XYgRjraGu_ra_LOHp2s2utKiGFDFPfNeLH4/exec`
- **ID (Version 2):** `AKfycbzuiRVRP_bcJwdeX1dGskF445PoK-7KToeG2EOpC4e2jlCLr24`
  - **URL:** `https://script.google.com/macros/s/AKfycbzuiRVRP_bcJwdeX1dGskF445PoK-7KToeG2EOpC4e2jlCLr24/exec`
