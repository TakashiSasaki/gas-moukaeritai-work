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

function testGetObjects() {
  try {
    // UUIDに基づいてシートを取得
    const UUID = PropertiesService.getScriptProperties().getProperty('UUID');
    var sheet = findSheet(UUID);
    
    if (!sheet) {
      throw new Error('Sheet with UUID ' + UUID + ' not found');
    }

    // テスト用の検索条件を作成
    var criteria = {
      'Name': 'John Doe',
      'City': 'New York'
    };

    // 条件に一致する行を取得 (完全一致)
    var matchingRows = getObjects(sheet, criteria, false);

    // マッチした行の数を表示
    Logger.log('Number of matching rows: ' + matchingRows.length);

    // ログに結果を表示
    if (matchingRows.length > 0) {
      Logger.log('Matching rows:');
      matchingRows.forEach(function(row) {
        Logger.log(JSON.stringify(row));  // オブジェクト形式でログに出力
      });
    } else {
      Logger.log('No matching rows found.');
    }

  } catch (e) {
    // エラー発生時のログ
    Logger.log('Error in testGetObjects: ' + e.message);
  }
}
