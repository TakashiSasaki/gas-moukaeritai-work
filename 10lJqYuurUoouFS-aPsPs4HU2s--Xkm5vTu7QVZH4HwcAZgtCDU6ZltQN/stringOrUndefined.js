/**
  @param {String} s
  @return {void}
*/
function stringOrUndefined(s) {
  if(typeof s === "string") return;
  if(typeof s === "undefined") return;
  throw "stringOrUndefined: neither undefined or string.";
}//stringOrUndefined


