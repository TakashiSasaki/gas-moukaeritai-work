# Project: Document Saver

This Google Apps Script project is a sophisticated web application called "コンテンツパネルアップローダー" (Content Panel Uploader). It functions as a rich content editor that allows users to build a document from multiple "panels," each containing a title, markdown text, and images. The application leverages the Gemini API to provide AI-powered assistance for generating titles and image captions.

## Overview

The application provides a single-page interface where users can dynamically add, reorder, and delete content panels. It is designed to streamline the process of creating structured documents by automatically generating relevant metadata. All work is automatically saved to the browser's local storage, allowing users to persist their session and resume editing later.

## Functionality

The project's logic is split between the client-side interface (`index.html`) and server-side Google Apps Script functions (`doGet.js`, `gemini.js`).

### Server-Side (`gemini.js`)

The core AI functionality resides in `gemini.js`. This script communicates with the Google Gemini API to generate content.

-   **API Key Management**: The script retrieves a `GEMINI_API_KEY` from the project's `PropertiesService`.
-   **`generateCaptionForImage(base64ImageData, mimeType, useCache)`**: This function takes a Base64-encoded image and its MIME type, sends it to the `gemini-2.0-flash-lite` model, and requests a short, descriptive caption.
-   **`generateTitleFromMarkdown(markdownText, useCache)`**: This function sends markdown text to the Gemini API to generate a concise title for the content panel.
-   **`generateDocumentTitleFromPanels(panelsData, useCache)`**: This function aggregates the titles and markdown content from all panels, sends the combined text to the Gemini API, and generates a comprehensive title for the entire document.
-   **Caching**: All three Gemini functions utilize `CacheService` to cache the results of API calls for 6 hours, reducing redundant API usage and improving performance. A hash of the content (image or text) is used as part of the cache key.

```javascript
// Excerpt from gemini.js
function generateTitleFromMarkdown(markdownText, useCache = false) {
  if (!API_KEY) {
    return "エラー: APIキーが設定されていません。";
  }
  if (!markdownText || markdownText.trim() === "") {
    return "エラー: マークダウンテキストが空です。";
  }

  const cache = CacheService.getScriptCache();
  const markdownHash = computeHash_(markdownText);
  const cacheKey = `panelTitle_${markdownHash}`;

  if (useCache) {
    const cachedTitle = cache.get(cacheKey);
    if (cachedTitle) {
      return cachedTitle;
    }
  }
  // ... (API call logic)
}
```

### Client-Side (`index.html`)

The `index.html` file implements a dynamic and interactive single-page application.

-   **Dynamic Panel Management**: Users can add new content panels, delete existing ones, and reorder them using drag-and-drop (via the SortableJS library).
-   **Rich Content Editing**: Each panel includes a textarea for markdown input and a drag-and-drop area for uploading images.
-   **AI Integration**:
    -   When markdown is pasted or entered, the app can automatically trigger `generateTitleFromMarkdown` to populate the panel's title field.
    -   When images are dropped, `generateCaptionForImage` is called to automatically generate a caption for each image.
    -   A dedicated button allows the user to trigger `generateDocumentTitleFromPanels` to create a title for the entire document based on all panel content.
-   **Local Storage Persistence**: The application state, including the document title, all panel content (titles, markdown, and Base64-encoded images), is saved to the browser's `localStorage`. This ensures that users do not lose their work between sessions.
-   **Markdown Preview**: A modal window allows users to preview the rendered HTML of their markdown content using the `marked.js` library.

## Web Interface

The project serves a single, feature-rich web page (`index.html`) styled with CSS from `style.html`. The interface is designed to be intuitive for content creation, with clear sections for the overall document title and individual content panels.

-   **`doGet(e)`**: The entry point for the web app. It creates the HTML template from `index.html`, evaluates it, and serves it to the user. It also configures the appropriate `XFrameOptionsMode` and `SandboxMode` to allow embedding and enhance security.

## Permissions

The web application is configured with the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed it).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including users not logged into a Google account).
-   **Google Services**: The script requires permissions for:
    -   `UrlFetchApp` to make requests to the Google Gemini API.
    -   `PropertiesService` to access the stored `GEMINI_API_KEY`.
    -   `CacheService` to cache API responses.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **API Key**: A valid Google Gemini API key must be stored as a script property with the key `GEMINI_API_KEY` for the AI features to function.

## Deployments

The project has two listed deployments:

-   **Deployment 1**:
    -   **ID**: `AKfycbylC8hfXcdxyd5SL8fzR2DudERRKhizwqqomsM5aG2B`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbylC8hfXcdxyd5SL8fzR2DudERRKhizwqqomsM5aG2B/exec)
-   **Deployment 2 (Version 1)**:
    -   **ID**: `AKfycbzM0oF4LEvKTbg7inoVB2hdc3aHI_v63zc7CAFikyLPVM6w2aaJ0nS0MQf6beDS03wDYg`
    -   **Target**: `1`
    -   **Description**: `UIとりあえずできたよ` (UI is ready for now)
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbzM0oF4LEvKTbg7inoVB2hdc3aHI_v63zc7CAFikyLPVM6w2aaJ0nS0MQf6beDS03wDYg/exec)
