/*
  sheet シート
  key_column_name プロパティ名を格納したカラムの名前
  value_column_name 値を格納したカラムの名前
*/
function getAsDictionary(sheet, key_column_name, value_column_name) {
  if(arguments.length === 0) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    col1 = 1;
    col2 = 2;
  }
  var data_range = sheet.getDataRange();
  var range1 = sheet.getRange(1, col1, data_range.getHeight(), 1);
  var values1 = range1.getValues();
  var range2 = sheet.getRange(1, col2, data_range.getHeight(), 1);
  var values2 = range2.getValues();
  var result_object = {};
  for(var i=0; i<data_range.getHeight(); ++i) {
    result_object[values1[i][0]] = values2[i][0];
  }
  return result_object;
}
