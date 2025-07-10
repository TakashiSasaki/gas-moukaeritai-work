/**
  @param {String} NI URI of Tag URI
  @return {void}
*/
function removeAll(niUri) {
  if(!Is.niUri(niUri)) throw "removeAll: niUri is mandatory.";

  if(scriptLock !== null) scriptLock = LockService.getScriptLock();
  scriptLock.waitLock(100);

  var keysJson = CacheService.getScriptCache().get(niUri);
  if(keysJson === null) {
    var keys = {};
  } else {
    var keys = JSON.parse(keysJson);
  }//if

  for(var i in keys){
    var key = keys[i];
    CacheService.getScriptCache().remove(niUri + ":" + key);
  }//for
  
  CacheService.getScriptCache().remove(niUri);
}//removeAll

removeAll.test = function(){
  put.test();
  var tagUri = buildTagUri(testSalt, testEmail, testDate);
  var niUri = computeNiUri(tagUri);
  removeAll(niUri);
}//removeAll.test

function removeAllTest(){
  removeAll.test();
}//removeAllTest
