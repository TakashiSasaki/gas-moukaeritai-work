/**
  @param {Number} len length
  @return {Array} an array of 8bit unsigned int.
*/
function getUint8Array(len){
  if(typeof len !== "number") throw "needs length";
  var a = [];
  while(a.length < len){
    var v = globalInstance.get32();
    var b1 = v >>> 24;
    var b2 = (v >>> 16) & 0xff;
    var b3 = (v >>> 8) & 0xff;
    var b4 = v  & 0xff;
    if(b1 > 255 || b1 < 0) throw "error";
    if(b2 > 255 || b2 < 0) throw "error";
    if(b3 > 255 || b3 < 0) throw "error";
    if(b4 > 255 || b4 < 0) throw "error";
    a.push(b1);
    a.push(b2);
    a.push(b3);
    a.push(b4);
  }//while
  Assert_.numberArrayInRange(a, 0, 255);
  Assert_.numberArrayZeroBits(a, ~ 0xff);
  return a.slice(0,len);
}//getUint8Array

getUint8Array.test = function(){
  var N = 200000;
  var values = getUint8Array(N);
  var counts = computeCounts(values, 0, 255);
  var stats = computeStats(counts);
  Logger.log(stats);
  var entropy = stats.entropy;
  var identicalEntropy = stats.identicalEntropy;  
  if(Math.round(entropy, 2) !== Math.round(identicalEntropy, 2)){
    throw "getInt8ArrayTest: unexpected entropy.";
  }//if
}//getUint8Array.test

function getUint8ArrayTest(){
  getUint8Array.test();
}//getUint8ArrayTest
