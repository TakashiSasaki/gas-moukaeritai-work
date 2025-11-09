# Google Apps Script Project: 1SN862ojGSUHB0KjJW-p4iYu8O_U8OYBnOsYMIQhb4soKnnioCHCVhH72

## Project Overview
This Google Apps Script project functions as a library designed to facilitate working with Gmail threads by structuring their data into a table-like format. It extends an external `Table` library to manage and query Gmail thread properties, including ID, importance, inbox status, subject, date, body content, and associated email addresses.

## Functionality

### `GmailThreadTable.js`
-   **`GmailThreadTable()`**: The constructor for the `GmailThreadTable` class. It inherits from an external `Table` library and initializes the column names relevant to Gmail thread properties.

### `cache.js`
-   **`cache(gmailThread)`**: This function takes a `GmailThread` object as input and extracts various mutable and immutable properties. It uses `CacheService.getScriptCache()` to store these properties, optimizing for performance by retrieving cached data if available. The extracted properties include:
    -   `id`: Thread ID.
    -   `firstMessageSubject`: Subject of the first message.
    -   `lastMessageDate`: Date of the last message.
    -   `firstMessageBody`: Body of the first message (truncated to 10000 characters).
    -   `lastMessageBody`: Body of the last message (truncated to 10000 characters).
    -   `addresses`: All unique email addresses associated with the thread.
    -   `isImportant`: Boolean indicating if the thread is marked as important.
    -   `isInInbox`: Boolean indicating if the thread is in the inbox.
    -   `isInPriorityInbox`: Boolean indicating if the thread is in the priority inbox.

### `create.js`
-   **`create()`**: A factory function that returns a new instance of the `GmailThreadTable` class.

### `getAddresses_.js`
-   **`getAddresses(thread)`**: Extracts all unique email addresses (from Bcc, Cc, From, and To fields) from all messages within a given `GmailThread`.
-   **`testGetAddresses()`**: A test function for `getAddresses`.

### `query.js`
-   **`query(queryString, max)`**: This function is defined as a prototype method of `GmailThreadTable`. It searches Gmail threads using `GmailApp.search()` based on a provided `queryString` and `max` number of results. For each found `GmailThread`, it calls the `cache` function to process the thread's data and then appends the resulting object to the `GmailThreadTable` instance.

### `test.js`
-   **`test()`**: A demonstration function that creates a `GmailThreadTable` instance, executes a default query (e.g., "is:important"), and logs the results in a table format.

## Web Interface
This project does not include any `.html` files and therefore does not provide a web interface. It is designed to be used programmatically within Google Apps Script.

## Permissions
The `appsscript.json` manifest does not specify any `webapp` properties, indicating that this script is not deployed as a web application. It will require permissions to access Gmail (`GmailApp`) and Cache services (`CacheService`).

## Configuration
This project relies on the following external Google Apps Script library:
-   **Table**:
    -   **Library ID**: `145HOZDGMnvmYoPGYsN--JfNWQtotCDYFYLeSh-dPm-VQxx9sVlWE64um`
    -   **Version**: `3`

## Deployments
The project has one deployment:
-   **ID**: `AKfycbxAYs1QIFJXKc9oWI-OdySfLVUKNFdRS4qg6tM-ktUa`
-   **Target**: `HEAD` (This deployment points to the latest saved version of the script).
-   **Description**: (No specific description provided).
-   **Published URL**: (Not applicable as it's not a web app).
