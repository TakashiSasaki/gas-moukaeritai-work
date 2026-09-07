function getScreenName(){
  var screen_name = CacheService.getUserCache().get("screen_name");
  if(screen_name) return screen_name;
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/account/settings.json");
  var content_text = http_response.getContentText();
  var json_object = JSON.parse(content_text);
  screen_name = json_object.screen_name;
  CacheService.getUserCache().put("screen_name", screen_name, 21600);
  return screen_name;
}

function testGetScreenName(){
  Logger.log(getScreenName());
}
