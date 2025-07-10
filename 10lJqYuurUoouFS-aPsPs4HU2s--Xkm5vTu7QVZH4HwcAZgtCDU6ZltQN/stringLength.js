global = this;
/**
  @param {Any} any
  @param {Number} len
  @return {Assert}
*/
function length(any, len) {
  if(any.length !== len) throw "length: length is not " + len;
  return global;
}//length
