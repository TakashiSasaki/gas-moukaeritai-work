/**
  @return 31 bit random integer value.
*/
function get31() {
  throw "get31: create an instance first.";
}

Random_.prototype.get31 = function(){
  return this.mt.genrand_int31();
}//get31

get31.test = function(){
  var r1 = createWithFixedSeed();
  var v1 = r1.get31();
  Logger.log("get31 : " + v1.toFixed());
}
