/**
  @param {Number} len length
  @return {Array}
*/
function getInt8Array(len) {
  if(typeof len !== "number") throw "needs length";
  var a = getUint8Array(len);
  for(var i=0; i<a.length; ++i){
    var v = a[i];
    if(v > 127) {
      v = v - 256;
      a[i] = v;
    }//if
  }//for
  Assert_.numberArrayInRange(a, -128, 127);
  return a;
}//getInt8Array

getInt8Array.test = function(){
  Logger.log("getInt8Array : " + getInt8Array(5));
}//getInt8Array.test

getInt8Array.test = function(){
  var N = 200000;
  var values = getInt8Array(N);
  var counts = computeCounts(values, -128, 127);
  var stats = computeStats(counts);
  Logger.log(stats);
  var entropy = stats.entropy;
  var identicalEntropy = stats.identicalEntropy;
  if(Math.round(entropy, 2) !== Math.round(identicalEntropy, 2)){
    throw "getInt8ArrayTest: unexpected entropy.";
  }//if
}//getInt8Array.test

function getInt8ArrayTest(){
  getInt8Array.test();
}//getInt8ArrayTest


