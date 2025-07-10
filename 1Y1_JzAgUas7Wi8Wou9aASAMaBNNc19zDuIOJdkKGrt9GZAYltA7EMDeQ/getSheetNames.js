function getSheetNames(spreadsheet) {
  if(spreadsheet === undefined) {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheets = spreadsheet.getSheets();
  var sheetNames = [];
  for(var i in sheets){
    sheetNames.push(sheets[i].getName());
  }//for
  return sheetNames;
}//getSheetNames

function test(){
   var x = PropertiesService.getScriptProperties().getProperty("abc");
   Logger.log(x);
}