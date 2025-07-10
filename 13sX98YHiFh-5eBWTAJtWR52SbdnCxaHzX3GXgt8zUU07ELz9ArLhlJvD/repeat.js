/**
  @param {String} s
  @param {Number} nRepeat
  @return {String}
*/
function repeat(s, nRepeat) {
  Assert.isString(s);
  Assert.isInteger(nRepeat);
  var result = "";
  for(var i=0; i<nRepeat; ++i) {
    result += s;
  }//for
  return result;
}//repeat

repeat.test = function(){
  Assert.equalStrings(repeat("a", 5), "aaaaa");
}//repeat.test

function repeatTest(){
  repeat.test();
}//repeatTest