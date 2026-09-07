function onEditTest(e){
  var authMode = e.authMode;
  var oldValue = e.oldValue;
  var range = e.range;
  var source = e.source;
  var triggerUid = e.triggerUid;
  var user = e.user;
  var value = e.value;
  console.log(JSON.stringify(e));
}

function onEdit2(e) {
  var ui = SpreadsheetApp.getUi();
  console.log(ui);
  if(typeof ui !== "object") {
    console.log("onEdit : no ui");
    return;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = PropertiesService.getDocumentProperties().getProperty("sheetName");
  var sheet = ss.getSheetByName("sheetName");
  var renderedResult = render(sheet);
  Logger.log(renderedResult);
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.html = renderedResult.html;
  htmlTemplate.date = renderedResult.date;
  htmlTemplate.sheetName = renderedResult.sheetName;
  htmlTemplate.continuous = true;
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Markdown in Sheet Addon");
  ui.showSidebar(htmlOutput);
}
