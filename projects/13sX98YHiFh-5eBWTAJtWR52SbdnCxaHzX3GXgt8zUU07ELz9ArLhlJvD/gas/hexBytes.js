function hexBytes(bytes) {
  Assert.numberArrayInRange(bytes, -128, 255);
  var hexStrings = [];
  for(var i=0; i<bytes.length; ++i){
    var byte = bytes[i];
    var hexString = hexByte(byte);
    hexStrings.push(hexString);
  }//for  
  var result = hexStrings.join("");
  return result;
}//hexBytes

hexBytes.test = function(){
  var testBytes = [200-256, 100, 5];
  var hexString = hexBytes(testBytes);
  Assert.equalStrings(hexString, "c86405");
}//hexBlob.test

function hexBytesTest(){
  hexBytes.test();
}//hexBytesTest