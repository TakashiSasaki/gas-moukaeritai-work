/**
  @param {Integer} integer
  @return {String}
*/
function toHexStringFromInteger(integer){
  if (0<= integer && integer < 16) {
    return '0' + (integer).toString(16);
  }
  if(16<=integer && integer <= 0xff) {
    return (integer).toString(16);
  }
  if(-128<=integer && integer<0){
    return (integer+256).toString(16);
  }
  throw new Error("unexpected integer value " + integer);
}

/**
  @param {Integer[]} array of integer
  @return {String}
*/
function toHexStringFromByteArray(byteArray){
  var result = "";
  for(var i in byteArray) {
    var hexString = toHexStringFromInteger(byteArray[i]);
    result += hexString;
  }
  return result;
}

function testToHexStringFromIntegerArray(){
  var byteArray = [0x20, 0x42, 0x7a, 0x70, 0x8c, 0x3f, 0x6f, 0x07, 0xcf, 0x12, 0xab, 0x23, 0x55, 0x79, 0x82, 0xd9, 0xe6, 0xd2, 0x3b, 0x61];
  var hexStringCorrect = "20427a708c3f6f07cf12ab23557982d9e6d23b61";
  var hexString = toHexString(byteArray);
  if(hexString !== hexStringCorrect) throw new Error();
}

/**
  @param {Integer[] or Integer} array of integer or a single integer value
  @return {String}
*/
function toHexString(integerArrayOrInt){
  if(typeof integerArrayOrInt === "number"){
    var string = toHexStringFromInteger(integerArrayOrInt);
    return string;
  }
  if(typeof integerArrayOrInt === "object"){
    var string = toHexStringFromByteArray(integerArrayOrInt);
    return string;
  }
}

function testToHexString(){
  var x1 = 123; // 0x7b
  var x2 = -123; // 0x85
  var x3 = [123, -123];
  var s1 = toHexString(x1);
  var s2 = toHexString(x2);
  var s3 = toHexString(x3);
  if(s1 !== "7b") throw new Error();
  if(s2 !== "85") throw new Error();
  if(s3 !== "7b85") throw new Error();
}

