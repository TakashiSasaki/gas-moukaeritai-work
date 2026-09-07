/**
  Set token endpoint.
  Default is set to "https://www.googleapis.com/oauth2/v4/token".
  @param {String} token_endpoint
  @return {String} the same as given string
*/
function setTokenEndpoint(token_endpoint) {
  if(!token_endpoint) throw "invalid token_endpoint";
  return set_("token_endpoint", token_endpoint);
}

function getTokenEndpoint_(){
  try {
    return get_("token_endpoint");
  } catch (e) {
    return "https://www.googleapis.com/oauth2/v4/token";
  }
}
