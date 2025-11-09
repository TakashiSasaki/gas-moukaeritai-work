# Project: jsrun.it Proxy / Dynamic Content Loader

## Project Overview and Purpose

This Google Apps Script project functions as a web application that dynamically fetches and serves HTML, CSS, and JavaScript content from `jsrun.it`. It acts as a proxy, embedding the fetched content directly into its `index.html` template. This approach allows for serving dynamic web content from external sources while leveraging Google Apps Script's web app capabilities. The project caches the fetched external content for a short period (120 seconds) to improve performance.

## Functionality

The project provides a web application that dynamically fetches and serves web content.

### Core Features:

-   **`doGet(e)` (in `Code.js`):**
    -   This is the main entry point for the web application.
    -   It attempts to retrieve cached HTML, CSS, and JavaScript content from `CacheService.getScriptCache()`.
    -   If content is not cached, it fetches the latest versions from specific `jsrun.it` URLs (`http://jsrun.it/TakashiSasaki/SOuH/html`, `http://jsrun.it/TakashiSasaki/SOuH/css`, `http://jsrun.it/TakashiSasaki/SOuH/js`) using `UrlFetchApp.fetch()`.
    -   The fetched content is then stored in the script cache for 120 seconds.
    -   Finally, it renders `index.html`, injecting the fetched HTML, CSS, and JavaScript into the template.

### Client-Side (`index.html`):

The `index.html` serves as a container for the dynamically loaded content:

-   It includes `<style>` and `<script>` tags that use server-side templating (`<?!=css?>`, `<?!=html?>`, `<?!=js?>`) to embed the fetched CSS, HTML, and JavaScript directly into the page.
-   This means the actual user interface and client-side logic are defined within the external `jsrun.it` resources.

## Web Interface

The project's web interface (`index.html`) is minimal, primarily acting as a loader for external HTML, CSS, and JavaScript from `jsrun.it`. The actual user experience is determined by the content hosted on `jsrun.it`.

## Permissions

The `appsscript.json` file specifies:
-   **Execution:** `USER_ACCESSING` (the script runs with the identity and permissions of the user accessing the web app).
-   **Access:** `ANYONE` (the web app is accessible by anyone, including anonymous users).
-   **Google Services:** Requires access to `UrlFetchApp` to fetch external web content and `CacheService` for caching. `HtmlService` is used for the web interface.

## Configuration

-   **Time Zone:** `Asia/Tokyo`
-   **Dependencies:** No external libraries are explicitly listed. The project relies on external content from `jsrun.it`.

## Deployments

The project is deployed as a web application.
