/**
  It should be called back explicitly by the function dedicated by setCallbackFunctionName in caller project.
  Don't forget to give the callback parameter.

  function callback(e){
    return GasOAuthLibrary.callback(e);
  }

  @param {Object} e callback parameter.
  @return {HtmlOutput}
*/

function callback(e){
  Logger.log(e);
  if(!e.parameter.code) {
    throw "failed to get authorization code.";
  }
  
  if(!(e.parameter.temporary_active_user_key === Session.getTemporaryActiveUserKey())) {
    throw "temporary active user keys do not match";
  }
  
  try {
    var old_code = getAuthorizationCode_(e.parameter.code);
    if(old_code == e.parameter.code) return; //do nothing
  } catch (e) {
  }
  setAuthorizationCode_(e.parameter.code);
  
  var params = {
    "method" : "POST",
    "payload" : {
      "code" : e.parameter.code,
      "client_id" : e.parameter.client_id,
      "client_secret" : getClientSecret_(),
      "redirect_uri" : getRedirectEndpoint_(),
      "grant_type" : "authorization_code",
    },
    "muteHttpExceptions" : true
  };
  var http_response = UrlFetchApp.fetch(getTokenEndpoint_(), params);
  Logger.log(http_response.getBlob().getContentType());
  Logger.log(http_response.getContentText());
  if(http_response.getBlob().getContentType() === "application/x-www-form-urlencoded") {
    var formString = http_response.getContentText();
    var endpointObject = decodeXWwwFormUrlencoded(formString);
  } else {
    var jsonString = http_response.getContentText();
    var endpointObject = JSON.parse(jsonString);
  }
  
  setAccessToken_(endpointObject.access_token);
  setTokenType_(endpointObject.token_type);
  setTimestamp_();
  Logger.log(endpointObject.expires_in);
  setExpiresIn_(endpointObject.expires_in);
  if(endpointObject.refresh_token) {
    setRefreshToken(endpointObject.refresh_token);
  }
  
  var html_template = HtmlService.createTemplateFromFile("sampleResultPage");
  html_template.access_token = getAccessToken();
  html_template.token_type = getTokenType();
  html_template.timestamp = getTimestamp_();
  html_template.expires_in = getExpiresIn_();
  html_template.expires_at = getExpiresAt();
  html_template.temporary_active_user_key = e.parameter.temporary_active_user_key;
  try {
    html_template.refresh_token = getRefreshToken();
  } catch (e) {
    html_template.refresh_token = "no refresh token";
  }
  html_template.client_id = getClientId_();
  html_template.authorization_code = getAuthorizationCode_();
  var html_output = html_template.evaluate();
  html_output.setTitle(getAccessToken());
  return html_output;
}

function setAuthorizationCode_(authorization_code){
  if(!authorization_code) throw "invalid authorization code";
  return set_("authorization_code", authorization_code);
}

function getAuthorizationCode_(){
  return get_("authorization_code");
}

