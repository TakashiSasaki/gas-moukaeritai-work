function oauthUrl() {
  var endpoint_url = "https://accounts.google.com/o/oauth2/auth";
  var param = {
    "response_type" : "code",
    "client_id" : PropertiesService.getScriptProperties().getProperty("client_id"),
    "redirect_uri" : PropertiesService.getScriptProperties().getProperty("redirect_uri"),
    "state" : ScriptApp.newStateToken().withMethod("usercallback").withArgument("aaaa", "bbbb").withTimeout(2000).createToken(),  
    "scope" : ["https://www.googleapis.com/auth/script.storage"],
    "access_type" : "offline"
  };
  var params = [];
  for(var name in param){ 
    params.push(name + "=" + encodeURIComponent(param[name]));
  }
  var url = endpoint_url + "?" + params.join("&");  
  return url;
}
