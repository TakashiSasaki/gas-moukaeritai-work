//filename: listSheets.gs

function listSheets() {
  // ユーザー単位でのロックを取得
  var lock = LockService.getUserLock();
  lock.waitLock(30000);  // 最大30秒間ロックを待つ

  try {
    var userProperties = PropertiesService.getUserProperties();
    var allProperties = userProperties.getProperties();
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var sheetList = [];

    for (var key in allProperties) {
      if (allProperties.hasOwnProperty(key) && uuidRegex.test(key)) {
        var spreadsheetId = allProperties[key];
        try {
          var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
          var title = spreadsheet.getName();  // スプレッドシートのタイトルを取得
          sheetList.push({ uuid: key, spreadsheetId: spreadsheetId, title: title });
        } catch (e) {
          Logger.log('Error opening spreadsheet with ID ' + spreadsheetId + ': ' + e.message);
        }
      }
    }
    return sheetList;  // UUID, スプレッドシートID, タイトルのリストを返す

  } finally {
    // ロックを解放
    lock.releaseLock();
  }
}

function testListSheets() {
  try {
    // listSheets 関数を実行して結果を取得
    var sheetList = listSheets();

    // マッチしたスプレッドシートの数を表示
    Logger.log('Number of sheets found: ' + sheetList.length);

    // ログに結果を表示
    if (sheetList.length > 0) {
      Logger.log('List of sheets:');
      sheetList.forEach(function(sheetInfo) {
        Logger.log('UUID: ' + sheetInfo.uuid + ', Spreadsheet ID: ' + sheetInfo.spreadsheetId + ', Title: ' + sheetInfo.title);
      });
    } else {
      Logger.log('No sheets found.');
    }

  } catch (e) {
    // エラー発生時のログ
    Logger.log('Error in testListSheets: ' + e.message);
  }
}
