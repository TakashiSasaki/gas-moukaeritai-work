function doGet(e) {
  var body = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/Wb0T/html").getContentText();
  var css = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/Wb0T/css").getContentText();
  var js = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/Wb0T/js").getContentText();
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.body = body;
  htmlTemplate.css = css;
  htmlTemplate.js = js;
  return htmlTemplate.evaluate();
}

function computeHotp(keyHex, count, nDigits) {
  var keyByteString = hexToByteString(keyHex);
  var countHex = numberTo16Hex(count);
  var countByteString = hexToByteString(countHex);
  var byteArray = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1, countByteString, keyByteString);
  return hmacToHotp(byteArray, nDigits, true);
}

function numberTo16Hex(number) {
  if (number < 0) throw "expecting non-negative integer";
  if (Math.floor(number) !== number) throw "expecting integer";
  var hex = Number(number).toString(16);
  Logger.log(hex);
  return ("0000000000000000" + hex).substr(-16);
}

function testNumberTo16Hex() {
  Logger.log(numberTo16Hex(1));
  Logger.log(numberTo16Hex(Math.floor(1111111109 / 30)));
}

function hexToByteString(s) {
  // s is the key to be converted in bytes
  var b = [];
  var last = s.length;
  for (var i = 0; i < last; i = i + 2) {
    var x = s[i] + s[i + 1];
    x.toUpperCase();
    x = "0x" + x;
    x = parseInt(x);
    b[i] = String.fromCharCode(x);
  }
  return b.join('');
}

function testHexToByteString() {
  Logger.log(hexToByteString("3132333435363738393031323334353637383930"));
}

function byteArrayToHex(byteArray) {
  var hexArray = [];
  for (var i = 0; i < byteArray.length; ++i) {
    var byte = byteArray[i];
    if (byte < 0) byte += 256;
    var hex = byte.toString(16);
    if (hex.length === 1) {
      hexArray.push("0" + hex);
    } else if (hex.length === 2) {
      hexArray.push(hex);
    } else {
      throw hex + " can't be 2 digit hex";
    }
  }
  return hexArray.join("");
}

function hmacToHotp(hmac, precision, signed) {
  if (hmac.length !== 20) throw "HMAC should be 20 bytes";
  if (signed === false) {
    for (var i in hmac) {
      if (typeof hmac[i] !== "number") throw "HMAC should be an array of numbers with length 20";
      if (hmac[i] < 0) throw "hmac[i] should be non-negative number";
      if (hmac[i] >= 256) throw "hmac[i] should be less than 256";
    }
  } else if (signed === true) {
    for (var i in hmac) {
      if (typeof hmac[i] !== "number") throw "HMAC should be an array of numbers with length 20";
      if (hmac[i] < -128) throw "hmac[i] is not in range of signed byte.";
      if (hmac[i] >= 128) throw "hmac[i] is not in range of signed byte.";
      if (hmac[i] < 0) hmac[i] += 256;
    }
  } else {
    throw "expecting 'signed' flag";
  }
  var offset = hmac[19] & 0xf;
  var byte1 = (hmac[offset + 0] & 0x7f) << 24;
  var byte2 = (hmac[offset + 1] & 0xff) << 16;
  var byte3 = (hmac[offset + 2] & 0xff) << 8;
  var byte4 = (hmac[offset + 3] & 0xff) << 0;
  if (byte1 < 0) throw "byte1 should be non-negative";
  if (byte2 < 0) throw "byte2 should be non-negative";
  if (byte3 < 0) throw "byte3 should be non-negative";
  if (byte4 < 0) throw "byte4 should be non-negative";
  var v = byte1 | byte2 | byte3 | byte4;
  v = "0000000000" + v;
  v = v.substr(v.length - precision, precision);
  return v;
}

