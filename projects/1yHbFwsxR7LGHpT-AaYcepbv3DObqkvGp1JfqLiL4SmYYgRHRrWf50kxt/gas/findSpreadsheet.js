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

function testFindSpreadsheet() {
  const uuid = PropertiesService.getScriptProperties().getProperty("UUID");
  try {
    // スプレッドシートのタイトルを指定して検索
    // findSpreadsheet関数を実行
    var spreadsheet = findSpreadsheet(uuid, uuid, true);

    // スプレッドシートが見つかった場合、そのURLをログに表示
    Logger.log('Spreadsheet found: ' + spreadsheet.getUrl());

  } catch (e) {
    // エラーが発生した場合、エラーメッセージをログに表示
    Logger.log('Error in testFindSpreadsheet: ' + e.message);
  }
}
