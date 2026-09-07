hexToIntTable = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "a": 10,
  "b": 11,
  "c": 12,
  "d": 13,
  "e": 14,
  "f": 15
}

intToHexTable = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ];

function hexToInt8Array(hexString) {
  var result = [];
  for(var i=0; i<hexString.length; i+=2) {
    var high4Bits = hexToIntTable[hexString.slice(i,i+1)];
    var low4Bits = hexToIntTable[hexString.slice(i+1, i+2)];
    var x = high4Bits * 16 + low4Bits;
    x = x>=128 ? x-256 : x;
    result.push(x);
  }
  return result;
}

function int8ArrayToHex(int8Array){
  var result = "";
  for(var i=0; i<int8Array.length; ++i) {
    var x = int8Array[i];
    x = x<0 ? x+256 : x;
    var high = Math.floor(x / 16);
    var low = x % 16;
    result += intToHexTable[high];
    result += intToHexTable[low];
  }
  return result;
}

function testHexToInt8Array(){
  var hex1   = "5ddc3cbc731f121cde6a41aedd90ddae40ae6a0e";
  var hex2   = "e06022bd73c1328c45eea76bc8ba6d9fc2f66f5c";
  var xor12  = "bdbc1e0100de20909b84e6c5152ab03182580552";
  Logger.log(hexToInt8Array(hex1));
}

function testint8ArrayToHex(){
  var int8Array =  [93.0, -36.0, 60.0, -68.0, 115.0, 31.0, 18.0, 28.0, -34.0, 106.0, 65.0, -82.0, -35.0, -112.0, -35.0, -82.0, 64.0, -82.0, 106.0, 14.0];
  Logger.log(int8ArrayToHex(int8Array));
}