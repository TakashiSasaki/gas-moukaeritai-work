function getMuteState(userId) {
  var jsonString = CacheService.getUserCache().get(userId);
  if(jsonString===null) {
    return null;
  }
  var jsonObject = JSON.parse(jsonString);
  var muteState = jsonObject["muted"];
  return muteState;
}
