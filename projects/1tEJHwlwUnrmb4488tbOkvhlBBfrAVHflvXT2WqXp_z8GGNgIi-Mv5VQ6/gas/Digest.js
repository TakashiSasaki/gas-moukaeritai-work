function computeDigest_(message) {
  var bytes = Utilities.newBlob(message).getBytes();
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes);
  console.log(digest.length);
  var digestStr = digest.map(function(byte) {
    if(byte < 0) byte += 256;
    var result = byte.toString(16);
    if (byte < 16) {
      result = "0" + result;
    }
    return result;
  }).join("");
  Logger.log(digestStr);
  return digestStr;
}

function testComputeDigest(){
  const digest_string = computeDigest_("こんにちは");
  console.log(digest_string);
  return digest_string;
}
