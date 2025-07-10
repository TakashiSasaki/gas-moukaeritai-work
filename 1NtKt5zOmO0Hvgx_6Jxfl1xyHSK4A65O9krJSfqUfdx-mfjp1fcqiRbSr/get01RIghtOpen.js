/**
  @return {Number}
*/
function get01RightOpen() {
  throw "get01RightOpen: create an instance first.";
}//get01RightOpen

Random_.prototype.get01RightOpen = function(){
  return this.mt.random();
}//get01RightOpen


/**
  @return {Number}
*/
function get01RightOpen53bitResolution(){
  throw "get01RightOpen53bitResolution: create an instance first.";
}//get01RightOpen53bitResolution

Random_.prototype.get01RightOpen53bitResolution = function(){
  return this.mt.genrand_res53();
}//get01RightOpen53bitResolution

function get01RightOpen53bitResolutionTest(){
  var r = new Random();
  Logger.log(r.get01RightOpen53bitResolutionTest());
}
