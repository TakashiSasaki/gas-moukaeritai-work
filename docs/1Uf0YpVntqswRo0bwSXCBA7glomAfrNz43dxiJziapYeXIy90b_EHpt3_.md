# Google Apps Script Project: 1Uf0YpVntqswRo0bwSXCBA7glomAfrNz43dxiJziapYeXIy90b_EHpt3_

## Project Overview
This Google Apps Script project, named "Markdown2Docs", is a web application designed to streamline the process of converting Markdown text into formatted Google Documents. It offers a live preview of the Markdown content, the ability to automatically generate document titles using the Gemini API, and functionality to save the converted content as a new Google Document.

## Functionality

### `Code.gs.js`
This file contains the primary server-side functions for the web application.
-   **`doGet()`**: Serves the `index.html` file as a web application. It sets the page title to "Markdown2Docs", allows embedding in iframes (`ALLOWALL`), and configures the sandbox mode to `NATIVE`.
-   **`convertMarkdownAndCreateDoc(markdown, title)`**: Receives Markdown text and a desired document title. It creates a new Google Document with the given title, converts the Markdown content into the document using `convertMarkdownToGoogleDocExtended`, and returns the URL of the newly created document.

### `Markdown.js`
This file is responsible for the core Markdown parsing and conversion logic to Google Document format.
-   **`convertMarkdownToGoogleDocExtended(markdown, doc)`**: Takes Markdown text and a Google Document object. It processes the Markdown line by line, converting various elements into Google Document formatting:
    -   **Headings**: Lines starting with `#` are converted to corresponding Google Document heading styles (HEADING1 to HEADING6).
    -   **Code Blocks**: Text enclosed in triple backticks (```` ``` ````) is formatted as code with "Courier New" font.
    -   **Display Math**: Lines starting and ending with `$$` are converted to Google Document equations.
    -   **Lists**: Both numbered (`1. `) and unordered (`- ` or `* `) lists are converted to Google Document list items with appropriate glyph types.
    -   **Inline Formatting**: Helper functions `processListItem` and `processInlineFormatting` are used to apply inline styles such as bold (`**text**`), italic (`*text*`), inline code (`` `code` ``), and links (`[text](url)`). Inline math (`$math$`) is also handled.

### `callGeminiAPI.js`
This script handles communication with the Gemini API.
-   **`callGeminiAPI(payload)`**: Sends a POST request to the Gemini API's `generateContent` endpoint. It retrieves the API key from `PropertiesService.getScriptProperties()` and uses a specified `MODEL_ID` (e.g., `gemma-3-27b-it`). It logs the API response.
-   **`testGetTitle()`**: A test function that demonstrates calling the Gemini API to generate a title from a sample text.

### `generateTitleFromMarkdown.js`
This file provides functionality to generate titles for Markdown content using AI.
-   **`generateTitleFromMarkdown(markdown)`**: Takes Markdown text, constructs a prompt for the Gemini API to generate a concise title, and calls `callGeminiAPI`. It then parses the API response to extract the generated title. Includes robust JSON extraction using `extractJsonString`.
-   **`extractJsonString(text)`**: A helper function to extract a valid JSON string from a larger text, useful for parsing AI model responses.
-   **`testGenerateTitleFromMarkdown()`**: A test function to verify the title generation process with sample Markdown.

### `getAppUrl.js`
-   **`getAppUrl()`**: Returns the published URL of the current web application.

## Web Interface (`index.html`)
The `index.html` file provides the user-facing interface for the Markdown2Docs application.
-   **Markdown Input**: A `textarea` (`id="markdownInput"`) for users to paste or type their Markdown content.
-   **Title Input**: An `input` field (`id="docTitle"`) for the document title, which can be manually entered or automatically generated.
-   **Action Buttons**:
    -   **"Paste Markdown Text"**: Uses the Clipboard API to paste content into the Markdown input.
    -   **"Regenerate Title"**: Triggers the `generateTitleFromMarkdown` function to create a title based on the current Markdown.
    -   **"Save as New Document"**: Calls `convertMarkdownAndCreateDoc` to create a Google Document from the Markdown.
-   **Live Preview**: A `div` (`id="preview"`) that dynamically renders the Markdown content as HTML, including support for MathJax to display mathematical expressions.
-   **Document Link Display**: A `div` (`id="docLink"`) to show the URL of the newly created Google Document.
-   **QR Code**: Displays a QR code for the web app's URL, generated using `QRCode.js`.
-   **Client-side Logic**: JavaScript handles user interactions, live preview updates, calls to server-side functions via `google.script.run`, and integration with MathJax and QRCode.js.
-   **External Libraries**: Integrates MathJax for mathematical typesetting and QRCode.js for QR code generation.
-   **Styling**: Includes inline CSS for layout and appearance.

## Permissions
The `appsscript.json` manifest specifies the following web app execution permissions:
-   `webapp.access`: `ANYONE` - This means the web application can be accessed by anyone, including anonymous users.
-   `webapp.executeAs`: `USER_ACCESSING` - The script will execute with the identity and permissions of the user who is currently accessing the web app.

The project requires the following OAuth scopes:
-   `https://www.googleapis.com/auth/script.external_request`: For making external HTTP requests (e.g., to the Gemini API).
-   `https://www.googleapis.com/auth/script.scriptapp`: For interacting with the script itself (e.g., getting the web app URL).
-   `https://www.googleapis.com/auth/cloud-platform`: Likely for broader access to Google Cloud services, potentially related to Gemini API.
-   `https://www.googleapis.com/auth/documents`: For creating and modifying Google Documents.

## Configuration
This project relies on `PropertiesService.getScriptProperties()` to store the `GEMINI_API_KEY`, which is essential for the title generation functionality.

## Deployments
The project has multiple deployments, indicating different versions or stages of the application:

1.  **Deployment 1 (HEAD)**:
    -   **ID**: `AKfycbxd8lYaATVxcLQ2oQYs_37eyiv2bdRI1fE5TIw7Qa4`
    -   **Target**: `HEAD` (Points to the latest saved version of the script).
    -   **Description**: (No specific description provided).
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbxd8lYaATVxcLQ2oQYs_37eyiv2bdRI1fE5TIw7Qa4/exec`

2.  **Deployment 2 (Version 4)**:
    -   **ID**: `AKfycbxkVNMd-fLAOo6nA9j9vhYs2PUvFRKKkEafnaHGZ9QBv6uzTHv9w0s2CuFdHSRJjb2L`
    -   **Target**: `4`
    -   **Description**: "ちょっとスタイルを調整" (Adjusted style a bit)
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbxkVNMd-fLAOo6nA9j9vhYs2PUvFRKKkEafnaHGZ9QBv6uzTHv9w0s2CuFdHSRJjb2L/exec`

3.  **Deployment 3 (Version 5)**:
    -   **ID**: `AKfycbwTrTMc7qFkJ4T80-NbIe-DKzyug2_zp5bzZWUE1CNzeHP1M9ng5Vcb8UpMJnYPJS1Q`
    -   **Target**: `5`
    -   **Description**: "スコープ修正" (Scope correction)
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbwTrTMc7qFkJ4T80-NbIe-DKzyug2_zp5bzZWUE1CNzeHP1M9ng5Vcb8UpMJnYPJS1Q/exec`

4.  **Deployment 4 (Version 2)**:
    -   **ID**: `AKfycbyRvvRp9jc_Inkjchz2BJ4t8vfaTrQUriea6MFqZQ1UJYJ3hBkGGmqqUsuLuZadlD2d`
    -   **Target**: `2`
    -   **Description**: "v1"
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbyRvvRp9jc_Inkjchz2BJ4t8vfaTrQUriea6MFqZQ1UJYJ3hBkGGmqqUsuLuZadlD2d/exec`

5.  **Deployment 5 (Version 1)**:
    -   **ID**: `AKfycbzz_cJXg9ux5PL5jLCo_iRqcbkU1c8ax6T0q4IG1cY0aetHdvGzcMhtDd5zb14x-awQ`
    -   **Target**: `1`
    -   **Description**: (No specific description provided).
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbzz_cJXg9ux5PL5jLCo_iRqcbkU1c8ax6T0q4IG1cY0aetHdvGzcMhtDd5zb14x-awQ/exec`

6.  **Deployment 6 (Version 3)**:
    -   **ID**: `AKfycbxBCoTjY4_xwW8ens1g6p3xWd1JaL2D66Lv_sJc9KVZG0D1gEO5kIaf_0so7GK2VRwf`
    -   **Target**: `3`
    -   **Description**: "QR code"
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbxBCoTjY4_xwW8ens1g6p3xWd1JaL2D66Lv_sJc9KVZG0D1gEO5kIaf_0so7GK2VRwf/exec`
