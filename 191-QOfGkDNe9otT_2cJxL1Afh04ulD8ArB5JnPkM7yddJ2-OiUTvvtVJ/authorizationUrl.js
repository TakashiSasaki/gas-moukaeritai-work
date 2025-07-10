/**
  @return {String} authorization URL
*/
function getAuthorizationUrl() {
  var param = {
    "response_type": "code",
    "client_id": getClientId_(),
    "scope": getScopeList_(),
    "access_type": "offline",
    "prompt": "consent"
  };
  try {
    param["state"] = ScriptApp.newStateToken().withMethod(getCallbackFunctionName_())
      .withArgument("temporary_active_user_key", Session.getTemporaryActiveUserKey())
      .withArgument("client_id", getClientId_())
      .withTimeout(2000).createToken();
    param["redirect_uri"] = getRedirectEndpoint_();
  } catch (e) {
    Logger.log(e);
    param["redirect_uri"] = "urn:ietf:wg:oauth:2.0:oob";
  } //try
  var params = [];
  for (var name in param) {
    params.push(name + "=" + encodeURIComponent(param[name]));
  }
  var url = getAuthorizationEndpoint_() + "?" + params.join("&");
  //Logger.log(url);
  return url;
}

function getRedirectEndpoint_() {
  var redirectEndpoint = CacheService.getUserCache().get("redirectEndpoint");
  if (redirectEndpoint === null) {
    var service_url = ScriptApp.getService().getUrl();
    var redirectEndpoint = service_url.replace(/exec$/, "usercallback").replace(/dev$/, "usercallback");
    CacheService.getUserCache().put("redirectEndpoint", redirectEndpoint);
  }
  return redirectEndpoint;
}