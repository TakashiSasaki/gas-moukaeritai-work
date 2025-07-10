function doGet() {
  var spreadsheet = SpreadsheetLibrary.getSingletonSpreadsheet();
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  HtmlTemplateLibrary.addGoogleSpreadsheetEdit(spreadsheet.getId(), "Unicode Normalization Sandbox");
  HtmlTemplateLibrary.addHtmlOutput(HtmlService.createTemplateFromFile("index").evaluate(), "button");
  return HtmlTemplateLibrary.getHtmlOutput("Unicode Normalization Sandbox");
}

function save(sheet_name, values) {
  LockService.getScriptLock().waitLock(10000);
  var spreadsheet = SpreadsheetLibrary.getSingletonSpreadsheet();
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheet_name);
  if(!sheet) {
    var sheet = spreadsheet.insertSheet(sheet_name);
  }
  sheet.clear();
  sheet.clearFormats();
  sheet.setFrozenRows(1);
  var range = sheet.getRange(1, 1, values.length, values[0].length);
  range.setValues(values);
}

function deleteAllSheets(){
  LockService.getScriptLock().waitLock(10000);
  var spreadsheet = SpreadsheetLibrary.getSingletonSpreadsheet();
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  for(var i=0; i<sheets.length; ++i) {
    try{
      spreadsheet.deleteSheet(sheets[i]);
    } catch(e) {
    }
  }
}