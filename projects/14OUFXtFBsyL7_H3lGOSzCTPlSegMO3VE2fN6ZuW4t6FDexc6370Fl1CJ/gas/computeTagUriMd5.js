/**
  @param {string} salt
  @param {string} email
  @param {string} date
  @return {string} Base64 encoded MD5 of email with salt.
*/
function computeTagUriMd5(salt, email, date) {
  var tagUri = buildTagUri(salt, email, date);
  var tagUriDigest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, tagUri);
  var base64 = Utilities.base64Encode(tagUriDigest);
  var noPadding = base64.replace(/=+$/,"");
  return base64;
}//computeTagUriMd5


computeTagUriMd5.test = function(){
  var tagUriMd5 = computeTagUriMd5("hoge", "abc@example.com", "2019-11");
  Logger.log("computeTagUriMd5.test:" + tagUriMd5);
}//computeTagUriMd5.test

function computeTagUriMd5Test(){
  computeTagUriMd5.test();
}//computeTagUriMd5Test