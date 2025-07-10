function getFeedsJsonString() {
  var url = "https://api.github.com/feeds";
  var cachedJsonString = CacheService.getUserCache().get(url);
  if(cachedJsonString) {
    Logger.log("getFeedsJsonString cache hit");
    return cachedJsonString;
  }
  var blob = GasOAuthLibrary.fetchBlob(url);
  var jsonString = blob.getDataAsString();
  Logger.log(jsonString);
  CacheService.getUserCache().put(url, jsonString);
  return jsonString;
}

function getUserName(){
  var feedsJsonString = getFeedsJsonString();
  var feedsJsonObject = JSON.parse(feedsJsonString);
  var currentUserPublicUrl = feedsJsonObject.current_user_public_url;
  var x = currentUserPublicUrl.split("/");
  var currentUser = x[x.length-1];
  Logger.log(currentUser);
  return currentUser;
}
