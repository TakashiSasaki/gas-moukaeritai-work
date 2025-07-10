/**
  @param {Blob} blob or array
  @return {String}
*/
function computeSha1Hex(blob) {
  var uint8Array = toUint8Array(blob);
  var hexString = sha1.hex(uint8Array);
  return hexString;
}//computeSha1Hex

/**
  @param {Blob} blob or array
  @return {Array} an array of unsigned int
*/
function computeSha1Uint8Array(blob){
  var uint8Array = toUint8Array(blob);
  return sha1.bin(uint8Array);
}//computeSha1Uint8Array

/**
  @param {Blob} blob or array
  @return {Blob}
*/
function computeSha1Blob(blob){
  var uint8Array = computeSha1Uint8Array(blob);
  return uint8Array.map(function(x){return x <= 127 ? x : x-256;});
}//computeSha1Uint8Array
