global = this;
/**
  @param {Any} any
  @return {Assert}
*/
function isUndefined(any) {
  if(typeof any !== "undefined") {
    throw "isUndefined: not undefined.";
  }//if
  return global;
}//isUndefined
