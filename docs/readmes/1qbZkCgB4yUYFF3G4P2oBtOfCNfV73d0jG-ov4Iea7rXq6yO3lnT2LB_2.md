# Project: Gmail and Spreadsheet Utilities

## Project Overview and Purpose

This Google Apps Script project is a Google Sheets add-on that provides a suite of utilities for interacting with Gmail labels and threads, as well as for managing spreadsheet triggers and cell formatting. It leverages the Gmail API (Advanced Service) and integrates with external libraries `SpreadsheetAddon` and `AddonHelper` to enhance Google Sheets functionality. The add-on allows users to enumerate Gmail labels, update label properties, retrieve thread information, and manage installable triggers directly from a Google Sheet. It also includes a basic XML parser for Gmail filter data.

## Functionality

The project provides a set of functions accessible through a custom menu in Google Sheets.

### Core Features:

-   **`onOpen()` (in `onOpen.js`):** Creates a custom menu in the Google Sheets UI with options to:
    -   `onOpen` (re-open the menu)
    -   `listGmailLabels` (enumerate Gmail labels)
    -   `updateGmailLabel` (update Gmail label properties)
    -   `getLastThreadsForLabelIds` (get last threads for specified label IDs)
    -   `setBackgroundColor` (set background color of cells)
-   **`enumerateGmailLabels()` (in `listGmailLabels.js`):**
    -   Retrieves all Gmail labels for the active user using `Gmail.Users.Labels.list()`.
    -   Writes label information (name, ID, type, visibility, message/thread counts) to a new sheet named "GmailLabelInfo" using the `SpreadsheetAddon` library.
    -   Sorts the sheet by label name.
-   **`updateGmailLabel()` (in `updateGmailLabelName.js`):**
    -   Reads label data from the active sheet.
    -   If an "action" column indicates "update", it uses `Gmail.Users.Labels.update()` to modify the corresponding Gmail label.
-   **`getLastThreadsForLabelIds()` (in `getLastThread.js`):**
    -   Reads label IDs from the active range in the spreadsheet.
    -   For each label ID, it fetches the last thread using `Gmail.Users.Threads.list()` and `Gmail.Users.Threads.get()`.
    -   Extracts and writes thread details (from, to, cc, subject, date) to a new sheet.
-   **`deleteTrigger(functionName)` (in `deleteTrigger.js`):** Deletes all installable triggers associated with a given `functionName`.
-   **`setOnChangeTrigger(functionName, spreadsheet)` (in `setOnChangeTrigger.js`):** Creates an `onChange` installable trigger for a specified `functionName` on a given `spreadsheet`.
-   **`setBackgroundColor(colorCode, range)` (in `setBackgroundColor.js`):** Sets the background color of a specified range (or active range) to `colorCode`. It also includes a `setBackgroundToRed` helper.
-   **`parseMailFilterXml(text)` (in `parseXml.js`):**
    -   Parses an XML string (expected to be a Gmail mail filter export).
    -   Extracts filter objects, including properties like `id`, `updated`, and various filter criteria (e.g., `from`, `to`, `subject`, `label`).
    -   Includes helper functions `getSheetValuesInOneText` to read sheet content as a single string and `getHeaders` to extract unique keys from objects.

### Client-Side (`xmlParser.html`):

The `xmlParser.html` provides a simple interface for XML parsing:

-   A `textarea` for users to paste XML content.
-   A "parse" button (client-side JavaScript not shown, but likely calls a server-side function like `parseMailFilterXml`).

## Web Interface

The project primarily interacts with the user through a custom menu in Google Sheets. It also includes a basic HTML file (`xmlParser.html`) which could be used as a sidebar or dialog for parsing XML content.

## Permissions

The `appsscript.json` file specifies:
-   **Advanced Services:** `Gmail API (v1)` is enabled.
-   **Libraries:**
    -   `SpreadsheetAddon` (ID: `1LSYokZ_LmtIkXv-URsN99givIHlIkDNHwQjkLAo6JkzwLvsbagpdbTaE`, Version: `24`)
    -   `AddonHelper` (ID: `1ryBTdV-IJH57QxJefgX334JWuJ7KHLjpT43v45VAqwAmFSKqkXkMFnAY`, Version: `3`)
-   **Time Zone:** `Asia/Tokyo`
-   **Execution:** This is an add-on, so it runs with the permissions granted by the user during installation.

## Configuration

-   The project uses `PropertiesService.getDocumentProperties()` to store the sheet name for `getLastThreadsForLabelIds`.
-   It relies heavily on the `SpreadsheetAddon` library for sheet manipulation.

## Deployments

This project is intended to be deployed as a Google Sheets Add-on.
