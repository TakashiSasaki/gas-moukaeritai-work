# Project: Show Google Tasks

This Google Apps Script project is designed to interact with the Google Tasks API to retrieve a user's task lists.

## Overview

The primary function of this script is to list all of the user's Google Task lists, logging their titles and IDs. The project's `README.md` states an intention to display these tasks in a web app, but based on the current files, it functions as a standalone script that logs output to the Apps Script editor.

## Functionality

The core logic is contained in the `listTaskLists` function within `Code.js`.

-   **Google Tasks API**: The script utilizes the Google Tasks API, which is enabled as an advanced service in the project.
-   **Listing Task Lists**: It calls `Tasks.Tasklists.list()` to fetch all task lists associated with the user's account.
-   **Logging**: The script then iterates through the retrieved lists and logs the title and ID of each one to the Apps Script logger.

```javascript
function listTaskLists() {
  try {
    const taskLists = Tasks.Tasklists.list();
    if (!taskLists.items || taskLists.items.length === 0) {
      Logger.log('No task lists found.');
      return;
    }
    Logger.log('Task lists:');
    for (let i = 0; i < taskLists.items.length; i++) {
      const taskList = taskLists.items[i];
      Logger.log(`- ${taskList.title} (ID: ${taskList.id})`);
    }
  } catch (e) {
    Logger.log('Error listing task lists: ' + e.toString());
  }
}
```

## Web Interface

Although the `README.md` file mentions displaying tasks in a web app, the project currently does not contain any `.html` files or a `webapp` configuration in its `appsscript.json`. Therefore, it does not function as a web application.

## Permissions

As a standalone script, it requires user authorization to access their Google Tasks data. When run for the first time, it will prompt the user for permission to "View your tasks".

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Advanced Services**: The Google Tasks API (v1) is enabled as an advanced service with the identifier `Tasks`.

## Deployments

The project has the following deployment:

-   **Deployment ID**: `AKfycbxRtaUHkV8L2S7TsZ0dm97mojhzLcAtmI5zknc1UX8`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbxRtaUHkV8L2S7TsZ0dm97mojhzLcAtmI5zknc1UX8/exec)
        (Note: As this project is not a web app, this URL will not lead to a user interface.)