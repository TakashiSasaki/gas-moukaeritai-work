function getTriggers() {
  //SpreadsheetLibrary.activateSpreadsheet("GAS Library Viewer");
  //var triggers = ScriptApp.getUserTriggers(SpreadsheetApp.getActiveSpreadsheet());
  var triggers = ScriptApp.getProjectTriggers();
  Logger.log(triggers);
  return triggers;
}

function setTrigger(function_name){
  //SpreadsheetLibrary.activateSpreadsheet("GAS Library Viewer");
  var trigger = ScriptApp.newTrigger(function_name).timeBased().everyHours(1).create();
}

function deleteTimeBasedTriggers(){
  var triggers = ScriptApp.getProjectTriggers();
  for(var i in triggers) {
    if(triggers[i].getEventType() == ScriptApp.EventType.CLOCK && triggers[i].getTriggerSource() == ScriptApp.TriggerSource.CLOCK){
      ScriptApp.deleteTrigger(triggers[i]);
    }//if
  }//for
}

function getTriggersAsTable(){
  var table = [];
  var triggers = ScriptApp.getProjectTriggers();
  for(var i in triggers) {
    var trigger = triggers[i];
    var type = trigger.getEventType();
    var function_name = trigger.getHandlerFunction();
    var source = trigger.getTriggerSource();
    var source_id = trigger.getTriggerSourceId();
    var unique_id = trigger.getUniqueId();
    table.push([type, function_name, source, source_id, unique_id]);
  }//for
  Logger.log(table);
  return table;
}
