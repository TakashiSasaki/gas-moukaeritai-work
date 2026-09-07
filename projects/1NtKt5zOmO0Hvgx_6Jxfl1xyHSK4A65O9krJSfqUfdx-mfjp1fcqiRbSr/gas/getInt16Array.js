/**
  @param {Number} len length
  @return {Array}
*/
function getInt16Array(len){
  if(typeof len !== "number") throw "needs length";
  var a = getUint16Array(len);
  for(var i=0; i<a.length; ++i){
    var v = a[i];
    if(v < 0) throw "Out of range. Too small.";
    if(v > 65535) throw "Out of range. Too large.";
    if(v > 32767) {
      v -= 65536;
      a[i] = v;
    }
    if(a[i] < -32768) throw "Out of range. Too small.";
    if(a[i] > 32767) throw "Out of range. Too large.";
  }//for
  Assert_.numberArrayInRange(a, -32768, 32767);
  return a;
}//getInt16Array

getInt16Array.test = function(){
  Logger.log("getInt16Array : " + getInt16Array(5));
}

