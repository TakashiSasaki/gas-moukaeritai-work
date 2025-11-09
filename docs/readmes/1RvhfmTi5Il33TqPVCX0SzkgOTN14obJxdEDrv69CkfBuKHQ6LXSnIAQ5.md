# Google Apps Script Project: 1RvhfmTi5Il33TqPVCX0SzkgOTN14obJxdEDrv69CkfBuKHQ6LXSnIAQ5

## Project Overview
This Google Apps Script project implements a "Cache Clipboard" web application. It allows users to manage multiple named clipboards, storing and retrieving text content and descriptions. The application leverages Google Apps Script's `PropertiesService` for persistent storage of clipboard metadata and `CacheService` for caching external resources and potentially clipboard content.

## Functionality

### `Code.js`
This file contains the server-side logic for the web application.

-   **`doGet(e)`**: The entry point for web app requests. It creates an HTML template from `index.html`, injects CSS and HTML content fetched from external URLs (`jsrun.it`), and sets the page title to "Cache Clipboard".
-   **`fetchCss()`**: Fetches CSS content from a specified `jsrun.it` URL. It uses `CacheService.getScriptCache()` to cache the CSS for 60 seconds, improving performance.
-   **`fetchHtml()`**: Fetches HTML content from a specified `jsrun.it` URL. Similar to `fetchCss()`, it caches the HTML for 60 seconds.
-   **`test()`**: A test function that demonstrates the usage of `CacheHelper.put()` and `CacheHelper.get()` to store and retrieve an object in the cache.
-   **`deleteClipboard(clipboardName)`**: Deletes a clipboard entry from `PropertiesService.getUserProperties()` based on its name and returns the updated list of clipboards.
-   **`computeClipboardId(clipboardName)`**: Computes a unique MD5 hash for a clipboard, combining the effective user's email, a user-specific salt, and the clipboard name.
-   **`getUserSalt()`**: Retrieves a user-specific salt from `PropertiesService.getUserProperties()`. If no salt exists, it generates a new random one and stores it.
-   **`getClipboards()`**: Retrieves all clipboard entries stored in `PropertiesService.getUserProperties()`, excluding the `userSalt`. It constructs an array of clipboard objects, each including its name, content (initially null), description, and a computed ID.
-   **`addClipboard(clipboardName, description)`**: Adds a new clipboard entry to `PropertiesService.getUserProperties()` with the given name and description, then returns the updated list of clipboards.

### `index.html`
This file serves as the basic web interface for the application.

-   **Dynamic Content Injection**: The HTML structure includes placeholders (`<?!=css?>` and `<?!=html?>`) where the server-side `doGet` function injects the fetched CSS and HTML content from `jsrun.it`.
-   **User Welcome**: Displays a welcome message including the effective user's email (`<?=Session.getEffectiveUser().getEmail();?>`).
-   **External Resources**: Links to Bootstrap CSS and Bootstrap Theme CSS from `jsdo.it` are included in the `<head>`. This suggests that the main UI elements and client-side logic are primarily loaded from these external sources, which are then cached by the server-side script.

## Permissions
The `appsscript.json` manifest specifies the following web app execution permissions:
-   `webapp.access`: `ANYONE` - This means the web application can be accessed by anyone, including anonymous users.
-   `webapp.executeAs`: `USER_ACCESSING` - The script will execute with the identity and permissions of the user who is currently accessing the web app.

## Configuration
This project relies on `PropertiesService.getUserProperties()` for persistent storage of user-specific clipboard data and a unique user salt. It also uses `CacheService.getScriptCache()` for caching external CSS and HTML content.

The project depends on the following external Google Apps Script library:
-   **CacheHelper**:
    -   **Library ID**: `1NYN_AoEoGoZIOKurCE2dSWFMzpBTeZFczQ-q_F4d-mvQ2XK6rdtz3Zev`
    -   **Version**: `66`

## Deployments
The project has two deployments:

1.  **Deployment 1 (HEAD)**:
    -   **ID**: `AKfycbwTvn3g19jJ96jlnksFFXMZxvxX2F_jz8enYgIctT88`
    -   **Target**: `HEAD` (This deployment points to the latest saved version of the script).
    -   **Description**: (No specific description provided).
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbwTvn3g19jJ96jlnksFFXMZxvxX2F_jz8enYgIctT88/exec`

2.  **Deployment 2 (Version 2)**:
    -   **ID**: `AKfycbzh3Mavd-EIq1sVBS16jv1hPJezIl59cZD-tp8TJCVMhhpWgJ3o`
    -   **Target**: `2` (This deployment points to version 2 of the script).
    -   **Description**: "web app meta-version"
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbzh3Mavd-EIq1sVBS16jv1hPJezIl59cZD-tp8TJCVMhhpWgJ3o/exec`
