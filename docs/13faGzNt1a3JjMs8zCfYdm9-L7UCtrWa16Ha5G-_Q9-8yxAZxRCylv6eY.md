# Google Driveの一覧を取得するアドオン

## Overview

This Google Apps Script project is a Google Sheets add-on that provides a way to list files from Google Drive. It opens a sidebar in the active spreadsheet.

## Functionality

The script uses `onInstall` and `onOpen` simple triggers. When the add-on is installed or the spreadsheet is opened, it creates a menu item named "open" under the "Add-ons" menu and displays a sidebar. The sidebar's content is defined in the `index.html` file.

### Code (`コード.js`)

```javascript
function onInstall(e) {
  Logger.log("onInstall");
  onOpen(e);
}

function onOpen(e){
  Logger.log("onOpen");
  ScriptCatalog.register(e);
  var ui = SpreadsheetApp.getUi();
  Logger.log(ui);
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  ui.createAddonMenu().addItem("open", "onOpen").addToUi();
  ui.showSidebar(html_output);
}

function aaa(e){
  alert(e);
}
```

## Permissions

The `appsscript.json` file does not specify any explicit OAuth scopes, so the permissions will be inferred by Google Apps Script based on the code's usage. The code uses `SpreadsheetApp.getUi()` and `HtmlService`, which require access to the spreadsheet and the ability to display a sidebar.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "ScriptCatalog",
      "libraryId": "1XxEVVxW1MQEZCQTg1RTDQW8KDMtUURz22SQmBfaS3xLr5OZ__MSnwlur",
      "version": "14"
    }]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has one deployment:

- **ID:** `AKfycbwIx-zFrVXeK9sDpnYijuiszhppkONeADQ3oCcuUuQ`
- **URL:** `https://script.google.com/macros/s/AKfycbwIx-zFrVXeK9sDpnYijuiszhppkONeADQ3oCcuUuQ/exec`
