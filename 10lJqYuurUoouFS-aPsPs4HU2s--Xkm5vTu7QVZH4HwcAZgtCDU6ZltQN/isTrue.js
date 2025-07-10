"use strict";
var global = this;

/**
  @param {Boolean} b
  @return {Assert}
*/
function isTrue(b) {
  if(b === true) return global;
  throw "isTrue: not true.";
}//isTrue

