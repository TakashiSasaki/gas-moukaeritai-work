function onOpen(e) {
  var spreadsheet = e.source;
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  PropertiesService.getUserProperties().setProperty("activeSpreadsheetId", spreadsheet.getId());
  SpreadsheetApp.getUi().createAddonMenu().addItem("showSidebar", "showSidebar").addToUi();
}

function showSidebar(){
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.authorizationUrl = createAuthorizationUrl();
  var htmlOutput = htmlTemplate.evaluate();
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}
