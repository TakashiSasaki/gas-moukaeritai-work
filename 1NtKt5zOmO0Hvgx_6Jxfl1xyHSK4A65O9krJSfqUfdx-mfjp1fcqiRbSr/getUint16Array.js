/**
  @param {Number} len length
  @return {Array}
*/
function getUint16Array(len){
  if(typeof len !== "number") throw "needs length";
  var a = [];
  while(a.length < len){
    var v = globalInstance.get32();
    var upper16 = v >>> 16;
    var lower16 = v & 0x0000ffff;
    if(lower16 < 0) throw "Out of range. Too small.";
    if(lower16 > 65535) throw "Out of range. Too large.";
    if(upper16 < 0) throw "Out of range. Too small.";
    if(upper16 > 65535) throw "Out of range. Too large.";
    a.push(upper16);
    a.push(lower16);
  }//while
  Assert_.numberArrayInRange(a, 0, 65535);
  Assert_.numberArrayZeroBits(a, ~ 0xffff);
  return a.slice(0,len);
}//getUint16Array

getUint16Array.test = function(){
  Logger.log("getUint16Array : " + getUint16Array(5));
}//getUint16Array.test

function getUint16ArrayTest(){
  getUint16Array.test();
}//getUint16ArrayTest