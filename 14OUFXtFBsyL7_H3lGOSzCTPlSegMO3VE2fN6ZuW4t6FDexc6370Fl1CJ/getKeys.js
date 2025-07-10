/**
  @param {string} Ni URI of Tag URI
  @return {object} pairs of key and expiration time.
*/
function getKeys(niUri) {
  if(!Is.niUri(niUri))  throw "getKeys: niUri is mandatory.";
  var keysJson = CacheService.getScriptCache().get(niUri);
  if(keysJson === null) {
    var keys = {};
  } else {
    try {
      var keys = JSON.parse(keysJson);
    } catch (e){
      var keys = {};
      CacheService.getScriptCache().put(niUri, JSON.stringify(keys), 21600);
    }//try
  }//if
  return keys;
}//getKeys

getKeys.test = function(){
  var tagUri = buildTagUri(testSalt, testEmail, testDate);
  var niUri = computeNiUri(tagUri);
  Logger.log("getKeys.test: niUri = " + niUri);
  var keys = getKeys(niUri);
  Logger.log("getKeys.test: " + JSON.stringify(keys));
}//getKeys.test

function getKeysTest(){
  getKeys.test();
}//getKeysTest
