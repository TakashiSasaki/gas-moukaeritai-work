function put(salt, date, key, value){
  console.log("Web Clipboard Readre/put.gs: salt=" + salt + ", date=" + date + ", key=" + key + ", value=" + value);
  if(salt === undefined) throw "put: salt is mandatory.";
  if(date === undefined) throw "put: date is mandatory.";
  if(key === undefined) throw "put; key is mandatory.";
  if(value === undefined) throw "put: value is mandatory.";
  var tagUriMd5 = computeTagUriMd5(salt, date);
  console.log("Web Clipboard Reader/put.gs: tagUriMd5=" + tagUriMd5); 
  var putAt = WebClipboardWriter.put(tagUriMd5, key, value);
  return putAt;
}//put

put.test = function(){
  var putAt = put(testSalt, testDate, testKey, testValue);
  Logger.log("put.test: putAt = " + putAt);
}//put.test

function putTest(){
  put.test();
}//putTest