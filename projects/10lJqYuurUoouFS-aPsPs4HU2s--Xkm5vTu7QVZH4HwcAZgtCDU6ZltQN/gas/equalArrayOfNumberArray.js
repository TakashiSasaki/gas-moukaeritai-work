/**
  @param {Array} array1
  @param {Array} array2
  @return {void}
*/
function equalArrayOfNumberArray(array1, array2){
  isArray(array1);
  isArray(array2);
  if(array1.length !== array2.length) throw "Different lengths.";
  for(var i=0; i<array1.length; ++i){
    var v1 = array1[i];
    var v2 = array2[i];
    equalNumberArray(v1, v2);
  }//for
}//equalArrayOfNumberArray

equalArrayOfNumberArray.test = function(){
  try{
    equalArrayOfNumberArray([[1],[1]],[[1.0],[1.0]]);
  } catch (e) {
    throw "equalArrayOfNumberArray.test: false failure.";
  }//try
  try{
    equalArrayOfNumberArray([[1],[1.1]],[[1.0],[1.0]]);
    throw "equalArrayOfNumberArray.test: false success.";
  } catch (e) {
  }//try
}//equalArrayOfNumberArray.test

function equalArrayOfNumberArrayTest(){
  equalArrayOfNumberArray.test();
}//equalArrayOfNumberArrayTest