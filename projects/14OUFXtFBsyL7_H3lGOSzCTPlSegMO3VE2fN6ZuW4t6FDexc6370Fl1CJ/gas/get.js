/**
  @param {string} Ni URI of Tag URI
  @param {string} key
  @return {string} value or null
*/
function get(niUri, key) {
  if(!Is.niUri(niUri)) throw "get: niUri should be NI URI.";
  if(typeof key !== "string") throw "get: key is mandatory.";
  var value = CacheService.getScriptCache().get(niUri + "#" + key);
  if(value === null) {
    var keys = getKeys(niUri);  
    delete keys.key;
    CacheService.getScriptCache().put(niUri, JSON.stringify(keys));
  }//if
  return value;
}//get

get.test = function(){
  put.test();
  var tagUri = buildTagUri(testSalt, testEmail, testDate);
  var niUri = computeNiUri(tagUri);
  var value = get(niUri, testKey);
  Logger.log("get.test: value = " + value);
}//get.test

function getTest(){
  get.test();
}//getTest
