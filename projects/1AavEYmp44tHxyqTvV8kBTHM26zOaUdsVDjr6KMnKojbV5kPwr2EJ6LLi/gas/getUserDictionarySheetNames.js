function getUserDictionarySheetNames(){
  var spreadsheet_id = PropertiesService.getUserProperties().getProperty("spreadsheet_id");
  var spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
  var sheets = spreadsheet.getSheets();
  var sheet_names = [];
  for(var i=0; i<sheets.length; ++i){
    var sheet_name = sheets[i].getName();
    if(sheet_name.match("\.zip$") || sheet_name.match("\.txt$") || sheet_name.match("^.+@.+$")) {
      sheet_names.push(sheet_name);
    }
  }
  return sheet_names;
}
