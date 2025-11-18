# GAS Project Finder

## Overview

This Google Apps Script project, "GAS Project Finder," is a web app that searches for and displays a list of Google Apps Script projects from the user's Google Drive. It provides a simple interface to view all your GAS projects, sorted by their last update time.

## Functionality

The web app has a main page that displays a table of script files. It also has separate pages for a README and for testing the API.

### Core Features

- **`doGet(e)`:** The main entry point for the web app. It routes the user to different pages based on the URL path (`/json`, `/readme`, `/test`) or serves the main `index.html` page.
- **`searchScriptFiles()`:** This function searches the user's Google Drive for files with the MIME type `application/vnd.google-apps.script`. The results are cached for 5 minutes to improve performance.
- **`getJsonResponse()`:** Provides a JSON endpoint that returns the list of script files.
- **Web Interface (`index.html`):** The main page provides a button to load or refresh the list of projects. The projects are displayed in a table with their name, last updated time, and ID.

### Code Examples

#### `doGet.js`
```javascript
function doGet(e) {
  const path = (e.pathInfo || '').toLowerCase();
  const params = e.parameter || {};

  // ... (routing logic)

  if (path === 'json' || hasParam('json')) {
    return getJsonResponse();
  } else {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('Google Apps Script プロジェクト検索')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}
```

#### `Code.js`
```javascript
function searchScriptFiles() {
  const cache = CacheService.getUserCache();
  const cacheKey = 'v1_user_script_files';

  const cachedData = cache.get(cacheKey);
  if (cachedData != null) {
    return JSON.parse(cachedData);
  }

  const query = "mimeType = 'application/vnd.google-apps.script' and trashed = false";
  const files = DriveApp.searchFiles(query);
  const fileList = [];
  
  while (files.hasNext()) {
    const file = files.next();
    fileList.push({
      name: file.getName(),
      id: file.getId(),
      url: file.getUrl(),
      lastUpdated: file.getLastUpdated().toISOString()
    });
  }
  
  fileList.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  
  const dataToCache = JSON.stringify(fileList);
  cache.put(cacheKey, dataToCache, 300);
  
  return fileList;
}
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone, including anonymous users, and executes as the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbxTdjPOI6Jr_AWz3lfAxhwokuP3r3HvtYO-vgWMc_-w`
  - **URL:** `https://script.google.com/macros/s/AKfycbxTdjPOI6Jr_AWz3lfAxhwokuP3r3HvtYO-vgWMc_-w/exec`
- **ID (Version 9):** `AKfycbz0a4RTpHE5Bxn3AeHWEAD7QHreptLqpa3HLxatARciZwYLJk8jd494G3Dd5_PF3WsJFg`
  - **URL:** `https://script.google.com/macros/s/AKfycbz0a4RTpHE5Bxn3AeHWEAD7QHreptLqpa3HLxatARciZwYLJk8jd494G3Dd5_PF3WsJFg/exec`
