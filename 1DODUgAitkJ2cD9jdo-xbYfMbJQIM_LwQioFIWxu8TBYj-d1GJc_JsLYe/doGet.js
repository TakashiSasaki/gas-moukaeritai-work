
function doGet(e) {
  if(e === undefined) e = {}
  if(e.parameter === undefined) e.parameter = {}
  if(Object.keys(e.parameter).length === 0) {
    var htmlTemplate = HtmlService.createTemplateFromFile("index");
    var htmlOutput = htmlTemplate.evaluate();
    htmlOutput.setTitle(PropertiesService.getScriptProperties().getProperty("title"));
    htmlOutput.setFaviconUrl(PropertiesService.getScriptProperties().getProperty("iconUrl"));
    return htmlOutput;
  }//if
}//doGet
