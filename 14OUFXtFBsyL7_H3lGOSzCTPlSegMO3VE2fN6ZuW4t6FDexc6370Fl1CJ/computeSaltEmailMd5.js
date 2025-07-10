/**
  @param {string} salt
  @param {string} email
  @return {string} Base64 encoded MD5 of email with salt.
*/
function computeSaltEmailMd5(salt, email) {
  var saltEmail = salt + ":" + email;
  var saltEmailMd5 = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, saltEmail);
  var saltEmailMd5Base64 = Utilities.base64Encode(saltEmailMd5);
  return saltEmailMd5Base64;
}//computeSaltEmailMd5
