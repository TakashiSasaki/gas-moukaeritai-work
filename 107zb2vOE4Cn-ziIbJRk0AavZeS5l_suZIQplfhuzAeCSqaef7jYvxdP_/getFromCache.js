function testGetFromCache() {
  try {
    getFromCache();
    getFromCache({});
  } catch (e) {
    console.log(e);
  }
}

/**
 * Retrieves a value from the cache using the provided key.
 *
 * @param {Object} params - The parameters for getting data from the cache.
 * @param {string} params.keyString - The key used to retrieve the data. Optional.
 * @param {string} params.email - The email associated with the data. Either this or emailMd5Base64WebSafe must be provided, but not both.
 * @param {string} params.emailMd5Base64WebSafe - The Base64 web safe MD5 hash of the email. Either this or email must be provided, but not both.
 * @returns {string} The value associated with the key in the cache.
 */
function getFromCache({keyString, email, emailMd5Base64WebSafe}) {
  
  if (!o) {
    o = {
      keyString: "***keyString***",
      email: "test@example.com"
    }
  }
  if (!isNonemptyString(o.keyString)) {
    throw new Error("keyString is mandatory.");
  }//if
  const keyMd5Byte = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, o.keyString);

  let emailMd5Byte = null;
  if (isNonemptyString(o.emailMd5Base64WebSafe) && !o.email) {
    emailMd5Byte = Utilities.base64DecodeWebSafe(o.emailMd5Base64WebSafe);
  } else if (isNonemptyString(o.email) && !o.emailMd5Base64WebSafe) {
    emailMd5Byte = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, o.email);
  }//if
  const xorByte = [];
  for (var i = 0; i < keyMd5Byte.length; ++i) {
    xorByte.push(emailMd5Byte[i] ^ keyMd5Byte[i]);
  }//for
  const xorBase64WebSafe = Utilities.base64EncodeWebSafe(xorByte);

  const cache = CacheService.getScriptCache();
  const value = cache.get(xorBase64WebSafe);
  if (!isNonemptyString(value)) {
    throw new Error("Failed to get valueString from the cache.");
  }//if
  return value;
}//getFromCache
