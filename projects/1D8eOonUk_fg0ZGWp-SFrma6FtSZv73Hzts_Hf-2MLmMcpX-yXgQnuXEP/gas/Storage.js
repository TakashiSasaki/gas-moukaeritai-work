// ==========================================
// Storage.gs
// スプレッドシートの読み書きと自動管理を担当
// ロック機構とキャッシュ(CacheService)を利用して高速化・競合防止を図ります
// ==========================================

/**
 * スプレッドシートを取得します。存在しない場合や削除されている場合は新規作成します。
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getOrCreateSpreadsheet() {
  const scriptProperties = PropertiesService.getScriptProperties();
  let spreadsheetId = scriptProperties.getProperty('SPREADSHEET_ID');
  let spreadsheet = null;

  if (spreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (e) {
      console.warn("以前のスプレッドシートが見つからないため、新規作成を準備します。");
      spreadsheetId = null;
    }
  }

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create("Facility_HTML_Data_Store");
    scriptProperties.setProperty('SPREADSHEET_ID', spreadsheet.getId());
    
    const sheet = spreadsheet.getSheets()[0];
    sheet.setName("HTML_Data");
    sheet.appendRow(["Timestamp", "PageID", "FacilityName", "HTMLContent"]);
    
    console.log("スプレッドシートを新規作成しました: " + spreadsheet.getId());
  } else {
    let targetSheet = spreadsheet.getSheetByName("HTML_Data");
    if (!targetSheet) {
      targetSheet = spreadsheet.insertSheet("HTML_Data");
      targetSheet.appendRow(["Timestamp", "PageID", "FacilityName", "HTMLContent"]);
    }
  }
  return spreadsheet;
}

/**
 * 生成されたHTMLデータをスプレッドシートに追記保存します（ロック取得リトライ付き）。
 * 保存成功後、該当ページのキャッシュをクリアします。
 * @param {number} pageId 施設のセット番号
 * @param {string} facilityName 施設名
 * @param {string} htmlContent 生成されたHTML文字列
 */
function saveHtmlData(pageId, facilityName, htmlContent) {
  const lock = LockService.getScriptLock();
  let success = false;
  let retries = 3; // 最大リトライ回数

  while (retries > 0 && !success) {
    try {
      // 10秒間ロックの取得を試みる
      lock.waitLock(10000); 
      
      const ss = getOrCreateSpreadsheet();
      const sheet = ss.getSheetByName("HTML_Data");
      sheet.appendRow([new Date(), pageId, facilityName, htmlContent]);
      
      // 書き込みを確実に完了させてからロックを解放するためにflushを実行
      SpreadsheetApp.flush();
      
      // ★追加：データが更新されたので、該当ページの古いキャッシュを削除
      const cache = CacheService.getScriptCache();
      cache.remove('html_content_' + pageId);
      
      success = true;
      
    } catch (e) {
      console.warn(`ロックの取得に失敗しました。リトライします... 残り回数: ${retries - 1}`);
      retries--;
      if (retries === 0) {
        throw new Error("スプレッドシートが混み合っているため、データの保存に失敗しました。時間をおいて再度お試しください。");
      }
      Utilities.sleep(1000); // 1秒待機してリトライ
    } finally {
      lock.releaseLock();
    }
  }
}

/**
 * 特定の施設IDの最新のHTMLコンテンツを返します。
 * キャッシュサービスを利用して5分間（300秒）データを保持し、高速に応答します。
 * @param {number} pageId 施設のセット番号
 */
function getLatestHtml(pageId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'html_content_' + pageId;
  const cachedHtml = cache.get(cacheKey);

  // キャッシュにデータが存在する場合は、スプレッドシートを読みに行かずキャッシュを返す
  if (cachedHtml) {
    console.log(`Cache hit for pageId: ${pageId}`);
    return cachedHtml;
  }

  // キャッシュがない場合はスプレッドシートから取得
  console.log(`Cache miss for pageId: ${pageId}. Fetching from spreadsheet.`);
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName("HTML_Data");
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][1] == pageId) {
      const htmlContent = data[i][3];
      // 取得したHTMLをキャッシュに5分間（300秒）保存
      cache.put(cacheKey, htmlContent, 300);
      return htmlContent; 
    }
  }
  return null;
}

/**
 * 全ての施設の最新取得日時をオブジェクト形式で取得します。
 */
function getLatestTimestamps() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName("HTML_Data");
  const data = sheet.getDataRange().getValues();
  const timestamps = {};

  for (let i = 1; i < data.length; i++) {
    const ts = data[i][0];
    const pageId = data[i][1];
    
    if (ts instanceof Date) {
      timestamps[pageId] = Utilities.formatDate(ts, "JST", "yyyy/MM/dd HH:mm:ss");
    }
  }
  return timestamps;
}