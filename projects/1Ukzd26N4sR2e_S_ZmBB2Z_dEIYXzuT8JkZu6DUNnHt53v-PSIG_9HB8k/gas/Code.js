const client_id = "546346188438-rgmoo8uvqta07sal41p1cpdjaqmf4amm.apps.googleusercontent.com";
const client_secret = "fIG4_w8lWwmI_FbeZqdgki8g";

function myFunction() {
  const url = "https://cloudresourcemanager.googleapis.com/v1/projects";
  const httpResponse = UrlFetchApp.fetch(url);
  Logger.log(httpResponse);

}

function getAuthorizationUrl() {
  const endpointUrl = "https://accounts.google.com/o/oauth2/auth";
  const state = ScriptApp.newStateToken().withMethod("receiveAuthorizationCode").createToken();
  const client_id = "546346188438-rgmoo8uvqta07sal41p1cpdjaqmf4amm.apps.googleusercontent.com";
  const redirect_uri = "https://script.google.com/macros/s/AKfycbzapKCD4fac6szWRM2UquJ0hsiaQWrQ6FXPzHozx5CtNqqp_H5pUZAQsKBSiYZkEis/usercallback";
  const response_type = "code";
  const authorizationUri = endpointUrl + "?state=" + encodeURIComponent(state)
    + "&client_id=" + encodeURIComponent(client_id)
    + "&redirect_uri=" + encodeURIComponent(redirect_uri)
    + "&scope=" + encodeURIComponent("https://www.googleapis.com/auth/cloud-platform")
    + "&response_type=code"
    + "&access_type=offline";
  return authorizationUri;
}

function receiveAuthorizationCode(e) {
  const code = e.parameter.code;
  if (typeof code === "string" && code.length > 0) {
    CacheService.getUserCache().put("code", code);
  }
  exchangeAuthorizationCodeForRefreshAndAccessTokens();
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}

function exchangeAuthorizationCodeForRefreshAndAccessTokens() {
  const endpointUrl = "https://oauth2.googleapis.com/token"
  const requestBody = {
    "client_id": "546346188438-rgmoo8uvqta07sal41p1cpdjaqmf4amm.apps.googleusercontent.com",
    "client_secret": "fIG4_w8lWwmI_FbeZqdgki8g",
    "grant_type": "authorization_code",
    "redirect_uri": "https://script.google.com/macros/s/AKfycbzapKCD4fac6szWRM2UquJ0hsiaQWrQ6FXPzHozx5CtNqqp_H5pUZAQsKBSiYZkEis/usercallback",
    "state": ScriptApp.newStateToken().withMethod("receiveRefreshAndAccessToken"),
    "code": CacheService.getUserCache().get("code")
  }
  const httpResponse = UrlFetchApp.fetch(endpointUrl, {
    "method": "POST",
    "payload": requestBody,
    "muteHttpExceptions": true
  });
  const contentText = httpResponse.getContentText();
  const o = JSON.parse(contentText);
  const access_token = o.access_token;
  const refresh_token = o.refresh_token;
  CacheService.getUserCache().put("access_token", access_token);
  CacheService.getUserCache().put("refresh_token", refresh_token);
}

function receiveRefreshAndAccessTokens(e) {
  const textOutput = ContentService.createTextOutput(JSON.stringify(e));
  return textOutput;
}

function getToken() {
  const url = "https://accounts.google.com/o/oauth2/auth";
  const param = {
    "method": "POST",
    "payload": {
      "grant_type": "authorization_code",
      "client_id": client_id,
      "client_secret": client_secret
    },
    "muteHttpExceptions": true
  }
  const httpResponse = UrlFetchApp.fetch(url, param);
  Logger.log(httpResponse);
}

function doGet() {
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}