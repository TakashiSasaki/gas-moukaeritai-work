/**
  @param {String} s
  @return {void}
*/
function base64(s) {
  if(typeof s !== "string") throw "base64: not a string.";
  var regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
  var m = s.match(regex);
  if(m === null) throw "base64: not a Base64 string.";
}//base64
