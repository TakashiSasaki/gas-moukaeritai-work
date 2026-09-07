/*
  @param {Array} a1
  @param {Array} a2
  @return {void}
*/
function equalArray(a1, a2){
  if(a1.length !== a2.length) throw "equalArray: Lengths differ.";
  for(var i=0; i<a1.length; ++i){
    equal(a1[i],a2[i]);
  }//for
}//equalArray

equalArray.test = function(){
  equalArray(["a", 1], ["a", 1]);
}//equalArray.test

function equalArrayTest(){
  equalArray.test();
}//equalArrayTest
