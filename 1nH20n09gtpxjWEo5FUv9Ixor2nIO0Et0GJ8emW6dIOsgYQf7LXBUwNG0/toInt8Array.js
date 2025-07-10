/**
  @param {Array} uint8Array signed or unsigned 8bit int array
  @return {Array} signed 8bit int array
*/
function toInt8Array(uint8Array){
  //var uint8Array = []
  return uint8Array.map(function(x){return x<=127 ? x : x-256;});
}//toInt8Array
