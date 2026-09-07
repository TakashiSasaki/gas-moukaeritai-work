function getActiveOrSavedSpreadsheet(properties, key) {
  //properties = PropertiesService.getScriptProperties();
  if(key === undefined) {
    key = "spreadsheetId";
  }
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if(spreadsheet === null){
    var spreadsheetId = properties.getProperty("spreadsheetId");
    if(spreadsheetId === null){
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if(spreadsheet === null) {
        throw "Neither active spreadsheet or saved spreadsheet ID.";
      }//if
      properties.setProperty("~~~spreadsheetId~~~", spreadsheet.getId());
      return spreadsheet;
    }//if
  }//if
  return spreadsheet;
}
