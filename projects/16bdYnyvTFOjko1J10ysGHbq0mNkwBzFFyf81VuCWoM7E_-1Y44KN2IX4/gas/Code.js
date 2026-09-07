/**
 * Searches for Google Apps Script project files in Google Drive.
 * Results are cached for 5 minutes per user.
 * @return {Array<Object>} A list of file objects.
 */
function searchScriptFiles() {
  const cache = CacheService.getUserCache();
  const cacheKey = 'v1_user_script_files';

  const cachedData = cache.get(cacheKey);
  if (cachedData != null) {
    console.log('Cache hit for key: ' + cacheKey);
    return JSON.parse(cachedData);
  }

  console.log('Cache miss for key: ' + cacheKey + '. Fetching from Drive.');
  const query = "mimeType = 'application/vnd.google-apps.script' and trashed = false";
  const files = DriveApp.searchFiles(query);
  const fileList = [];
  
  while (files.hasNext()) {
    const file = files.next();
    fileList.push({
      name: file.getName(),
      id: file.getId(),
      url: file.getUrl(),
      lastUpdated: file.getLastUpdated().toISOString()
    });
  }
  
  fileList.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  
  const dataToCache = JSON.stringify(fileList);
  cache.put(cacheKey, dataToCache, 300);
  
  return fileList;
}

/**
 * Creates a JSON response containing the list of script files.
 * @return {ContentOutput} The Content service output with JSON data.
 */
function getJsonResponse() {
  const data = searchScriptFiles();
  return ContentService.createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Includes the content of another HTML file in a template.
 * @param {string} filename The name of the file to include.
 * @return {string} The content of the file.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


/**
 * Returns the URL of the deployed web app (always the /exec URL).
 * @return {string} The web app's URL.
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * サーバーサイドで指定されたURLをUrlFetchAppを使って取得します。
 * 自身のウェブアプリのエンドポイントを呼び出すため、OAuthトークンをヘッダーに含めます。
 * @param {string} url 取得するURL。
 * @return {object} 成功した場合は { success: true, data: ... }、失敗した場合は { success: false, error: ... } を返します。
 */
function fetchUrlFromServer(url) {
  try {
    const params = {
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      },
      muteHttpExceptions: true // HTTPエラー時に例外をスローせず、レスポンスを返す
    };
    
    const response = UrlFetchApp.fetch(url, params);
    const responseCode = response.getResponseCode();
    const content = response.getContentText();

    if (responseCode === 200) {
      // 成功：パースしたJSONデータを返す
      return { success: true, data: JSON.parse(content) };
    } else {
      // サーバー側でのエラー
      return { success: false, error: `サーバーがステータス ${responseCode} を返しました。レスポンス: ${content}` };
    }
  } catch (e) {
    // その他の例外（URLが無効など）
    return { success: false, error: e.toString() };
  }
}
