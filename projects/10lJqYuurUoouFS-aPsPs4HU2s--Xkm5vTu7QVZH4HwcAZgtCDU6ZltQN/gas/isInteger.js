"use strict";

global = this;
/**
  @param {Number} i
  @result {Assert}
*/
function isInteger(i) {
  if(typeof i !== "number") throw "isInteger: not a number.";
  if(Math.ceil(i) !== i) throw "isInteger: not an integer number.";
  if(Math.floor(i) !== i) throw "isInteger: not an integer number.";
  return global;
}//isInteger

/**
  @param {Number} num
  @result {Assert}
*/
function isIntegerPositive(num) {
  isInteger(num);
  if(num <= 0) {
    throw "isIntegerPositive: zero or negative.";
  }//if
  return global;
}//isIntegerPositive

isInteger.test = function(){
  isInteger(1).isInteger(2);
  isInteger(2.0).isInteger(3.0);
}

function integerTest_(){
  isInteger.test();
}