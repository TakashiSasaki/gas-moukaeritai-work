# Project: Google Sheets Object Manager Web App

This Google Apps Script project is a web application that provides an object-oriented interface for managing data within Google Sheets. It allows users to find spreadsheets and sheets, and perform CRUD-like (Create, Read, Update) operations on sheet data by treating each row as a JavaScript object.

## Overview

The primary purpose of this project is to simplify interactions with Google Sheets by abstracting away the row/column paradigm into a more developer-friendly object model. It offers a web-based user interface for managing and viewing sheet data, making it easier to work with structured information.

## Functionality

The core functionality is implemented across `doGet.js`, `index.html`, `findSheet.js`, `findSpreadsheet.js`, `getObjects.js`, and `putObjects.js`.

### Core Features

-   **`doGet()`**: Serves as the entry point for the web application, rendering the `index.html` file.
-   **`findSheet(uuid)`**: Retrieves a Google Sheet by its UUID. If a sheet with the given UUID is not found in the spreadsheet (whose ID is stored in user properties under that UUID), it creates a new sheet with that UUID as its name.
-   **`findSpreadsheet(title, uuid, createIfNotFound)`**: Searches for a Google Spreadsheet by its `title`. If `createIfNotFound` is true and no spreadsheet is found, it creates a new one. It stores the spreadsheet's ID in user properties using the provided `uuid` as the key. This function uses `LockService` to prevent race conditions.
-   **`getObjects(sheet, criteriaObject, partialMatch)`**: Reads data from a specified `sheet` and returns an array of JavaScript objects. Each object represents a row, with keys corresponding to column headers. It filters rows based on `criteriaObject` (supporting both exact and partial matches) and includes a `_rowIndex` property in each object to track the original row number.
-   **`putObjects(sheet, recordsArray)`**: Writes an array of JavaScript objects (`recordsArray`) to a specified `sheet`.
    -   If the sheet is empty, it uses the keys from the first object to create a header row.
    -   If an object in `recordsArray` contains a `_rowIndex` property, it updates the existing row at that index.
    -   Otherwise, it appends new rows to the sheet.
    -   It dynamically adds new columns if an object contains keys not present in the existing headers. This function also uses `LockService`.

### Code Examples

#### `doGet.js`

```javascript
//filename: doGet.gs

function doGet(e) {
  // パラメータ無しで呼び出された場合、index.htmlを表示
  return HtmlService.createHtmlOutputFromFile('index');
}
```

#### `findSheet.js`

```javascript
//filename: findSheet.gs

function findSheet(uuid) {
  try {
    // ユーザープロパティからスプレッドシートIDを取得
    const spreadsheetId = PropertiesService.getUserProperties().getProperty(uuid);
    
    if (!spreadsheetId) {
      throw new Error("No spreadsheet found for the given UUID in user properties.");
    }

    // スプレッドシートを開く
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // UUIDをシート名としてシートを取得
    let sheet = spreadsheet.getSheetByName(uuid);
    
    // シートが見つからなければ新規作成
    if (!sheet) {
      Logger.log("Sheet with UUID " + uuid + " not found. Creating a new sheet.");
      sheet = spreadsheet.insertSheet(uuid);
    }
    
    return sheet;
    
  } catch (e) {
    // エラー発生時の処理
    Logger.log("Error: " + e.message);
    throw new Error("Failed to retrieve or create the sheet: " + e.message);
  }
}
```

#### `findSpreadsheet.js`

```javascript
//filename: findSpreadsheet.gs

function findSpreadsheet(title, uuid, createIfNotFound = false) {
  // ユーザー単位でのロックを取得
  var lock = LockService.getUserLock();
  lock.waitLock(30000);  // 最大30秒間ロックを待つ

  try {
    var files = DriveApp.getFilesByName(title);  // 指定されたタイトルのファイルを検索
    var fileCount = 0;
    var spreadsheet;

    while (files.hasNext()) {
      var file = files.next();
      if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        fileCount++;
        spreadsheet = SpreadsheetApp.open(file);  // スプレッドシートオブジェクトを取得
      }
    }

    // 一つだけ見つかった場合はそのスプレッドシートを返す
    if (fileCount === 1) {
      if (uuid) {
        var userProperties = PropertiesService.getUserProperties();
        userProperties.setProperty(uuid, spreadsheet.getId());  // スプレッドシートのIDを格納
      }
      return spreadsheet;
    } else if (fileCount === 0 && createIfNotFound) {
      // スプレッドシートが見つからなかった場合、新規作成
      spreadsheet = SpreadsheetApp.create(title);
      if (uuid) {
        var userProperties = PropertiesService.getUserProperties();
        userProperties.setProperty(uuid, spreadsheet.getId());  // 新規作成したスプレッドシートIDを格納
      }
      Logger.log("New Spreadsheet created with title: " + title);
      return spreadsheet;
    } else if (fileCount === 0) {
      throw new Error("No spreadsheet found with the title: " + title);
    } else {
      throw new Error("Multiple spreadsheets found with the title: " + title);
    }

  } finally {
    // ロックを解放
    lock.releaseLock();
  }
}
```

#### `getObjects.js`

```javascript
//filename: getObjects.gs

function getObjects(sheet, criteriaObject, partialMatch = false) {
  var data = sheet.getDataRange().getValues();
  var headers = data[0];  // ヘッダ行を取得
  
  // _rowIndexというカラムがヘッダに存在する場合はエラーをスロー
  if (headers.indexOf('_rowIndex') !== -1) {
    throw new Error('Invalid sheet: _rowIndex is used as a column name.');
  }

  var matchingRows = [];

  // データ部分（2行目以降）をループ
  for (var i = 1; i < data.length; i++) {
    var isMatch = true;
    var rowObject = { _rowIndex: i + 1 };  // 行番号を _rowIndex として格納

    // criteriaObject内の各プロパティ（カラム名）と値を確認
    for (var key in criteriaObject) {
      if (criteriaObject.hasOwnProperty(key)) {
        var columnIndex = headers.indexOf(key);  // カラム名のインデックスを取得

        if (columnIndex == -1) {
          throw new Error('Column not found: ' + key);
        }

        var cellValue = data[i][columnIndex];

        if (partialMatch) {
          // 部分一致（文字列が含まれているかを確認）
          if (cellValue.toString().indexOf(criteriaObject[key]) === -1) {
            isMatch = false;
            break;
          }
        } else {
          // 完全一致
          if (cellValue != criteriaObject[key]) {
            isMatch = false;
            break;
          }
        }
      }
    }

    if (isMatch) {
      // ヘッダ行のカラム名に基づいてオブジェクトを作成
      for (var j = 0; j < headers.length; j++) {
        rowObject[headers[j]] = data[i][j];
      }
      matchingRows.push(rowObject);  // マッチした行のデータをオブジェクト形式で追加
    }
  }

  return matchingRows;  // マッチしたデータをオブジェクト形式で返す
}
```

#### `putObjects.js`

```javascript
//filename: putObjects.gs

function putObjects(sheet, recordsArray) {
  // ドキュメントレベルのロックを取得
  var lock = LockService.getUserLock();
  lock.waitLock(30000);  // 最大30秒間ロックを待つ

  try {
    // シートが空かどうかを確認
    if (sheet.getLastRow() === 0) {
      // 最初のオブジェクトのキーを使用してヘッダを設定
      var firstRecord = recordsArray[0];
      var headers = Object.keys(firstRecord).filter(function(key) { return key !== '_rowIndex'; });
      sheet.appendRow(headers);  // ヘッダ行を追加
    }

    // ヘッダ行を取得
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // _rowIndexがヘッダに存在する場合はエラーをスロー
    if (headers.indexOf('_rowIndex') !== -1) {
      throw new Error("_rowIndex is a reserved property and cannot be used as a column name.");
    }

    // 各レコード（オブジェクト）を処理
    recordsArray.forEach(function(recordObject) {
      var newRow = [];

      // 既存のヘッダに基づいてデータを設定
      for (var i = 0; i < headers.length; i++) {
        var columnName = headers[i];
        if (recordObject.hasOwnProperty(columnName)) {
          newRow.push(recordObject[columnName]);
        } else {
          newRow.push('');  // 該当するデータがない場合は空にする
        }
      }

      // オブジェクト内でヘッダに存在しないカラムがあれば、それを追加
      for (var key in recordObject) {
        if (headers.indexOf(key) === -1 && key !== '_rowIndex') {
          headers.push(key);  // 新しいカラムを追加
          newRow.push(recordObject[key]);  // 新しいカラムの値を設定
        }
      }

      // ヘッダ行を更新
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      // _rowIndex プロパティが存在する場合、その行を更新
      if (recordObject.hasOwnProperty('_rowIndex')) {
        var rowIndex = recordObject['_rowIndex'];
        if (rowIndex > 1 && rowIndex <= sheet.getLastRow()) {
          sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);
        } else {
          throw new Error('Invalid _rowIndex: ' + rowIndex);
        }
      } else {
        // 新しい行をシートに追加
        sheet.appendRow(newRow);
      }
    });

  } finally {
    // ロックを解放
    lock.releaseLock();
  }
}
```

## Web Interface (`index.html`)

The `index.html` file provides a simple web interface:

-   **Sheet List Display**: On page load, it calls the server-side `listSheets()` function (not provided in the snippets but implied) and renders the returned list of sheets. Each sheet is displayed with its UUID and spreadsheet title.
-   **Client-side Scripting**: Contains JavaScript to handle the loading and rendering of the sheet list using `google.script.run`.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `MYSELF` (the web app is accessible only by the user who deployed it). This is appropriate for an application managing personal Google Sheets data.
-   **Google Services**: Implicitly uses `SpreadsheetApp` for sheet manipulation, `DriveApp` for finding spreadsheets, `PropertiesService` for storing user properties, `CacheService` (implied for `listSheets`), and `LockService` for concurrency control.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`UUID`**: Test functions (`testFindSheet`, `testFindSpreadsheet`, `testPutObjects`, `testGetObjects`) suggest that a `UUID` is stored in `PropertiesService.getScriptProperties()` for identifying specific spreadsheets or sheets.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
