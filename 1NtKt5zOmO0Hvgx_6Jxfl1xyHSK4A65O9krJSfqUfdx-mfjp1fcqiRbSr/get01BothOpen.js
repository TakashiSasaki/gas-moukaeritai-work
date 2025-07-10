/**
  @return {Number}
*/
function get01BothOpen() {
  throw "get01BothOpen: create an instance first.";
}//get01BothOpen

Random_.prototype.get01BothOpen = function(){
  return this.mt.genrand_real3();
}//get01BothOpen

function get01BothOpenTest(){
  var random = new Random_();
  var x = random.get01BothOpen();
  Logger.log(x);
}//get01BothOpenTest