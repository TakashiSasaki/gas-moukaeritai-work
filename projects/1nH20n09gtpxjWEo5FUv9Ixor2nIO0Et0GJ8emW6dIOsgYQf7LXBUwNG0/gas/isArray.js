/*
  @param {Array} arrayOrSomething array or something
  @return {Boolean} true if arrayOrSomething is an array
*/
function isArray(arrayOrSomething) {
  return Object.prototype.toString.call(arrayOrSomething) === '[object Array]';
}//isArray

isArray.test = function(){
  assertEqual(true, isArray([]));
  assertEqual(false, isArray(""));
}//isArray.test

function isArrayTest(){
  isArray.test();
}//isArrayTest
