/**
  @param {String} functionName
  @param {Spreadsheet?} spreadsheet
  @returns {void}
*/
function setOnEditTrigger(functionName, spreadsheet){
  var triggerBuilder = ScriptApp.newTrigger(functionName);
  var spreadsheetTriggerBuilder = triggerBuilder.forSpreadsheet(spreadsheet);
  spreadsheetTriggerBuilder.onEdit();
  var trigger = spreadsheetTriggerBuilder.create();
}
