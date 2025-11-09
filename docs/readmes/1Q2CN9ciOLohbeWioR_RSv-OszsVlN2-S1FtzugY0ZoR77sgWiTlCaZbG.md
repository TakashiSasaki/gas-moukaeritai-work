# Project: Spreadsheet Object Manipulator / Spreadsheet DB

## Project Overview and Purpose

This Google Apps Script project appears to be a library designed to facilitate object-oriented manipulation of Google Sheets, effectively treating a sheet as a simple database or a collection of objects. It provides functions to append, update, and retrieve data from a Google Sheet using JavaScript objects, where object keys correspond to column headers. It also includes utilities for managing column names and mapping keys to row indices. The project includes a basic web interface for demonstration and interaction.

## Functionality

The project provides a set of server-side functions for interacting with Google Sheets.

### Core Features:

-   **`doGet()`:** The entry point for the web application, which renders `index.html`.
-   **`appendObject(obj)` (in `object.js`):** Appends a single JavaScript object as a new row to the active sheet. Object keys are mapped to column headers.
-   **`appendObjects(objects)` (in `object.js`):** Appends an array of JavaScript objects as new rows to the active sheet.
-   **`updateObject(obj, keyProperty)` (in `object.js`):** Updates an existing row in the active sheet based on a specified `keyProperty` within the object. If a row with the matching key value is found, it updates that row.
-   **`appendRow(rowValues)` (in `row.js`):** Appends a single row (array of values) to the active sheet.
-   **`appendRows(rowsValues)` (in `row.js`):** Appends multiple rows (2D array of values) to the active sheet.
-   **`writeRow(rowValues, rowIndex)` (in `row.js`):** Writes a single row at a specific `rowIndex` in the active sheet.
-   **`_objectToRowValues(obj)` (in `_values.js`):** Converts a JavaScript object into an array of row values, mapping object keys to column indices.
-   **`_objectsToRowsValues(objects)` (in `_values.js`):** Converts an array of JavaScript objects into a 2D array of row values.
-   **`_padRowsValues(rowsValues)` (in `_values.js`):** Pads rows with `null` values to ensure consistent length.
-   **`getColumnNames()` (in `column.js`):** Retrieves and caches the column names (headers) from the first row of the active sheet.
-   **`getColumnIndex(columnName)` (in `column.js`):** Returns the 1-based index of a column given its name. If the column name doesn't exist, it attempts to add it as a new column header.
-   **`getKeyValueRowIndexMap(keyColumnName)` (in `key.js`):** Creates and caches a map between key values in a specified `keyColumnName` and their corresponding row indices.
-   **`test()` (in `test.js`):** Contains test functions to demonstrate the usage of `appendObject`, `appendObjects`, and `updateObject`. It also includes helper functions `getSpreadsheetForDebug` and `getSheetForDebug` for setting up test environments.

## Web Interface

The project provides a simple web interface (`index.html`) that allows users to specify a target spreadsheet and sheet, and then perform basic data manipulation operations (append, update, clear) using a textarea for input. It also includes functionality to save and recall content from client-side storage.

## Permissions

The `appsscript.json` file specifies:
-   **Execution:** `USER_ACCESSING` (the script runs with the identity and permissions of the user accessing the web app).
-   **Access:** `ANYONE` (the web app is accessible by anyone, including anonymous users).
-   **Google Services:** Requires access to `SpreadsheetApp` for spreadsheet manipulation.

## Configuration

-   **Time Zone:** `Asia/Tokyo`
-   **Dependencies:** No external libraries are explicitly listed.
-   **Script Properties:** The `test.js` file references `PropertiesService.getScriptProperties().getProperty("spreadsheetIdForDebug")`, indicating that a debug spreadsheet ID can be configured.

## Deployments

The project is deployed as a web application.
