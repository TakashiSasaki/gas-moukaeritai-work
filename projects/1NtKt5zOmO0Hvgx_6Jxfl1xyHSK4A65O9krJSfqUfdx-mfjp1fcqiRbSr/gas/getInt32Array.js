/**
  @param {Number} len length
  @return {Array}
*/
function getInt32Array(len){
  if(typeof len !== "number") throw "needs length";
  var a = getUint32Array(len);
  for(var i=0; i<len; ++i){
    if(a[i] < 0) throw "Out of range. Too small.";
    if(a[i] > 4294967295) throw "Out of range. Too large.";
    if((a[i] & (~(0xffffffff))) !== 0) throw "Unexpected bit is set to 1.";
    if((a[i] & 0x80000000) !== 0){
      var v = a[i];
      v = ~ v;
      v += 1;
      v &= 0x7fffffff;
      v = -v;
      a[i] = v;
    }//if
    if(a[i] < -2147483648) throw "Out of range. Too small.";
    if(a[i] > 2147483647) throw "Out of range. Too large.";
  }//for
  Assert_.numberArrayInRange(a, -2147483648, 2147483647);
  Assert_.numberArrayZeroBits(a, 0xffffffff00000000);
  return a;
}//getInt32Array

getInt32Array.test = function(){
  Logger.log("getInt32Array : " + getInt32Array(5));
}

function getInt32ArrayTest(){
  getInt32Array.test();
}

/**
  @param {Number} len length
  @return {Array}
*/
function getUint32Array(len){
  if(typeof len !== "number") throw "needs length";
  var a = new Array(len);
  for(var i=0; i<len; ++i){
    var v = globalInstance.get32();
    if(v < 0) throw "Out of range. Too small.";
    if(v > 4294967295) throw "Out of range. Too large.";
    if((v & (~ 0xffffffff)) !== 0) throw "Unexpected bit is set to 1";
    a[i] = v;
  }//for
  Assert_.numberArrayInRange(a, 0, 4294967295);
  Assert_.numberArrayZeroBits(a, ~ 0xffffffff);
  return a;
}//getUint32Array

getUint32Array.test = function(){
  Logger.log("getUint32Array : " + getUint32Array(5));
}

function getUint32ArrayTest(){
  getUint32Array.test();
}