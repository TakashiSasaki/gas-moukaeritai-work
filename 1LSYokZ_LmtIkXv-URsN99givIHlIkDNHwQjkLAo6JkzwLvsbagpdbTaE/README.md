# Spreadsheet Addon (すぷれ)

## Overview

The "Spreadsheet Addon (すぷれ)" project is a comprehensive Google Apps Script library designed to extend and enhance the functionality of Google Sheets. It provides a wide array of tools for advanced spreadsheet manipulation, data management, developer utilities, and user interface enhancements. The addon integrates directly into Google Sheets through a custom menu, offering features ranging from database-like operations on sheet data to detailed introspection of spreadsheet properties and trigger management. It leverages `HtmlService` for interactive sidebars and dialogs, `PropertiesService` for persistent script data, and the advanced Sheets service for more granular control.

## Functionality

The project offers a rich set of features categorized into several modules, accessible primarily through a custom menu in Google Sheets.

### Core Features

-   **Menu Management (`Menu.js`):**
    -   `recreateMenu()`: Dynamically builds the custom add-on menu in Google Sheets, organizing functions into submenus like "Database", "Trigger", "Edit", "Edit sheet", "Unicode", "URL", "Developer Metadata", "Dev", and "Help".
    -   `onOpen()` and `onInstall()`: Automatically call `recreateMenu()` when the spreadsheet is opened or the addon is installed.
-   **Database-like Operations (`Database.js`, `database_.js`, `getRecords.js`, `getColumnNames.js`):**
    -   `appendObject()`: Appends a JSON object as a new row to the active sheet, mapping object keys to column headers.
    -   `appendFieldName()`: Adds a new column header to the rightmost available column.
    -   `showDatabaseSidebar()`: Displays a sidebar (`database.html`) for interacting with sheet data as a database, including setting headers, renewing tables, and generating Google Visualization API query URLs.
    -   `setHeader()`, `getHeader()`: Manage the header row of a sheet.
    -   `clearTable()`, `renewTable()`: Clear and refresh data in a sheet.
    -   `getRecords(sheet)`: Retrieves all rows from a sheet as an array of JavaScript objects, using the header row as keys.
    -   `getColumnNames(sheet)`: Returns an array of column names from the frozen row.
-   **Sheet and Range Editing (`EditRange.js`, `EditSheet.js`, `sheet_.js`, `placeCheckbox.js`):**
    -   `getIndexOf()`: Finds the index of values from one range within a list from another range.
    -   `createSheetByDate()`: Creates a new sheet with the current date and time as its name.
    -   `adjustColumnWidth()`: Adjusts column widths, optionally setting a maximum width.
    -   `swapValuesAndNotes()`: Swaps the values and notes of cells in the active range.
    -   `getValuesAsJson()`, `setValuesAsJson()`, `appendValuesAsJson()`: Copy, paste, and append cell values as JSON.
    -   `trimSheet()`: Deletes empty columns and rows outside the data range.
    -   `fillBlankCells()`, `fillBlankCellsByRightColumn()`, `fillBlankCellsByLeftColumn()`: Fill blank cells in a range with a specified value or values from adjacent columns.
    -   `moveToTop()`, `moveToLeftmost()`, `moveToLeftTop()`: Move rows or columns to the top or leftmost positions.
    -   `twoInLeft()`: Combines values from two columns into the left column, separated by a newline.
    -   `placeCheckbox()`: Places checkboxes in the selected range using the Sheets API.
-   **Triggers (`setOnEditTrigger.js`, `deleteTriggers.js`, `onEditColor.js`, `showTriggers.js`):**
    -   `setOnEditTrigger(functionName, spreadsheet)`: Creates an `onEdit` installable trigger for a specified function.
    -   `deleteInstalledTriggers()`: Deletes installable triggers by function name.
    -   `addOnEditColorTrigger()`: Creates an `onEdit` trigger that colors the modified cell and adds a timestamp note.
    -   `showInstalledTriggers()`: Displays a JSON representation of all project and user-installed triggers.
-   **URL Generation (`URL.js`):**
    -   `publishForGoogleVisualization()`: Generates a Google Visualization API query URL for the active sheet and displays the JSON response.
    -   `publishAsHtml()`: Generates a public HTML export URL for the active sheet.
    -   `feedSpreadsheets()`, `feedSheetsPrivateBasic()`, `feedSheetsPrivateFull()`, `feedSheetsPublicBasic()`, `feedSheetsPublicFull()`: Generate URLs for Google Sheets API v3 feeds.
    -   `queryAsHtml()`, `queryAsJson()`, `queryAsCsv()`: Generate Google Visualization API query URLs with HTML, JSON, or CSV output, allowing for custom queries and header rows.
-   **Developer Utilities (`Dev.js`, `DeveloperMetadata.js`, `Help.js`):**
    -   `showSpreadsheetInfo()`, `showSheetInfo()`, `showActiveAndCurrentThings()`, `showRangeStructure()`: Display detailed information about the active spreadsheet, sheet, and ranges.
    -   `showDeveloperMetadata()`: Displays developer metadata associated with the spreadsheet.
    -   `showJsdoc()`: Shows the JSDoc documentation for the addon.
    -   `showAuthorizationInfo()`: Displays the authorization status and URLs for different authorization modes.
    -   `showAllFunctionNamesNotInAddonMenu()`: Lists functions that are not included in the custom menu.
-   **Unicode Utilities (`Unicode.js`):**
    -   `hexRangeToSheet()`: Appends hexadecimal character ranges to a sheet, converting them to characters.
-   **Other Utilities (`countCellsInAllSheets.js`, `splitByRegex.js`):**
    -   `countCellsInAllSheets()`: Counts the total number of cells in all sheets of the active spreadsheet.
    -   `splitByRegex()`: Splits cell content by a regular expression and writes the results to a new sheet.

### Code Examples

#### `Database.js` (Appending an object)

```javascript
function appendObject() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var ui = SpreadsheetApp.getUi();
  if (sheet.getFrozenRows() != 1) {
    ui.alert("One frozon row is required.");
    return;
  }
  var promptResponse = ui.prompt(
    ["Add JSON object as a row", "Each key corresponds to column name on the frozen row."].join(" "),
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;

  var o = JSON.parse(promptResponse.getResponseText());
  var keys = Object.keys(o);

  var existingFields = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
  // ... (rest of the function) ...
}
```

#### `Menu.js` (Menu creation snippet)

```javascript
function recreateMenu(e) {
  var ui = SpreadsheetApp.getUi();
  var addonMenu = ui.createAddonMenu();
  var subMenu;
  var addedFunctionNames = [];
  
  function add(item, caption){ /* ... */ }

  add("Database");
  add(appendObject);
  add(appendFieldName);
  // ... (many more additions) ...
  add("Help");
  addonMenu.addSubMenu(subMenu);
  addonMenu.addToUi();
  return addedFunctionNames;
}
```

#### `onEditColor.js` (OnEdit trigger example)

```javascript
function addOnEditColorTrigger() {
  var trigger = ScriptApp.newTrigger("onEditColorTriggerHandler")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
}

function onEditColorTriggerHandler(event) {
  const COLOR = "#dddd44";
  const range = event.range;
  range.setBackground(COLOR);
  range.setNote(new Date());
}
```

## Permissions

The `appsscript.json` file indicates that the project uses the advanced Sheets service (v4). It is configured as a web application that executes as the user accessing it and is accessible by anyone.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "enabledAdvancedServices": [{
      "userSymbol": "Sheets",
      "serviceId": "sheets",
      "version": "v4"
    }]
  },
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbwsy3-sNbx3Twj5sJd6ZUIo-kZ6KYAqEb842Kvkqdw`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwsy3-sNbx3Twj5sJd6ZUIo-kZ6KYAqEb842Kvkqdw/exec`
-   **ID (Version 32 - web app meta-version):** `AKfycbwuZ6LOWFTlx8Ra6L-JGOE8NBu8NwFTd6cGf023ZJIPx5o0zkQ`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwuZ6LOWFTlx8Ra6L-JGOE8NBu8NwFTd6cGf023ZJIPx5o0zkQ/exec`
