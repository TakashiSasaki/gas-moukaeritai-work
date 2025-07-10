function getValuesByColumnNames(sheet, column_names) {
  if(arguments.length===0) {
    sheet = SpreadsheetApp.openById("1_MT2f6VpN8gSaPzZJAVHEpWFvIfviYXTVXkRfHrZeOo").getSheetByName("getValuesByColumnNames");
    column_names = ["column_a", "column_c"];
  }
  var array_of_column_values = [];
  for(var i=0; i<column_names.length; ++i) {
    var column_values = getValuesByColumnName(sheet, column_names[i]);
    array_of_column_values.push(column_values);
  }
  Logger.log(array_of_column_values);
}
