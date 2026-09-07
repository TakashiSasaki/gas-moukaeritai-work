"use strict";
var global = this;
/**
  @param {*} any
  @return {Assert}
*/
function isDefined(any) {
  if(typeof any === "undefined") throw "isDefined: is undefined.";
  return global;
}//isDefined
