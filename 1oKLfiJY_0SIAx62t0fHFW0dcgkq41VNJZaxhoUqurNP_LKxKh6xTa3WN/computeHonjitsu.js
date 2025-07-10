/*
  @return {string} hex sha1 of UTF-8 encoded 本日は晴天なり
*/
function computeHonjitsu() {
  var utf8Bytes = Utilities.newBlob("本日は晴天なり").getBytes();
  Assert_.equal(utf8Bytes.length, 21);
  var gasSha1 = Str.hexBytes(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, "本日は晴天なり", Utilities.Charset.UTF_8));
  Assert_.equal(gasSha1, "6b4016472030307a38f6ca23f76572ae0bed338f");
  var sha1 = computeSha1Hex(utf8Bytes);
  Assert_.equal(gasSha1, sha1);
  return sha1;  
}//computeSha1Hex

computeHonjitsu.test = function(){
  computeHonjitsu();
}//computeHonjitsu.test

function computeHonjitsuTest(){
  computeHonjitsu.test();
}//computeHonjitsu