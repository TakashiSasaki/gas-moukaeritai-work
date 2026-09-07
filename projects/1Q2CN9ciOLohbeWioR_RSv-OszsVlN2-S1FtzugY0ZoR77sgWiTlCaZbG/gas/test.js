function test() {
  const sheet = getSheetForDebug("test");

  appendRows([]);
  appendObject({
    "key1": "value1",
    "key3": "value3"
  });
  appendObjects([
    { "key4": "value4" }, { "key5": "value5" },
    { "date1": new Date() },
    { "key1": true, "key2": false },
    { "key3": null, "key4": [1.0, 2, 3.0] }
  ])

}

function getSpreadsheetForDebug(){
  const spreadsheetIdForDebug = PropertiesService.getScriptProperties().getProperty("spreadsheetIdForDebug");
  const spreadsheet = SpreadsheetApp.openById(spreadsheetIdForDebug);
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  Logger.log(SpreadsheetApp.getActiveSpreadsheet().getUrl());
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheetForDebug(sheetName){
  const spreadsheet = getSpreadsheetForDebug();
  const sheet = spreadsheet.getSheetByName(sheetName);
  SpreadsheetApp.setActiveSheet(sheet);
  return sheet;
}
