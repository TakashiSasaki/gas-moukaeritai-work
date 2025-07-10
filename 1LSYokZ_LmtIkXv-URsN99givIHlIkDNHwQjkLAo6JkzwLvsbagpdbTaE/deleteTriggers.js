function deleteInstalledTriggers(){
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt("function name of triggers", ui.ButtonSet.OK_CANCEL);
  if(response.getSelectedButton() !== ui.Button.OK) return;
  var functionName = response.getResponseText();
  
  var projectTriggers = ScriptApp.getProjectTriggers();
  var userTriggers = ScriptApp.getUserTriggers(SpreadsheetApp.getActiveSpreadsheet());
  var triggers = projectTriggers.concat(userTriggers);
  
  for(var i in triggers) {
    var trigger = triggers[i];
    var handlerFunction = trigger.getHandlerFunction();
    if(handlerFunction !== functionName) continue;
    ScriptApp.deleteTrigger(trigger);
  }//for
  
  ui.alert("deleted " + triggers.length + " triggers");
}//deleteInstalledTriggers

deleteInstalledTriggers.caption = "Delete all installed triggers";
