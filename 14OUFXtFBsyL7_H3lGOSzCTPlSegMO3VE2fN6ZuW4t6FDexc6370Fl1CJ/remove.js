scriptLock = undefined;

/**
  @param {String} NI URI of Tag URI
  @param {String} key
  @return {Boolean} key has existed or not
*/
function remove(niUri, key){
  if(!Is.niUri(niUri)) throw "remove: niUri is mandatory.";
  if(typeof key !== "string") throw "remove: key is mandatory.";
  
  if(scriptLock !== null) scriptLock = LockService.getScriptLock();
  scriptLock.waitLock(100);
  CacheService.getScriptCache().remove(niUri + "#" + key);
  
  var keysJson = CacheService.getScriptCache().get(niUri);
  if(keysJson === null) {
    var keys = {};
  } else {
    var keys = JSON.parse(keysJson);
  }//if
  
  if(keys[key] === undefined) return false;
  delete keys.key;
  CacheService.getScriptCache().put(niUri, JSON.stringify(keys));
  return true;
}//remove

remove.test = function(){
  put.test();
  var tagUri = buildTagUri(testSalt, testEmail, testDate);
  var niUri = computeNiUri(tagUri);
  var result = remove(niUri, testKey);
  Logger.log("remove.test: " + result);
  if(result !== true) throw "remove.test: failed to remove the item.";
}//remove.test

function removeTest(){
  remove.test();
}//removeTest
