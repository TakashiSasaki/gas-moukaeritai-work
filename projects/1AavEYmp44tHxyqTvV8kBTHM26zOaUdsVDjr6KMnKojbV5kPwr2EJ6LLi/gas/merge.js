function merge() {
  var active_user = Session.getActiveUser();
  var email = active_user.getEmail();
  var spreadsheet_id = PropertiesService.getUserProperties().getProperty("spreadsheet_id");
  var spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
  var merger_sheet = spreadsheet.getSheetByName(email);
  if(!merger_sheet){
    merger_sheet = spreadsheet.insertSheet(email);
  }
  var sheets = spreadsheet.getSheets();
  var mergee_sheets = [];
  for(var i=0; i<sheets.length; ++i){
    var sheet = sheets[i];
    var sheet_name = sheet.getSheetName();
    if(sheet_name.match("^.+\.zip$")) {
      mergee_sheets.push(sheet);
    }
  }
  for(var i=0; i<mergee_sheets.length; ++i){
    var mergee_sheet = mergee_sheets[i];
    var mergee_range = mergee_sheet.getDataRange();
    var mergee_values = mergee_range.getValues();
    var mergee_height = mergee_range.getHeight();
    var mergee_width = mergee_range.getWidth();
    var merger_range = merger_sheet.getRange(merger_sheet.getDataRange().getHeight()+1, 1, mergee_height, mergee_width);
    merger_range.setValues(mergee_values);
  }
  
  merger_sheet.sort(3);
  merger_sheet.sort(2);
  merger_sheet.sort(1);
  mergee_range = mergee_sheet.getDataRange();
}
