global = this;
/**
  @param {Any} n
  @return {Assert}
*/
function isNull(n) {
  isObject(n);
  //if(typeof n !== "object") throw "isNull: not an object.";
  if(n !== null) throw "isNull: not a null object.";
  return global;
}//isNull

isNull.test = function(){
  isNull(null).isNull(null);
}

function isNullTest(){
  isNull.test();
}
