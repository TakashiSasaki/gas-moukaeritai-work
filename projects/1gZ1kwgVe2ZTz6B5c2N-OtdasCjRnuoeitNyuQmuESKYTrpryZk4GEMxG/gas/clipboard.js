function getClipboardValues() {
  var jsonString = CacheService.getUserCache().get("values");
  return jsonString;
}

function getClipboardHeader(){
  var jsonString = CacheService.getUserCache().get("header");
  return jsonString;
}
