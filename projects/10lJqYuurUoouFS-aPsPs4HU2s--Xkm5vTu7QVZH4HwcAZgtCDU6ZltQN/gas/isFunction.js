global = this;
/**
  @param {Function} func
  @return {Assert}
*/
function isFunction(func) {
  if(typeof func === "function") return global;
  throw "isFunction: not a function.";
}//isFunction

