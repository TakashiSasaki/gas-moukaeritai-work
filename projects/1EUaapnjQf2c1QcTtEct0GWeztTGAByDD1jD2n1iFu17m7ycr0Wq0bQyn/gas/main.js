
function setActiveSpreadsheetAsDefault(){
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  currentSpreadsheetId = userProperties.getProperties("spreadsheetId");
  if(currentSpreadsheetId !== null) {
    console.log("currentSpreadsheetId = " + currentSpreadsheetId);
  }
  if(activeSpreadsheet !== null) {
    userProperties.setProperty("spreadsheetId", activeSpreadsheet.getId());
  }
}//setActiveSpreadsheetAsDefault
