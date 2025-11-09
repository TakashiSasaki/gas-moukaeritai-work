# Google Apps Script Project: 1R6Wr7q2KhcEMl6aUGc4YtwcKyuDfPkX-duWxyA93qLVLnpvAFkx47N4r

## Project Overview
This Google Apps Script project functions as a web application designed to extract and display the content of specific cells from Google Colaboratory notebooks. Users can provide a Google Colab notebook URL, and the application will parse it to retrieve the notebook's file ID and the ID of the cell to scroll to. It then fetches the content of that specific cell and presents it, along with various generated links for direct access or download.

## Functionality

### `Code.js`
The `Code.js` file contains the core logic for the web application, primarily through the `doGet` function, which handles incoming web requests.

-   **`doGet(e)`**: This function is the entry point for web app requests.
    -   It checks for `fileId` and `scrollTo` parameters, either from `e.pathInfo` (for clean URLs) or `e.parameter` (for query parameters).
    -   If these parameters are missing, it serves the `index.html` template.
    -   It retrieves the Google Colab notebook content using `getByWebContentLink(fileId)`.
    -   The fetched content (a JSON string) is parsed, and the `source` code of the specified cell (`scrollTo`) is extracted.
    -   The extracted cell content is returned as a `TEXT` or `JSON` `ContentOutput`.
    -   Includes basic error handling to return an "access denied" message if an error occurs during processing.
-   **`getByWebContentLink(fileId)`**: Fetches the content of a Google Drive file using its web content link.
-   **`webContentLink(fileId)`**: Constructs a direct download URL for a Google Drive file using its ID.
-   **`downloadLink(fileId)`**: Constructs a Google Drive API download URL for a file (note: this function is defined but not directly used in `doGet`'s current implementation, though it's called from `index.html` via `google.script.run`).
-   **`exampleColabUrl()`**: Retrieves an example Colab URL from script properties.
-   **`devUrl()`**: Retrieves a development URL from script properties.
-   **`execUrl()`**: Retrieves the execution URL of the web app from script properties.
-   **`editUrl()`**: Retrieves the edit URL of the script from script properties.

## Web Interface
The `index.html` file provides the user interface for interacting with the web application.

-   **Input**: A `textarea` (`id="colabUrl"`) where users can paste a Google Colab notebook URL.
-   **Extracted Information**: Displays the extracted `fileId` and `scrollTo` (cell ID) in read-only input fields.
-   **Generated Links**: Provides various generated URLs:
    -   URL of this form (`execUrl`)
    -   Download link (`downloadLink`)
    -   Web content link (`webContentLink`)
    -   URL to get cell content (`cellContentUrl`)
-   **Cell Content Display**: A `textarea` (`id="cellContent"`) to display the actual content of the fetched cell.
-   **Copy Functionality**: Buttons are provided to easily copy the generated URLs and cell content to the clipboard.
-   **Client-side Logic**: JavaScript within `index.html` handles:
    -   Parsing the pasted Colab URL to extract `fileId` and `scrollTo`.
    -   Constructing the `cellContentUrl`.
    -   Using `google.script.run` to call server-side functions (`downloadLink`, `webContentLink`, `exampleColabUrl`) and update the UI.
    -   Fetching the cell content dynamically using `fetch` API.
    -   `copy(button)` function to copy text from associated textareas.
-   **Development Links**: A section with links for development purposes (`devUrl`, `execUrl`, `editUrl`).
-   **Author Link**: A link to the author's Twitter profile.

## Permissions
The `appsscript.json` manifest specifies the following web app execution permissions:
-   `webapp.access`: `ANYONE_ANONYMOUS` - This means the web application can be accessed by anyone, even without a Google account.
-   `webapp.executeAs`: `USER_DEPLOYING` - The script will execute with the identity and permissions of the user who deployed the web app.

## Configuration
This project relies on `PropertiesService.getScriptProperties()` to retrieve various URLs (`exampleColabUrl`, `devUrl`, `execUrl`, `editUrl`). These properties need to be set up in the script's project settings.

No advanced Google services are explicitly enabled in `appsscript.json`.

## Deployments
The project has two deployments:

1.  **Deployment 1 (HEAD)**:
    -   **ID**: `AKfycbyOjT0_ju2cGcfLTNGX6JEBW8DAnD9e31Tsdi-9IxU`
    -   **Target**: `HEAD` (This deployment points to the latest saved version of the script).
    -   **Description**: (No specific description provided).
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbyOjT0_ju2cGcfLTNGX6JEBW8DAnD9e31Tsdi-9IxU/exec`

2.  **Deployment 2 (Version 40)**:
    -   **ID**: `AKfycbwk_7NmrG1nPM3bBIxPbEsURHcqxBfLf0Gu_WHdJaNLouq3XuDbVvDRYoZnY0QRCmPk`
    -   **Target**: `40` (This deployment points to version 40 of the script).
    -   **Description**: "Web app only"
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbwk_7NmrG1nPM3bBIxPbEsURHcqxBfLf0Gu_WHdJaNLouq3XuDbVvDRYoZnY0QRCmPk/exec`
