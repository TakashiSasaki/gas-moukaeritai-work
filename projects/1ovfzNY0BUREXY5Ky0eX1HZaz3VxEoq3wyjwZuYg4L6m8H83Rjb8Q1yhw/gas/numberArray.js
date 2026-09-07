/**
  @param {Array}
  @return {Boolean}
*/
function numberArray(a) {
  if(!array(a)) return false;
  //var a = [];
  for(var i=0; i<a.length; ++i){
    if(typeof a[i] !== "number") return false;
  }
  return true;
}//numberArray

numberArray.test = function(){
  var case1 = [1,2,3];
  var result1 = numberArray(case1);
  if(result1 !== true) throw "numberArray.test: false negative.";
  var case2 = ["2", "hello"];
  var result2 = numberArray(case2);
  if(result2 !== false) throw "numberArray.test: false positive.";
}//numberArray.test

function numberArrayTest(){
  numberArray.test();
}//numberArrayTest
