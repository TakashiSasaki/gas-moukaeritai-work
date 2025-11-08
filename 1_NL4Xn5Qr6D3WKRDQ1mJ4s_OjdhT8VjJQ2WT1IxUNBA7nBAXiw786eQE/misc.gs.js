function getDeploymentId() {
    return [ScriptApp.getScriptId() , ScriptApp.getService().getUrl()];
}

function testGetDeploymentId(){
  Logger.log(getDeploymentId());
}