function fetch(url) {
  LockService.getScriptLock().waitLock(20000);
  if(arguments.length===0) {
    url = "http://kakaku.com/pc_category.htm";
  }
  var cache = CacheService.getScriptCache();
  var cached_string = cache.get(url);
  if(cached_string) {
    return cached_string;
  }
  var response = UrlFetchApp.fetch(url);
  var response_string = response.getContentText("Shift_JIS");  
  try {
    cache.put(url, response_string);
  } catch(e) {
    cache.remove(url);
  }
  return response_string;
}
