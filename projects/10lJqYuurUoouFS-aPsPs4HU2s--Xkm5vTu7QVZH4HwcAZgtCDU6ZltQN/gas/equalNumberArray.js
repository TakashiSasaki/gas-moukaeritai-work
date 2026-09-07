/**
  @param {Array} array1
  @param {Array} array2
  @return {void}
*/
function equalNumberArray(array1, array2){
  numberArray(array1);
  numberArray(array2);
  if(array1.length !== array2.length) throw "Different lengths.";
  for(var i=0; i<array1.length; ++i){
    if(typeof array1[i] !== "number") throw "Not a number.";
    if(typeof array2[i] !== "number") throw "Not a number.";
    if(array1[i] !== array2[i]) throw "Different values.";
  }//for
}//equalNumberArray

equalNumberArray.test = function(){
  try{
    equalNumberArray([1,2,3], [1.0, 2.0, 3.0]);
  } catch(e){
    throw "equalNumberArray.test: false failure.";
  }//try
  
  try{
    equalNumberArray(["1", "2"], [1,2]);
    throw "equalNumberArray.test: false succeess.";
  } catch(e){
  }//try
  
  var case3 = [[1,2,3,null]];
  try{
    equalNumberArray(1, [1]);
    throw "equalNumberArray.test: false success.";
  } catch(e){
  }//try
}//equalNumberArray.test

function equalNumberArrayTest(){
  equalNumberArray.test();
}//equalNumberArrayTest

