# Layout Library

## Overview

This Google Apps Script project, "Layout Library," is a library for creating web apps with a tabbed user interface. It uses Bootstrap for styling and provides a set of functions to easily add different types of content as tabs.

## Functionality

The library is designed to be used as a templating system for building more complex web apps. It provides a main `tabs.html` file that renders the tabbed layout, and a set of server-side functions to add content to the tabs.

### Core Features

- **`doGet()`:** A sample function that demonstrates how to use the library. It adds two sample tabs, a CSS header, a Google Doc, and a script document to the layout.
- **`addHtmlOutput(html_output, title)`:** Adds a raw `HtmlOutput` object as a new tab.
- **`addIframeTab(url, title)`:** Adds a new tab that displays the content of a given URL in an iframe.
- **`addScriptDocument(script_url, script_id, title)`:** Adds a tab that displays information about another Google Apps Script project.
- **`addGoogleDocument(document_id, title)`:** Adds a tab that embeds a Google Document.
- **`addGoogleSpreadsheet(spreadsheet_id, title)`:** Adds a tab that embeds a Google Spreadsheet.
- **`getHtmlOutput(title)`:** Renders the final `HtmlOutput` object with the tabbed layout.

### Code Examples

#### `doGet.js`
```javascript
function doGet(){
  addHtmlOutput(HtmlService.createHtmlOutputFromFile("sample_tab1").setTitle("title_tab1"));
  addHtmlOutput(HtmlService.createHtmlOutputFromFile("sample_tab2").setTitle("title_tab2"));
  addHeader(HtmlService.createHtmlOutputFromFile("sample_css"));
  addGoogleDocument("18s2UMxOJDh2hVZ2xxcPvkPCqFd1RnPcJIVCrrndSc04", "tesuto");
  addScriptDocument(ScriptApp.getService().getUrl(), ScriptApp.getScriptId(), "Html Template Library");
  var output = getHtmlOutput("Html Template Library");
  return output;
}
```

#### `tabs.html`
```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <!-- ... -->
  </head>
  <body>
    <ul class="nav nav-tabs">
      <? for(var i=0; i<htmlOutputs.length; ++i) { ?>
      <li class="nav-item">
        <a class="nav-link bg-primary" data-toggle="tab" href="#tab<?=i?>"><?=htmlOutputs[i].getTitle()?></a>
      </li>      
      <? } ?>
    </ul>
    <div class="tab-content">
      <? for(var i=0; i<htmlOutputs.length; ++i) { ?>
        <div class="tab-pane" id="tab<?=i?>">
        <?!= htmlOutputs[i].getContent()?>
        </div>
      <? } ?>
    </div>
    <!-- ... -->
  </body>
</html>
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone and executes as the user accessing the app.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has one deployment:

- **ID:** `AKfycbyJX3LCrJTONsTB80ZBuwCA32YYQJSzRC7mH6ygL1A`
- **URL:** `https://script.google.com/macros/s/AKfycbyJX3LCrJTONsTB80ZBuwCA32YYQJSzRC7mH6ygL1A/exec`
