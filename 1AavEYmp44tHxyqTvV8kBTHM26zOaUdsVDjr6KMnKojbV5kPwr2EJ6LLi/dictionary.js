function updateDictionary() {
  //var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var zipped_contents_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("zippedContents");
  var values = zipped_contents_sheet.getDataRange().getValues();
  var notes = zipped_contents_sheet.getDataRange().getNotes();
  for(var i=1; i<values.length; ++i){
    var name = values[i][1];
    var csv = notes[i][5];
    var csv_values = Utilities.parseCsv(csv, "\t");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    if(!sheet){
      var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(name);
    }
    var existing_range = sheet.getDataRange();
    var range = sheet.getRange(existing_range.getHeight()+1,1, csv_values.length, csv_values[0].length);
    range.setValues(csv_values);
    sheet.autoResizeColumn(1);
    sheet.autoResizeColumn(2);
    sheet.autoResizeColumn(3);
    sheet.autoResizeColumn(4);
    sheet.sort(3);
    sheet.sort(2);
    sheet.sort(1);
    var new_data_range = sheet.getDataRange();
    var new_values = new_data_range.getValues();
    for(var j=1; j<new_values.length; ++j){
      if(new_values[j][0]===new_values[j-1][0] && new_values[j][1]===new_values[j-1][1] && new_values[j][2]===new_values[j-1][2]) {
        new_values[j-1][0] = null;
        new_values[j-1][1] = null;
        new_values[j-1][2] = null;
      }
    }
    new_data_range.setValues(new_values);
    sheet.sort(3);
    sheet.sort(2);
    sheet.sort(1);
  }
}
