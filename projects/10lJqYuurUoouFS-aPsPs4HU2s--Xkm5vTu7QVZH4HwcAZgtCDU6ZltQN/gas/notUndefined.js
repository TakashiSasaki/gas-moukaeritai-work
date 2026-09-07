global = this;
/**
  @param {Any} any
  @return {Assert}
*/
function notUndefined(any) {
  if(typeof any === "undefined") throw "notUndefined: it is not 'undefined'.";
  return global;
}//notUndefined
