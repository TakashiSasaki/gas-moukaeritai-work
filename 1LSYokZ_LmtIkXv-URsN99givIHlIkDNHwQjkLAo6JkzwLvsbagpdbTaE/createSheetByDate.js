function createSheetByDate(){
  var sheetName = (new Date()).toString();
  SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
}
