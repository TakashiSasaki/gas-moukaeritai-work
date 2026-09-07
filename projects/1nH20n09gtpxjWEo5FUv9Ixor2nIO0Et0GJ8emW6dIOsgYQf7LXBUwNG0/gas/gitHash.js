function gitHash(string) {
  var blob = Utilities.newBlob("");
  blob.setDataFromString(string, "UTF-8");
  var utf8Bytes = blob.getBytes();  
  var hashInt8Array = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, "blob " + utf8Bytes.length + "\x00" + string, Utilities.Charset.UTF_8);
  return hashInt8Array;
}

function gitHashHex(string) {
  var int8Array = gitHash("abcde");
  return StringUtility.toHexString(int8Array);  
}

function testGitHash1(){
  // $ echo -n abcde | git hash-object --stdin
  // 6a8165460570531a1247bd99a73b53a5a6e500d5
  var hashByteArray = gitHash("abcde");
  var hashHexString = StringUtility.toHexString(hashByteArray);
  if(hashHexString !== "6a8165460570531a1247bd99a73b53a5a6e500d5") throw new Error();
}

function testGitHash2(){
  // $ git hash-object konnichiwa.txt
  // 4fad5e76e242e7a806c9c536ac587fa5f65acdd5
  var hashByteArray = gitHash("こんにちは");
  var hashHexString = StringUtility.toHexString(hashByteArray);
  if(hashHexString !== "4fad5e76e242e7a806c9c536ac587fa5f65acdd5") throw new Error();
}

function testBlob(){
  var blob = Utilities.newBlob("abc");
  var x = Object.prototype.toString.call(blob);  
  Logger.log(x);
  Logger.log(blob.constructor);
  Logger.log(Object.keys(blob));
  Logger.log(typeof blob);
}