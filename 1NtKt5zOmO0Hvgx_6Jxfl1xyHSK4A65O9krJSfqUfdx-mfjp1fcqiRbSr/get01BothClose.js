/*
  @param {void}
  @return {Number}
*/
function get01BothClose() {
  throw "get01:　create an instance first."; 
}

Random_.prototype.get01BothClose = function(){
  return this.mt.genrand_real1();
}

get01BothClose.test = function(){
  var r1 = createWithFixedSeed();
  var v1 = r1.get01BothClose();
  Logger.log("get01BothClose : " + v1);
};
