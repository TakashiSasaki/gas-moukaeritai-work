/**
  @param {Array} a
  @param {Number} len
  @return {void}
*/
function arrayLength(a, len) {
  isArray(a);
  if(a.length !== len) {
    throw "arrayLength: the length of give array is not " + len + ".";
  }
}
