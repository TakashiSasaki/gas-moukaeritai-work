# Project: IME Dictionary Aggregator

This Google Apps Script project is a web application designed to aggregate and process multiple IME (Input Method Editor) dictionaries stored in Google Drive. It identifies specific dictionary files, extracts their content, provides statistics, and integrates with an external `ImeDictionary` library to generate structured IME dictionary entries.

## Overview

The primary goal of this project is to streamline the management of IME user dictionaries. It allows users to gather dictionary data from various sources within their Google Drive, analyze it, and prepare it for use or further processing, potentially leveraging AI for dictionary generation.

## Functionality

The project's core functionality is implemented across `Code.js`, `doGenerateImeDictionary.js`, and the web interface (`index.html`). It relies on the `ImeDictionary` library for AI-powered dictionary generation.

### Core Features

-   **`doGet()`**: The entry point for the web application, which serves the `index.html` file. It sets the page title to "Aggregate IME dictionaries in Google Drive".
-   **`getFileList()`**: Searches the user's Google Drive for two types of files:
    -   "PersonalDictionary.zip" files.
    -   Plain text files named "output<number>.txt" (e.g., `output1.txt`, `output123.txt`).
    For each found file, it extracts metadata (name, ID, URL, creation date, parent folder, size) and caches this information for 10 minutes. The overall file list is also cached.
-   **`processFiles()`**: Reads and processes the content of the files identified by `getFileList()`.
    -   For "PersonalDictionary.zip", it unzips the file and reads the content of "dictionary.txt" using UTF-8 encoding.
    -   For "output<number>.txt" files, it reads their content using UTF-16 encoding.
    -   For each processed file, it calculates the byte count, total line count, and the count of lines containing a hard tab character. The text content and byte count are cached to avoid redundant processing.
-   **`doGenerateImeDictionary(userInput, apiType)`**: A server-side wrapper function that utilizes the external `ImeDictionary` library. It takes user input (TSV/CSV/JSON string) and an `apiType` ("gemma" or "gemini") to call the corresponding function in the `ImeDictionary` library (e.g., `ImeDictionary.gemma(userInput)` or `ImeDictionary.gemini(userInput)`). It returns an array of parsed dictionary entries.

### Code Examples

#### `Code.js` (Excerpt)

```javascript
function doGet() {
  // HTMLテンプレートをそのまま返す（ファイル一覧は非同期で取得）
  var template = HtmlService.createTemplateFromFile('index');
  const htmlOutput = template.evaluate().setTitle('Aggregate IME dictionaries in Google Drive');
  Logger.log(htmlOutput.getContent());
  return htmlOutput;
}

function getFileList() {
  var overallCache = CacheService.getUserCache();
  var cached = overallCache.get("fileList");
  if (cached) {
    return JSON.parse(cached);
  }
  // ... (file search and metadata extraction logic) ...
  overallCache.put("fileList", JSON.stringify(files), 600); // Cache for 10 minutes
  return files;
}

function processFiles() {
  // ... (file processing, content reading, and statistics calculation logic) ...
}
```

#### `doGenerateImeDictionary.js`

```javascript
/**
 * Wrapper function for ImeDictionary.gemma or ImeDictionary.gemini.
 *
 * @param {string} userInput - The TSV/CSV/JSON input string.
 * @param {string} apiType - 'gemma' or 'gemini' to select the underlying API.
 * @return {Object[]} Parsed array of dictionary entries.
 * @throws {Error} If structure is missing or JSON parsing fails.
 */
function doGenerateImeDictionary(userInput, apiType) {
  var entries;
  if (apiType === 'gemini') {
    entries = ImeDictionary.gemini(userInput);
  } else {
    entries = ImeDictionary.gemma(userInput);
  }
  if (!Array.isArray(entries)) {
    throw new Error('Expected an array of entries from ' + apiType + ', but got ' + typeof entries);
  }
  return entries;
}
```

## Web Interface (`index.html`)

The `index.html` file provides a multi-stage web interface for users to interact with the dictionary aggregation process:

-   **Stage 1 (File List)**: Displays a table of files found in Google Drive (`PersonalDictionary.zip` and `output<number>.txt`).
-   **Stage 2 (Processing Results)**: Shows the results of processing each file, including byte count, line count, and tab-containing line count. It also displays the sum of tab-containing lines.
-   **Stage 3 (Preview)**: Provides a preview area for the aggregated dictionary content, including a row count.
-   **Stage 4 (Analysis)**: Offers an "Analyze Preview" button and a "Copy Preview JSON" button, along with a section to display analysis results and the raw JSON.
-   **Client-side Scripting**: Uses `google.script.run` to call server-side functions and Google Charts to render interactive tables.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `MYSELF` (the web app is accessible only by the user who deployed it).
-   **Advanced Services**: `Drive API (v3)` is enabled, allowing the script to search and read files from Google Drive.
-   **Libraries**: Depends on the `ImeDictionary` library (Script ID: `1OcQHj6g4a4jpoBpIKeacLAv1j9t-I6vGn2t91zyRqL3MHZC8inEUcpSb`).

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Caching**: Utilizes `CacheService.getUserCache()` for caching file lists, file metadata, and processed file content to improve performance.
-   **Locking**: Employs `LockService.getScriptLock()` to prevent concurrent execution of server-side functions, ensuring data consistency.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
