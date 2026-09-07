function renewSheet(spreadsheet_id, sheet_name, input_columns, func) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
  var sheet = spreadsheet.getSheetByName(sheet_name);
  if(!sheet) {
    sheet = spreadsheet.insertSheet(sheet_name);
  }
  if(input_columns>0){
    var data_range = sheet.getDataRange();
    var input_range = sheet.getRange(1,1,data_range.getHeight(), input_columns);
    var input_values = input_range.getValues();
  }
  var output_values = func(input_values);
  if(output_values) {
    var output_range = sheet.getRange(1, input_columns+1, output_values.length, output_values[0].length);
    output_range.clear();
    output_range.setValues(output_values);
  }
}
