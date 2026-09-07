/**
  @param {String} spreadsheet_id スプレッドシート識別子
  @param {String[]} シート名の配列
  @param {String} 結果を記入するシート名
*/
function mergeAndUniquifySheets(spreadsheet_id, source_sheet_names, destination_sheet_name){
  var spreadsheet = SpreadsheetApp.openById(spreadsheet_id);
  var tmp1_sheet = getTmpSheet(spreadsheet_id, "tmp1");
  var tmp2_sheet = getTmpSheet(spreadsheet_id, "tmp2");
  
  var i_column = 1;
  var i_row = 1;
  for(var i=0; i<source_sheet_names.length; ++i) {
    var sheet = spreadsheet.getSheetByName(source_sheet_names[i]);
    var data_range = sheet.getDataRange();
    var value = "=unique("+source_sheet_names[i]+"!A:"+ String.fromCharCode(65+data_range.getWidth())+")";
    //ScriptLog.log(value);
    //Logger.log(value);
    tmp1_sheet.getRange(i_row, i_column).setValue(value);
    i_row += data_range.getHeight() + 1;
  }
  var data_range = tmp1_sheet.getDataRange();
  tmp2_sheet.getRange(1,1).setValue("=unique("+ "tmp1" + "!A:" + String.fromCharCode(65+data_range.getWidth()) + ")");
  var data_range = tmp2_sheet.getDataRange();
  //Logger.log(data_range.getHeight());
  //Logger.log(data_range.getWidth());
  var values = data_range.getValues();
  spreadsheet.deleteSheet(tmp1_sheet);
  spreadsheet.deleteSheet(tmp2_sheet);
  
  var destination_sheet = spreadsheet.getSheetByName(destination_sheet_name);
  if(!destination_sheet) {
    destination_sheet = spreadsheet.insertSheet(destination_sheet_name);
  }
  destination_sheet.clear();
  destination_sheet.getRange(1,1,values.length, values[0].length).setValues(values);
  return values;
}  

function test_(){
   var spreadsheet_id = "1q4CbnUkeLs7SMoRR-xsv9KLOY_sho5JR69mbnehAnPc";
   mergeAndUniquifySheets(spreadsheet_id, ["permissions"], "permissions");
}