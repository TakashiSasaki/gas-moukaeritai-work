/**
  Get access token by refresh token if it exists.
  @return {String} access_token
*/
function refresh() {
  var params = {
    "method" : "POST",
    "payload" : {
      "refresh_token" : getRefreshToken(),
      "client_id" : getClientId_(),
      "client_secret" : getClientSecret_(),
      "grant_type" : "refresh_token",
    },
    "muteHttpExceptions" : false
  };
  var http_response = UrlFetchApp.fetch(getTokenEndpoint_(), params);
  Logger.log(http_response.getResponseCode());
  var json_string = http_response.getContentText();
  Logger.log(json_string);  
  var json_object = JSON.parse(json_string);
  var access_token = json_object.access_token;
  Logger.log(access_token);
  setAccessToken_(access_token);
  setTokenType_(json_object.token_type);
  setTimestamp_();
  setExpiresIn_(json_object.expires_in);
  return access_token;
}
