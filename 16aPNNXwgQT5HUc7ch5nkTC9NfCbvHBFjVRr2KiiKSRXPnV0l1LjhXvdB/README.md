# Form Addon

## Overview

This Google Apps Script project is an add-on for Google Forms. It provides a set of tools to manage and interact with a form, accessible through an add-on menu in the Google Forms UI.

## Functionality

The add-on adds a menu to the Google Forms editor with several functions to inspect and modify the form.

### Core Features

- **`onOpen()`:** Creates the add-on menu in the Google Forms UI. The menu includes items for most of the script's functions.
- **`addText(form)`:** Adds a new text item to the form.
- **`getResponses(form)`:** Retrieves and logs the responses from the form.
- **Form Inspection:** Includes functions to show the number of items, the published URL, and the response URL.
- **Form Modification:** Includes functions to delete page breaks and non-text questions from the form.

### Code Examples

#### `onOpen.js`
```javascript
function onOpen() {
  FormApp.getUi().createAddonMenu()
  .addItem("onOpen", "onOpen")
  .addItem("showNumberOfItems", "showNumberOfItems")
  .addItem("showPublishedUrl", "showPublishedUrl")
  .addItem("showResponseUrl", "showResponseUrl")
  .addItem("showEntries", "showEntries")
  .addItem("postFirstEntry", "postFirstEntry")
  .addItem("deletePageBreaks", "deletePageBreaks")
  .addItem("deleteNonTextQuestions", "deleteNonTextQuestions")
  .addToUi();
}
```

#### `Code.js`
```javascript
function addText(form){
  if(form === undefined) form = getForm_();
  var textItem = form.addTextItem();
  var textItemId = textItem.getId();
  Logger.log(textItemId);
}

function getResponses(form){
  if(form === undefined) form = FormApp.getActiveForm();
  if(form === null) form = getForm_();
  var responses = form.getResponses();
  for(var i in responses) {
    var response = responses[i];
    var itemResponses = response.getItemResponses();
    for(var j in itemResponses) {
      var itemResponse = itemResponses[j];
      var responseText = itemResponse.getResponse();
      Logger.log(responseText);
      
    }
  }
}
```

## Permissions

The `appsscript.json` file does not specify any explicit OAuth scopes or library dependencies. The script's functionality requires access to the Google Form it is attached to.

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

- **ID:** `AKfycbxlhD7QuP3MrBhUFpOyIB4RImfxZJQgAazEjeeprhaI`
- **URL:** `https://script.google.com/macros/s/AKfycbxlhD7QuP3MrBhUFpOyIB4RImfxZJQgAazEjeeprhaI/exec`
