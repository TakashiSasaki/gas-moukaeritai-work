GasOAuthLibrary.setAuthorizationEndpoint("https://github.com/login/oauth/authorize");
GasOAuthLibrary.setClientId(PropertiesService.getScriptProperties().getProperty("GithubClientId"));
GasOAuthLibrary.setClientSecret(PropertiesService.getScriptProperties().getProperty("GithubClientSecret"));
GasOAuthLibrary.setCallbackFunctionName("callback2");
GasOAuthLibrary.setScopeList("repo");
GasOAuthLibrary.setTokenEndpoint("https://github.com/login/oauth/access_token");

function doGet() {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate().setTitle("Github Repository Summary");
  return htmlOutput;
}

function callback2(e){
  Logger.log(e);
  return GasOAuthLibrary.callback(e);
}
