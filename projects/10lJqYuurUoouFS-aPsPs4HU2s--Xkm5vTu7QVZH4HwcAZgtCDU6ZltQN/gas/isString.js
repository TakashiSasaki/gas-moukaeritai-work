"use strict";
var global = this;
/**
  @param {String} s
  @return {Assert}
*/
function isString(s) {
  if(typeof s !== "string") throw ("isString: not a string");
  return global;
}//isString

function isStringTest(){
  console.log(isString("abcde"))
}
