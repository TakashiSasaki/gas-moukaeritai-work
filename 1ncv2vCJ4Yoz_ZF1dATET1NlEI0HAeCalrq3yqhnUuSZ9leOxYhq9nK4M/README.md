# Project: 1ncv2vCJ4Yoz_ZF1dATET1NlEI0HAeCalrq3yqhnUuSZ9leOxYhq9nK4M

## Project Overview and Purpose

This Google Apps Script project is a "DNS Record Extractor" that leverages the Gemini API to extract DNS records from various sources, including image screenshots of DNS management screens and raw text data (like BIND zone files). It provides a web-based user interface for uploading files or pasting text, processing them with the Gemini API, and then displaying the extracted DNS records in a structured table. Additionally, it integrates with a "PubCache" library for saving and restoring extraction results and offers functionality to save the extracted records to a Google Spreadsheet.

## Core Functionality

### `Code.js`

This script contains server-side functions for interacting with the PubCache library and fetching data from external endpoints.

*   **`saveDataToCache(key, value)`**: Saves a key-value pair to the PubCache library. It expects the key to meet PubCache's specifications (e.g., minimum 43 characters).
*   **`getEndpointUrl(key)`**: Retrieves an API endpoint URL associated with a given key from PubCache.
*   **`fetchFromEndpoint(url)`**: Fetches content from a specified URL, following redirects, and returns the response text. This is used to retrieve data previously saved to PubCache via its endpoint.

```javascript
/**
 * [Web App用] 指定されたキーと値のペアをPubCacheライブラリを使用して保存します。
 * @param {string} key 保存するキー。PubCacheの仕様（43文字以上）を満たす必要があります。
 * @param {string} value 保存する値（JSON文字列など）。
 * @return {string} 成功メッセージ。
 */
function saveDataToCache(key, value) {
  try {
    PubCache.put(key, value);
    Logger.log(`[PubCache] Saved data with key: ${key}`);
    return `Successfully saved data to cache.`;
  } catch (e) {
    Logger.log(`[PubCache ERROR] ${e.stack}`);
    throw new Error(`Server-side cache error: ${e.message}`);
  }
}

/**
 * [Web App用] PubCacheライブラリを使用して指定されたキーのAPIエンドポイントURLを取得します。
 * @param {string} key URLを取得するためのキー。
 * @return {string|null} エンドポイントURL。キーが無効な場合はnull。
 */
function getEndpointUrl(key) {
    return PubCache.getEndpoint(key);
}

/**
 * [Web App用] 指定されたエンドポイントURLからコンテンツを取得します。
 * リダイレクトを追跡し、最終的なコンテンツを返します。
 * @param {string} url 取得するURL。
 * @return {string} 取得したコンテンツのテキスト。
 */
function fetchFromEndpoint(url) {
  try {
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL provided.');
    }
    const options = {
      'method' : 'GET',
      'followRedirects' : true,
      'muteHttpExceptions': true
    };
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 200) {
      Logger.log(`[Fetch] Successfully fetched content from ${url}`);
      return response.getContentText();
    } else {
      throw new Error(`Failed to fetch from endpoint. Status code: ${responseCode}`);
    }
  } catch (e) {
    Logger.log(`[Fetch ERROR] ${e.stack}`);
    throw new Error(`Server-side fetch error: ${e.message}`);
  }
}
```

### `gemini.js`

This script contains the core logic for interacting with the Gemini API to extract DNS records.

*   **`extractDnsRecordsFromImages(arrayOfBase64Data, arrayOfMimeTypes, arrayOfFileNames)`**: Processes an array of base64 encoded image data. It uploads these images to the Gemini API, constructs a prompt for image analysis, and calls `callGeminiAPI` to get the extracted DNS records. It includes locking mechanisms and file cleanup.
*   **`extractDnsRecordsFromText(textContent)`**: Processes raw text content. It constructs a prompt specifically for text analysis and calls `callGeminiAPI` to extract DNS records.
*   **`callGeminiAPI(parts)`**: A general function to make requests to the Gemini API. It handles API key authentication, request formatting, and parsing the JSON response.
*   **`getPromptForImage()`**: Returns the specific prompt text used for instructing the Gemini API to extract DNS records from images.
*   **`getPromptForText()`**: Returns the specific prompt text used for instructing the Gemini API to extract DNS records from text.
*   **`deleteGeminiFile(fileName)`**: Deletes a file previously uploaded to the Gemini API.

```javascript
/**
 * [Web App用] 複数の画像ファイルからDNSレコードを抽出します。
 * @param {string[]} arrayOfBase64Data 画像ファイルのData URLの配列。
 * @param {string[]} arrayOfMimeTypes 画像のMIMEタイプの配列。
 * @param {string[]} arrayOfFileNames 元のファイル名の配列。
 * @return {string} 抽出されたDNSレコードのJSON文字列。
 */
function extractDnsRecordsFromImages(arrayOfBase64Data, arrayOfMimeTypes, arrayOfFileNames) {
  // ... (implementation)
}

/**
 * [Web App用] テキストデータからDNSレコードを抽出します。
 * @param {string} textContent DNSレコード情報を含むテキスト。
 * @return {string} 抽出されたDNSレコードのJSON文字列。
 */
function extractDnsRecordsFromText(textContent) {
  // ... (implementation)
}

/**
 * Gemini APIを呼び出す共通関数。
 * @param {Array<Object>} parts APIに送信するparts配列。
 * @return {string} APIから返されたテキストコンテンツ。
 */
function callGeminiAPI(parts) {
  // ... (implementation)
}
```

### `spreadsheet.gs.js` and `spreadsheet.js`

These files (which appear to be duplicates, with `spreadsheet.js` commented out) handle saving extracted DNS records to a Google Spreadsheet.

*   **`saveRecordsToSheet(records)`**: Saves an array of DNS record objects to a Google Spreadsheet. It uses `LockService` to prevent concurrent writes, creates a new sheet with a timestamp for each save, and also maintains an up-to-date sheet named 'new'.
*   **`getOrCreateSpreadsheet()`**: Retrieves the ID of the target spreadsheet from script properties or creates a new one if it doesn't exist, storing its ID in script properties.

```javascript
/**
 * [Web App用] レコードをGoogleスプレッドシートに保存します。
 * スクリプト全体で同時に1つのプロセスのみ実行されるようにLockServiceで排他制御を行います。
 * @param {object[]} records 保存するDNSレコードの配列。
 * @return {string} 保存先のスプレッドシートのURL。
 */
function saveRecordsToSheet(records) {
  // ... (implementation)
}

/**
 * スクリプトプロパティからIDを取得してスプレッドシートを開くか、
 * 存在しない場合は新しく作成します。
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet} スプレッドシートオブジェクト。
 */
function getOrCreateSpreadsheet() {
  // ... (implementation)
}
```

### `doGet.js`

This is the entry point for the web application, responsible for serving the user interface.

*   **`doGet(e)`**: Processes HTTP GET requests to the web app. It uses `HtmlService.createTemplateFromFile('index')` to render `index.html`, allowing for server-side templating. It sets the title and viewport meta tag for the HTML output.

```javascript
/**
 * WebアプリケーションへのHTTP GETリクエストを処理します。
 *
 * @param {Object} e GETリクエストのイベントパラメータ。
 * @return {HtmlOutput} HTMLサービスの出力。
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  const htmlOutput = template.evaluate();
  htmlOutput
    .setTitle('DNS Record Extractor')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  return htmlOutput;
}
```

## Web Interface

The project's web interface is defined in `index.html`. It provides a modern, responsive design for users to interact with the DNS record extraction functionality.

### `index.html`

This HTML file presents the main user interface:

*   **Sections for Extraction:**
    *   "Extract from Image": A drag-and-drop zone for image files (PNG, JPEG, WebP) and text files (.txt, .zone).
    *   "Extract from Text": A textarea for pasting or typing DNS record text.
*   **Action Buttons:** "Extract from Files / Text" to initiate the extraction and "Clear All" to reset the inputs.
*   **Status Display:** A dedicated area (`#status`) to show processing messages, errors, and success notifications.
*   **Result Display:** A table (`#result-container`) to show the extracted DNS records.
*   **PubCache Integration:** A section (`#pubcache-section`) for saving and restoring results using a PubCache key. It allows generating new keys, selecting from a history, and copying endpoint URLs.
*   **Export Controls:** Buttons to download and copy extracted records in CSV and JSON formats.
*   **Client-side Logic:** Extensive JavaScript handles UI interactions, file processing (reading files, categorizing), clipboard operations, API calls to the Google Apps Script backend (`google.script.run`), and dynamic updating of the results table and status. It also manages a history of PubCache keys in `localStorage`.

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Dependencies:**
    *   **Libraries:**
        *   `PubCache` (ID: `18adAHG43To87g8tgWJ0KwVg9gpE09gLTm9Fogw2R7YK28Gl_NG9hODlc`, Version: `0`, Development Mode: `true`) - This indicates a dependency on an external Google Apps Script library for caching.
*   **Web App Access:** `ANYONE_ANONYMOUS` - The web application can be accessed by anyone, even without a Google account.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app. This is crucial for `UrlFetchApp` calls and `DriveApp` operations (if any were used directly, though here it's for Gemini API interaction).

## Configuration

*   **`GEMINI_API_KEY`**: The Gemini API key must be set as a script property (`PropertiesService.getScriptProperties()`) for the `gemini.js` script to function.
*   **`SPREADSHEET_ID`**: The ID of the Google Spreadsheet used for saving extracted records is stored as a script property. If not found, a new spreadsheet is created.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbxwckHTK_S3CymGqT1t5pHHlEuTJ7caa0LCbJQhfWM`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbxwckHTK_S3CymGqT1t5pHHlEuTJ7caa0LCbJQhfWM/exec`

*   **Deployment ID:** `AKfycbwV3dOARMexlmsPpe_heXOfDbKz7NqFaLDV-EzSydMpgyx34EOxmFUzzHPduwLm_KSi`
    *   **Target Version:** `5`
    *   **Description:** `release v5`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbwV3dOARMexlmsPpe_heXOfDbKz7NqFaLDV-EzSydMpgyx34EOxmFUzzHPduwLm_KSi/exec`
