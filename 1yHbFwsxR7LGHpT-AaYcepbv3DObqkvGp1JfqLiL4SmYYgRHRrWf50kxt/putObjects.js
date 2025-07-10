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

function testPutObjects() {
  const UUID = PropertiesService.getScriptProperties().getProperty("UUID");

  try {
    // スプレッドシートとシートの取得
    var sheet = findSheet(UUID);

    // スプレッドシートIDとシート名の定義
    var spreadsheetId = sheet.getParent().getId();  // スプレッドシートID
    var sheetName = sheet.getName();  // シート名

    if (!sheet) {
      throw new Error('Sheet with name ' + sheetName + ' not found in spreadsheet with ID ' + spreadsheetId);
    }

    // テスト用の複数レコードデータを作成
    var recordsArray = [
      {
        'Name': 'John Doe',
        'Age': 30,
        'City': 'New York',
        'State': 'New York',
        'Date Added': new Date()
      },
      {
        '_rowIndex': 3,  // 行番号3を更新
        'Name': 'Jane Doe',
        'Age': 28,
        'City': 'Los Angeles',
        'State': 'California',
        'Date Added': new Date()
      }
    ];

    // 複数のレコードを追加または更新する関数を呼び出し
    putObjects(sheet, recordsArray);

    // データが正しく追加または更新されたことを確認するためのログ
    Logger.log('Records added or updated to sheet: ' + sheetName + ' in spreadsheet: ' + spreadsheetId);

  } catch (e) {
    // エラーが発生した場合、エラーメッセージをログに表示
    Logger.log('Error in testPutObjects: ' + e.message);
  }
}
