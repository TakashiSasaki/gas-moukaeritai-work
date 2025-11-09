# ContentService test

## Overview

The "ContentService test" project is a straightforward Google Apps Script web application primarily intended for testing the `ContentService`. When accessed as a web app, it returns a simple plain text response. Additionally, the project demonstrates the enablement of the Drive Advanced Service, although its direct use in the main web app function is minimal.

## Functionality

The project's core functionality is to serve a basic text response via a web app and to illustrate the setup for using Google Drive services.

### Core Features

-   **`doGet()`:** This function serves as the web application's entry point. It creates a `TextOutput` using `ContentService`, sets its content to "ContentService test", and specifies the MIME type as plain text.
-   **`dummy()`:** A placeholder function that includes a call to `DriveApp.getFileById("a")`. This function itself doesn't perform a meaningful operation but serves to enable the Drive Advanced Service in the `appsscript.json` manifest.

### Code Examples

#### `Code.js`

```javascript
function doGet() {
  const textOutput = ContentService.createTextOutput();
  textOutput.setContent("ContentService test");
  textOutput.setMimeType(ContentService.MimeType.TEXT)
  return textOutput;
}

function dummy(){
  DriveApp.getFileById("a");
}
```

## Permissions

The `appsscript.json` file indicates that the Drive Advanced Service (v2) is enabled. The web application is configured to execute as the user who deployed it and is accessible by anyone anonymously. The Execution API is also set to be accessible by anyone.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v2",
        "serviceId": "drive"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "executionApi": {
    "access": "ANYONE"
  }
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbz2gjv0c7aInZKHUFdXNZZCYQLRG-AVuCCI0MgMsTwf`
    -   **URL:** `https://script.google.com/macros/s/AKfycbz2gjv0c7aInZKHUFdXNZZCYQLRG-AVuCCI0MgMsTwf/exec`
-   **ID (Version 3):** `AKfycbxFGtAf1bGMiFt4jygazAIDQxUnaujiW0YFuIz-Ym4-hu11BT7AZJYOrZNSipQh4ugC2A`
    -   **URL:** `https://script.google.com/macros/s/AKfycbxFGtAf1bGMiFt4jygazAIDQxUnaujiW0YFuIz-Ym4-hu11BT7AZJYOrZNSipQh4ugC2A/exec`
