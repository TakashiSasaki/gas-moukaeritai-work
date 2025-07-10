/**
  @param {String|Object}
  @returns {String} hex string
*/
//function hashStringIntoHex(string) {
function computeSha1Hex(string) {
  if(typeof string === typeof {}) {
    string = JSON.stringify(string);
  }
  if(typeof string !== typeof "") throw new Error("expecting string");
  var digest = computeSha1Uint8Array(string);
  var hex = StringUtility.toHexString(digest);
  
  var hex2 = sha1.hex(StringUtility.toUtf8ByteArray(string));
  if(hex !== hex2) throw new Error("two way digest don't match");
  return hex;
}



function testComputeSha1Hex(){
  var utf16 = "こんにちは";
  //var utf8ByteArray = [0xE3, 0x81, 0x93, 0xE3, 0x82, 0x93, 0xE3, 0x81, 0xAB, 0xE3, 0x81, 0xA1, 0xE3, 0x81, 0xAF];
  var sha1ByteArray = [0x20, 0x42, 0x7a, 0x70, 0x8c, 0x3f, 0x6f, 0x07, 0xcf, 0x12, 0xab, 0x23, 0x55, 0x79, 0x82, 0xd9, 0xe6, 0xd2, 0x3b, 0x61];
  var sha1Hex = "20427a708c3f6f07cf12ab23557982d9e6d23b61";
  var hex = computeSha1Hex(utf16);
  if(hex !== sha1Hex) throw new Error();
}
