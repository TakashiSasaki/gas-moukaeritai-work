function setMuteState(userId, muteState) {
  var jsonString = CacheService.getUserCache().get(userId);
  if(jsonString===null) {
    CacheService.getUserCache().put(userId, JSON.stringify({"muted":muteState}), 21600);
    return;
  }
  var jsonObject = JSON.parse(jsonString);
  jsonObject["muted"] = muteState;
  CacheService.getUserCache().put(userId, JSON.stringify(jsonObject), 21600);
}
