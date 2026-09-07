/**
  @param {string} NI URI of Tag URI
  @param {string} key
  @param {string} value
  @return {number} put time
*/
function put(niUri, key, value) {
  if(!Is.niUri(niUri)) throw "put: niUri is mandatory.";
  if(typeof key !== "string") throw "put: key is mandatory.";
  if(typeof value !== "string") throw "put: value is mandatory.";

  var keys = getKeys(niUri);
  var putAt = (new Date()).getTime();
  keys[key] = putAt;
  CacheService.getScriptCache().put(niUri, JSON.stringify(keys), 21600);
  CacheService.getScriptCache().put(niUri + "#" + key, value, 21600);
  return putAt;
}//put

put.test = function(){
  var tagUri = buildTagUri(testSalt, testEmail, testDate);
  var niUri = computeNiUri(tagUri);
  var putAt = put(niUri, testKey, testValue);
  Logger.log("put.test: putAt = " + putAt);
  if(typeof putAt !== "number") throw "put.test: failed.";
  if(putAt > (new Date()).getTime()) throw "put.test: failed.";
  if(putAt < (new Date()).getTime() - 1000) throw "put.test: failed.";
  var value = CacheService.getScriptCache().get(niUri + "#" + testKey);
  if(value !== testValue) throw "put.test: failed to get correct value.";
}//put.test

function putTest(){
  put.test();
}//putTest
