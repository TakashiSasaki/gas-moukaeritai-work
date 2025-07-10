/*
  @return {String} hex sha1 of UTF-8 encoded こんにちわ
*/
function computeKonnichiwa() {
  var utf8Bytes = Utilities.newBlob("こんにちわ").getBytes();
  Assert_.equal(utf8Bytes.length, 15);
  var gasSha1 = Str.hexBytes(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, utf8Bytes));
  Assert_.equal(gasSha1, "e80c5a91a7dc6eacbcf2924ea0b9c99ecec3261e");
  var sha1 = computeSha1Hex(utf8Bytes);
  Assert_.equal(gasSha1, sha1);
  return sha1;
}//computeKonnichiwa

computeKonnichiwa.test = function(){
  var sha1 = computeKonnichiwa();
  Logger.log("computeKonnichiwa.test: " + sha1);
}//computeKonnichiwa.test

function computeKonnichiwaTest(){
  computeKonnichiwa.test();
}