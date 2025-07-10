function toByteArrayFromString(string) {
  var byteArray = [];
  if(typeof string !== "string") throw new Error("string is expected");
  for(var i=0; i<string.length; ++i) {
    byteArray.push(string.charCodeAt(i));
  }
  if(string.length !== byteArray.length) throw new Error();
  return byteArray;
}

function testToByteArray() {
  var string = "abcde";
  var byteArray = toByteArrayFromString(string);
  var string2 = toStringFromByteArray(byteArray);
  if(string !== string2) throw new Error();
}

function toStringFromByteArray(byteArray) {
  var string = "";
  for(var i in byteArray) {
    var charCode = byteArray[i];
    if(charCode < -128 || charCode >= 256) {
      throw new Error("charCode is out of range");
    }
    if(-128<=charCode && charCode<=-1) {
      charCode += 256;
    }
    string+=String.fromCharCode(charCode);
  }
  if(byteArray.length !== string.length) {
    throw new Error();
  }
  return string;
}

function testUtf8ToByteArray(){
  var utf16String = "こんにちは";
  var utf8ByteArrayCorrect = [0xE3, 0x81, 0x93, 0xE3, 0x82, 0x93, 0xE3, 0x81, 0xAB, 0xE3, 0x81, 0xA1, 0xE3, 0x81, 0xAF];
  var utf8ByteArray = toUtf8ByteArray(utf16String);
  if(JSON.stringify(utf8ByteArray) !== JSON.stringify(utf8ByteArrayCorrect)) throw new Error();
}

/**
  @param {string} utf16String
  @return {Byte[]}
*/
function toUtf8ByteArray(utf16String){
  var blob = Utilities.newBlob("");
  blob.setDataFromString(utf16String, "UTF-8");
  var byteArray = blob.getBytes();
  for(var i in byteArray) {
    if(byteArray[i]<0) {
      byteArray[i]+=256;
    }
  }
  return byteArray;
}

function testToUtf8ByteArray(){
  var utf16String = "こんにちは";
  var utf8ByteArray = [0xE3, 0x81, 0x93, 0xE3, 0x82, 0x93, 0xE3, 0x81, 0xAB, 0xE3, 0x81, 0xA1, 0xE3, 0x81, 0xAF];
  if(JSON.stringify(utf8ByteArray) !== JSON.stringify(toUtf8ByteArray(utf16String))) throw new Error();
}

/**
  @param {string} utf16String
  @return {string}
*/
function toUtf8String(utf16String){
  var utf8ByteArray = toUtf8ByteArray(utf16String);
  var utf8String = toStringFromByteArray(utf8ByteArray);
  return utf8String;
}

function testToUtf8String(){
  var utf16String = "こんにちは";
  var utf8ByteArrayCorrect = [0xE3, 0x81, 0x93, 0xE3, 0x82, 0x93, 0xE3, 0x81, 0xAB, 0xE3, 0x81, 0xA1, 0xE3, 0x81, 0xAF];
  var utf8ByteArray = toByteArrayFromString(toUtf8String(utf16String));
  if(utf8ByteArray.length !== 15) throw new Error();
  if(JSON.stringify(utf8ByteArray) !== JSON.stringify(utf8ByteArrayCorrect)) throw new Error();
  if(toStringFromByteArray(utf8ByteArrayCorrect) !== toUtf8String(utf16String)) throw new Error();
}
