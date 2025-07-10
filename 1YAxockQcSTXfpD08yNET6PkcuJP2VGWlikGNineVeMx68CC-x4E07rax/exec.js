function exec(function_name, parameters) {
  var params = {
    "method" : "POST",
    "contentType" : "application/json",
    "headers" : {
      "Authorization" : "Bearer " + PropertiesService.getUserProperties().getProperty("access_token")
    },
    "payload" : JSON.stringify({
      "function": function_name,
      "parameters": parameters,
      "devMode" : true
    }),
    "muteHttpExceptions": true
  };
  var url = "https://script.googleapis.com/v1/scripts/" 
          + "1NYN_AoEoGoZIOKurCE2dSWFMzpBTeZFczQ-q_F4d-mvQ2XK6rdtz3Zev"
          + ":run";
  var http_response = UrlFetchApp.fetch(url, params);
  var content_text = http_response.getContentText();
  var json_object = JSON.parse(content_text);
  var result = json_object.response.result;
  Logger.log(content_text);
  return result;
}
