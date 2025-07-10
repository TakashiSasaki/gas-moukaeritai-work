function setSpreadsheetId(){
  var spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1lWjTl1UfoOa0ayohCV5kScy0T0HtMWJgWMCLrmIwsuU/edit?addon_dry_run=AAnXSK-HxpkNe08HkEbcsa_cSIZ95apz2eq0euZDq1HYpU4-gzPlbu9DPnSnz960N1dSSeSHgJ5SjKg4UFShzGMr_ulAOfaVvCoQOJIBoDV6EigJtxEcCm4Zy5iAx-KLiCGxuh5s-3Rf#gid=0");
  var spreadsheetId = spreadsheet.getId();
  PropertiesService.getUserProperties().setProperty("spreadsheetId", spreadsheetId);
}//setSpreadsheetId

function getSpreadsheet(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if(spreadsheet != null){
    return spreadsheet;
  }//if
  var spreadsheet_id = PropertiesService.getUserProperties().getProperty("spreadsheetId");
  if(spreadsheet_id != null) {
    spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
    return spreadsheet;
  }//if
  throw "no spreadsheet";
}

function getSpreadsheetIdString() {
  var spreadsheet = getSpreadsheet();
  if(spreadsheet) return spreadsheet.getId();
  return "no spreadsheet ID";
}

function setSpreadsheetUrl(spreadsheetUrl){
  PropertiesService.getUserProperties().setProperty("spreadsheetUrl", spreadsheetUrl);
  var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
  var spreadsheetId = spreadsheet.getId();
  if(!spreadsheetId) {
    throw("spreadsheet is not found");
  }
  PropertiesService.getUserProperties().setProperty("spreadsheetId", spreadsheetId);
  return spreadsheetId;
}
