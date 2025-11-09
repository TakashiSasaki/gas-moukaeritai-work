# Project: Interactive Sticker Voting/Feedback System

This Google Apps Script project is a web application that functions as an interactive voting or feedback system. It allows users to place "stickers" (characters or symbols) on a visual grid, and their placements (x, y coordinates and the sticker itself) are recorded in a Google Sheet. The system supports multiple sheets for different voting contexts and provides APIs for reading and writing data.

## Overview

The primary purpose of this project is to provide a dynamic and visual way for users to express opinions or provide feedback on a two-dimensional scale. The data collected can then be easily analyzed within Google Sheets. It's suitable for surveys, brainstorming sessions, or interactive polls.

## Functionality

The core functionality is implemented across `doGet.js`, `Code.js`, `ReadAPI.js`, `WriteAPI.js`, and the web interface (`voting.html`, `setting.html`, `debug.html`).

### Core Features

-   **`doGet(e)`**: Serves as the entry point for the web application. It routes requests to different HTML templates based on URL parameters:
    -   `voting` parameter: Serves `voting.html` (the main interactive grid).
    -   `debug` parameter: Serves `debug.html` (for debugging purposes).
    -   Default: Serves `setting.html` (for application settings).
-   **`getSpreadsheet()`**: (in `Code.js`) Retrieves or creates a Google Sheet based on the `SS_NAME` property (from script properties). It stores the spreadsheet's ID in user properties (`SS_ID`) for persistent access and uses `LockService` to ensure thread safety.
-   **`ReadAPI.js`**: Provides functions to read data from the associated Google Sheet:
    -   `getSheetNames()`: Returns a list of all sheet names in the active spreadsheet.
    -   `getXyLabels(sheetName)`: Retrieves X and Y axis labels from the first row of a specified sheet.
    -   `getShapes(sheetName)`: Retrieves a list of "shapes" (characters/symbols) that can be used as stickers from a specified sheet.
    -   `getRecentStickers(sheetName)`: Retrieves recent sticker placements (x, y percentages and sticker text) from a specified sheet.
-   **`WriteAPI.js`**: Defines the function to record sticker placements:
    -   `recordSticker(sheetName, xPercent, yPercent, stickerText)`: Records the `xPercent`, `yPercent` (position on the grid), and `stickerText` to a new row in the specified sheet. It uses `LockService` to prevent concurrent writes.

### Code Examples

#### `doGet.js`

```javascript
function doGet(e) {
  if (e.parameter.voting) {
    const htmlOutput = HtmlService.createTemplateFromFile("voting").evaluate();
    htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1.0");
    return htmlOutput;
  } if (e.parameter.debug) {
    const htmlOutput = HtmlService.createTemplateFromFile("debug").evaluate();
    htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1.0");
    return htmlOutput;
  } else {
    const htmlOutput = HtmlService.createTemplateFromFile("setting").evaluate();
    htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1.0");
    return htmlOutput;
  }
}//doGet
```

#### `Code.js` (Excerpt)

```javascript
function getSpreadsheet() {
  const lock = LockService.getUserLock();
  lock.waitLock(5000);
  const existingSsId = PropertiesService.getUserProperties().getProperty("SS_ID");
  if (existingSsId) {
    const existingSs = SpreadsheetApp.openById(existingSsId);
    if (existingSs) {
      return existingSs;
    } else {
      PropertiesService.getUserProperties().deleteProperty("SS_ID");
    }
  }

  const ssName = PropertiesService.getScriptProperties().getProperty("SS_NAME");
  const files = DriveApp.getFilesByName(ssName);

  // ... (logic to find or create spreadsheet) ...
}
```

#### `ReadAPI.js` (Excerpt)

```javascript
function getSheetNames() {
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  const sheetNames = sheets.map((sheet) => sheet.getName());
  console.log(sheetNames);
  return sheetNames;
}//getSheetNames

function getXyLabels(sheetName) {
  if (!sheetName) sheetName = "Sheet1";
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Can't open the sheet named ${sheetName}.`);
  const range = sheet.getRange(1, 2, 1, 2);
  const values = range.getValues();
  const xLabel = values[0][0];
  const yLabel = values[0][1];
  console.log(xLabel, yLabel);
  return [xLabel, yLabel];
}//getXyLabels

function getShapes(sheetName) {
  if (!sheetName) sheetName = "Sheet1";
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Can't open the sheet named ${sheetName}.`);
  const range = sheet.getRange(1, 4, 1, 1);
  const values = range.getValues();
  const shapes = values[0][0];
  const array = Array.from(shapes);
  console.log(array);
  return array;
}//getShapes
```

#### `WriteAPI.js`

```javascript
function recordSticker(sheetName, xPercent, yPercent, stickerText) {
  if (!sheetName) {
    sheetName = "Sheet1";
    xPercent = 12.3;
    yPercent = 23.4;
    stickerText = "☺";
  }
  const lock = LockService.getUserLock();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  lock.waitLock(1000);
  const lastRow = sheet.getLastRow();
  sheet.insertRowAfter(lastRow);
  const range = sheet.getRange(lastRow + 1, 1, 1, 4);
  range.setValues([[new Date(), xPercent, yPercent, stickerText]]);
  lock.releaseLock();
}//recordSticker
```

## Web Interface (`voting.html`, `setting.html`, `debug.html`, `gridSvg.html`)

The project provides a multi-page web interface:

-   **`voting.html`**: The main interactive page where users place stickers. It displays a grid, X and Y axis labels, and a footer with selectable sticker shapes. Client-side JavaScript handles mouse events for placing stickers, fullscreen toggling, and calls server-side functions via `google.script.run` to record placements and update the display.
-   **`setting.html`**: (Content not provided, but implied to be for application settings).
-   **`debug.html`**: (Content not provided, but implied to be for debugging purposes).
-   **`gridSvg.html`**: Contains SVG code for rendering the background grid.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **Google Services**: Implicitly uses `SpreadsheetApp` for sheet manipulation, `DriveApp` for finding spreadsheets, `PropertiesService` for storing user properties, and `LockService` for concurrency control.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`SS_NAME`**: The name of the Google Sheet used for data storage must be set as a script property (`PropertiesService.getScriptProperties()`).
-   **`SS_ID`**: The ID of the data spreadsheet is stored in `PropertiesService.getUserProperties()`.
-   **`AUTHOR`**: A placeholder for the author's name, used in error messages.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
