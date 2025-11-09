# Project: JavascriptProxy

## Project Overview and Purpose

This Google Apps Script project, "JavascriptProxy," acts as a proxy service for JavaScript files hosted on GitHub (or other raw content URLs). Its primary purpose is to serve these raw JavaScript files with the correct `Content-Type: text/javascript` MIME type, which is often missing when directly linking to raw GitHub content. This allows developers to easily include external JavaScript libraries hosted on GitHub in their web projects without issues related to MIME type mismatches. The service caches fetched scripts for improved performance.

## Functionality

The project provides a web application that dynamically fetches and serves JavaScript files.

### Core Features:

-   **`doGet(e)`:**
    -   This is the main entry point for the web application.
    -   It inspects the request parameters (`e.parameters`) to determine which script to fetch.
    -   If `marked` is in the parameters, it fetches `marked.min.js` from `https://raw.githubusercontent.com/chjj/marked/master/marked.min.js`.
    -   If `CsvParser` is in the parameters, it fetches `require.gs` from `https://raw.githubusercontent.com/TakashiSasaki/csvParser/gas/require.gs`.
    -   Fetched scripts are cached in `CacheService.getScriptCache()` for up to 6 hours (21600 seconds) to reduce redundant external requests.
    -   The fetched script content is returned with `ContentService.MimeType.JAVASCRIPT`.
    -   If no specific script parameter is found, it serves the `index.html` template, which lists available scripts and usage instructions.

### Client-Side (`index.html`):

The `index.html` provides information about the service:

-   **Explanation:** Explains why the service is needed (GitHub raw content often has `text/plain` MIME type).
-   **Usage Example:** Provides a `<script>` tag example demonstrating how to include a script using this proxy.
-   **Available Scripts:** Lists the script names (e.g., "marked", "CsvParser") and their corresponding source URLs that this proxy can serve.
-   **Author Information:** Includes a link to the author's Twitter profile.

## Web Interface

The project provides a simple web interface (`index.html`) that explains the purpose of the service, provides instructions on how to use it, and lists the JavaScript libraries it can proxy.

## Permissions

The `appsscript.json` file specifies:
-   **Execution:** `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access:** `ANYONE_ANONYMOUS` (the web app is accessible by anyone, even anonymous users).
-   **Google Services:** Requires access to `UrlFetchApp` to fetch external script content and `CacheService` for caching. `HtmlService` is used for the web interface.

## Configuration

-   **Time Zone:** `Asia/Tokyo`
-   **Dependencies:** No external libraries are explicitly listed in `appsscript.json`. The script dynamically fetches external JavaScript files.

## Deployments

The project is deployed as a web application. The example URL in `index.html` suggests a deployment ID like `AKfycbwu69ThF572u9fRQmN0CC8P6g0ymZ1gUtQWQRleNIBJSF1IKms`.
