/**
  @param {Number} a
  @return {void}
*/
function numberArray(a) {
  isArray(a);
  //var a = [];
  for(var i=0; i<a.length; ++i){
    if(typeof a[i] !== "number") {
      throw "numberArray: not a number.";
    }//if
  }//for
}//numberArray

numberArray.test = function(){
  numberArray([1,2,3]);
}//numberArray.test

function numberArrayTest(){
  numberArray.test();
}//numberArrayTest