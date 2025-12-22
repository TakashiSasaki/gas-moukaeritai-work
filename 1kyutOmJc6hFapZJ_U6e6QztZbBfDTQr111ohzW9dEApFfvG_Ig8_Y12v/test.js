function checkMyScopes() {
  const token = ScriptApp.getOAuthToken();
  const url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + token;
  const response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}
