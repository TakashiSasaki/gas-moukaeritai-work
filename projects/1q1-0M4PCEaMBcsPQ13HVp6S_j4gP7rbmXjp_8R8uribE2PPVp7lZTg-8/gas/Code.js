scripts = {
  "marked" : "https://raw.githubusercontent.com/chjj/marked/master/marked.min.js",
  "CsvParser" : "https://raw.githubusercontent.com/TakashiSasaki/csvParser/gas/require.gs"
}

function doGet(e) {
  Logger.log(e);
  if("marked" in e.parameters) {
    var marked = CacheService.getScriptCache().get("marked");
    if(marked === null) { 
      var httpResponse = UrlFetchApp.fetch(scripts["marked"]);
      var marked = httpResponse.getContentText();
      CacheService.getScriptCache().put("marked", marked, 21600);
    }
    return ContentService.createTextOutput(marked).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  if("CsvParser" in e.parameters) {
    var httpResponse = UrlFetchApp.fetch(scripts["CsvParser"]);
    var CsvParser = httpResponse.getContentText();
    return ContentService.createTextOutput(CsvParser).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.scripts = scripts;
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("JavascriptProxy");
  return htmlOutput;
}
