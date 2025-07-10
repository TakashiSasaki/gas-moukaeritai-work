/**
  @param {*} any
  @return {Boolean}
*/
function defined(any) {
  if(typeof any === "undefined") return false;
  return true;
}//defined

defined.test = function(){
  if(defined(undefined) === true) throw "defined.test: failed in case 1.";
  if(defined(123.455) === false) throw "defined.test: failed in case 2.";
  if(defined("abc") === false) throw "defined.test: failed in case 3.";
  if(defined(null) === false) throw "defined.test: failed in case 4.";
}//defined.test

function definedTest(){
  defined.test();
}
