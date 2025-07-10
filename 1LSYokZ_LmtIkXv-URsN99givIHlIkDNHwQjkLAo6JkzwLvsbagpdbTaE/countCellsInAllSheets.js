function countCellsInAllSheets() {
  var count = 0;
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for(var i=0; i<sheets.length; ++i){
    var sheet = sheets[i];
    var sheet_name = sheet.getName();
    var data_range = sheet.getDataRange();
    var n_columns = data_range.getWidth();
    var n_rows = data_range.getHeight();
    var n_cells = n_columns * n_rows;
    count += n_cells;
  }//for
  return count;
}//countCellsInAllSheets
