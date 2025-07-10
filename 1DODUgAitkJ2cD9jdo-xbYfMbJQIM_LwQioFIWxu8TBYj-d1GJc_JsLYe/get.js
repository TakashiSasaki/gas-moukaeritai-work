/*
  @param {string} salt
  @param {string} date
  @param {string} key
  @return {string} value
*/
function get(salt, date, key) {
  if(salt === undefined) throw "get: salt is mandatory.";
  if(date === undefined) throw "get: date is mandatory.";
  if(key === undefined) throw "get: key is mandatory.";
  var tagUriMd5 = computeTagUriMd5(salt, date);
  var value = WebClipboardWriter.get(tagUriMd5, key);
  return value;
}//get

get.test = function(){
  put.test();
  var value = get(testSalt, testDate, testKey);
  Logger.log("get.test: " + value);
}//get.test

function getTest(){
  get.test();
}//getTest
