function doGet(e) {
  const idFromMicrosoft = PropertiesService.getScriptProperties().getProperty("idFromMicrosoft");
  const valueFromMicrosoft = PropertiesService.getScriptProperties().getProperty("valueFromMicrosoft");
  
  const gasUrl = ScriptApp.getService().getUrl();
  if (gasUrl.indexOf("/exec") >= 0) {
    var redirectUriBase = gasUrl.slice(0, -4) + 'usercallback';
  } else {
    var redirectUriBase = gasUrl.slice(0, -3) + 'usercallback';
  }
  
  const authUrlBase = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
  //https://login.microsoftonline.com/common/oauth2/v2.0/authorize
  //https://login.microsoftonline.com/common/oauth2/v2.0/token
  
  var param = {
    "response_type" : "code",
    "client_id" : idFromMicrosoft,
    "redirect_uri" : redirectUriBase,
    "state" : ScriptApp.newStateToken().withMethod("callbackFromMicrosoft").withArgument("hoge", "fuga").withTimeout(2000).createToken(),
    "scope" : "https://graph.microsoft.com/User.Read",
    //"access_type" : "offline"
  };
  
  var paramArray = [];
  for(var name in param){ 
    paramArray.push(name + "=" + encodeURIComponent(param[name]));
  }

  const authUrl = authUrlBase + "?" + paramArray.join("&");
  Logger.log(authUrl);

  const template = HtmlService.createTemplateFromFile("index");  
  template.authUrl = authUrl;
  const output = template.evaluate();
  return output;
}

function callbackFromMicrosoft(e){
  Logger.log("callbackFromMicrosoft" + e);
}
