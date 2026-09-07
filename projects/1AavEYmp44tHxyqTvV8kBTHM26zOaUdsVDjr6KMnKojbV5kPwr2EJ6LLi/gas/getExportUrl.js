function getExportUrl(spreadsheet_id, sheet_name, format){
  if(!format){
    format = "csv";
  }
  var spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
  var sheet = spreadsheet.getSheetByName(sheet_name);
  var sheet_id = sheet.getSheetId();
  //var id = sheet.getIndex();
  var spreadsheet_url = spreadsheet.getUrl();
  var export_url = spreadsheet_url.substring(0, spreadsheet_url.length-4) + "export";
  var tsv_url = export_url + "?format=" + format + "&gid=" + sheet_id;
  return tsv_url;
}
