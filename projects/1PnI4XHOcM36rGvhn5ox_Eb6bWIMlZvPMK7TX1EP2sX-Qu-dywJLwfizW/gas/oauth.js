function buildAuthorizationUrl() {
  var url = "https://slack.com/oauth/v2/authorize";
  url += "?client_id=" + PropertiesService.getScriptProperties().getProperty("client_id");
  url += "&redirect_uri=" + getCallbackUrl();
  //url += "&redirect_uri=" + "https://script.google.com/macros/s/AKfycbzVCxJzdcc0TqvhaapgDF7w1rhm1Q4Nb4SIPIsPuomYo6C05k4//usercallback";
  url += "&scope=channels:read";
  url += "&state=" + ScriptApp.newStateToken().withMethod("catchRequestToken").createToken();
  CacheService.getUserCache().put("authorizationUrl", url);
}

function catchRequestToken(e) {
  const htmlTemplate = HtmlService.createTemplateFromFile("exchange");
  CacheService.getUserCache().put("code", e.parameter.code);
  htmlTemplate.catchedData = e;
  htmlTemplate.code = e.parameter.code;
  fetchAccessToken();
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}

function fetchAccessToken() {
  var url = "https://slack.com/api/oauth.v2.access";
  const options = {
    "method": "POST",
    "payload": {
      "client_id": PropertiesService.getScriptProperties().getProperty("client_id"),
      "client_secret": PropertiesService.getScriptProperties().getProperty("client_secret"),
      "code": CacheService.getUserCache().get("code"),
      "redirect_uri": getCallbackUrl()
    }
  };
  //url += "?client_id=" + PropertiesService.getScriptProperties().getProperty("client_id");
  //url += "&client_secret=" + PropertiesService.getScriptProperties().getProperty("client_secret");
  //url += "&redirect_uri=" + getCallbackUrl();
  const httpResponse = UrlFetchApp.fetch(url, options);
  const cache = CacheService.getUserCache();
  cache.put("exchangedData", httpResponse.getContentText());
  const parsedBody = JSON.parse(httpResponse.getContentText());
  cache.put("app_id", parsedBody.app_id);
  cache.put("authed_user.id", parsedBody["authed_user"]["id"]);
  cache.put("scope", parsedBody.scope);
  cache.put("token_type", parsedBody.token_type);
  cache.put("access_token", parsedBody.access_token, 21600);
  cache.put("bot_user_id", parsedBody.bot_user_id);
  cache.put("team.id", parsedBody.team.id);
  cache.put("team.name", parsedBody.team.name);
  cache.put("enterprise", parsedBody.enterprise);
  cache.put("is_enterprise_install", parsedBody.is_enterprise_install);
}
