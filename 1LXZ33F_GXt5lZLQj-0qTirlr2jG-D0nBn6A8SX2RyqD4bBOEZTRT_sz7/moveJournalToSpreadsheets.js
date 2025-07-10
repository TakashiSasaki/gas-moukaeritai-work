function getTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i<triggers.length; ++i){
    var trigger = triggers[i];
    var functionName = trigger.getHandlerFunction();
    Logger.log(functionName);
    Logger.log(triggers[i]);
  }
}

function setTrigger(){
  var trigger = ScriptApp.newTrigger("dummy").timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).everyWeeks(1).create();
}

function dummy(){
  Logger("dummy: do nothing.");
}