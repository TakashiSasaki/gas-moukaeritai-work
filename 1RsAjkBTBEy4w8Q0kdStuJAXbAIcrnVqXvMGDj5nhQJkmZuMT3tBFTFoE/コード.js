var jwsHeader = '{"typ":"JWT",\r\n "alg":"HS256"}';
var jwsPayload = '{"iss":"joe",\r\n "exp":1300819380,\r\n "http://example.com/is_root":true}';
var jwk = '{"kty":"oct","k":"AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow"}';
var jwsInput = "eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ";
var signatureByteArray =  [116, 24, 223, 180, 151, 153, 224, 37, 79, 250, 96, 125, 216, 173,
   187, 186, 22, 212, 37, 77, 105, 214, 191, 240, 91, 88, 5, 88, 83,
   132, 141, 121];
var signatureBase64 = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
var keyBase64 = "AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow";

function doGet() {
  return HtmlService.createTemplateFromFile("index").evaluate().addMetaTag("viewport", "width=device-width,initial-scale=1").setTitle("JWT Sandbox");
}

function test(){
  var jws_input = [101, 121, 74, 48, 101, 88, 65, 105, 79, 105, 74, 75, 86, 49, 81, 105, 76, 65, 48, 75, 73, 67, 74, 104, 98, 71, 99, 105, 79, 105, 74, 73, 85, 122, 73, 49, 78, 105, 74, 57, 46, 101, 121, 74, 112, 99, 51, 77, 105, 79, 105, 74, 113, 98, 50, 85, 105, 76, 65, 48, 75, 73, 67, 74, 108, 101, 72, 65, 105, 79, 106, 69, 122, 77, 68, 65, 52, 77, 84, 107, 122, 79, 68, 65, 115, 68, 81, 111, 103, 73, 109, 104, 48, 100, 72, 65, 54, 76, 121, 57, 108, 101, 71, 70, 116, 99, 71, 120, 108, 76, 109, 78, 118, 98, 83, 57, 112, 99, 49, 57, 121, 98, 50, 57, 48, 73, 106, 112, 48, 99, 110, 86, 108, 102, 81];
  Logger.log("jws_input : " + jws_input);
  Logger.log("String.fromCharCode.apply(null, jws_input) : "+String.fromCharCode.apply(null, jws_input));
  var jws_input_string = "eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ";
  Logger.log("jws_input_string : " + jws_input_string);
  Logger.log("Utilities.base64Encode(jws_input_string) : " + Utilities.base64Encode(jws_input_string));
  var key_string = "AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow";
  Logger.log(key_string);
  Logger.log(key_string.length);
  var key_bytes = Utilities.base64DecodeWebSafe(key_string, Utilities.Charset.US_ASCII);
  Logger.log(key_bytes);
  Logger.log(key_bytes.length);
  Logger.log(Utilities.base64EncodeWebSafe(key_bytes));
  var signature_bytes = Utilities.computeHmacSha256Signature(jws_input_string, key_bytes);
  Logger.log(signature_bytes);
  var signature_base64 = Utilities.base64EncodeWebSafe(signature_bytes);
  Logger.log(signature_base64);
}

/**
  Investigate usage of Utilities.computeHmacSha256Signature function.
  https://en.wikipedia.org/wiki/Hash-based_message_authentication_code

  @return {String} "0xf7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
*/
function Hmac256WikipediaExample1(){
  var value_string = "The quick brown fox jumps over the lazy dog";
  var key_string = "key";
  var hmac_byte_array = Utilities.computeHmacSha256Signature(value_string, key_string);
  var hmac_hex_string = "0x";
  for(var i in hmac_byte_array) {
    var b = hmac_byte_array[i];
    if(b < 0) b+= 256;
    var b_hex = b.toString(16);
    hmac_hex_string += b_hex;
  }
  Logger.log(hmac_hex_string);
  return hmac_hex_string;
}


function test2(){
  var key_byte_array = Utilities.base64DecodeWebSafe(keyBase64);
  //var key_byte_array_positive = toPositiveByteArray(key_byte_array);
  var hmac_byte_array = Utilities.computeHmacSha256Signature(jwsInput, key_byte_array);
  Logger.log(hmac_byte_array);
  Logger.log(Utilities.base64EncodeWebSafe(hmac_byte_array));
}


function testJwsInput(){
  var value_byte_array = stringToByteArray(jwsInput);
  Logger.log(isEqualByteArray(value_byte_array, 
   [101, 121, 74, 48, 101, 88, 65, 105, 79, 105, 74, 75, 86, 49, 81,
   105, 76, 65, 48, 75, 73, 67, 74, 104, 98, 71, 99, 105, 79, 105, 74,
   73, 85, 122, 73, 49, 78, 105, 74, 57, 46, 101, 121, 74, 112, 99, 51,
   77, 105, 79, 105, 74, 113, 98, 50, 85, 105, 76, 65, 48, 75, 73, 67,
   74, 108, 101, 72, 65, 105, 79, 106, 69, 122, 77, 68, 65, 52, 77, 84,
   107, 122, 79, 68, 65, 115, 68, 81, 111, 103, 73, 109, 104, 48, 100,
   72, 65, 54, 76, 121, 57, 108, 101, 71, 70, 116, 99, 71, 120, 108, 76,
   109, 78, 118, 98, 83, 57, 112, 99, 49, 57, 121, 98, 50, 57, 48, 73,
   106, 112, 48, 99, 110, 86, 108, 102, 81]));
}

function testKey(){
  var key_byte_array = Utilities.base64DecodeWebSafe(keyBase64);
  Logger.log(isEqualByteArray(toPositiveByteArray(key_byte_array),       
       [3,35,53,75,43,15,165,188,131,126,6,101,119,123,166,143,90,179,40,
       230,240,84,201,40,169,15,132,178,210,80,46,191,211,251,90,146,
       210,6,71,239,150,138,180,195,119,98,61,34,61,46,33,114,5,46,79,8,
       192,205,154,245,103,208,128,163]));
}

function testSignature(){
  var byte_array = Utilities.base64DecodeWebSafe(signatureBase64);
  var byte_array_positive = toPositiveByteArray(byte_array);
  Logger.log(isEqualByteArray(byte_array_positive, signatureByteArray));
}

