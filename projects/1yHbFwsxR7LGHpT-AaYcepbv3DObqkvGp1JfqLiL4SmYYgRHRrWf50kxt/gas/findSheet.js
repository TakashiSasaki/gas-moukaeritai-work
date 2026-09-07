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

function testFindSheet() {
  const uuid = PropertiesService.getScriptProperties().getProperty("UUID");

  try {
    // findSheet関数を呼び出してシートを取得（存在しなければ作成）
    const sheet = findSheet(uuid);

    // シートが正しく取得または作成されたことをログに出力
    Logger.log('Sheet successfully retrieved or created with name: ' + sheet.getName());

  } catch (e) {
    // エラーが発生した場合はエラーメッセージをログに表示
    Logger.log('Error in testFindSheet: ' + e.message);
  }
}
