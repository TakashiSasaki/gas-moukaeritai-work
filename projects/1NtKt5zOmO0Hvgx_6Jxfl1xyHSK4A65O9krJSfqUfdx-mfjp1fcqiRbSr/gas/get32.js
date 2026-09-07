/**
  @return {int} 32bit random integer value.
*/
function get32() {
  var v = globalInstance.get32();
  return v;
  //throw "get32: create an instance first.";
}//get31

Random_.prototype.get32 = function(){
  return this.mt.genrand_int32();
}//get31

get32.test=function(){
  var r1 = createWithFixedSeed();
  var r2 = createWithFixedSeed();
  var v1 = r1.get32();
  var v2 = r2.get32();
  Logger.log("get32 : " + v1.toFixed());
  Logger.log("get32 : " + v2.toFixed());
}
