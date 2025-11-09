# Google Keep to Google Tasks

## Overview

This Google Apps Script project is a Google Docs add-on designed to extract tasks from a document and interact with Google Tasks. It provides a sidebar to manage these tasks.

## Functionality

The script adds a menu to the Google Docs UI when a document is opened. This menu allows users to "Extract Checkboxes," view an "About" page, and "Debug."

### Core Features

- **Extract Checkboxes:** The `extractCheckboxes` function reads the content of the active Google Doc. It identifies list items and separates them into checked (strikethrough) and unchecked tasks. These tasks are then displayed in a sidebar. The extracted tasks and the document title are stored in the cache.
- **Google Tasks Integration:** The script uses the Google Tasks API (Advanced Service) to interact with Google Tasks. The `getExistingTaskTitles_` function retrieves task lists and tasks.
- **Caching:** The script uses `CacheService` to cache task lists, improving performance by reducing the number of API calls.

### Code (`Code.js`, `Checkboxes.js`, `ExistingTaskTitles.js`)

#### `Code.js`
```javascript
function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem("Extract Checkboxes", "extractCheckboxes")
      .addItem('About', 'about')
      .addItem('Debug', 'extract')
      .addToUi();
}//onOpen

// ... other functions for showing sidebars and debugging
```

#### `Checkboxes.js`
```javascript
function extractCheckboxes(){
  var template = HtmlService.createTemplateFromFile("tasks");
  template.uncheckedTasks = [];
  template.checkedTasks = [];
  template.title = DocumentApp.getActiveDocument().getName();
  var body = DocumentApp.getActiveDocument().getBody();
  for(var i=0; i<body.getNumChildren(); ++i){
    if(body.getChild(i).getType() === DocumentApp.ElementType.LIST_ITEM){
      var listItem = body.getChild(i).asListItem();
      var text = listItem.getChild(0).asText();
      if(text.isStrikethrough() === true){
        template.checkedTasks.push(text.getText());
      } else {
        template.uncheckedTasks.push(text.getText());
      }//if
    }//if
  }//for
  CacheService.getDocumentCache().put("title", template.title);
  CacheService.getDocumentCache().put("checkedTasks", JSON.stringify(template.checkedTasks));
  CacheService.getDocumentCache().put("uncheckedTasks", JSON.stringify(template.uncheckedTasks));
  DocumentApp.getUi().showSidebar(template.evaluate().setTitle("Extracted tasks"));
}//extractCheckboxes
```

#### `ExistingTaskTitles.js`
```javascript
function getExistingTaskTitles_(taskListTitle){
  var taskLists = Tasks.Tasklists.list();
  var taskList;
  for(var i=0; i<taskLists.items.length; ++i){
    if(taskLists.items[i].title === taskListTitle){
      taskList = taskLists.items[i];
    }//if
  }//for
  if (taskList === undefined) return [];
  var tasks = Tasks.Tasks.list(taskList.id);
  if(tasks === null || tasks === undefined) {
    return [];
  }//if
  var existingTaskTitles = [];
  while(true){
    for(var i=0; i<tasks.items.length; ++i){
      existingTaskTitles.push(tasks.items[i].title);
    }
    if(typeof tasks.nextPageToken === "string") {
      tasks = Tasks.Tasks.list(taskList.id, {pageToken: tasks.nextPageToken});
    } else {
      break;
    }
  }//files
  return existingTaskTitles;
}//getExistingTaskTitles
```

## Permissions

The `appsscript.json` file indicates that the script uses the Google Tasks API.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": [{
      "userSymbol": "Tasks",
      "serviceId": "tasks",
      "version": "v1"
    }]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has one deployment:

- **ID:** `AKfycbzTz1hem8XAYAd6iemrfnEp1YvubtyEs70KiBaMCp9q`
- **URL:** `https://script.google.com/macros/s/AKfycbzTz1hem8XAYAd6iemrfnEp1YvubtyEs70KiBaMCp9q/exec`