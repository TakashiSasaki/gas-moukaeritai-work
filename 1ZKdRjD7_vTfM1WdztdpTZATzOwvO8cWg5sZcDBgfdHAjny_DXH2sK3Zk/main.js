function doGet() {
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  return html_output;
}

function onInstall(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var spreadsheet_id = spreadsheet.getId();
  PropertiesService.getUserProperties().setProperty("spreadsheetId", spreadsheet_id);
  onOpen();
}

function onOpen(){
  var ui = SpreadsheetApp.getUi();
  ui.showSidebar(HtmlService.createTemplateFromFile("index").evaluate());
  var addon = ui.createAddonMenu();
  addon.addItem("a", "functionName");
  addon.addToUi();
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .getContent();
}

function getNow() {
  return new Date();
}