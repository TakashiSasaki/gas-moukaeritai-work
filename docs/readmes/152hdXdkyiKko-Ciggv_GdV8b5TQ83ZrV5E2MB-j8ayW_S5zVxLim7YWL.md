# Snippets For Gmail

## Overview

This Google Apps Script project, "Snippets For Gmail," is designed to interact with Gmail. It uses the Gmail API (Advanced Service) to retrieve information about labels and threads.

## Functionality

The script provides functions to get a list of all labels in a user's Gmail account and to retrieve threads associated with a specific label.

### Core Features

- **`getLabels()`:** This function retrieves a list of all labels for the active user. It returns a 2D array containing details about each label, such as its ID, name, and the number of messages and threads.
- **`getThreadsByLabelId(labelId, nMaxThreads)`:** This function retrieves a list of threads that have a specific label. It takes a `labelId` (e.g., "INBOX") and an optional `nMaxThreads` to limit the number of results. It returns a 2D array with the thread ID and snippet for each thread.

### Code Examples

#### `getLabels.js`
```javascript
function getLabels() {
  var labels = Gmail.Users.Labels.list(Session.getActiveUser().getEmail()).labels;
  var rows = [[
    "id", "labelListVisibility", "messageListVisibility", "messageTotal", "messageUnread", 
    "name", "threadsTotal", "threadsUnread", "type", "internalDate", "snippet"
  ]];
  for(var i=0; i<labels.length; ++i){
    var label = labels[i];
    row = [];
    row.push(label.id);
    row.push(label.labelListVisibility);
    row.push(label.messageListVisibility);
    row.push(label.messagesTotal);
    row.push(label.messagesUnread);
    row.push(label.name);
    row.push(label.threadsTotal);
    row.push(label.threadsUnread);
    row.push(label.type);
    rows.push(row);
  }//for
  rows.frozenRows=1;
  rows.frozenColumns=0;
  return rows;
}//getLabels
```

#### `getThreadsByLabelId.js`
```javascript
function getThreadsByLabelId(labelId, nMaxThreads){
  if(labelId === undefined) labelId = "INBOX";
  if(nMaxThreads === undefined) nMaxThreads = 10;
  var email = Session.getActiveUser().getEmail();
  var threads = Gmail.Users.Threads.list(email, {labelIds:[labelId], maxResults:nMaxThreads}).threads;
  var result = threads.reduce(function(rows, thread){
    var row = [];
    row.push(thread.id);
    row.push(thread.snippet);
    rows.push(row);
    return rows;
  }, [["threadId", "snippet"]]);
  return result;
}//getThreadsByLabelId
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

- **ID:** `AKfycbx_kF6GsfXuhIBS9M-Psc2hL-a07Pn-ra4Z_A2jsRu4`
- **URL:** `https://script.google.com/macros/s/AKfycbx_kF6GsfXuhIBS9M-Psc2hL-a07Pn-ra4Z_A2jsRu4/exec`
