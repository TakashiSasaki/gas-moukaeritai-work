/**
  Set authorization endpoint.
  Default endpoint is set to "https://accounts.google.com/o/oauth2/v2/auth".
  @param {String} authorization_endpoint
  @return {String} authorization_endpoint, the same as given string
*/
function setAuthorizationEndpoint(authorizationEndpoint) {
  if(authorizationEndpoint === undefined) throw "invalid authorization endpoint";
  return set_("authorizationEndpoint", authorizationEndpoint);
}

function getAuthorizationEndpoint_(){
  try {
    return get_("authorizationEndpoint");
  } catch (e) {
    return "https://accounts.google.com/o/oauth2/v2/auth";
  }
}

