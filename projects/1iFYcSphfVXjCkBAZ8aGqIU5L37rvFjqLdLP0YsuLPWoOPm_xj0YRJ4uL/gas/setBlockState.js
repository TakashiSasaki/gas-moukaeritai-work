function setBlockState(userId, blockState) {
  var jsonString = CacheService.getUserCache().get(userId);
  if(jsonString===null) {
    CacheService.getUserCache().put(userId, JSON.stringify({"blocked":blockState}));
    return;
  }
  var jsonObject = JSON.parse(jsonString);
  jsonObject["blocked"] = blockState;
  CacheService.getUserCache().put(userId, JSON.stringify(jsonObject));
}
