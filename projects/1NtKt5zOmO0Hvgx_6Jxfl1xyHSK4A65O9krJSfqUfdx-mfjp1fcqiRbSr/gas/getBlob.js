function getBlob(len) {
  var a = getInt8Array(len);
  var b = Utilities.newBlob(a);
  return b;
}//getBlob

getBlob.test = function(){
  Logger.log("getBlob : " + getBlob(5));
}
