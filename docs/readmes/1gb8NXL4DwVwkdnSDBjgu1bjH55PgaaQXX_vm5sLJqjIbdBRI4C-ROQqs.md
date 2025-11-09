# Bookmark Spreadsheet

## Overview

The "Bookmark Spreadsheet" project is a Google Apps Script web application that provides a user-friendly interface for managing and viewing content from Google Spreadsheets. It enables users to search for spreadsheets by name, select a specific spreadsheet, and then browse its various sheets and their data. The application saves user selections using `PropertiesService` and caches search results with `CacheService` for improved performance.

## Functionality

This web application offers a range of features for interacting with Google Spreadsheets:

### Core Features

-   **Spreadsheet Search:** Users can search for Google Spreadsheets by providing a name query. The search results are cached to speed up subsequent searches.
-   **Spreadsheet Selection and Saving:** Users can select a spreadsheet, and its ID is saved in `UserProperties` for persistence across sessions.
-   **Sheet Information Retrieval:** The application can fetch detailed information about all sheets within a selected spreadsheet, including sheet names, column counts, row counts, and header rows.
-   **Sheet Content Display:** It can retrieve and display the content of the first sheet of a selected spreadsheet, presenting it as an array of objects where each object represents a row and uses header names as keys.
-   **Web Application Interface:** The `doGet` function serves an HTML-based user interface, allowing users to interact with the application through their web browser. It supports routing to different pages like `index.html` (main viewer) and `settings.html`.
-   **URL Retrieval:** The `getWebAppUrl` function provides the base URL of the deployed web application.

### Code Examples

#### `Code.js`

```javascript
/**
 * Google Driveからスプレッドシートを名前で検索し、UserCacheにキャッシュします。
 * @param {string} nameQuery 検索するスプレッドシート名の一部
 * @returns {Array<Object>} IDと名前を持つスプレッドシートのリスト
 */
function searchSpreadsheetsByName(nameQuery) {
  const cache = CacheService.getUserCache();
  const cacheKey = 'spreadsheet_search_' + nameQuery.toLowerCase();
  const cachedResult = cache.get(cacheKey);

  if (cachedResult != null) {
    console.log('Cache hit for query: ' + nameQuery);
    return JSON.parse(cachedResult);
  }

  console.log('Cache miss for query: ' + nameQuery + '. Performing search...');
  const files = DriveApp.getFilesByType(MimeType.GOOGLE_SHEETS);
  const spreadsheets = [];
  while (files.hasNext()) {
    const file = files.next();
    if (nameQuery && file.getName().toLowerCase().includes(nameQuery.toLowerCase())) {
      spreadsheets.push({ id: file.getId(), name: file.getName() });
    }
  }

  cache.put(cacheKey, JSON.stringify(spreadsheets), 60 * 10);

  return spreadsheets;
}

/**
 * 指定されたスプレッドシートの最初のシートからコンテンツを取得します。
 * 最初の行をヘッダとして扱い、残りの行をオブジェクトの配列として返します。
 * @param {string} spreadsheetId コンテンツ取得対象のスプレッドシートID
 * @returns {Object} シート名、ヘッダ、コンテンツ（オブジェクトの配列）を含むオブジェクト。エラーの場合はerrorプロパティを持つ。
 */
function getSheetContent(spreadsheetId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheets()[0]; // 最初のシートを対象
    if (!sheet) {
      return { error: 'スプレッドシートにシートが存在しません。', sheetName: null };
    }

    const sheetName = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    if (lastRow < 2 || lastColumn === 0) { // ヘッダ行のみ、またはデータがない場合
      return { sheetName: sheetName, headers: [], content: [] };
    }

    const allValues = sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
    const headers = allValues[0];
    const dataRows = allValues.slice(1); // ヘッダ行を除外

    const content = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header.trim() !== '') {
          obj[header.trim()] = row[index];
        }
      });
      return obj;
    });

    return { sheetName: sheetName, headers: headers.filter(h => h.trim() !== ''), content: content };
  } catch (e) {
    return { error: 'コンテンツの取得に失敗しました。指定されたスプレッドシートが見つからないか、アクセス権がありません。詳細: ' + e.message, sheetName: null };
  }
}
```

#### `doGet.js`

```javascript
function doGet(e) {
  // e.pathInfo でデプロイURLの末尾以降のパスを取得します。
  // 例： .../exec/settings というURLでアクセスされた場合、e.pathInfo は "settings" という文字列になります。
  if (e.pathInfo === 'settings') {
    // パスが 'settings' と一致する場合、settings.html を読み込んで返します。
    return HtmlService.createTemplateFromFile('settings')
      .evaluate()
      .setTitle('Settings'); // 必要に応じてタイトルを変更してください。
  }

  // ルートURL (.../exec/) へのアクセスや、上記条件に一致しないパスの場合は、
  // デフォルトで index.html を読み込んで返します。
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Spreadsheet Viewer');
}
```

## Permissions

The `appsscript.json` file indicates that this project runs as a web application, executing as the user who deployed it, and is accessible by anyone. It does not have any explicit library dependencies.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}
```

## Deployments

The project has three deployments:

-   **ID (HEAD):** `AKfycby_xIfclBR_hh62wHREuBAPX9I6LdH0Kjujc58G_DI3`
    -   **URL:** `https://script.google.com/macros/s/AKfycby_xIfclBR_hh62wHREuBAPX9I6LdH0Kjujc58G_DI3/exec`
-   **ID (Version 2 - 公開用):** `AKfycbzG1T0CCGAZeRXgqjGnRvn6kf01CawumQ2CoOghPQPmPKMGyytN098yvC1Yd10I0kbAqA`
    -   **URL:** `https://script.google.com/macros/s/AKfycbzG1T0CCGAZeRXgqjGnRvn6kf01CawumQ2CoOghPQPmPKMGyytN098yvC1Yd10I0kbAqA/exec`
-   **ID (Version 1 - プレビュー用):** `AKfycbzSsjc2zq4wx3LgfbYVTEMEInTvAzpQjmATklah0_gAsvfRtX2U7Hy1_OQqH4fQ9v9U`
    -   **URL:** `https://script.google.com/macros/s/AKfycbzSsjc2zq4wx3LgfbYVTEMEInTvAzpQjmATklah0_gAsvfRtX2U7Hy1_OQqH4fQ9v9U/exec`
