/**
  @param {String | Object}
  @return {Byte[]} byte array of SHA1 message digest
*/
function computeSha1Uint8Array(string){
  if(typeof string === typeof {}) {
    string = JSON.stringify(string);
  }
  if(typeof string !== typeof "") throw new Error("expecting string");
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, string, Utilities.Charset.UTF_8);
  var digestUnsigned = toUnsigned(digest);
  if(typeof digest !== "object") throw new Error();
  if(digest.length !== 20) throw new Error();
  
  var digest2 = unpack(sha1.bin(StringUtility.toUtf8ByteArray(string)));
  if(JSON.stringify(digestUnsigned) !== JSON.stringify(digest2)) throw new Error("two way digest don't match");
  return digestUnsigned;
}

function testComputeSha1IntArray(){
  var utf16 = "こんにちは";
  var sha1ByteArray = computeSha1Uint8Array(utf16);
  //var sha1ByteArray = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, utf16, Utilities.Charset.UTF_8);
  var unsignedCharArray = toUnsigned(sha1ByteArray);
  var correctSha1ByteArray =  [0x20, 0x42, 0x7a, 0x70, 0x8c, 0x3f, 0x6f, 0x07, 0xcf, 0x12, 0xab, 0x23, 0x55, 0x79, 0x82, 0xd9, 0xe6, 0xd2, 0x3b, 0x61];
  // $ wc konnichiwa.txt
  //  0  0 15 konnichiwa.txt
  // $ openssl dgst -sha1 < konnichiwa.txt
  // (stdin)= 20427a708c3f6f07cf12ab23557982d9e6d23b61
  if(JSON.stringify(unsignedCharArray) !== JSON.stringify(correctSha1ByteArray)) throw new Error();
}
