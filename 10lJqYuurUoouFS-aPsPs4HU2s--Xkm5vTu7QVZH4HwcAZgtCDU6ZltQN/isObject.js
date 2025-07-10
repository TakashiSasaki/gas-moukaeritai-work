global = this;
/**
  @param {Any} any
  @return {Assert}
*/
function isObject(any) {
  if(typeof any !== "object") {
    throw "isObject: not an object.";
  } // if
  return global;
}//isObject
