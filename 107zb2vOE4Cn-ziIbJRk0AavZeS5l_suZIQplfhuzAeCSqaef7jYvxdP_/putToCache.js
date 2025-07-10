function testPutToCache() {
  try {
    putToCache();
    putToCache({});
  } catch (e) {
    console.log(e);
  }
  try {
    putToCache({
      valueString: "***valueString***",
      email: "test@example.com"
    });
  } catch (e) {
    console.log(e);
  }
  console.log("testPutToCache finished.");
}

/**
  * putToCache(o)
  * @param {Object} o
  * @param {String} o.keyString
  * @param {String} o.valueString
  * @param {String} o.email
  * @param {String} o.emailMd5Base64WebSafe
*/
function putToCache(o) {
  if (!o) {
    o = {
      email: "test@example.com",
      valueString: "***valueString***",
      keyString: "***keyString***",
    }
  }//if
  if (!isNonemptyString(o.valueString)) {
    throw new Error("valueString is mandatory.");
  }//if
  if (!isNonemptyString(o.keyString)) {
    o.keyString = Utilities.getUuid();
  }//if
  const keyMd5Byte = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, o.keyString);

  let emailMd5Byte = null;
  if (isNonemptyString(o.emailMd5Base64WebSafe) && !o.email) {
    emailMd5Byte = Utilities.base64DecodeWebSafe(o.emailMd5Base64WebSafe);
  } else if (!o.emailMd5Base64WebSafe && isNonemptyString(o.email)) {
    emailMd5Byte = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, o.email);
  } else {
    throw new ("emailMd5Base64WebSafe or email is required.")
  }//if

  const xorByte = [];
  for (var i = 0; i < keyMd5Byte.length; ++i) {
    xorByte.push(keyMd5Byte[i] ^ emailMd5Byte[i]);
  }//for
  const xorBase64WebSafe = Utilities.base64EncodeWebSafe(xorByte);

  const cache = CacheService.getScriptCache();
  cache.put(xorBase64WebSafe, o.valueString);
  const value2 = cache.get(xorBase64WebSafe);
  if (o.valueString.length !== value2.length) {
    throw new Error("Failed to put the valueString. May be too long.")
  }//if
  return o.keyString;
}//putToCache

