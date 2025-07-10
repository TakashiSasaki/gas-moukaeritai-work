function getLastExecutionDate(){
  return CacheService.getUserCache().get("unblockAndMute");
}

function installTrigger(minutes){
  if(minutes === undefined) {
    minutes = 1;
  }
  deleteTriggers("unblockAndMute");
  ScriptApp.newTrigger("unblockAndMute").timeBased().everyMinutes(minutes).create();
}
