function setSpreadsheetId() {
  var activeSpreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  if(typeof activeSpreadsheetId === "string"){
    PropertiesService.getUserProperties().setProperty("spreadsheetId", activeSpreadsheetId);
    return activeSpreadsheetId;
  }
  return "";
}//setSpreadsheetId
