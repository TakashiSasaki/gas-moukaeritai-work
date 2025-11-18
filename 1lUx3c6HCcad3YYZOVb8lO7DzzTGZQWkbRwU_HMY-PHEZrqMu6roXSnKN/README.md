# Project: PublicWebCache

## Project Overview and Purpose

This Google Apps Script project, "PublicWebCache," functions as a public key-value store accessible via a web application. It allows users to store and retrieve content (text, images, etc.) associated with a unique key. The cache uses `CacheService.getScriptCache()` for storage, with a 6-hour expiration. It supports both HTTP GET/POST requests and `google.script.run` calls for interaction. A unique feature is its ability to handle different MIME types for stored content and a client-side interface that includes camera access for capturing and storing images.

## Functionality

The project provides a web-based interface and server-side functions for interacting with a public cache.

### Core Features:

-   **`doGet(e)`:**
    -   Serves `index.html` if no parameters are provided or if the `key` parameter is present but less than 32 characters long (acting as a landing page or for key generation).
    -   If a valid `key` (32+ characters) is provided, it retrieves the cached content associated with that key.
    -   The retrieved content's MIME type is set dynamically before returning the `ContentService.TextOutput`.
-   **`doPost(e)`:**
    -   Expects a `key` parameter (32+ characters) and `postData` containing `type` (MIME type) and `contents`.
    -   Stores the `type` and `contents` in `CacheService.getScriptCache()` using the provided `key`.
    -   Returns the old content if a value was previously associated with the key.
-   **`putContent(key, type, content)`:** A server-side function callable via `google.script.run` to store content in the cache. It combines `type` and `content` with a null character separator.
-   **`getContent(key)`:** A server-side function callable via `google.script.run` to retrieve content from the cache. It returns an array `[type, content]`.
-   **`setMimeType(x, type)`:** A helper function to set the `MimeType` of a `ContentService.TextOutput` based on the provided `type` string (e.g., `text/csv`, `application/json`).
-   **`splitZero(s)`:** A helper function to split a string at the first null character (`\0`), used to separate the MIME type from the content stored in the cache.

### Client-Side (`index.html`):

The `index.html` provides an interactive interface for testing the cache:

-   **Key Management:** Displays `pathInfo` (likely the script ID or a derived key) and allows manual input for `key`.
-   **Content Input/Output:** Textareas for `description` (for saving via `google.script.run`) and `dataUri` (for captured images). Input fields for `type` and `content` for HTTP POST/GET.
-   **Camera Integration:**
    -   "カメラ起動" (Start Camera): Activates the user's webcam and displays the feed in a `<video>` element.
    -   "カメラ停止" (Stop Camera): Stops the webcam feed.
    -   "フォーカス" (Focus): Attempts to set continuous focus on the video stream.
    -   "撮影" (Capture): Captures a frame from the video feed onto a `<canvas>` and converts it to a Data URI, which is then displayed in a textarea.
-   **HTTP Interaction:** Buttons to "post by fetch" and "get by fetch" using the `fetch` API, allowing users to test `doPost` and `doGet` with custom keys, types, and content.
-   **`google.script.run` Interaction:** Buttons to "get by google.script.run" and "put by google.script.run" to test the `getContent` and `putContent` server-side functions.
-   **Endpoint Display:** Shows the `execUrl` (deployed web app URL) and `devUrl` (development URL).

## Web Interface

The project provides a single-page web interface (`index.html`) that allows users to interact with the cache service. It features input fields for keys, content, and MIME types, along with buttons to perform GET and POST operations via both standard HTTP `fetch` and `google.script.run`. A unique aspect is the integration of camera access to capture images and store their Data URIs in the cache.

## Permissions

The `appsscript.json` file specifies:
-   **Execution:** `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access:** `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **Google Services:** Requires access to `CacheService` for storing and retrieving data, and `ContentService` for serving various content types. `HtmlService` is used for the web interface.

## Configuration

-   **Time Zone:** `Asia/Tokyo`
-   **Dependencies:** No external libraries are explicitly listed.
-   **Script Properties:** The `index.html` references `PropertiesService.getScriptProperties().getProperty('URL')` for the `execUrl`, implying that the deployed URL might be stored as a script property.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
