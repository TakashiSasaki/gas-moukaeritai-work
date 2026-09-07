function niUri(niUri) {
  var regex = /^ni:\/\/(.*)\/(.+);([a-zA-Z0-9_-]+)$/;
  if(typeof niUri !== "string") return false;
  var match = niUri.match(regex);
  if(match === null) return false;
  var authority = match[1];
  var alg = match[2];
  var val = match[3];
  return (match[0] === niUri);
}//niUri

niUri.test = function(){
  var case1 = "ni:///sha-256-96;ZiRXeW_W-DZ48twF";
  var result1 = niUri(case1);
  if(result1 !== true) throw "niUri.test: failed in case 1.";
}//niUri.test
  
function niUriTest(){
  niUri.test();
}//niUriTest
