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
 * 指定されたスプレッドシートIDのタイトルを取得します。
 * 取得できない場合はエラーをスローします。
 * @param {string} spreadsheetId タイトルを取得するスプレッドシートのID
 * @returns {string} スプレッドシートのタイトル
 * @throws {Error} スプレッドシートが見つからない場合やアクセスできない場合
 */
function getSpreadsheetTitle(spreadsheetId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    return spreadsheet.getName();
  } catch (e) {
    throw new Error('指定されたID (' + spreadsheetId + ') のスプレッドシートが見つからないか、アクセスできません。詳細: ' + e.message);
  }
}

/**
 * 選択されたスプレッドシートIDをユーザープロパティに保存し、そのスプレッドシートのIDとタイトルを返します。
 * @param {string} spreadsheetId 保存するスプレッドシートのID
 * @returns {Object} 保存されたスプレッドシートのIDとタイトル
 * @throws {Error} スプレッドシートが見つからない場合やアクセスできない場合
 */
function saveSelectedSpreadsheet(spreadsheetId) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('selectedSpreadsheetId', spreadsheetId);

  const title = getSpreadsheetTitle(spreadsheetId);
  console.log('Selected Spreadsheet ID saved: ' + spreadsheetId + ', Title: ' + title);
  return { id: spreadsheetId, title: title };
}

/**
 * 保存されているスプレッドシートのIDとタイトルを取得します。
 * @returns {Object|null} 保存されているスプレッドシートのIDとタイトル、またはnull
 */
function getSavedSpreadsheetInfo() {
  const userProperties = PropertiesService.getUserProperties();
  const spreadsheetId = userProperties.getProperty('selectedSpreadsheetId');

  if (spreadsheetId) {
    try {
      const title = getSpreadsheetTitle(spreadsheetId);
      return { id: spreadsheetId, title: title };
    } catch (e) {
      console.error('Error getting saved spreadsheet info:', e.message);
      userProperties.deleteProperty('selectedSpreadsheetId');
      return null;
    }
  }
  return null;
}

/**
 * 指定されたスプレッドシート内の全シートの情報を取得します。
 * 各シートの名前、最終カラム数、最終行数、およびヘッダ行（1行目）のデータを返します。
 * @param {string} spreadsheetId 情報取得対象のスプレッドシートID
 * @returns {Array<Object>} シート情報（name, columnCount, rowCount, headers）の配列
 * @throws {Error} スプレッドシートが見つからない場合やアクセスできない場合
 */
function getSpreadsheetSheetsInfo(spreadsheetId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheets = spreadsheet.getSheets();
    const sheetsInfo = [];

    sheets.forEach(sheet => {
      const lastColumn = sheet.getLastColumn();
      const lastRow = sheet.getLastRow();
      let headers = [];

      if (lastRow > 0 && lastColumn > 0) {
        headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
      }

      sheetsInfo.push({
        name: sheet.getName(),
        columnCount: lastColumn,
        rowCount: lastRow,
        headers: headers
      });
    });
    return sheetsInfo;
  } catch (e) {
    throw new Error('シート情報の取得に失敗しました。指定されたID (' + spreadsheetId + ') のスプレッドシートが見つからないか、アクセス権がありません。詳細: ' + e.message);
  }
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

/**
 * WebアプリケーションのベースURLを取得します。
 * @returns {string} /exec/ または /dev/ で終わるURL
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}
