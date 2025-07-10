/**
  @param {string} salt
  @return {string} saltEmailHash
*/
function computeSaltEmailHash(salt) {
  var email = Session.getEffectiveUser().getEmail();
  var saltEmailHash = WebClipboardWriter.computeSaltEmailMd5(salt, email);
  return saltEmailHash;
}//computeSaltEmailHash

computeSaltEmailHash.test = function(){
  var saltEmailHash = computeSaltEmailHash("hoge");
  Logger.log("computeSaltEmailHash.test: " + saltEmailHash);
}//computeSaltEmailHash.test

function computeSaltEmailHashTest(){
  computeSaltEmailHash.test();
}//computeSaltEmailHashTest