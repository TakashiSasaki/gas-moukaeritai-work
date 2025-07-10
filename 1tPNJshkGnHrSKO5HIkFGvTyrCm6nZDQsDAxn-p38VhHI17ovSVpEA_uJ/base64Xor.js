base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
base64XorTable = undefined;

function getBase64XorTable(){
  if(base64XorTable !== undefined) {
    return base64XorTable;
  }
  var jsonString = CacheService.getScriptCache().get("base64XorTable");
  if(jsonString) {
    base64XorTable = JSON.parse(jsonString);
    return base64XorTable;
  }
  base64XorTable = makeBase64XorTable();
  return base64XorTable;  
}

function makeBase64XorTable(){
  base64XorTable = {};
  for(var i=0; i<256; i+=4) {
    for(var j=0; j<256; j+=4) {
      var xxxx = Utilities.base64Encode([i>=128?i-256:i]);
      var x = xxxx.slice(0,1);
      var yyyy = Utilities.base64Encode([j>=128?j-256:j]);
      var y = yyyy.slice(0,1);
      var zzzz = Utilities.base64Encode([(i^j)>=128?(i^j)-256:(i^j)]);
      var z = zzzz.slice(0,1);
      if(x in base64XorTable) {
        base64XorTable[x][y] = z;
      } else {
        base64XorTable[x] = {}
        base64XorTable[x][y] = z;
      }
    }
  }
  CacheService.getScriptCache().put("base64XorTable", JSON.stringify(base64XorTable), 21600);
  return base64XorTable;  
}

function xorBase64Strings(x,y){
  if(y === undefined) {
    if(x.length === 2) {
      return xorBase64(x[0], x[1]);
    }
    if(x.length === 1) {
      return x[0];
    }
    var z = xorBase64(x.slice(0, x.length-1));
    return xorBase64(z, x[x.length-1]);
  }
  base64XorTable = getBase64XorTable();
  x = x.replace(/=+$/, "");
  y = y.replace(/=+$/, "");
  z = "";
  if(x.length !== y.length) throw "x and y doesn't have the same length";
  for(var i=0; i<x.length; ++i) {
    var xor = base64XorTable[x.slice(i,i+1)][y.slice(i,i+1)];
    z += xor;
  }
  return z;
}

function testXorBase64(){
  if ("d" !== xorBase64WebSafeStrings(["a","b","c"])) throw "a xor b xor c === d";
  var hex1   = "5ddc3cbc731f121cde6a41aedd90ddae40ae6a0e";
  var hex2   = "e06022bd73c1328c45eea76bc8ba6d9fc2f66f5c";
  var xor12  = "bdbc1e0100de20909b84e6c5152ab03182580552";
  var int8Array1 = hexToInt8Array(hex1);
  var int8Array2 = hexToInt8Array(hex2);
  var base64String1 = Utilities.base64Encode(int8Array1);
  var base64String2 = Utilities.base64Encode(int8Array2);
  var base64String3 = xorBase64Strings(base64String1, base64String2);
  var int8Array3 = Utilities.base64Decode(base64String3);
  var hex3 = int8ArrayToHex(int8Array3);
  if(xor12 !== hex3) throw "hex1 xor hex2 === hex3";
}