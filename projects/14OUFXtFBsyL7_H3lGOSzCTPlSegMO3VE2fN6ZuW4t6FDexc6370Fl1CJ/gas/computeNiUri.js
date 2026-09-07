/**
  @param {String} Tag URI
  @param {Number} remaining bits after truncation.
*/
function computeNiUri(tagUri, bits) {
  if(bits === undefined) bits = 96;
  Assert.isString(tagUri);
  var sha256 = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, tagUri);
  var base64 = Utilities.base64EncodeWebSafe(sha256);
  Assert.length(base64, computeBase64Length(256));
  var truncated = base64.slice(0, computeBase64Length(bits));
  Assert.length(truncated, computeBase64Length(bits));
  var noPadding = truncated.match(/^([^=]+)=*$/)[1];
  var niUri = "ni:///sha-256" + ((bits === 256) ? "" : ("-" + bits)) + ";" + noPadding;
  return niUri;
}//computeDigest

computeNiUri.test = function(){
  var hello = "Hello World!";
  Assert.length(hello, 12);
  
  //example in RFC6920
  var niUri256 = computeNiUri(hello, 256);
  Logger.log("computeNiUriTest: sha-256 : " + niUri256);
  Assert.equalStrings(niUri256, 'ni:///sha-256;f4OxZX_x_FO5LcGBSKHWXfwtSx-j1ncoSt3SABJtkGk');

  var niUri96 = computeNiUri(hello, 96);
  Logger.log("computeNiUriTest: sha-256-96 : " + niUri96);
}//computeNiUri.test

function computeNiUriTest(){
  computeNiUri.test();
}//computeNiUri
