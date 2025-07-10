function doPost(e) {
  try {
    if (e.pathInfo === "write") {
      var title = e.parameter.title;
      if (!title) {
        // title パラメータが無い場合のエラーメッセージ
        throw new Error("Missing 'title' parameter.");
      }
      var payload = e.postData.contents;
      var result = write(title, payload);
      var output = JSON.stringify({ "response": { "result": result } });
      return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    }

    // その他のパスまたはパスなしのリクエストへのデフォルトの応答
    OPENAPI.servers[0].url = ScriptApp.getService().getUrl();
    var output = JSON.stringify({ "response": { "result": OPENAPI } });
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var output = JSON.stringify({ "error": { "errorMessage": error.message, "errorType": "Exception" } });
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
  }
}//doPost
