/**
  @param {String} functionName
  @returns {void}
*/
function deleteTrigger(functionName){
  var triggers = ScriptApp.getProjectTriggers();
  for(var i in triggers) {
    var trigger = triggers[i];
    var handlerFunction = trigger.getHandlerFunction();
    if(handlerFunction !== functionName) continue;
    ScriptApp.deleteTrigger(trigger);
  }
}
