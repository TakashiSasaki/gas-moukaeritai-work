function getCategoryCode(cat1, cat2) {
  if(arguments.length === 0) {
    cat1 = "lighting";
    cat2 = "ceiling-fanlight";
    return getCategoryCode(cat1, cat2);
  }
  var cached = CacheService.getScriptCache().get(cat1+"_"+cat2);
  if(cached) {
    Logger.log("cache hit");
    Logger.log(cached);
    return JSON.parse(cached);
  }
  var content_string = fetch("http://kakaku.com/" + cat1 + "/" + cat2 + "/");
  var matched = content_string.match(/value="([0-9]+),([0-9]+)"/);
  if(matched) {
    var code1 = ("0000" + matched[1]).slice(-4);
    var code2 = ("0000" + matched[2]).slice(-4);
  }
  var matched = content_string.match(/value="([0-9]+),([0-9]+),([0-9]+)"/);
  if(matched) {
    var code1 = ("0000" + matched[1]).slice(-4);
    var code2 = ("0000" + matched[2]).slice(-4);
    var code3 = ("0000" + matched[3]).slice(-4);
  }
  var result = [code1, code2, code3];
  CacheService.getScriptCache().put(cat1+"_"+cat2, JSON.stringify(result), 21600);
  return result;
}
