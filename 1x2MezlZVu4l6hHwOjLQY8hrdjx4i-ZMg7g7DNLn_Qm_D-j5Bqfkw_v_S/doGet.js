function doGet(e) {
  try {
    console.log(e);

    // /hello パスでのリクエストに対する応答
    if (e.pathInfo === 'hello') {
      var output = JSON.stringify({ "response": { "result": "Hello, world!" } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // /getEmail パスでのリクエストに対する応答
    if (e.pathInfo === 'getEmail') {
      var output = JSON.stringify({ "response": { "result": Session.getActiveUser().getEmail() } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // ユーザーのロケールを取得
    if (e.pathInfo === "getActiveUserLocale") {
      var output = JSON.stringify({ "response": { "result": Session.getActiveUserLocale() } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // タイトルに対応するキャッシュデータを取得
    if (e.pathInfo === "read") {
      var title = e.parameter.title;
      var output = JSON.stringify({ "response": { "result": read(title) } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // その他のパスまたはパスなしのリクエストへのデフォルトの応答
    OPENAPI.servers[0].url = ScriptApp.getService().getUrl();
    var output = JSON.stringify(OPENAPI, undefined, 4);
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var output = JSON.stringify({ "error": { "errorMessage": error.message, "errorType": "Exception" } });
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }//try-catch-clause
}//doGet
