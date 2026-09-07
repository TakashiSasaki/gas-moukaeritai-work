function showSidebar(e){
  console.log("showSidebar" + JSON.stringify(e));
  var ui = SpreadsheetApp.getUi();
  if(typeof ui !== "object") {
    console.log("showSidebar : no ui");
    return;
  }
  //var sheetName = SpreadsheetApp.getActiveSheet().getName();
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  if(e === undefined) {
    htmlTemplate.html = undefined;
    htmlTemplate.date = undefined;
    htmlTemplate.sheetName =　undefined;
    htmlTemplate.continuous = false;
  } else {
  
  }
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Markdown in Sheet Addon");
  ui.showSidebar(htmlOutput);
}
