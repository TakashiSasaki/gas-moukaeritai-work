active_user = Session.getActiveUser();
effective_user = Session.getEffectiveUser();

/**
  リロードにより重複して呼び出された場合でも
  既に取得したトークンを破壊しないようにしなければならない。
*/
function usercallback(e){
  try {
    CacheService.getUserCache().put("code", e.parameter.code);
    Logger.log(e.parameter.code);
  } catch (exception){
    //do nothing
  }
  fetchAccessToken();
  var html_template = HtmlService.createTemplateFromFile("code");
  var html_output = html_template.evaluate();
  return html_output;
}

function fetchAccessToken(){
  if(!CacheService.getUserCache().get("code")) {
    Loggerlog("!code : " + code);
    return;
  }
  var endpoint_url = "https://accounts.google.com/o/oauth2/token";
  var params = {
    "method" : "POST",
    "payload" : {
      "code" : CacheService.getUserCache().get("code"),
      "client_id" : PropertiesService.getScriptProperties().getProperty("client_id"),
      "client_secret" : PropertiesService.getScriptProperties().getProperty("client_secret"),
      "redirect_uri" :PropertiesService.getScriptProperties().getProperty("redirect_uri"),
      "grant_type" : "authorization_code",
    },
    "muteHttpExceptions" : true
  };
  CacheService.getUserCache().remove("code");
  var http_response = UrlFetchApp.fetch(endpoint_url, params);
  var json_string = http_response.getContentText();
  if(!json_string) {
    return;
  }
  var json_object = JSON.parse(json_string);
  Logger.log(json_object);
  var access_token = json_object.access_token;
  var token_type = json_object.token_type;
  var expires_in = json_object.expires_in;
  var refresh_token = json_object.refresh_token;
  if(!access_token) {
    return;
  }
  PropertiesService.getUserProperties().setProperty("access_token", access_token);
  PropertiesService.getUserProperties().setProperty("token_type", token_type);
  PropertiesService.getUserProperties().setProperty("expires_in", expires_in);  
  PropertiesService.getUserProperties().setProperty("refresh_token", refresh_token);  
}
