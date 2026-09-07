function deleteTriggers(){
  var triggers = ScriptApp.getProjectTriggers();
  for(var i in triggers) {
    Logger.log(triggers[i].getHandlerFunction());
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log("deleted " + triggers.length + " trigger(s)");
}
