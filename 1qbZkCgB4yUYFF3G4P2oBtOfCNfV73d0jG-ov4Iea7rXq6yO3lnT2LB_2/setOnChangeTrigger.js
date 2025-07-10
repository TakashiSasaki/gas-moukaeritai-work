/**
  @param {String} functionName
  @param {Spreadsheet?} spreadsheet
  @returns {void}
*/
function setOnChangeTrigger(functionName, spreadsheet){
  var triggerBuilder = ScriptApp.newTrigger("functionName");
  var spreadsheetTriggerBuilder = triggerBuilder.forSpreadsheet(spreadsheet);
  spreadsheetTriggerBuilder.onChange();
  var trigger = spreadsheetTriggerBuilder.create();
}
