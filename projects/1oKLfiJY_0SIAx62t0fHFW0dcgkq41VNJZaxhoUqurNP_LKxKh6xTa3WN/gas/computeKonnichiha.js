/*
  @return {string} hex sha1 of UTF-8 encoded こんにちは
*/
function computeKonnichiha() {
  var utf8Bytes = Utilities.newBlob("こんにちは").getBytes();
  Assert_.equal(utf8Bytes.length, 15);
  var gasSha1 = Str.hexBytes(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, utf8Bytes));
  Assert_.equal(gasSha1, "20427a708c3f6f07cf12ab23557982d9e6d23b61");
  var sha1 = computeSha1Hex(utf8Bytes);
  Assert_.equal(gasSha1, sha1);
  return sha1;
}//computeKonnichiha

computeKonnichiha.test = function(){
  computeKonnichiha();
}
