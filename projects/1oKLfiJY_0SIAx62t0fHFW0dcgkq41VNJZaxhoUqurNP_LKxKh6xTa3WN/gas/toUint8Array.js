/**
  @param {Blob} blob or array of int
  @return {Array}
*/
function toUint8Array(blob) {
  //var blob = Utilities.newBlob(data)
  if(Is_.blob(blob)){
    var int8Array = blob.getBytes();
    return int8Array.map(function(x){return x<0 ? x+256: x;});
  } else {
    var array = blob;
    return array.map(function(x){return x<0 ? x+256: x;});
  }//if
}//toUint8Array

toUint8Array.test = function(){
  var blob = Utilities.newBlob([-1,0,1]);
  var uint8Array = toUint8Array(blob);
  Assert_.equalArray(uint8Array, [255,0,1]);
  Assert_.equalArray(toUint8Array([-1,0,1]),[255,0,1]);
}//toUint8Array.test

function toUint8ArrayTest(){
  toUint8Array.test();
}//toUint8ArrayTest
