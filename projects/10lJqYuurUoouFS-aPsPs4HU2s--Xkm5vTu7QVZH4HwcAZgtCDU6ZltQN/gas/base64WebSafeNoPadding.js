/**
  @param {String} s
  @return {void}
*/
function base64WebSafeNoPadding(s) {
  if(typeof s !== "string") throw "base64WebSafeNoPadding: not a string.";
  var regex = /^[A-Za-z0-9_-]+$/;
  var m = s.match(regex);
  if(m === null) throw "base64WebSafeNoPadding: not a 'Base64 Web Safe without Padding' string.";  
}//base64WebSafeNoPadding
