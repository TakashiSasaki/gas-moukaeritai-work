/*
  @param {string|number|boolean} string, number or boolean
  @return {void}
*/
function equal(v1, v2) {
  if(typeof v1 !== typeof v2) throw "equal: different types. typeof v1: " + typeof v1 + ", typeof v2: " + typeof v2;
  if(v1 !== v2) throw "equal: value is not equal. v1: " + v1 + ", v2: " + v2;
}//equal

equal.test = function(){
  equal("aaa", "aaa");
}//equal.test

function equalTest(){
  equal.test();
}//equalTest
