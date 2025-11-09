# Project: Markdown2Docs with Gemini AI

This Google Apps Script project is a feature-rich web application designed to convert Markdown text into formatted Google Documents. It offers a live preview of the Markdown content, leverages the Google Gemini API for AI-powered document title generation, and provides functionality to save the converted content as a new Google Document.

## Overview

The primary purpose of this project is to streamline the process of creating professional-looking Google Documents from Markdown. It combines the simplicity of Markdown with the advanced capabilities of Google Docs formatting and AI assistance, making it an efficient tool for content creators.

## Functionality

The core functionality is implemented across `Code.gs.js`, `Markdown.js`, `callGeminiAPI.js`, `generateTitleFromMarkdown.js`, `getAppUrl.js`, and the web interface (`index.html`).

### Core Features

-   **`doGet()`**: (in `Code.gs.js`) Serves as the entry point for the web application, rendering the `index.html` file. It sets the page title to "Markdown2Docs" and configures the sandbox mode and viewport.
-   **`convertMarkdownAndCreateDoc(markdown, title)`**: (in `Code.gs.js`) Receives Markdown text and a desired document title from the web interface. It creates a new Google Document with the given title and populates it with the converted Markdown content using `convertMarkdownToGoogleDocExtended()`. It then returns the URL of the newly created document.
-   **`convertMarkdownToGoogleDocExtended(markdown, doc)`**: (in `Markdown.js`) This function is responsible for parsing the Markdown text and applying corresponding formatting to a Google Document object. It supports:
    -   Headings (H1-H6)
    -   Code Blocks (delimited by ```)
    -   Display Math (delimited by `$$`)
    -   Numbered and Unordered Lists
    -   Inline Formatting (bold, italic, inline code, links)
    -   Inline Math (delimited by `$`)
-   **`callGeminiAPI(payload)`**: (in `callGeminiAPI.js`) A generic function to send POST requests to the Google Gemini API (defaulting to `gemma-3-27b-it`). It handles API key authentication and logs the API response.
-   **`generateTitleFromMarkdown(markdown)`**: (in `generateTitleFromMarkdown.js`) Uses the Gemini API to generate a concise and descriptive title from the provided Markdown content. It constructs a specific prompt, calls `callGeminiAPI()`, and extracts the title from the JSON response. It also includes `extractJsonString()` to robustly parse JSON from the API response.
-   **`getAppUrl()`**: (in `getAppUrl.js`) Returns the published URL of the current web application.

### Code Examples

#### `Code.gs.js`

```javascript
/**
 * File: Code.gs
 * Description: Backend script for Markdown2Docs web app.
 */

/**
 * Serves the HTML page to the client.
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Markdown2Docs')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.NATIVE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


/**
 * Receives markdown text and a document title from the web form, creates a new document,
 * converts Markdown content, and returns the document URL.
 */
function convertMarkdownAndCreateDoc(markdown, title) {
  var doc = DocumentApp.create(title);
  convertMarkdownToGoogleDocExtended(markdown, doc);
  return doc.getUrl();
}
```

#### `Markdown.js` (Excerpt)

```javascript
/**
 * Converts Markdown text to a formatted Google Document using the provided document.
 * @param {string} markdown - The Markdown text to be converted.
 * @param {Document} doc - The Google Document object to which the parsed content will be appended.
 */
function convertMarkdownToGoogleDocExtended(markdown, doc) {
  var body = doc.getBody();
  // ... (Markdown parsing and Google Docs formatting logic) ...
}
```

#### `generateTitleFromMarkdown.js` (Excerpt)

```javascript
/**
 * Filename: generateTitleFromMarkdown.gs
 * 
 * Generates a concise title from the Markdown content using Gemma 3 27B (Gemini API).
 *
 * @param {string} markdown - The Markdown text from which to generate a title.
 * @return {string} - The generated title.
 */
function generateTitleFromMarkdown(markdown) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const modelId = 'gemma-3-27b-it';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  // Prepare the prompt by separating the instruction from the content clearly.
  const prompt = `Please read the following Markdown content and generate a concise and descriptive title that accurately reflects its content. ` + 
                 `Output a plain text JSON object only in the format {"title":"..."}.\n\nContent:\n${markdown}`;

  // ... (API call and response parsing logic) ...
}
```

## Web Interface (`index.html`)

The `index.html` file provides a rich and interactive user interface:

-   **Markdown Input**: A `textarea` for users to paste or type their Markdown content. A "Paste Markdown Text" button uses the Clipboard API for convenience.
-   **Title Management**: An input field for the document title. A "Regenerate Title" button triggers AI-powered title generation using Gemini. The title is also auto-generated if left blank when saving.
-   **"Save as New Document" Button**: Calls the server-side `convertMarkdownAndCreateDoc()` function to create a Google Document.
-   **Live Preview**: A dedicated `div` (`#preview`) that dynamically renders the Markdown content as HTML, including support for MathJax to display mathematical expressions.
-   **Document Link Display**: A `div` (`#docLink`) to show the URL of the newly created Google Document.
-   **QR Code**: Displays a QR code for the web app's URL, generated using `QRCode.js`.
-   **Client-side Scripting**: Extensive JavaScript handles user interactions, live preview updates, calls to server-side functions via `google.script.run`, and integrates external libraries like MathJax and QRCode.js.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_ACCESSING` (the script runs with the identity and permissions of the user who is currently accessing the web app).
-   **Access**: `ANYONE` (the web app is accessible by anyone, including anonymous users).
-   **OAuth Scopes**:
    -   `https://www.googleapis.com/auth/script.external_request`: For making external HTTP requests (e.g., to the Gemini API).
    -   `https://www.googleapis.com/auth/script.scriptapp`: For interacting with the script itself (e.g., getting the web app URL).
    -   `https://www.googleapis.com/auth/cloud-platform`: Likely for broader access to Google Cloud services, potentially related to Gemini API.
    -   `https://www.googleapis.com/auth/documents`: For creating and modifying Google Documents.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`GEMINI_API_KEY`**: A Google Gemini API key must be set as a script property (`PropertiesService.getScriptProperties()`) for the AI features (title generation) to function.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.