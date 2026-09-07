function test() {
  //Test Vectors in RFC6238
  const secret = "3132333435363738393031323334353637383930";
  Logger.log(computeHotp(secret, 0, 6));
}

function testHmacSha1() {
  const input = Utilities.base64Decode("aW5wdXQgdG8gaGFzaA0K");
  const hmac = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1,

    [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
    ,
    [
      0x31,
      0x32,
      0x33,
      0x34,
      0x35,
      0x36,
      0x37,
      0x38,
      0x39,
      0x30,
      0x31,
      0x32,
      0x33,
      0x34,
      0x35,
      0x36,
      0x37,
      0x38,
      0x39,
      0x30
    ]
  );
  Logger.log(byteArrayToHex(hmac));
}