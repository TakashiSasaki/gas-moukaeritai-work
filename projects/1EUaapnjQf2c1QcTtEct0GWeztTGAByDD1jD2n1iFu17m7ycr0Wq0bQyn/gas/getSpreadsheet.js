function getSpreadsheet(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if(spreadsheet !== null) {
    return spreadsheet;
  }
  var spreadsheetId = PropertiesService.getUserProperties().getProperty("spreadsheetId");
  if(spreadsheetId !== null) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    if(spreadsheet !== null) return spreadsheet;
  }
  
  var spreadsheetName = PropertiesService.getScriptProperties().getProperty("spreadsheetName");
  if(typeof spreadsheetName !== "string" || spreadsheetName === "") {
    throw "spreadsheetName is not defined in script properties";
  }
  var spreadsheet = SpreadsheetApp.create(spreadsheetName);
  userProperties.setProperty("spreadsheetId", spreadsheet.getId());
  return spreadsheet;
}//getSpreadsheet

function testGetSpreadsheet(){
  var spreadsheet = getSpreadsheet();
  Logger.log(spreadsheet);
  Logger.log(spreadsheet.getName());
  Logger.log(spreadsheet.getId());
}