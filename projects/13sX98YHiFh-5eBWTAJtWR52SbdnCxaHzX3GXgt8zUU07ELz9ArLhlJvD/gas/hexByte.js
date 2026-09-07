/**
  @param {Number} signed or unsigned 8bit integer
  @return {String} two digit lower case hex string
*/
function hexByte(num) {
  Assert.isNumberInRange(num, -128, 255)
  num = num<0 ? num+256: num;
  var hexString = ("0" + num.toString(16)).substr(-2);
  return hexString;
}//hexString

hexByte.test = function(){
  var hexString = hexByte(-2);
  Assert.equalStrings(hexString, "fe");
}

function hexByteTest(){
  hexByte.test();
}