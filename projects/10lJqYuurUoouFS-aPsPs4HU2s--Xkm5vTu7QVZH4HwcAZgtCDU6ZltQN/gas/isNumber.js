global = this;
/**
  @param {Number} n
  @return {Assert}
*/
function isNumber(n) {
  if(typeof n !== "number") throw "number: n is not a number.";
  return global;
}//isNumber

/**
  @param {Number} n
  @return {Assert}
*/
function isNumberPositive(n) {
  isNumber(n);
  if(n <=0) throw "isNumberPosotive: n is zero or positive number.";
  return global;
}//isNumberPosotive

/**
  @param {Number} n
  @return {Assert}
*/
function isNumberNegative(n) {
  isNumber(n);
  if(n >=0 ) throw "isNumberNegative: n is zero or negative number.";
  return global;
}//isNumberNegative

/**
  @param {Number} n
  @return {Assert}
*/
function isNumberNonZero(n) {
  isNumber(n);
  if(n === 0 ) throw "isNumberNonZero: n is zero.";
  return global;
}//isNumberNonZero

/**
  @param {Number} num
  @param {Number} min
  @param {Number} max
  @return {Assert}
*/
function isNumberInRange(num, min, max) {
  isNumber(num).isNumber(min).isNumber(max);
  if(min > max) throw "isNumberInRange: min and max is opposite";
  if(num > max) throw "isNumberInRange: Out of range. Too large.";
  if(num < min) throw "isNumberInRange: Out of range. Too small.";  
  return global;
}//isNumberInRange

