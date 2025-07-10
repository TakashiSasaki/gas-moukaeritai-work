function getTwitterService() {
  var service = OAuth1.createService("twitter");
  service.setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
  service.setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
  service.setAuthorizationUrl("https://api.twitter.com/oauth/authorize")
  service.setConsumerKey(PropertiesService.getScriptProperties().getProperty("client_id"));
  service.setConsumerSecret(PropertiesService.getScriptProperties().getProperty("client_secret"));
  //service.setProjectKey(PropertiesService.getScriptProperties().getProperty("project_key"));
  service.setCallbackFunction("authCallback");
  service.setPropertyStore(PropertiesService.getScriptProperties());
  return service;
}

