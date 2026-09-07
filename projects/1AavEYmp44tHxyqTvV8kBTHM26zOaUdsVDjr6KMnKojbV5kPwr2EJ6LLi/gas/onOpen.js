function onInstall(e){
  onOpen();
}

function onOpen(e){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if(spreadsheet) {
    var spreadsheet_id = spreadsheet.getId();
    PropertiesService.getUserProperties().setProperty("spreadsheet_id", spreadsheet_id);
  }
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createAddonMenu();
  menu.addItem("onOpen", "onOpen");
  menu.addItem("updateZipFiles", "updateZipFiles");
  menu.addItem("updateZippedContents", "updateZippedContents");
  menu.addItem("updateDictionary", "updateDictionary");
  menu.addItem("getSheetId", "getSheetId");
  menu.addToUi();
  var html_template = HtmlService.createTemplateFromFile("sidebar");
  var html_output = html_template.evaluate();
  html_output.setTitle("Google日本語入力ユーザー辞書ユーティリティ");
  ui.showSidebar(html_output);
}

function getUserDictionarySheetNames(){
  var spreadsheet_id = PropertiesService.getUserProperties().getProperty("spreadsheet_id");
  var spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
  var sheets = spreadsheet.getSheets();
  var sheet_names = [];
  for(var i=0; i<sheets.length; ++i){
    var sheet_name = sheets[i].getName();
    if(sheet_name.match("\.zip$") || sheet_name.match("\.txt$")) {
      sheet_names.push(sheet_name);
    }
  }
  return sheet_names;
}
