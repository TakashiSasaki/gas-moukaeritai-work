# Google Apps Script Project: 1HdefH6zukEzlrAQNol72ckv9GbjCirkQM4RqrJbnjktxuW9n7k5ysfR8

## Project Overview
This Google Apps Script project provides a collection of utility functions primarily designed to enhance Google Sheets functionality. It includes features for array manipulation, clipboard operations within the script's cache, column-based data retrieval, object property manipulation, copying and pasting ranges, refreshing sheet data, and various row operations such as appending, logging, and clearing duplicates. The project also incorporates a basic HTML interface for displaying historical data.

## Functionality

### `array.js`
- `unionArray(array1, array2)`: Combines two arrays, returning a new array containing unique elements from both input arrays.
- `testUnionArray()`: A test function for `unionArray`.

### `clipboard.js`
- `getClipboardValues()`: Retrieves values previously stored in the user cache, typically from a copied range.
- `getClipboardHeader()`: Retrieves header information previously stored in the user cache.

### `getAsDictionary.js`
- `getAsDictionary(sheet, key_column_name, value_column_name)`: Transforms data from a specified sheet into a JavaScript object (dictionary). It uses values from `key_column_name` as object keys and `value_column_name` as corresponding values.

### `getValuesByColumnName.js`
- `getValuesByColumnName(sheet, column_name)`: Extracts all values from a specific column in a given sheet. The column is identified by its header name (assuming the first row contains headers).

### `getValuesByColumnNames.js`
- `getValuesByColumnNames(sheet, column_names)`: Retrieves values for multiple specified columns from a sheet, returning an array of arrays, where each inner array corresponds to a column's values.

### `install.js`
- `onInstall(e)`: An installable trigger function that sets up the add-on. It uses `AddonHelper.installAddon` to integrate with Google Sheets.
- `onOpen(e)`: An open trigger function that calls `onInstall` when the spreadsheet is opened, ensuring the add-on is properly initialized.

### `object.js`
- `deletePropertiesExcept(object, propertyNames)`: Modifies an object by deleting all its properties except those explicitly listed in `propertyNames`.
- `testDeletePropertiesExcept()`: A test function for `deletePropertiesExcept`.
- `copyShallow(srcObject, dstObject)`: Performs a shallow copy of enumerable properties from `srcObject` to `dstObject`, overwriting existing properties in `dstObject`.
- `copyShallow.test()`: A test function for `copyShallow`.
- `unionOfProperties(objects)`: Given an array of objects, this function returns an array of all unique property names found across all objects.
- `unionOfProperties.test()`: A test function for `unionOfProperties`.

### `range.js`
- `copyRange()`: Copies the currently active range's values, notes, backgrounds, font colors, number formats, and formulas into the user cache for later use.
- `copyHeader()`: Copies the values of the header row (first frozen row) of the active range or the entire data range to the user cache.

### `refresh.js`
- `refresh(values)`: This function's body is currently empty, suggesting it might be a placeholder for future functionality or an incomplete feature.

### `renewSheet.js`
- `renewSheet(spreadsheet_id, sheet_name, input_columns, func)`: A utility to update a specific sheet within a spreadsheet. It can create the sheet if it doesn't exist, read a specified number of input columns, process them with a provided function (`func`), and then write the output back to the sheet.

### `rows.js`
- `appendRows(rows)`: Appends a given 2D array of `rows` to the end of the active sheet.
- `appendLog(message)`: Appends a log entry to the active sheet. If `message` is undefined, it uses values from the user cache; otherwise, it logs the provided arguments along with a timestamp.
- `clearDuplicatedRows()`: Identifies and clears duplicated rows within the active range. Duplicates are determined by comparing MD5 hashes of row values.

### `test.js`
- `testAll()`: Iterates through all globally defined functions and executes any that have a `.test()` method, facilitating comprehensive testing of the script's components.

## Web Interface
The project includes an `index.html` file that serves as a basic web interface. It leverages Bootstrap for responsive design and Google Charts for data visualization.
- **Content**: The interface displays a textarea containing a JSON stringified `parameter` object and a dedicated `div` (`id="history"`) for displaying historical data.
- **Interaction**: A "draw table" button triggers the `drawHistory()` JavaScript function.
- **`drawHistory()` Function**: This client-side function is responsible for rendering a table using Google Charts. Currently, it uses a hardcoded `history` array (`[["a", "b"], ["c", "d"]]`) for demonstration purposes, populating the `history` div with this data.

## Permissions
The `appsscript.json` manifest specifies the following web app execution permissions:
- `webapp.access`: `MYSELF` - This means the web application can only be accessed by the user who deployed it.
- `webapp.executeAs`: `USER_DEPLOYING` - The script will execute with the identity and permissions of the user who deployed the web app.

## Configuration
This project utilizes the `CacheService.getUserCache()` for temporary storage of user-specific data, such as copied range values and headers.

It also depends on the following external Google Apps Script libraries:
- **DriveAppUtilityLibrary**:
    - **Library ID**: `1ziQa1RNI42ExDuN7tt5nxa_Cz19yEVCCeeevNU-gFcSwIqJzcThOBno8`
    - **Version**: `7`
- **AddonHelper**:
    - **Library ID**: `1ryBTdV-IJH57QxJefgX334JWuJ7KHLjpT43v45VAqwAmFSKqkXkMFnAY`
    - **Version**: `3`

## Deployments
The project has one deployment:
- **ID**: `AKfycbzJZEifaJTQpGfAS9_i9WHmPtGydwJIScM9hbFEDcSd`
- **Target**: `HEAD` (This deployment points to the latest saved version of the script).
- **Description**: (No specific description provided for this deployment).
- **Published URL**: `https://script.google.com/macros/s/AKfycbzJZEifaJTQpGfAS9_i9WHmPtGydwJIScM9hbFEDcSd/exec`
