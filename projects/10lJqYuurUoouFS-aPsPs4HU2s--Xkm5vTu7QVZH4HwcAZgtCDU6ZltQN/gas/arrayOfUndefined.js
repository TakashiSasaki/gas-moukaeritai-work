"use strict";
var global = this;
/**
  @param {Any} any
  @return {Assert}
*/
function arrayOfUndefined(any) {
  isArray(any);
  return global;
}//arrayOfUndefined

arrayOfUndefined.test = function(){
  arrayOfUndefined([,,,,]);
  arrayOfUndefined(new Array(100));
}

function arrayOfUndefinedTest(){
  arrayOfUndefined.test();
}