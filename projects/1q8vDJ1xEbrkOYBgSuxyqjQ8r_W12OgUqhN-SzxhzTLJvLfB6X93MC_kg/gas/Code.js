function doGet(e) {
  var html = CacheService.getScriptCache().get("html");
  if(typeof html !== "string") {
    html = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/SOuH/html").getContentText();
    CacheService.getScriptCache().put("html", html, 120);
  }
  var css = CacheService.getScriptCache().get("css");
  if(typeof css !== "string") {
    css = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/SOuH/css").getContentText();
    CacheService.getScriptCache().put("css", css, 120);
  }
  var js = CacheService.getScriptCache().get("js");
  if(typeof js !== "string") {
    js = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/SOuH/js").getContentText();
    CacheService.getScriptCache().put("js", js, 120);    
  }
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.html = html;
  htmlTemplate.css = css;
  htmlTemplate.js = js;
  var htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}
