function doGet(e) {
  setAuthorizationEndpoint("https://accounts.google.com/o/oauth2/auth")
  setClientId(PropertiesService.getScriptProperties().getProperty("client_id"));
  setScopeList(["https://www.googleapis.com/auth/script.storage"]);
  setClientSecret(PropertiesService.getScriptProperties().getProperty("client_secret"));
  setTokenEndpoint("https://accounts.google.com/o/oauth2/token");
  setCallbackFunctionName("callback");
  

  return HtmlService.createTemplateFromFile("sampleTopPage").evaluate().setTitle("GasOAuthLibrary");
//  var authorizationHtmlOutput = HtmlService.createTemplateFromFile("sample").evaluate();
//  HtmlTemplateLibrary.addHtmlOutput(authorizationHtmlOutput, "authorization");
//  var htmlOutput = HtmlTemplateLibrary.getHtmlOutput("OAuth Library Demo");
//  return htmlOutput;
//  return HtmlTemplateLibrary.tabs(
//  [HtmlService.createTemplateFromFile("authorization").evaluate().setTitle("authorization")], 
//  HtmlService.createHtmlOutputFromFile("css").setTitle("OAuth Library"));
  
}
