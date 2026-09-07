/**
  @param {Array} a
  @return {Boolean}
*/
function array(a) {
  return Object.prototype.toString.call(a) === '[object Array]';
}//array

array.test = function(){
  var case1 = [1,2,3];
  var result1 = array(case1);
  if(result1 !== true) throw "array.test: failed in case 1.";
  var case1 = {};
  var result2 = array(case1);
  if(result2 === true) throw "array.test: failed in case 2.";
}//array.test

function arrayTest(){
  array.test();
}//arrayTest