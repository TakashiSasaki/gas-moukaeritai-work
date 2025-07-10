/**
  @param {String|Object} string or object
  @returns {String} base64 web safe representation of SHA1 message digest
*/
function computeSha1Base64WebSafe(string) {
  if(typeof string === typeof {}) {
    string = JSON.stringify(string);
  }
  if(typeof string !== typeof "") throw new Error("expecting string");
  var digest = computeSha1Uint8Array(string);
  var signed = toSigned(digest);
  var base64 = Utilities.base64EncodeWebSafe(signed);
  return base64;
}

  
function testHashStringIntoBase64(){
  var utf16 = "こんにちは";
  var base64 = computeSha1Base64WebSafe(utf16);

  var sha1ByteArray = [0x20, 0x42, 0x7a, 0x70, 0x8c, 0x3f, 0x6f, 0x07, 0xcf, 0x12, 0xab, 0x23, 0x55, 0x79, 0x82, 0xd9, 0xe6, 0xd2, 0x3b, 0x61];
  var signed = toSigned(sha1ByteArray);
  var base64_2 = Utilities.base64EncodeWebSafe(signed);
  
  if(base64 !== base64_2) throw new Error();
}
