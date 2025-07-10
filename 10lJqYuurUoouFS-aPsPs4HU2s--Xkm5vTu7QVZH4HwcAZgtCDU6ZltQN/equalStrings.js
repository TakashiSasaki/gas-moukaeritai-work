/**
  @param {String} s1
  @param {String} s2
  @return {void}
*/
function equalStrings(s1, s2){
  if(typeof s1 !== "string") throw "equalString: s1 is not a string.";
  if(typeof s2 !== "string") throw "equalString: s2 is not a string.";
  if(s1 !== s2) throw "s1 and s2 is not equal.";
}//equalString
