// This code coms from https://github.com/speakeasyjs/base32.js/blob/master/test/base32_test.js
// by Kyle Drake https://github.com/kyledrake

var testStrings = ["", "f", "fo", "foo", "foob", "fooba", "foobar"];
var base32Strings = ["", "MY======", "MZXQ====", "MZXW6===", "MZXW6YQ=", "MZXW6YTB", "MZXW6YTBOI======"];
var base32HexStrings = ["", "CO======", "CPNG====", "CPNMU===", "CPNMUOG=", "CPNMUOJ1", "CPNMUOJ1E8======"];

function testDecodeRfc4648(){
  for(var i=0; i<testStrings.length; ++i){
    var str = base32Strings[i];
    var decoder = new Decoder({ type: "rfc4648" });
    var decoded = decoder.write(str).finalize();
    var decodedString = decoded.map(function(x){return String.fromCharCode(x)}).join("");
    if(decodedString !== testStrings[i]) throw "'" + str + "' should be decoded to '" + testStrings[i] + "'";
    Logger.log(str + " --> " + decodedString);
  }
}

function testEncodeCrockford(){
  for(var i=0; i<testStrings.length; ++i){
    var str = testStrings[i];
    var charArray = str.split("");
    var byteArray =charArray.map(function(x){return x.charCodeAt(0);});
    var encoder = new Encoder({ type: "crockford" });
    var encoded = encoder.write(byteArray).finalize();
    Logger.log(str + " --> " + encoded);
  }
}

function testDecodeBase32Hex(){
  for(var i in testStrings) {
    var str = base32HexStrings[i];
    var decoder = new Decoder({ type: "base32hex" });
    var decoded = decoder.write(str).finalize();
    var decodedString = decoded.map(function(x){return String.fromCharCode(x)}).join("");
    if(decodedString !== testStrings[i]) throw "'" + str + "' should be decoded to '" + testStrings[i] + "'";
    Logger.log(str + " --> " + decodedString);
  }
}

function test4(){
      var encoder = new Encoder({ type: "rfc4648" });
      var encode = encoder.write(buf).finalize();
}

function test5(){
      var encoder = new Encoder({ type: "crockford" });
      var encoded = encoder.write(buf).finalize();
}

function test6(){
      var encoder = new Encoder({ type: "crockford", lc: true });
      var encoded = encoder.write(buf).finalize();
}

function test7(){
      var encoder = new Encoder({ type: "base32hex", lc: true });
      var encoded = encoder.write(buf).finalize();
}
        
