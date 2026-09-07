function hexBlob(blob) {
  Assert.isBlob(blob); 
  // var blob = Utilities.newBlob(data)
  var bytes = blob.getBytes();
  var hexString = hexBytes(bytes);
  return hexString;
}//hexBlob

hexBlob.test = function(){
  var testBlob = Utilities.newBlob([200-256, 100, 5]);
  var hexString = hexBlob(testBlob);
  Assert.equalStrings(hexString, "c86405");
}//hexBlob.test

function hexBlobTest(){
  hexBlob.test();
}//hexBlobTest