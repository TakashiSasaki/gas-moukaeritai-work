function renameSheet(oldName, newName, spreadsheet){
  if(spreadsheet === undefined) {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheet = spreadsheet.getSheetByName(oldName);
  sheet.setName(newName);
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
  SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(1);
  return getSheetNames();
}//renameSheet
