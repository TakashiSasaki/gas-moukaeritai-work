/*
  シートの一行目は絡むヘッダとする。
  指定されたカラム名のカラムのデータを二次元配列として取得する。
*/
function getValuesByColumnName(sheet, column_name) {
  if(arguments.length === 0) {
    sheet = SpreadsheetApp.openById("1_MT2f6VpN8gSaPzZJAVHEpWFvIfviYXTVXkRfHrZeOo").getSheetByName("getValuesByColumnName");
    column_name = "nickname";
  }
  var data_range = sheet.getDataRange();
  var column_names = sheet.getRange(1, 1, 1, data_range.getWidth()).getValues()[0];
  var column_index = column_names.indexOf(column_name);
  if(column_index<0) {
    throw "column not found";
  }
  var column_range = sheet.getRange(1, column_index + 1, data_range.getHeight(),1);
  var column_values = column_range.getValues();
  return column_values;
}
