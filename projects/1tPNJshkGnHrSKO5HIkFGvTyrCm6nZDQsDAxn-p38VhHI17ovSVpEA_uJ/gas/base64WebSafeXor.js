base64WebSafeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
base64WebSafeXorTable = undefined;

function getBase64WebSafeXorTable(){
  if(base64WebSafeXorTable !== undefined) {
    return base64WebSafeXorTable;
  }
  var jsonString = CacheService.getScriptCache().get("base64WebSafeXorTable");
  if(jsonString) {
    base64WebSafeXorWebSafeTable = JSON.parse(jsonString);
    return base64WebSafeXorWebSafeTable;
  }
  base64WebSafeXorWebSafeTable = makeBase64WebSafeXorTable();
  return base64WebSafeXorTable; 
}

function makeBase64WebSafeXorTable(){
  base64WebSafeXorTable = {};
  for(var i=0; i<256; i+=4) {
    for(var j=0; j<256; j+=4) {
      var xxxx = Utilities.base64EncodeWebSafe([i>=128?i-256:i]);
      var x = xxxx.slice(0,1);
      var yyyy = Utilities.base64EncodeWebSafe([j>=128?j-256:j]);
      var y = yyyy.slice(0,1);
      var zzzz = Utilities.base64EncodeWebSafe([(i^j)>=128?(i^j)-256:(i^j)]);
      var z = zzzz.slice(0,1);
      if(x in base64WebSafeXorTable) {
        base64WebSafeXorTable[x][y] = z;
      } else {
        base64WebSafeXorTable[x] = {}
        base64WebSafeXorTable[x][y] = z;
      }
    }
  }
  CacheService.getScriptCache().put("base64WebSafeXorTable", JSON.stringify(base64WebSafeXorTable), 21600);
  Logger.log(base64WebSafeXorTable);
  return base64WebSafeXorTable;  
}

function testBase64WebSafeAlphabet(){
  base64WebSafeXorTable = getBase64WebSafeXorTable();
  for(var i=0; i<64; ++i) {
    for(var j=0; j<64; ++j) {
      var x = base64WebSafeAlphabet.slice(i,i+1);
      var y = base64WebSafeAlphabet.slice(j,j+1);
      if(base64WebSafeXorTable[x][y]===undefined) throw x + " xor " + y + " is not in table";
    }
  }
}

function xorBase64WebSafeStrings(x,y){
  if(y === undefined) {
    if(x.length === 2) {
      return xorBase64WebSafeStrings(x[0], x[1]);
    }
    if(x.length === 1) {
      return x[0];
    }
    var z = xorBase64WebSafeStrings(x.slice(0, x.length-1));
    return xorBase64WebSafeStrings(z, x[x.length-1]);
  }
  base64WebSafeXorTable = getBase64WebSafeXorTable();
  x = x.replace(/=+$/, "");
  y = y.replace(/=+$/, "");
  z = "";
  if(x.length !== y.length) throw "x and y doesn't have the same length";
  for(var i=0; i<x.length; ++i) {
    var xor = base64WebSafeXorTable[x.slice(i,i+1)][y.slice(i,i+1)];
    z += xor;
  }
  return z;
}

function testXorBase64WebSafe(){
  if ("d" !== xorBase64WebSafeStrings(["a","b","c"])) throw "a xor b xor c === d";
  var hex1   = "5ddc3cbc731f121cde6a41aedd90ddae40ae6a0e";
  var hex2   = "e06022bd73c1328c45eea76bc8ba6d9fc2f66f5c";
  var xor12  = "bdbc1e0100de20909b84e6c5152ab03182580552";
  var int8Array1 = hexToInt8Array(hex1);
  var int8Array2 = hexToInt8Array(hex2);
  var base64WebSafeString1 = Utilities.base64EncodeWebSafe(int8Array1);
  var base64WebSafeString2 = Utilities.base64EncodeWebSafe(int8Array2);
  var base64WebSafeString3 = xorBase64WebSafeStrings(base64WebSafeString1, base64WebSafeString2);
  var int8Array3 = Utilities.base64DecodeWebSafe(base64WebSafeString3);
  var hex3 = int8ArrayToHex(int8Array3);
  if(xor12 !== hex3) throw "hex1 xor hex2 === hex3";
}

