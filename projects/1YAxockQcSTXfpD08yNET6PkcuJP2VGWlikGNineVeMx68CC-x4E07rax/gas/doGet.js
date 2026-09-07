function doGet(){
  if(!PropertiesService.getUserProperties().getProperty("access_token")){
    if(!CacheService.getUserCache().get("code")) {
      var html_template = HtmlService.createTemplateFromFile("code");
      var html_output = html_template.evaluate();
      return html_output;
    } else {
      fetchAccessToken();
      var html_template = HtmlService.createTemplateFromFile("code");
      var html_output = html_template.evaluate();
      return html_output;  
    }
  } else {
    var html_template = HtmlService.createTemplateFromFile("code");
    var html_output = html_template.evaluate();
    return html_output;
  }
}

function deleteToken(){
  PropertiesService.getUserProperties().deleteProperty("access_token");
}

