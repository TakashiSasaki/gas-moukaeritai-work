/*
  @param {string} salt
  @param {string} date
  @return {object} pairs of key and expiration time.
*/
function getKeys(salt, date) {
  if(salt === undefined) throw "getKeys: salt is mandatory.";
  if(date === undefined) throw "getKeys: date is mandatory.";
  var tagUriMd5 = computeTagUriMd5(salt, date);
  var keys = WebClipboardWriter.getKeys(tagUriMd5);
  return keys;
}//getKeys

getKeys.test = function(){
  put.test();
  var keys = getKeys(testSalt, testDate);
  Logger.log("getKeys.test: " + JSON.stringify(keys));
}//getKeys.test

function getKeysTest(){
  getKeys.test();
}//getKeysTest