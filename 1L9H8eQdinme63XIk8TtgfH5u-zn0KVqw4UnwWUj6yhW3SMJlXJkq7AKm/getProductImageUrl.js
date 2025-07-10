function getProductImageUrl(url) {
  var cache = CacheService.getScriptCache();
  if(arguments.length === 0) {
    url = "http://kakaku.com/pc/";
    cache.remove(url);
    var image_url = getProductImageUrl(url);
    Logger.log(image_url);
    return image_url;
  }
  var image_url = cache.get(url);
  if(!image_url) {
    var response = UrlFetchApp.fetch(url);
    var xml_string = response.getContentText("Shift_JIS");
    var match = xml_string.match(/http:\/\/img.kakaku.com\/images\/productimage\/[A-Za-z0-9\/]+\.jpg/);
    if(match) {
      image_url = match[0];
      cache.put(url, image_url, 21600);
    }
  } else {
    Logger.log(image_url);
  }
  return image_url;
}
