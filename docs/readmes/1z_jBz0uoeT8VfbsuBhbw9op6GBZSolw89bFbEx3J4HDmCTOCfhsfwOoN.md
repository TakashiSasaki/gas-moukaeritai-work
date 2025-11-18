# Project: Google Takeout File Browser Add-on

This Google Apps Script project is a Google Sheets add-on designed to display a sidebar, with the intended purpose of browsing files from Google Takeout. While the current sidebar content is a placeholder, the project structure indicates its role as an interactive tool within Google Sheets.

## Overview

The primary purpose of this add-on is to provide a user interface within Google Sheets for interacting with Google Takeout data. Although the full functionality for browsing Takeout files is not yet implemented, the add-on establishes the necessary framework for such an application.

## Functionality

The core functionality is implemented in `Code.js`, with the user interface defined in `sidebar.html`.

### Core Features

-   **`onInstall(e)`**: This function is triggered when the add-on is installed. It calls `onOpen()`.
-   **`onOpen(e)`**: This function is triggered when the spreadsheet is opened or the add-on is installed. It creates a custom add-on menu in the Google Sheets UI with an item "showSidebar", which calls `showSidebar()`. It also calls `showSidebar()` directly to display the sidebar upon opening.
-   **`showSidebar()`**: Creates an HTML sidebar from `sidebar.html`. It sets the sidebar's title to "Google Takeout File Browser" and displays it in the active Google Sheet.

### Code Examples

#### `Code.js`

```javascript
function showSidebar() {
  const htmlTemplate = HtmlService.createTemplateFromFile("sidebar");
  const htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Google Takeout File Browser");
  SpreadsheetApp.getUi().showSidebar(htmlOutput);

  
}


function onInstall(e){
  onOpen();
}

function onOpen(e){
  SpreadsheetApp.getUi().createAddonMenu().addItem("showSidebar", "showSidebar").addToUi();
  showSidebar();
}
```

## Web Interface (`sidebar.html`)

The `sidebar.html` file provides a minimal placeholder for the add-on's user interface:

-   It currently contains only the text "hogehoge". This indicates that the actual content and interactive elements for browsing Google Takeout files are yet to be implemented or are loaded dynamically from another source not included in the provided snippets.

## Permissions

The `appsscript.json` file specifies no explicit OAuth scopes or library dependencies. As a Google Sheets add-on, it will require permissions to interact with `SpreadsheetApp` and `HtmlService` when installed and authorized by the user.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: No external libraries are explicitly listed in `appsscript.json`.

## Deployments

This project is intended to be deployed as a Google Sheets Add-on. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
