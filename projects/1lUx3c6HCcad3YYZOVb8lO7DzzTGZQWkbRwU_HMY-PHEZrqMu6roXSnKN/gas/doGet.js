function doGet(e) {
  const cache = CacheService.getScriptCache();
  const parameters = e.parameter; // リクエストの全パラメータを取得
  const key = parameters.key;

  // パラメータが全くない場合、またはkeyパラメータのみでその長さが32文字未満の場合、index.htmlを返す
  if (Object.keys(parameters).length === 0 || (Object.keys(parameters).length === 1 && (!key || key.length < 32))) {
    const htmlTemplate = HtmlService.createTemplateFromFile("index.html");
    htmlTemplate.pathInfo = e.pathInfo;
    const htmlOutput = htmlTemplate.evaluate();
    htmlOutput.setTitle("PublicWebCache")
    return htmlOutput;
  }

  // keyパラメータの検証（存在し、かつ32文字以上）
  if (!key || key.length < 32) {
    throw new Error("Invalid request: 'key' parameter is required and it must be at least 32 characters long.");
  }

  const currentCacheValue = cache.get(key);
  if (currentCacheValue) {
    const [type, content] = splitZero(currentCacheValue);
    const textOutput = ContentService.createTextOutput(content);
    return setMimeType(textOutput, type);
  }//if
}//doGet

