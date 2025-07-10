"use strict";
var global = this;
/**
  @param {Array} a
  @return {Assert}
*/
function isArray(a) {
  if(Object.prototype.toString.call(a) !== '[object Array]') {
    throw "isArray: not an array.";
  }//if
  return global;
}//isArray
